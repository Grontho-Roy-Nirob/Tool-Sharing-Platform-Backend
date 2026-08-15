// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';

// import { AdminController } from './admin.controller';
// import { AdminService } from './admin.service';
// import { Admin } from './entity/admin.entity';
// import { AdminAuthGuard } from './auth/admin.auth.guard';

// import { CategoryEntity } from '../owner/entity/category.entity';

// @Module({
//   imports: [TypeOrmModule.forFeature([Admin]), CategoryEntity],

//   controllers: [AdminController],

//   providers: [AdminService, AdminAuthGuard],

//   exports: [AdminService, AdminAuthGuard],
// })
// export class AdminModule {}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Admin } from './entity/admin.entity';
import { AdminAuthGuard } from './auth/admin.auth.guard';
import { AdminAuthModule } from './auth/admin.auth.module';
import { CategoryModule } from './category.module';

@Module({
  imports: [TypeOrmModule.forFeature([Admin]), AdminAuthModule, CategoryModule],

  controllers: [AdminController],

  providers: [AdminService, AdminAuthGuard],

  exports: [AdminService, AdminAuthGuard],
})
export class AdminModule {}
