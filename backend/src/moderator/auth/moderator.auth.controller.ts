import {
  Body,
  Controller,
  Post,
  Patch,
  UsePipes,
  ValidationPipe,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';

import { LoginDto } from '../dto/login.dto';
import { ModeratorAuthService } from './moderator.auth.service';
import { MulterError } from 'multer';
import { diskStorage } from 'multer';
import { RegisterModeratorDto } from '../dto/register-moderator.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { VerifyEmailDto } from '../dto/Verify-email.dto';
import { Get, Req, UseGuards } from '@nestjs/common';
import { ModeratorAuthGuard } from './moderator.auth.guard';
import {ForgotPasswordDto} from '../dto/forgot-password.dto';
import { VerifyResetOtpDto } from '../dto/verify-reset-otp.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
@Controller('moderator-auth')
export class ModeratorAuthController {
  constructor(
    private readonly moderatorAuthService: ModeratorAuthService,
  ) {}

//http://localhost:7000/moderator-auth/register
  @Post('register')
    @UseInterceptors(
      FileFieldsInterceptor(
        [
          { name: 'profileImage', maxCount: 1 },
          { name: 'nidFrontImage', maxCount: 1 },
          { name: 'nidBackImage', maxCount: 1 },
        ],
        {
          fileFilter: (req, file, cb) => {
            if (
              file.originalname.match(/^.*\.(jpg|jpeg|png|webp)$/)
            ) {
              cb(null, true);
            } else {
              cb(
                new MulterError(
                  'LIMIT_UNEXPECTED_FILE',
                  file.fieldname,
                ),
                false,
              );
            }
          },
  
          limits: {
            fileSize: 2 * 1024 * 1024,
          },
  
          storage: diskStorage({
            destination: './uploads/moderator',
  
            filename: (req, file, cb) => {
              cb(null, Date.now() + '_' + file.originalname);
            },
          }),
        },
      ),
    )
    @UsePipes(new ValidationPipe())
    async registerModerator(
      @Body() data: RegisterModeratorDto,
  
      @UploadedFiles()
      files: {
        profileImage?: Express.Multer.File[];
        nidFrontImage?: Express.Multer.File[];
        nidBackImage?: Express.Multer.File[];
      },
    ): Promise<any>
     {
        console.log(data);
      return await this.moderatorAuthService.registerModerator(
        data,
        files,
      );
    }

      @Post('verify-email')
@UsePipes(new ValidationPipe())
async verifyEmail(
  @Body() data: VerifyEmailDto,
): Promise<any> 
{
  return await this.moderatorAuthService.verifyEmail(data);
}
  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(
    @Body() data: LoginDto,
  ): Promise<any>
   {
    return await this.moderatorAuthService.login(data);
  }


  //http://localhost:7000/moderator-auth/profile
@Get('profile')
@UseGuards(ModeratorAuthGuard)
async getMyProfile(
  @Req() req: any,
): Promise<any> {
  return await this.moderatorAuthService.getMyProfile(
    req.user.sub,
  );
}


// http://localhost:7000/moderator-auth/forgot-password
  @Post('forgot-password')
@UsePipes(new ValidationPipe())
async forgotPassword(
  @Body() data: ForgotPasswordDto,
): Promise<any> 
{

  return await this.moderatorAuthService.forgotPassword(
    data,
  );

}
//http://localhost:7000/moderator-auth/verify-reset-otp
@Post('verify-reset-otp')
@UsePipes(new ValidationPipe())
async verifyResetOtp(
  @Body() data: VerifyResetOtpDto,
): Promise<any>
 {

  return await this.moderatorAuthService.verifyResetOtp(
    data,
  );

}
//http://localhost:7000/moderator-auth/reset-password
@Patch('reset-password')
@UsePipes(new ValidationPipe())
async resetPassword(
  @Body() data: ResetPasswordDto,
): Promise<any> {

  return await this.moderatorAuthService.resetPassword(
    data,
  );

}
//http://localhost:7000/moderator-auth/change-password
@Patch('change-password')
@UseGuards(ModeratorAuthGuard)
@UsePipes(new ValidationPipe())
async changePassword(
  @Req() req: any,
  @Body() data: ChangePasswordDto,
): Promise<any> {

  return await this.moderatorAuthService.changePassword(
    req.user.sub,
    data,
  );
}
}