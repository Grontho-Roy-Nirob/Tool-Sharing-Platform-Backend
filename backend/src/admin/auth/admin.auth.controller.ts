import { Body, Controller, HttpCode, HttpStatus, Post, UploadedFile, UseInterceptors } from '@nestjs/common';

import { AdminAuthService } from './admin.auth.service';

import { CreateAdminDto, LoginAdminDto } from '../dto/admin.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  // ==========================================
  // TEMPORARY: CREATE ADMIN
  // TODO: REMOVE AFTER INITIAL ADMIN CREATION
  // ==========================================

  // URL: http://localhost:7000/admin/auth/create
  @Post('create')
  @UseInterceptors(
    FileInterceptor('myfile', {
      storage: diskStorage({
        destination: './uploads/admin_profile',
        filename: (req, file, cb) => {
          cb(null, Date.now() + file.originalname);
        },
      }),
    }),
  )
  async createAdmin(
    @Body() createAdminDto: CreateAdminDto,
    @UploadedFile() myfile: Express.Multer.File,
  ) {
    if (myfile) {
      createAdminDto.profile_image = myfile.filename;
    }

    return this.adminAuthService.createAdmin(createAdminDto);
  }

  // ==========================================
  // ADMIN LOGIN
  // ==========================================

  // URL: http://localhost:7000/admin/auth/login
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginAdminDto: LoginAdminDto) {
    return this.adminAuthService.login(loginAdminDto);
  }
}
