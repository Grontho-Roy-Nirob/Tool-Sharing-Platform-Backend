import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

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

    const { tool_ids, start_date, end_date, message } = dto;

    if (!tool_ids || !Array.isArray(tool_ids) || tool_ids.length === 0) {
      throw new BadRequestException('At least one tool_id is required');
    }

    if (!start_date) {
      throw new BadRequestException('start_date is required');
    }

    if (!end_date) {
      throw new BadRequestException('end_date is required');
    }

    // ------------------------------------------
    // Remove duplicate tool IDs
    // ------------------------------------------

    const uniqueToolIds = [...new Set(tool_ids.map((id) => Number(id)))];

    if (uniqueToolIds.some((id) => isNaN(id))) {
      throw new BadRequestException('All tool_ids must be valid numbers');
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
    // Find all tools
    // ------------------------------------------

    const tools = await this.toolRepository.find({
      where: {
        id: In(uniqueToolIds),
      },
    });

    // ------------------------------------------
    // Check all tools exist
    // ------------------------------------------

    if (tools.length !== uniqueToolIds.length) {
      const foundToolIds = tools.map((tool) => tool.id);

      const missingToolIds = uniqueToolIds.filter(
        (id) => !foundToolIds.includes(id),
      );

      throw new NotFoundException(
        `Tool(s) not found: ${missingToolIds.join(', ')}`,
      );
    }

    // ------------------------------------------
    // Check tool availability
    // ------------------------------------------

    const unavailableTools = tools.filter((tool) => !tool.is_available);

    if (unavailableTools.length > 0) {
      const unavailableToolIds = unavailableTools.map((tool) => tool.id);

      throw new ConflictException(
        `Tool(s) currently unavailable: ${unavailableToolIds.join(', ')}`,
      );
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
    // Calculate total price
    // ------------------------------------------

    let totalAmount = 0;

    for (const tool of tools) {
      const pricePerDay = Number(tool.rental_price_per_day);

      if (isNaN(pricePerDay)) {
        throw new BadRequestException(
          `Invalid rental price for tool ID ${tool.id}`,
        );
      }

      totalAmount += pricePerDay * durationDays;
    }

    // ------------------------------------------
    // Create order
    // ------------------------------------------

    const order = this.orderRepository.create({
      renter_id: renterId,

      tools,

      start_date: startDate,
      end_date: endDate,

      duration_days: durationDays,

      total_amount: totalAmount,

      status: OrderStatus.PENDING,

      message: message ?? null,
    });

    // ------------------------------------------
    // Save order
    // ------------------------------------------

    const savedOrder = await this.orderRepository.save(order);

    console.log('Created Order:', savedOrder);
    console.log(
      'Tools:',
      tools.map((tool) => tool.id),
    );
    console.log('Total Amount:', totalAmount);
    console.log('================================');

    return savedOrder;
  }

  // ==========================================
  // GET MY ORDERS
  // ==========================================

  async getMyOrders(renterId: number) {
    const orders = await this.orderRepository.find({
      where: {
        renter_id: renterId,
      },

      relations: {
        tools: true,
        renter: true,
      },

      order: {
        created_at: 'DESC',
      },
    });

    return orders;
  }
}
