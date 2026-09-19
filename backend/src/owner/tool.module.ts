import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ToolController } from './tool.controller';
import { ToolService } from './tool.service';

import { ToolEntity } from '../owner/entity/tool.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ToolEntity])],

  controllers: [ToolController],

  providers: [ToolService],

  exports: [ToolService],
})
export class ToolModule {}
