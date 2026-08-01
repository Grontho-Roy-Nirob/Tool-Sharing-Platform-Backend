import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  ValidationPipe,
  UsePipes,
  UseInterceptors,
  UploadedFile,
  Res,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { OwnerService } from './owner.service';
import { OwnerAuthGuard } from './auth/owner.auth.guard';

@Controller('owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  // URL: http://localhost:7000/owner/listall
  @UseGuards(OwnerAuthGuard)
  @Get('listall')
  getAllOwner() {
    return this.ownerService.getAllOwner();
  }

  
}
