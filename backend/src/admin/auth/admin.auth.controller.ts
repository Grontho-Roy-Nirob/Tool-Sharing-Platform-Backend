import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AdminAuthService } from './admin.auth.service';
import { LoginAdminDto } from '../dto/admin.dto';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginAdminDto: LoginAdminDto) {
    return this.adminAuthService.login(loginAdminDto);
  }
}