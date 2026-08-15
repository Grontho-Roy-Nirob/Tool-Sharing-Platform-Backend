import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoryEntity } from '../owner/entity/category.entity';
import { CategoryService } from './category.service';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity])],

  providers: [CategoryService],

  exports: [CategoryService],
})
export class CategoryModule {}
