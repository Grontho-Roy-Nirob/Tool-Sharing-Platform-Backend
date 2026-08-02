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

import { AdminService } from './admin.service';

import { AdminAuthGuard } from './auth/admin.auth.guard';



@Controller('admin')

export class AdminController {

  constructor(private readonly adminService: AdminService) {}



  // URL: http://localhost:7000/admin/listall

  @UseGuards(AdminAuthGuard)

  @Get('listall')

  getAllAdmin() {

    return this.adminService.getAllAdmin();

  }

} 

