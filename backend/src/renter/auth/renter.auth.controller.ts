import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { CreateRenterDto, LoginDto } from '../dto/renter.dto';
import { RenterAuthService } from './renter.auth.service';

@Controller('renter-auth')
export class RenterAuthController {
  constructor(private readonly renterAuthService: RenterAuthService) {}

  // POST: /renter-auth/register
  @Post('register')
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: diskStorage({
        destination: './uploads/renter_profile',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
          cb(null, true);
        } else {
          cb(
            new Error('Only jpg, jpeg, png and webp files are allowed.'),
            false,
          );
        }
      },
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async register(
    @Body() createRenterDto: CreateRenterDto,
    @UploadedFile() profileImage?: Express.Multer.File,
  ) {
    if (profileImage) {
      createRenterDto.profileImage = profileImage.filename;
    }

    return this.renterAuthService.register(createRenterDto);
  }

  // POST: /renter-auth/login
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async login(@Body() loginDto: LoginDto) {
    return this.renterAuthService.login(loginDto);
  }
}
