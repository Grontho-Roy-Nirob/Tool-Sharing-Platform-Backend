import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OwnerEntity } from './entity/owner.entity';
import { loginDTO, OwnerDTO } from './dto/owner.dto';
import { CategoryEntity } from './entity/category.entity';
import { ToolEntity } from './entity/tool.entity';
import { ToolDTO } from './dto/tool.dto';
import { OrderList, OrderStatus } from '../renter/entity/orderlist.entity';
import { MailerService } from '@nestjs-modules/mailer';

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
  // EXISTING OWNER METHODS
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
    const tool = await this.toolRepo.findOneBy({ id });

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
    ownerData: OwnerDTO,
  ): Promise<OwnerEntity | null> {
    await this.ownerRepo.update(id, ownerData);

    return this.ownerRepo.findOneBy({ id });
  }

  async deleteOwner(ownerid: number): Promise<void> {
    await this.ownerRepo.delete(ownerid);
  }

  // ==========================================
  // ORDER MANAGEMENT
  // ==========================================

  // GET OWNER'S ORDERS
  async getOwnerOrders(ownerId: number) {
    const owner = await this.ownerRepo.findOneBy({
      id: ownerId,
    });

    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    return this.orderRepo.find({
      relations: {
        renter: true,
        tool: true,
      },

      where: {
        tool: {
          owner: {
            id: ownerId,
          },
        },
      },

      order: {
        created_at: 'DESC',
      },
    });
  }

  // ==========================================
  // APPROVE ORDER
  // ==========================================

  async approveOrder(orderId: number) {
    const order = await this.orderRepo.findOne({
      where: {
        id: orderId,
      },

      relations: {
        tool: {
          owner: true,
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new ConflictException(
        `Order cannot be approved because its current status is ${order.status}`,
      );
    }

    order.status = OrderStatus.APPROVED;

    return this.orderRepo.save(order);
  }

  // ==========================================
  // REJECT ORDER
  // ==========================================

  async rejectOrder(orderId: number) {
    const order = await this.orderRepo.findOne({
      where: {
        id: orderId,
      },

      relations: {
        tool: {
          owner: true,
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new ConflictException(
        `Order cannot be rejected because its current status is ${order.status}`,
      );
    }

    order.status = OrderStatus.REJECTED;

    return this.orderRepo.save(order);
  }
}
