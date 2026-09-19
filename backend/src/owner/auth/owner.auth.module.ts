// import { Module } from '@nestjs/common';
// import { JwtModule } from '@nestjs/jwt';
// import { OwnerModule } from 'src/owner/owner.module';
// import { jwtConstants } from './owner.constants';
// import { OwnerAuthService } from './owner.auth.service';
// import { OwnerAuthController } from './owner.auth.controller';

// @Module({
//   imports: [
//     OwnerModule,
//     JwtModule.register({
//       global: true,
//       secret: jwtConstants.secret,
//       signOptions: { expiresIn: '30m' },
//     }),
//   ],
//   providers: [OwnerAuthService],
//   controllers: [OwnerAuthController],
//   exports: [OwnerAuthService],
// })
// export class OwnerAuthModule {}

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { OwnerModule } from 'src/owner/owner.module';
import { OwnerAuthController } from './owner.auth.controller';
import { OwnerAuthService } from './owner.auth.service';

@Module({
  imports: [
    OwnerModule,
    ConfigModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '30m',
        },
      }),
    }),
  ],
  controllers: [OwnerAuthController],
  providers: [OwnerAuthService],
  exports: [OwnerAuthService],
})
export class OwnerAuthModule {}
