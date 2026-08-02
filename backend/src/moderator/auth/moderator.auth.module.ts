import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ModeratorModule } from '../moderator.module';
import { ModeratorAuthController } from './moderator.auth.controller';
import { ModeratorAuthService } from './moderator.auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Moderator } from '../entity/moderator.entity';
import { ModeratorEmailVerification } from '../entity/moderator-email-verification.entity';
import { ModeratorDocument } from '../entity/moderator-document.entity';
import { ModeratorPasswordReset } from '../entity/moderator-password-reset.entity';
import { MailModule } from '../mail/mail.module';
import { MailService } from '../mail/mail.service';

@Module({
  imports: [
    ModeratorModule,
    ConfigModule,
    MailModule,
    TypeOrmModule.forFeature([
    Moderator,
    ModeratorDocument,
    ModeratorEmailVerification,
    ModeratorPasswordReset,
    
  ]), 

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

  controllers: [
    ModeratorAuthController,
  ],

  providers: [
    ModeratorAuthService,
    MailService
  ],

  exports: [
    ModeratorAuthService,
    MailService
  ],
})
export class ModeratorAuthModule {}