import {
  Body,
  Controller,
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
}
