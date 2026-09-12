import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OwnerEntity } from './entity/owner.entity';
import { loginDTO, OwnerDTO } from './dto/owner.dto';

import { CategoryEntity } from './entity/category.entity';
import { ToolEntity } from './entity/tool.entity';
import { ToolDTO } from './dto/tool.dto';

import { OrderList, OrderStatus } from '../renter/entity/orderlist.entity';

import { MailerService } from '@nestjs-modules/mailer';
import { UpdateOwnerDTO } from './dto/update-owner.dto';

@Injectable()
export class OwnerService {
  constructor(
    @InjectRepository(OwnerEntity)
    private ownerRepo: Repository<OwnerEntity>,

    @InjectRepository(CategoryEntity)
    private categoryRepo: Repository<CategoryEntity>,

    @InjectRepository(ToolEntity)
    private toolRepo: Repository<ToolEntity>,

    @InjectRepository(OrderList)
    private orderRepo: Repository<OrderList>,

    private readonly mailerService: MailerService,
  ) {}

  // ==========================================
  // OWNER METHODS
  // ==========================================

  getAllOwner(): Promise<OwnerEntity[]> {
    return this.ownerRepo.find();
  }

  async createOwner(data: OwnerDTO): Promise<OwnerEntity> {
    const owner = await this.ownerRepo.save(data);

    await this.mailerService.sendMail({
      to: owner.email,
      subject: 'Welcome to Tool Sharing Platform',

      text: `Hello ${owner.name}, Welcome to Tool Sharing Platform. Your account has been created successfully. Thank you.`,
    });

    return owner;
  }

  async findOne(logindata: loginDTO): Promise<OwnerEntity | null> {
    return this.ownerRepo.findOneBy({
      email: logindata.email,
    });
  }

  async getCategoryName() {
    return this.categoryRepo.find({
      select: {
        name: true,
      },
    });
  }

  getAllTools(): Promise<ToolEntity[]> {
    return this.toolRepo.find();
  }

  async getToolsByOwner(ownerid: number): Promise<ToolEntity[]> {
    const owner = await this.ownerRepo.findOneBy({
      id: ownerid,
    });

    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    return this.toolRepo.find({
      where: {
        owner: {
          id: ownerid,
        },
      },
      relations: {
        category: true,
        owner: true,
      },
    });
  }

  async createTool(ownerid: number, tooldata: ToolDTO): Promise<ToolEntity> {
    const owner = await this.ownerRepo.findOneBy({
      id: ownerid,
    });

    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    const category = await this.categoryRepo.findOneBy({
      id: tooldata.category_id,
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.toolRepo.save({
      ...tooldata,
      owner,
      category,
    });
  }

  async updateTool(id: number, tooldata: ToolDTO): Promise<ToolEntity> {
    const tool = await this.toolRepo.findOne({
      where: { id },
      relations: {
        category: true,
      },
    });

    if (!tool) {
      throw new NotFoundException('Tool not found');
    }

    let category = tool.category;

    if (tooldata.category_id) {
      const newCategory = await this.categoryRepo.findOneBy({
        id: tooldata.category_id,
      });

      if (!newCategory) {
        throw new NotFoundException('Category not found');
      }

      category = newCategory;
    }

    return this.toolRepo.save({
      ...tool,
      ...tooldata,
      category,
    });
  }

  async updateOwner(
    id: number,
    ownerData: UpdateOwnerDTO,
  ): Promise<OwnerEntity | null> {
    const owner = await this.ownerRepo.findOneBy({ id });

    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    if (ownerData.password) {
      ownerData.password = await bcrypt.hash(ownerData.password, 10);
    }

    await this.ownerRepo.update(id, ownerData);

    return this.ownerRepo.findOneBy({ id });
  }

  async deleteOwner(ownerid: number): Promise<void> {
    await this.ownerRepo.delete(ownerid);
  }

  // ==========================================
  // ORDER MANAGEMENT
  // ==========================================

  // ==========================================
  // GET OWNER'S ORDERS
  // ==========================================

  async getOwnerOrders(ownerId: number) {
    // ------------------------------------------
    // Check owner
    // ------------------------------------------

    const owner = await this.ownerRepo.findOneBy({
      id: ownerId,
    });

    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    // ------------------------------------------
    // Get orders containing owner's tools
    // ------------------------------------------

    const orders = await this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.renter', 'renter')
      .leftJoinAndSelect('order.tools', 'tool')
      .leftJoinAndSelect('tool.owner', 'owner')
      .where('owner.id = :ownerId', {
        ownerId,
      })
      .orderBy('order.created_at', 'DESC')
      .getMany();

    return orders;
  }

  // ==========================================
  // APPROVE ORDER
  // ==========================================

  async approveOrder(orderId: number) {
    const order = await this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.tools', 'tool')
      .leftJoinAndSelect('tool.owner', 'owner')
      .where('order.id = :orderId', {
        orderId,
      })
      .getOne();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // ------------------------------------------
    // Check status
    // ------------------------------------------

    if (order.status !== OrderStatus.PENDING) {
      throw new ConflictException(
        `Order cannot be approved because its current status is ${order.status}`,
      );
    }

    // ------------------------------------------
    // Make sure order has tools
    // ------------------------------------------

    if (!order.tools || order.tools.length === 0) {
      throw new ConflictException('Cannot approve an order without tools');
    }

    // ------------------------------------------
    // Approve order
    // ------------------------------------------

    order.status = OrderStatus.APPROVED;

    return this.orderRepo.save(order);
  }

  // ==========================================
  // REJECT ORDER
  // ==========================================

  async rejectOrder(orderId: number) {
    const order = await this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.tools', 'tool')
      .leftJoinAndSelect('tool.owner', 'owner')
      .where('order.id = :orderId', {
        orderId,
      })
      .getOne();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // ------------------------------------------
    // Check status
    // ------------------------------------------

    if (order.status !== OrderStatus.PENDING) {
      throw new ConflictException(
        `Order cannot be rejected because its current status is ${order.status}`,
      );
    }

    // ------------------------------------------
    // Make sure order has tools
    // ------------------------------------------

    if (!order.tools || order.tools.length === 0) {
      throw new ConflictException('Cannot reject an order without tools');
    }

    // ------------------------------------------
    // Reject order
    // ------------------------------------------

    order.status = OrderStatus.REJECTED;

    return this.orderRepo.save(order);
  }
}
