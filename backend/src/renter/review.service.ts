import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Review } from './entity/review.entity';
import { Renter } from '../renter/entity/renter.entity';
import { ToolEntity } from '../owner/entity/tool.entity';

import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,

    @InjectRepository(Renter)
    private readonly renterRepository: Repository<Renter>,

    @InjectRepository(ToolEntity)
    private readonly toolRepository: Repository<ToolEntity>,
  ) {}

  // Create Review
  async create(
    renterId: number,
    createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    // Find renter
    const renter = await this.renterRepository.findOne({
      where: { renterId },
    });

    if (!renter) {
      throw new NotFoundException('Renter not found.');
    }

    // Find tool
    const tool = await this.toolRepository.findOne({
      where: {
        id: createReviewDto.toolId,
      },
    });

    if (!tool) {
      throw new NotFoundException('Tool not found.');
    }

    // Create review
    const review = this.reviewRepository.create({
      order_id: createReviewDto.orderId,
      renter,
      tool,
      rating: createReviewDto.rating,
      review: createReviewDto.review,
    });

    return await this.reviewRepository.save(review);
  }

  // Get Review
  async findOne(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: {
        review_id: id,
      },
      relations: {
        renter: true,
        tool: true,
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found.');
    }

    return review;
  }

  // Update Review
  async update(
    reviewId: number,
    renterId: number,
    updateReviewDto: UpdateReviewDto,
  ): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: {
        review_id: reviewId,
      },
      relations: {
        renter: true,
        tool: true,
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found.');
    }

    if (review.renter.renterId !== renterId) {
      throw new ForbiddenException('You can only update your own review.');
    }

    Object.assign(review, updateReviewDto);

    return await this.reviewRepository.save(review);
  }

  // Delete Review
  async remove(
    reviewId: number,
    renterId: number,
  ): Promise<{ message: string }> {
    const review = await this.reviewRepository.findOne({
      where: {
        review_id: reviewId,
      },
      relations: {
        renter: true,
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found.');
    }

    if (review.renter.renterId !== renterId) {
      throw new ForbiddenException('You can only delete your own review.');
    }

    await this.reviewRepository.remove(review);

    return {
      message: 'Review deleted successfully.',
    };
  }
}
