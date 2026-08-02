import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Review } from './entity/review.entity';
import { Renter } from '../renter/entity/renter.entity';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,

    @InjectRepository(Renter)
    private readonly renterRepository: Repository<Renter>,
  ) {}

  // Create Review
  async create(
    renterId: number,
    createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    const renter = await this.renterRepository.findOne({
      where: { renterId },
    });

    if (!renter) {
      throw new NotFoundException('Renter not found.');
    }

    const review = this.reviewRepository.create({
      orderId: createReviewDto.orderId,
      renter,
      rating: createReviewDto.rating,
      review: createReviewDto.review,
    });

    return await this.reviewRepository.save(review);
  }

  // Get Review
  async findOne(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: {
        reviewId: id,
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
        reviewId,
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
        reviewId,
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
