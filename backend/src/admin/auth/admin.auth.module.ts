// import { Module } from '@nestjs/common';
// import { JwtModule } from '@nestjs/jwt';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Admin } from '../entity/admin.entity';
// import { AdminAuthController } from './admin.auth.controller';
// import { AdminAuthService } from './admin.auth.service';

// @Module({
//   imports: [
//     TypeOrmModule.forFeature([Admin]),

//     ConfigModule,

//     JwtModule.registerAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],

//       useFactory: (configService: ConfigService) => ({
//         secret: configService.getOrThrow<string>('JWT_SECRET'),

//         signOptions: {
//           expiresIn: '30m',
//         },
//       }),
//     }),
//   ],

//   controllers: [AdminAuthController],

//   providers: [AdminAuthService],

//   exports: [AdminAuthService],
// })
// export class AdminAuthModule {}
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Admin } from '../entity/admin.entity';
import { AdminAuthController } from './admin.auth.controller';
import { AdminAuthService } from './admin.auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),

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

  controllers: [AdminAuthController],

  providers: [AdminAuthService],

  exports: [AdminAuthService, JwtModule],
})
export class AdminAuthModule {}
