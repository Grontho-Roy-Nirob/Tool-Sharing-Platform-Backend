import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ValidationPipe,
  UsePipes,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { OwnerService } from './owner.service';
import { OwnerAuthGuard } from './auth/owner.auth.guard';
import { CategoryEntity } from './entity/category.entity';
import { ToolEntity } from './entity/tool.entity';
import { ToolDTO } from './dto/tool.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, MulterError } from 'multer';
import { OwnerDTO } from './dto/owner.dto';
import { OwnerEntity } from './entity/owner.entity';

@Controller('owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  // URL: http://localhost:7000/owner/listall
  @UseGuards(OwnerAuthGuard)
  @Get('listall')
  getAllOwner() {
    return this.ownerService.getAllOwner();
  }

  // URL: http://localhost:7000/owner/category-name
  @Get('category-name')
  getCategoryName(): Promise<CategoryEntity[]> {
    return this.ownerService.getCategoryName();
  }

  // URL: http://localhost:7000/owner/tools
  @Get('tools')
  getAllTools(): Promise<ToolEntity[]> {
    return this.ownerService.getAllTools();
  }

  // URL: http://localhost:7000/owner/createtool/1
  @Post('createtool/:ownerid')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(
    FileInterceptor('myfile', {
      fileFilter: (req, file, cb) => {
        if (file.originalname.match(/^.*\.(jpg|jpeg|png|webp)$/))
          cb(null, true);
        else cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'image'), false);
      },
      limits: { fileSize: 2000000 },
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, Date.now() + file.originalname);
        },
      }),
    }),
  )
  createToolByOwner(
    @Param('ownerid', ParseIntPipe) ownerid: number,
    @Body() tooldata: ToolDTO,
    @UploadedFile() myfile: Express.Multer.File,
  ): Promise<ToolEntity | null> {
    tooldata.tool_image = myfile.filename;
    return this.ownerService.createTool(ownerid, tooldata);
  }

  // URL: http://localhost:7000/owner/updatetool/1
  @Put('updatetool/:id')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(
    FileInterceptor('myfile', {
      fileFilter: (req, file, cb) => {
        if (file.originalname.match(/^.*\.(jpg|jpeg|png|webp)$/))
          cb(null, true);
        else cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'image'), false);
      },
      limits: { fileSize: 2000000 },
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, Date.now() + file.originalname);
        },
      }),
    }),
  )
  updateTool(
    @Param('id', ParseIntPipe) id: number,
    @Body() tooldata: ToolDTO,
    @UploadedFile() myfile: Express.Multer.File,
  ): Promise<ToolEntity> {
    if (myfile) {
      tooldata.tool_image = myfile.filename;
    }
    return this.ownerService.updateTool(id, tooldata);
  }

  // URL: http://localhost:7000/owner/update/1
  @UseGuards(OwnerAuthGuard)
  @Patch('update/:id')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(
    FileInterceptor('myfile', {
      fileFilter: (req, file, cb) => {
        if (file.originalname.match(/^.*\.(jpg|jpeg|png|webp)$/))
          cb(null, true);
        else cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'image'), false);
      },
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
      storage: diskStorage({
        destination: './uploads/owner_profile',
        filename: (req, file, cb) => {
          cb(null, Date.now() + file.originalname);
        },
      }),
    }),
  )
  updateOwner(
    @Param('id', ParseIntPipe) id: number,
    @Body() ownerData: OwnerDTO,
    @UploadedFile() myfile: Express.Multer.File,
  ): object | null{
    if (myfile) {
      ownerData.profile_image = myfile.filename;
    }
    return this.ownerService.updateOwner(id, ownerData);
  }

  // URL: http://localhost:7000/owner/delete/5
  @UseGuards(OwnerAuthGuard)
  @Delete('delete/:id')
  deleteOwner(@Param('id', ParseIntPipe) ownerid: number): Promise<void> {
    return this.ownerService.deleteOwner(ownerid);
  }
}
