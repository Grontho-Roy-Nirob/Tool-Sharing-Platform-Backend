import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Admin } from './entity/admin.entity';

import { AdminAuthModule } from './auth/admin.auth.module';
import { AdminAuthGuard } from './auth/admin.auth.guard';

import { ToolEntity } from '../owner/entity/tool.entity';
import { CategoryModule } from './category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, ToolEntity]),
    AdminAuthModule,
    CategoryModule,
  ],

  controllers: [AdminController],

  providers: [AdminService, AdminAuthGuard],

  exports: [AdminService, AdminAuthGuard],
})
export class AdminModule {}
