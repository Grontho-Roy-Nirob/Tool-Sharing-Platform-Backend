import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Moderator } from './entity/moderator.entity';
import { ModeratorDocument } from './entity/moderator-document.entity';

import { ModeratorEmailVerification } from './entity/moderator-email-verification.entity';
import { ModeratorPasswordReset } from './entity/moderator-password-reset.entity';
import { ModeratorController } from './moderator.controller';
import { MailModule } from './mail/mail.module';
import { ModeratorService } from './moderator.service';
import { JwtModule } from '@nestjs/jwt';
import { ModeratorAuthGuard } from './auth/moderator.auth.guard';
import { ModeratorAuthService } from './auth/moderator.auth.service';
import { ModeratorAuthController } from './auth/moderator.auth.controller';
import { MailService } from './mail/mail.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Moderator,
      ModeratorDocument,
      ModeratorEmailVerification,
      ModeratorPasswordReset,

    ]),

    MailModule,

    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '30m',
      },
    }),
  ],

  controllers: [
    ModeratorController,
    ModeratorAuthController,
  ],

  providers: [
    ModeratorService,
    ModeratorAuthService,
    ModeratorAuthGuard,
    MailService
  ],

  exports: [
    ModeratorService,
    ModeratorAuthService,
    ModeratorAuthGuard,
    MailService
  ],
})
export class ModeratorModule {}
