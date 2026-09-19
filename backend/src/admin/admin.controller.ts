import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import { AdminService } from './admin.service';
import { AdminAuthGuard } from './auth/admin.auth.guard';

import { CategoryService } from './category.service';
import { CreateCategoryDto } from 'src/owner/dto/create-category.dto';
import { UpdateCategoryDto } from 'src/owner/dto/update-category.dto';
import { UpdateToolStatusDto } from './dto/update-tool-status.dto';

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

  // URL:  http://localhost:7000/admin/categories
  @UseGuards(AdminAuthGuard)
  @Post('categories')
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  // URL: http://localhost:7000/admin/categories
  @UseGuards(AdminAuthGuard)
  @Get('categories')
  getAllCategories() {
    return this.categoryService.findAll();
  }

  // URL: http://localhost:7000/admin/categories/1
  @UseGuards(AdminAuthGuard)
  @Get('categories/:id')
  getCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }

  // URL: http://localhost:7000/admin/categories/1
  @UseGuards(AdminAuthGuard)
  @Put('categories/:id')
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  // URL: http://localhost:7000/admin/categories/1
  @UseGuards(AdminAuthGuard)
  @Delete('categories/:id')
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.remove(id);
  }

  // ==========================================
  // TOOL MANAGEMENT
  // ==========================================

  @UseGuards(AdminAuthGuard)
  @Patch('tools/:id/status')
  updateToolStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateToolStatusDto,
  ) {
    return this.adminService.updateToolStatus(id, dto);
  }
}
