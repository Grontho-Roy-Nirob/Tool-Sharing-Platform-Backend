import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import Stripe from 'stripe';

import { Payment, PaymentStatus } from './entity/payment.entity';

import { OrderList, OrderStatus } from '../renter/entity/orderlist.entity';

@Injectable()
export class PaymentService {
  private readonly stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(OrderList)
    private readonly orderRepository: Repository<OrderList>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRIT_KEY);
  }

  // ==========================================
  // CREATE STRIPE CHECKOUT SESSION
  // ==========================================

  async createPayment(renterId: number, orderId: number) {
    // Find order
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
        renter_id: renterId,
      },

      relations: {
        renter: true,
        tool: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Only approved orders can be paid
    if (order.status !== OrderStatus.APPROVED) {
      throw new ConflictException('Only approved orders can be paid');
    }

    // Check existing payment
    const existingPayment = await this.paymentRepository.findOne({
      where: {
        order_id: orderId,
      },
    });

    if (existingPayment?.status === PaymentStatus.PAID) {
      throw new ConflictException('Order has already been paid');
    }

    // ========================================
    // Amount comes from database
    // ========================================

    const amount = Number(order.total_amount);

    // Stripe uses the smallest currency unit.
    // BDT does not use decimal subdivisions in
    // Stripe's currency handling, so amount is
    // represented as an integer.
    const stripeAmount = Math.round(amount * 100);

    // ========================================
    // Transaction ID
    // ========================================

    const transactionId =
      existingPayment?.transaction_id ?? `TS-${order.id}-${Date.now()}`;

    // ========================================
    // Create payment record
    // ========================================

    let payment = existingPayment;

    if (!payment) {
      payment = this.paymentRepository.create({
        order_id: order.id,
        order,
        transaction_id: transactionId,
        amount,
        status: PaymentStatus.PENDING,
        paid_at: null,
      });

      await this.paymentRepository.save(payment);
    }

    // ========================================
    // Create Stripe Checkout Session
    // ========================================

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',

      payment_method_types: ['card'],

      line_items: [
        {
          price_data: {
            currency: 'BDT',

            product_data: {
              name: order.tool.tool_name,

              description: `Tool rental for ${order.duration_days} days`,
            },

            unit_amount: stripeAmount,
          },

          quantity: 1,
        },
      ],

      customer_email: order.renter.email,

      metadata: {
        order_id: String(order.id),
        payment_id: String(payment.id),
        transaction_id: payment.transaction_id,
      },

      success_url: `${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: process.env.STRIPE_CANCEL_URL,
    });

    return {
      message: 'Stripe checkout session created',

      payment_id: payment.id,

      transaction_id: payment.transaction_id,

      amount: payment.amount,

      checkout_url: session.url,
    };
  }
}
