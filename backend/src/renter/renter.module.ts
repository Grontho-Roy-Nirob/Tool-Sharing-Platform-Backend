import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { Renter } from './entity/renter.entity';
import { RenterController } from './renter.controller';
import { RenterService } from './renter.service';
import { RenterAuthGuard } from './auth/renter.auth.guard';
import { OrderList } from './entity/orderlist.entity';
import { ToolEntity } from '../owner/entity/tool.entity';
import { OrderListService } from './orderlist.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Renter, OrderList, ToolEntity]),

    ConfigModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
  ],

  controllers: [RenterController],

  providers: [RenterService, RenterAuthGuard, OrderListService],

  exports: [RenterService, RenterAuthGuard, OrderListService],
})
export class RenterModule {}
