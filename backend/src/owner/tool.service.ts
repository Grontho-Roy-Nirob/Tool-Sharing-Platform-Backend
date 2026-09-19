import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ToolEntity, ToolStatus } from '../owner/entity/tool.entity';

@Injectable()
export class ToolService {
  constructor(
    @InjectRepository(ToolEntity)
    private readonly toolRepo: Repository<ToolEntity>,
  ) {}

  async getPublicTools(): Promise<ToolEntity[]> {
    return this.toolRepo.find({
      where: {
        status: ToolStatus.APPROVED,
      },
      relations: {
        category: true,
        owner: true,
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  async getPublicToolById(id: number): Promise<ToolEntity> {
    const tool = await this.toolRepo.findOne({
      where: {
        id,
        status: ToolStatus.APPROVED,
      },
      relations: {
        category: true,
        owner: true,
      },
    });

    if (!tool) {
      throw new NotFoundException('Tool not found');
    }

    return tool;
  }
}
