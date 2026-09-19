import {
  Body,
  Controller,
  Headers,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/payment.dto';
import { RenterAuthGuard } from '../renter/auth/renter.auth.guard';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // ==========================================
  // CREATE STRIPE PAYMENT
  // POST /payment/create
  // ==========================================

  @UseGuards(RenterAuthGuard)
  @Post('create')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  createPayment(@Req() req: any, @Body() dto: CreatePaymentDto) {
    return this.paymentService.createPayment(req.user.sub, dto.order_id);
  }

  // ==========================================
  // STRIPE WEBHOOK
  // POST /payment/webhook
  // ==========================================

  @Post('webhook')
  handleStripeWebhook(
    @Req() req: any,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentService.handleWebhook(req.rawBody, signature);
  }
}
