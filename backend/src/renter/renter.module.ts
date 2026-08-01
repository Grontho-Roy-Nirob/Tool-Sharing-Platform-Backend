// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';

// import { Renter } from './entity/renter.entity';
// import { RenterController } from './renter.controller';
// import { RenterService } from './renter.service';

// @Module({
//   imports: [TypeOrmModule.forFeature([Renter])],
//   controllers: [RenterController],
//   providers: [RenterService],
//   exports: [RenterService],
// })
// export class RenterModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { Renter } from './entity/renter.entity';
import { RenterController } from './renter.controller';
import { RenterService } from './renter.service';
import { RenterAuthGuard } from './auth/renter.auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Renter]),

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
  providers: [RenterService, RenterAuthGuard],
  exports: [RenterService, RenterAuthGuard],
})
export class RenterModule {}
