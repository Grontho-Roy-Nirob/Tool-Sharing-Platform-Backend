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
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { RenterService } from './renter.service';
import { CreateRenterDto, UpdateRenterDto } from './dto/renter.dto';
import { RenterAuthGuard } from './auth/renter.auth.guard';
import { OrderListService } from './orderlist.service';
import { CreateOrderListDto } from './dto/create-orderlist.dto';

@Controller('renter')
export class RenterController {
  constructor(
    private readonly renterService: RenterService,
    private readonly orderListService: OrderListService,
  ) {}

  // ==========================================
  // CREATE RENTER
  // POST /renter
  // ==========================================

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

  // ==========================================
  // GET ALL RENTERS
  // GET /renter
  // ==========================================

  @UseGuards(RenterAuthGuard)
  @Get()
  findAll() {
    return this.renterService.findAll();
  }

  // ==========================================
  // CREATE RENTAL ORDER
  // POST /renter/orders
  // ==========================================

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

  // ==========================================
  // GET RENTER BY ID
  // GET /renter/:id
  // ==========================================

  @UseGuards(RenterAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.renterService.findOne(id);
  }

  // ==========================================
  // UPDATE RENTER
  // PATCH /renter/:id
  // ==========================================

  @UseGuards(RenterAuthGuard)
  @Patch(':id')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRenterDto: UpdateRenterDto,
  ) {
    return this.renterService.update(id, updateRenterDto);
  }

  // ==========================================
  // DELETE RENTER
  // DELETE /renter/:id
  // ==========================================

  @UseGuards(RenterAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.renterService.remove(id);
  }
}
