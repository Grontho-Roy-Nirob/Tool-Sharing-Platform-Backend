import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { RenterService } from './renter.service';
import { CreateRenterDto, UpdateRenterDto } from './dto/renter.dto';
import { RenterAuthGuard } from './auth/renter.auth.guard';

@Controller('renter')
export class RenterController {
  constructor(private readonly renterService: RenterService) {}

  // POST: /renter
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() createRenterDto: CreateRenterDto) {
    return this.renterService.create(createRenterDto);
  }

  // GET: /renter
  @UseGuards(RenterAuthGuard)
  @Get()
  findAll() {
    return this.renterService.findAll();
  }

  // GET: /renter/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.renterService.findOne(id);
  }

  // PATCH: /renter/:id
  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRenterDto: UpdateRenterDto,
  ) {
    return this.renterService.update(id, updateRenterDto);
  }

  // DELETE: /renter/:id
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.renterService.remove(id);
  }
}
