/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { ReviewRepository } from './review.repo';
import { StorageService } from '@app/common/storage/storage.service';
import { UserId } from 'apps/auth/user/domain/user_id';
import { Either, left } from '@app/common/core/result';
import * as AppErrors from '@app/common/core/app.error';
import { STORAGE_PATH } from '@app/common/constants';
import { Review } from './entity/review.entity';
import { ReviewId } from './entity/review_id';

@Injectable()
export class ReviewService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly storageService: StorageService,
  ) {}

  async createReview(review: Review): Promise<Review> {
    const result = await this.reviewRepository.createReview(review);
    return result;
  }

  async updateReview(review: Review): Promise<Review> {
    const result = await this.reviewRepository.updateReview(review);
    return result;
  }

  async getReviewById(reviewId: ReviewId): Promise<Review> {
    const review = await this.reviewRepository.findReviewById(reviewId);
    return review;
  }

  // async getTripsByUserIdPagination(
  //   userId: UserId,
  //   page: number,
  //   pageSize: number,
  // ): Promise<Trip[]> {
  //   const trip = await this.tripRepostiory.findTripsByUserIdPagination(
  //     userId,
  //     page,
  //     pageSize,
  //   );
  //   return trip;
  // }
}
