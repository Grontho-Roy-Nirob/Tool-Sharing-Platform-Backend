import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Renter } from '../entity/renter.entity';
import { RenterAuthController } from './renter.auth.controller';
import { RenterAuthService } from './renter.auth.service';
//import { RenterAuthGuard } from './renter.auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Renter]),

    ConfigModule,

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
  controllers: [RenterAuthController],
  providers: [RenterAuthService],
  exports: [RenterAuthService],
})
export class RenterAuthModule {}
