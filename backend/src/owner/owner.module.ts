// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';

// import { OwnerController } from './owner.controller';
// import { OwnerEntity } from './entity/owner.entity';
// import { OwnerService } from './owner.service';

// @Module({
//   imports: [TypeOrmModule.forFeature([OwnerEntity]),],
//   controllers: [OwnerController],
//   providers: [OwnerService],
//   exports: [OwnerService],
// })
// export class OwnerModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { OwnerController } from './owner.controller';
import { OwnerService } from './owner.service';
import { OwnerEntity } from './entity/owner.entity';
import { OwnerAuthGuard } from './auth/owner.auth.guard';
import { ToolEntity } from './entity/tool.entity';
import { CategoryEntity } from './entity/category.entity';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    TypeOrmModule.forFeature([OwnerEntity, ToolEntity, CategoryEntity]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        ignoreTLS: true,
        auth: {
          user: 'roygrontho@gmail.com',
          pass: 'qitn wfra oifx fjey',
        },
      },
    }),
  ],
  controllers: [OwnerController],
  providers: [OwnerService, OwnerAuthGuard],
  exports: [OwnerService, OwnerAuthGuard],
})
export class OwnerModule {}
