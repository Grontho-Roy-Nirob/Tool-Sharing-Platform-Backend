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
import { Request } from 'express';

import { ReviewService } from './review.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { RenterAuthGuard } from './auth/renter.auth.guard';
//import { RenterAuthGuard } from '../renter/auth/renter.auth.guard';

type JwtPayload = {
  sub: number;
  email: string;
  role: number;
};

type RequestWithUser = Request & {
  user: JwtPayload;
};

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // POST: /reviews
  @Post()
  @UseGuards(RenterAuthGuard)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  createReview(
    @Req() request: RequestWithUser,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewService.create(request.user.sub, createReviewDto);
  }

  // GET: /reviews/:id
  @Get(':id')
  getReview(@Param('id', ParseIntPipe) id: number) {
    return this.reviewService.findOne(id);
  }

  // PATCH: /reviews/:id
  @Patch(':id')
  @UseGuards(RenterAuthGuard)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  updateReview(
    @Req() request: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewService.update(id, request.user.sub, updateReviewDto);
  }

  // DELETE: /reviews/:id
  @Delete(':id')
  @UseGuards(RenterAuthGuard)
  deleteReview(
    @Req() request: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.reviewService.remove(id, request.user.sub);
  }
}
