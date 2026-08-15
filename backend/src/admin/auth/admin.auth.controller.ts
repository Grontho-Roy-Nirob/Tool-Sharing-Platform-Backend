import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { AdminAuthService } from './admin.auth.service';

import { CreateAdminDto, LoginAdminDto } from '../dto/admin.dto';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  // ==========================================
  // TEMPORARY: CREATE ADMIN
  // TODO: REMOVE AFTER INITIAL ADMIN CREATION
  // ==========================================

  @Post('create')
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.adminAuthService.createAdmin(createAdminDto);
  }

  // ==========================================
  // ADMIN LOGIN
  // ==========================================

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginAdminDto: LoginAdminDto) {
    return this.adminAuthService.login(loginAdminDto);
  }
}
