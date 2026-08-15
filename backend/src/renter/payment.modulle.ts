import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { Payment } from './entity/payment.entity';
import { OrderList } from '../renter/entity/orderlist.entity';

import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';

import { RenterAuthGuard } from '../renter/auth/renter.auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, OrderList]),

    // Make ConfigService available
    ConfigModule,

    // Make JwtService available
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),

        signOptions: {
          expiresIn: '30m',
        },
      }),
    }),
  ],

  controllers: [PaymentController],

  providers: [PaymentService, RenterAuthGuard],

  exports: [PaymentService],
})
export class PaymentModule {}
