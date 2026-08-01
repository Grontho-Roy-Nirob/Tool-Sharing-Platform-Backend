import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { CreateRenterDto, LoginDto } from '../dto/renter.dto';
import { RenterAuthService } from './renter.auth.service';

@Controller('renter-auth')
export class RenterAuthController {
  constructor(private readonly renterAuthService: RenterAuthService) {}

  // POST: /renter-auth/register
  @Post('register')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async register(@Body() createRenterDto: CreateRenterDto) {
    return await this.renterAuthService.register(createRenterDto);
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
    return await this.renterAuthService.login(loginDto);
  }
}
