import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Admin } from './entity/admin.entity';
import { ToolEntity, ToolStatus } from '../owner/entity/tool.entity';

import { UpdateToolStatusDto } from './dto/update-tool-status.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,

    @InjectRepository(ToolEntity)
    private toolRepo: Repository<ToolEntity>,
  ) {}

  getAllAdmin() {
    return this.adminRepo.find();
  }

  // ==========================================
  // TOOL MANAGEMENT
  // ==========================================

  async updateToolStatus(toolId: number, dto: UpdateToolStatusDto) {
    const tool = await this.toolRepo.findOne({
      where: {
        id: toolId,
      },
    });

    if (!tool) {
      throw new NotFoundException('Tool not found');
    }

    if (tool.status !== ToolStatus.PENDING) {
      throw new ConflictException(
        `Tool cannot be ${dto.status} because its current status is ${tool.status}`,
      );
    }

    tool.status = dto.status;

    return this.toolRepo.save(tool);
  }
}
