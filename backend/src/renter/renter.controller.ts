import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { RenterService } from './renter.service';
import { CreateRenterDto, UpdateRenterDto } from './dto/renter.dto';
import { RenterAuthGuard } from './auth/renter.auth.guard';
import { OrderListService } from './orderlist.service';
import { CreateOrderListDto } from './dto/create-orderlist.dto';
import { diskStorage, MulterError } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';

@Controller('renter')
export class RenterController {
  constructor(
    private readonly renterService: RenterService,
    private readonly orderListService: OrderListService,
  ) {}

  // POST /renter
  @Post()
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  create(@Body() createRenterDto: CreateRenterDto) {
    return this.renterService.create(createRenterDto);
  }

  // GET /renter
  @UseGuards(RenterAuthGuard)
  @Get()
  findAll() {
    return this.renterService.findAll();
  }

  // POST /renter/orders
  @UseGuards(RenterAuthGuard)
  @Post('orders')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  createOrder(@Req() req: any, @Body() dto: CreateOrderListDto) {
    console.log('Authenticated User:', req.user);
    console.log('Order DTO:', dto);

    return this.orderListService.create(req.user.sub, dto);
  }

  @UseGuards(RenterAuthGuard)
  @Get('orders')
  getMyOrders(@Req() req: any) {
    return this.orderListService.getMyOrders(req.user.sub);
  }

  // GET /renter/:id
  @UseGuards(RenterAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.renterService.findOne(id);
  }

  // PATCH /renter/:id
  @UseGuards(RenterAuthGuard)
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: diskStorage({
        destination: './uploads',
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
  @UsePipes(new ValidationPipe())
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRenterDto: UpdateRenterDto,
    @UploadedFile() myfile: Express.Multer.File,
  ) {
    if (myfile) {
      updateRenterDto.profileImage = myfile.filename;
    }

    return this.renterService.update(id, updateRenterDto);
  }

  // DELETE /renter/:id
  @UseGuards(RenterAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.renterService.remove(id);
  }
}
