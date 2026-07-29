import {
  Body,
  Controller,
  Post,
  UsePipes,
  UseInterceptors,
  UploadedFile,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterError, diskStorage } from 'multer';
import * as bcrypt from 'bcrypt';
import { OwnerAuthService } from './owner.auth.service';
import { loginDTO, OwnerDTO } from '../dto/owner.dto';
import { OwnerEntity } from '../entity/owner.entity';

@Controller('owner-auth')
export class OwnerAuthController {
  constructor(private ownerAuthService: OwnerAuthService) {}

  // URL: http://localhost:7000/owner-auth/register
  @Post('register')
  @UseInterceptors(
    FileInterceptor('myfile', {
      fileFilter: (req, file, cb) => {
        if (file.originalname.match(/^.*\.(jpg|webp|png|jpeg)$/))
          cb(null, true);
        else {
          cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'image'), false);
        }
      },
      limits: {
        fileSize: 2 * 1024 * 1024, // 2 MB
      },
      storage: diskStorage({
        destination: './uploads/profile',
        filename: function (req, file, cb) {
          cb(null, Date.now() + file.originalname);
        },
      }),
    }),
  )
  @UsePipes(new ValidationPipe())
  async addOwner(
    @Body() myobj: OwnerDTO,
    @UploadedFile() myfile: Express.Multer.File,
  ): Promise<OwnerEntity> {
    const salt = await bcrypt.genSalt();
    const hashedpassword = await bcrypt.hash(myobj.password, salt);
    myobj.password = hashedpassword;
    myobj.profile_image = myfile.filename;
    return this.ownerAuthService.signUp(myobj);
  }

  @Post('login')
  signIn(@Body() logindata: loginDTO) {
    return this.ownerAuthService.signIn(logindata);
  }
}
