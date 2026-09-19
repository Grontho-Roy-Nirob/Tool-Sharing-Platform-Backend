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
    this.stripe = new Stripe(process.env.STRIPE_SECRIT_KEY as string);
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

    // ==========================================
    // STRIPE AMOUNT
    // ==========================================

    const stripeAmount = Math.round(amount * 100);

    if (stripeAmount <= 0) {
      throw new ConflictException('Invalid Stripe amount');
    }

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

  // ==========================================
  // STRIPE WEBHOOK
  // ==========================================

  async handleWebhook(rawBody: Buffer, signature: string) {
    // ==========================================
    // CHECK SIGNATURE
    // ==========================================

    if (!signature) {
      throw new ConflictException('Stripe signature is missing');
    }

    if (!rawBody) {
      throw new ConflictException('Stripe raw body is missing');
    }

    let event: Stripe.Event;

    // ==========================================
    // VERIFY STRIPE WEBHOOK
    // ==========================================

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET as string,
      );
    } catch (error) {
      console.error('Stripe webhook verification failed:', error);

      throw new ConflictException('Invalid Stripe webhook signature');
    }

    console.log(`Stripe webhook received: ${event.type}`);

    // ==========================================
    // HANDLE STRIPE EVENTS
    // ==========================================

    switch (event.type) {
      // ----------------------------------------
      // CHECKOUT COMPLETED
      // ----------------------------------------

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        await this.handleCheckoutCompleted(session);

        break;
      }

      // ----------------------------------------
      // CHECKOUT EXPIRED
      // ----------------------------------------

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;

        await this.handleCheckoutExpired(session);

        break;
      }

      // ----------------------------------------
      // PAYMENT FAILED
      // ----------------------------------------

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        await this.handlePaymentFailed(paymentIntent);

        break;
      }

      // ----------------------------------------
      // OTHER EVENTS
      // ----------------------------------------

      default: {
        console.log(`Unhandled Stripe event: ${event.type}`);
      }
    }

    // ==========================================
    // RESPONSE TO STRIPE
    // ==========================================

    return {
      received: true,
    };
  }

  // ==========================================
  // CHECKOUT SESSION COMPLETED
  // ==========================================

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const paymentId = session.metadata?.payment_id;

    const orderId = session.metadata?.order_id;

    const transactionId = session.metadata?.transaction_id;

    if (!paymentId || !orderId) {
      console.error('Stripe metadata is missing');

      return;
    }

    // ==========================================
    // FIND PAYMENT
    // ==========================================

    const payment = await this.paymentRepository.findOne({
      where: {
        id: Number(paymentId),
      },
    });

    if (!payment) {
      console.error(`Payment ${paymentId} not found`);

      return;
    }

    // ==========================================
    // IDEMPOTENCY
    // ==========================================

    if (payment.status === PaymentStatus.PAID) {
      console.log(`Payment ${payment.id} already marked as PAID`);

      return;
    }

    // ==========================================
    // CHECK PAYMENT STATUS
    // ==========================================

    if (session.payment_status !== 'paid') {
      console.log(
        `Checkout completed but payment status is ${session.payment_status}`,
      );

      return;
    }

    // ==========================================
    // UPDATE PAYMENT
    // ==========================================

    payment.status = PaymentStatus.PAID;

    payment.paid_at = new Date();

    if (transactionId) {
      payment.transaction_id = transactionId;
    }

    await this.paymentRepository.save(payment);

    console.log(`Payment ${payment.id} marked as PAID`);

    // ==========================================
    // FIND ORDER
    // ==========================================

    const order = await this.orderRepository.findOne({
      where: {
        id: Number(orderId),
      },
    });

    if (!order) {
      console.error(`Order ${orderId} not found`);

      return;
    }

    // ==========================================
    // KEEP ORDER STATUS
    // ==========================================
    //
    // APPROVED order remains APPROVED.
    //
    // Payment status is stored in Payment table.
    //
    // Later চাইলে এখানে:
    //
    // order.status = OrderStatus.ACTIVE;
    //
    // করা যাবে.
    // ==========================================

    console.log(`Payment completed successfully for Order #${order.id}`);
  }

  // ==========================================
  // CHECKOUT EXPIRED
  // ==========================================

  private async handleCheckoutExpired(session: Stripe.Checkout.Session) {
    const paymentId = session.metadata?.payment_id;

    if (!paymentId) {
      return;
    }

    const payment = await this.paymentRepository.findOne({
      where: {
        id: Number(paymentId),
      },
    });

    if (!payment) {
      return;
    }

    // Already paid হলে change করবে না
    if (payment.status === PaymentStatus.PAID) {
      return;
    }

    payment.status = PaymentStatus.FAILED;

    await this.paymentRepository.save(payment);

    console.log(`Payment ${payment.id} marked as FAILED`);
  }

  // ==========================================
  // PAYMENT INTENT FAILED
  // ==========================================

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    console.log('Stripe payment failed:', paymentIntent.id);

    // ==========================================
    // PAYMENT INTENT METADATA
    // ==========================================

    const paymentId = paymentIntent.metadata?.payment_id;

    const transactionId = paymentIntent.metadata?.transaction_id;

    let payment: Payment | null = null;

    // ==========================================
    // FIND USING PAYMENT ID
    // ==========================================

    if (paymentId) {
      payment = await this.paymentRepository.findOne({
        where: {
          id: Number(paymentId),
        },
      });
    }

    // ==========================================
    // FIND USING TRANSACTION ID
    // ==========================================

    if (!payment && transactionId) {
      payment = await this.paymentRepository.findOne({
        where: {
          transaction_id: transactionId,
        },
      });
    }

    if (!payment) {
      console.log('Payment record not found for failed PaymentIntent');

      return;
    }

    // ==========================================
    // DON'T OVERWRITE PAID
    // ==========================================

    if (payment.status === PaymentStatus.PAID) {
      return;
    }

    // ==========================================
    // MARK FAILED
    // ==========================================

    payment.status = PaymentStatus.FAILED;

    await this.paymentRepository.save(payment);

    console.log(`Payment ${payment.id} marked as FAILED`);
  }
}
