import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ToolService } from './tool.service';

@Controller('tools')
export class ToolController {
  constructor(private readonly toolService: ToolService) {}

  // GET http://localhost:7000/tools
  @Get()
  getPublicTools() {
    return this.toolService.getPublicTools();
  }

  // GET http://localhost:7000/tools/1
  @Get(':id')
  getPublicToolById(@Param('id', ParseIntPipe) id: number) {
    return this.toolService.getPublicToolById(id);
  }
}
