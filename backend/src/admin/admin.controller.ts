import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import { AdminService } from './admin.service';
import { AdminAuthGuard } from './auth/admin.auth.guard';

import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
//import { CategoryEntity } from '../owner/entity/category.entity';
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly categoryService: CategoryService,
  ) {}

  // ==========================================
  // ADMIN
  // ==========================================

  // GET /admin/listall
  @UseGuards(AdminAuthGuard)
  @Get('listall')
  getAllAdmin() {
    return this.adminService.getAllAdmin();
  }

  // ==========================================
  // CATEGORY
  // ==========================================

  // POST /admin/categories
  @UseGuards(AdminAuthGuard)
  @Post('categories')
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  // GET /admin/categories
  @UseGuards(AdminAuthGuard)
  @Get('categories')
  getAllCategories() {
    return this.categoryService.findAll();
  }

  // GET /admin/categories/:id
  @UseGuards(AdminAuthGuard)
  @Get('categories/:id')
  getCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }

  // PUT /admin/categories/:id
  @UseGuards(AdminAuthGuard)
  @Put('categories/:id')
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  // DELETE /admin/categories/:id
  @UseGuards(AdminAuthGuard)
  @Delete('categories/:id')
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.remove(id);
  }
}
