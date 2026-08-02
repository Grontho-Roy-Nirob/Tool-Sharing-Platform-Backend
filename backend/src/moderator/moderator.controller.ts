import {
  Body,
  Controller,
  ParseIntPipe,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { RegisterModeratorDto } from './dto/register-moderator.dto';
import { MulterError } from 'multer';
import { diskStorage } from 'multer';
import { ModeratorService } from './moderator.service'
import { VerifyEmailDto } from './dto/Verify-email.dto';
import { VerifyModeratorDocumentDto } from './dto/verify-moderator-document.dto';
import { Get, Req, UseGuards } from '@nestjs/common';
import { ModeratorAuthGuard } from '../moderator/auth/moderator.auth.guard'


@Controller('moderator')
export class ModeratorController
 {

    constructor(private readonly moderatorService: ModeratorService)
    {
        
    }

  
//http://localhost:7000/moderator/verify-document/6
@Patch('verify-document/:moderatorId')
@UsePipes(new ValidationPipe())
async verifyModeratorDocument(
  @Param('moderatorId', ParseIntPipe) moderatorId: number,

  @Body() data: VerifyModeratorDocumentDto,
): Promise<any> 
{
  return await this.moderatorService.verifyModeratorDocument(
    moderatorId,
    data,
  );
}

//GET http://localhost:7000/moderator/all
@Get('all')
async getAllModerators(): Promise<any> {
  return await this.moderatorService.getAllModerators();
}
//GET http://localhost:7000/moderator/inactive
@Get('inactive')
async getInactiveModerators(): Promise<any> {
  return await this.moderatorService.getInactiveModerators();
}
//GET http://localhost:7000/moderator/pending-documents
@Get('pending-documents')
async getPendingDocumentModerators(): Promise<any> {
  return await this.moderatorService.getPendingDocumentModerators();
}


//PATCH http://localhost:7000/moderator/inactive/5
@Patch('inactive/:moderatorId')
async inactiveModerator(
  @Param('moderatorId', ParseIntPipe)
  moderatorId: number,
): Promise<any> {

  return await this.moderatorService.inactiveModerator(
    moderatorId,
  );

}

//Get http://localhost:7000/moderator/6
@Get(':moderatorId')
async getModeratorById(
  @Param('moderatorId', ParseIntPipe)
  moderatorId: number,
): Promise<any> {

  return await this.moderatorService.getModeratorById(
    moderatorId,
  );

}


@Patch('active/:moderatorId')
async activeModerator(
  @Param('moderatorId', ParseIntPipe)
  moderatorId: number,
): Promise<any> {

  return await this.moderatorService.activeModerator(
    moderatorId,
  );

}

}