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
    // ==========================================
    // FIND ORDER
    // ==========================================

    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
        renter_id: renterId,
      },

      relations: {
        renter: true,
        tools: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // ==========================================
    // CHECK ORDER STATUS
    // ==========================================

    if (order.status !== OrderStatus.APPROVED) {
      throw new ConflictException('Only approved orders can be paid');
    }

    // ==========================================
    // CHECK TOOLS
    // ==========================================

    if (!order.tools || order.tools.length === 0) {
      throw new ConflictException('No tools found in this order');
    }

    // ==========================================
    // CHECK EXISTING PAYMENT
    // ==========================================

    const existingPayment = await this.paymentRepository.findOne({
      where: {
        order_id: orderId,
      },
    });

    if (existingPayment?.status === PaymentStatus.PAID) {
      throw new ConflictException('Order has already been paid');
    }

    // ==========================================
    // ORDER TOTAL
    // ==========================================

    const amount = Number(order.total_amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new ConflictException('Invalid order amount');
    }

    /*
     * Stripe amounts are sent in the currency's
     * smallest unit.
     *
     * For a 2-decimal currency:
     *
     * ৳4500.00 → 450000
     */

    const stripeAmount = Math.round(amount * 100);

    // ==========================================
    // TRANSACTION ID
    // ==========================================

    const transactionId =
      existingPayment?.transaction_id ?? `TS-${order.id}-${Date.now()}`;

    // ==========================================
    // CREATE PAYMENT RECORD
    // ==========================================

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

    // ==========================================
    // CREATE STRIPE LINE ITEMS
    // ==========================================

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      order.tools.map((tool) => {
        const pricePerDay = Number(tool.rental_price_per_day);

        if (!Number.isFinite(pricePerDay) || pricePerDay <= 0) {
          throw new ConflictException(
            `Invalid rental price for tool ID ${tool.id}`,
          );
        }

        const toolTotal = pricePerDay * order.duration_days;

        return {
          price_data: {
            currency: 'BDT',

            product_data: {
              name: tool.tool_name,

              description:
                `Rental for ${order.duration_days} days | ` +
                `৳${pricePerDay}/day`,
            },

            unit_amount: Math.round(toolTotal * 100),
          },

          quantity: 1,
        };
      });

    // ==========================================
    // CREATE STRIPE CHECKOUT SESSION
    // ==========================================

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',

      payment_method_types: ['card'],

      line_items: lineItems,

      customer_email: order.renter.email,

      metadata: {
        order_id: String(order.id),

        payment_id: String(payment.id),

        transaction_id: payment.transaction_id,
      },

      success_url:
        `${process.env.STRIPE_SUCCESS_URL}` +
        `?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: process.env.STRIPE_CANCEL_URL,
    });

    // ==========================================
    // RESPONSE
    // ==========================================

    return {
      message: 'Stripe checkout session created',

      payment_id: payment.id,

      transaction_id: payment.transaction_id,

      amount: payment.amount,

      checkout_url: session.url,
    };
  }
}
