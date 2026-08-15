// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { JwtModule } from '@nestjs/jwt';
// import { ConfigModule, ConfigService } from '@nestjs/config';

// import { Review } from './entity/review.entity';
// import { Renter } from '../renter/entity/renter.entity';

// import { ReviewController } from './review.controller';
// import { ReviewService } from './review.service';
// import { RenterAuthGuard } from '../renter/auth/renter.auth.guard';

// @Module({
//   imports: [
//     TypeOrmModule.forFeature([Review, Renter]),

//     ConfigModule,

//     JwtModule.registerAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: (configService: ConfigService) => ({
//         secret: configService.getOrThrow<string>('JWT_SECRET'),
//       }),
//     }),
//   ],
//   controllers: [ReviewController],
//   providers: [ReviewService, RenterAuthGuard],
// })
// export class ReviewModule {}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { Review } from './entity/review.entity';
import { Renter } from '../renter/entity/renter.entity';
import { ToolEntity } from '../owner/entity/tool.entity';

import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { RenterAuthGuard } from '../renter/auth/renter.auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, Renter, ToolEntity]),

    ConfigModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
  ],

  controllers: [ReviewController],
  providers: [ReviewService, RenterAuthGuard],
})
export class ReviewModule {}
