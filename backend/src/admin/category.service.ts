import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CategoryEntity } from '../owner/entity/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  // ==========================================
  // CREATE
  // ==========================================

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryEntity> {
    const { name } = createCategoryDto;

    // Check duplicate category
    const existingCategory = await this.categoryRepository.findOne({
      where: { name },
    });

    if (existingCategory) {
      throw new ConflictException('Category already exists');
    }

    const category = this.categoryRepository.create({
      name,
    });

    return this.categoryRepository.save(category);
  }

  // ==========================================
  // GET ALL
  // ==========================================

  async findAll(): Promise<CategoryEntity[]> {
    return this.categoryRepository.find({
      order: {
        created_at: 'DESC',
      },
    });
  }

  // ==========================================
  // GET ONE
  // ==========================================

  async findOne(id: number): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  // ==========================================
  // UPDATE
  // ==========================================

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryEntity> {
    const category = await this.findOne(id);

    const { name } = updateCategoryDto;

    // Check duplicate name
    const existingCategory = await this.categoryRepository.findOne({
      where: { name },
    });

    if (existingCategory && existingCategory.id !== id) {
      throw new ConflictException('Category already exists');
    }

    category.name = name;

    return this.categoryRepository.save(category);
  }

  // ==========================================
  // DELETE
  // ==========================================

  async remove(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: {
        tools: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Don't delete category if tools are using it
    if (category.tools.length > 0) {
      throw new ConflictException(
        'Cannot delete category because tools are assigned to it',
      );
    }

    await this.categoryRepository.remove(category);

    return {
      message: 'Category deleted successfully',
    };
  }
}
