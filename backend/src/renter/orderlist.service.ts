import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrderList, OrderStatus } from './entity/orderlist.entity';

import { ToolEntity } from '../owner/entity/tool.entity';
import { Renter } from './entity/renter.entity';

import { CreateOrderListDto } from './dto/create-orderlist.dto';

@Injectable()
export class OrderListService {
  constructor(
    @InjectRepository(OrderList)
    private readonly orderRepository: Repository<OrderList>,

    @InjectRepository(ToolEntity)
    private readonly toolRepository: Repository<ToolEntity>,

    @InjectRepository(Renter)
    private readonly renterRepository: Repository<Renter>,
  ) {}

  // ==========================================
  // CREATE ORDER
  // ==========================================

  async create(renterId: number, dto: CreateOrderListDto) {
    console.log('========== CREATE ORDER ==========');
    console.log('Renter ID:', renterId);
    console.log('DTO:', dto);

    // ------------------------------------------
    // Validate request
    // ------------------------------------------

    if (!dto) {
      throw new BadRequestException('Order data is required');
    }

    const { tool_id, start_date, end_date, message } = dto;

    if (tool_id === undefined || tool_id === null) {
      throw new BadRequestException('tool_id is required');
    }

    if (!start_date) {
      throw new BadRequestException('start_date is required');
    }

    if (!end_date) {
      throw new BadRequestException('end_date is required');
    }

    // ------------------------------------------
    // Find renter
    // ------------------------------------------

    const renter = await this.renterRepository.findOne({
      where: {
        renterId,
      },
    });

    if (!renter) {
      throw new NotFoundException('Renter not found');
    }

    // ------------------------------------------
    // Find tool
    // ------------------------------------------

    const tool = await this.toolRepository.findOne({
      where: {
        id: Number(tool_id),
      },
    });

    if (!tool) {
      throw new NotFoundException('Tool not found');
    }

    // ------------------------------------------
    // Check tool availability
    // ------------------------------------------

    if (!tool.is_available) {
      throw new ConflictException('Tool is currently unavailable');
    }

    // ------------------------------------------
    // Convert dates
    // ------------------------------------------

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime())) {
      throw new BadRequestException('Invalid start_date');
    }

    if (isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid end_date');
    }

    // ------------------------------------------
    // Validate date range
    // ------------------------------------------

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // ------------------------------------------
    // Calculate duration
    // ------------------------------------------

    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    const durationDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / millisecondsPerDay,
    );

    // ------------------------------------------
    // Get tool price
    // ------------------------------------------

    const pricePerDay = Number(tool.rental_price_per_day);

    if (isNaN(pricePerDay)) {
      throw new BadRequestException('Invalid tool rental price');
    }

    // ------------------------------------------
    // Calculate total
    // ------------------------------------------

    const totalAmount = pricePerDay * durationDays;

    // ------------------------------------------
    // Create order
    // ------------------------------------------

    const order = this.orderRepository.create({
      renter_id: renterId,
      tool_id: tool.id,

      start_date: startDate,
      end_date: endDate,

      duration_days: durationDays,

      rental_price_per_day: pricePerDay,
      total_amount: totalAmount,

      status: OrderStatus.PENDING,

      message: message ?? null,
    });

    const savedOrder = await this.orderRepository.save(order);

    console.log('Created Order:', savedOrder);
    console.log('================================');

    return savedOrder;
  }
  async getMyOrders(renterId: number) {
    const orders = await this.orderRepository.find({
      where: {
        renter_id: renterId,
      },
      relations: {
        tool: true,
        renter: true,
      },
      order: {
        created_at: 'DESC',
      },
    });

    return orders;
  }
}
