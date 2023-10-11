/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import { ReviewRepository } from './review.repo';
import { StorageService } from '@app/common/storage/storage.service';
import { UserId } from 'apps/auth/user/domain/user_id';
import { Either, Result, left } from '@app/common/core/result';
import * as AppErrors from '@app/common/core/app.error';
import { STORAGE_PATH } from '@app/common/constants';
import { Review } from './entity/review.entity';
import { ReviewId } from './entity/review_id';
import { ReviewMapper } from './mapper/review.mapper';
import { Pagination } from '@app/common/core/pagination/pagination.type';

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

  async like(reviewId: ReviewId, userId: UserId): Promise<Result<void>> {
    return await this.reviewRepository.likeReview(reviewId, userId);
  }

  async unlike(reviewId: ReviewId, userId: UserId): Promise<Result<void>> {
    return await this.reviewRepository.unlikeReview(reviewId, userId);
  }

  async getReviewsByPlaceId(
    place_id: string,
    page: number,
    pageSize: number,
    sortBy: string,
  ): Promise<Pagination<Review>> {
    const result = await this.reviewRepository.findAllReviewsPagination(
      {
        place_id: place_id,
      },
      page,
      pageSize,
      sortBy,
    );
    return {
      result: result.result,
      page: result.page,
      totalPage: result.totalPage,
    };
  }

  async getReviewsByUserId(
    userId: UserId,
    page: number,
    pageSize: number,
    sortBy: string,
  ): Promise<Pagination<Review>> {
    const result = await this.reviewRepository.findAllReviewsPagination(
      {
        userId: userId.getValue().toMongoObjectID(),
      },
      page,
      pageSize,
      sortBy,
    );

    return {
      result: result.result,
      page: result.page,
      totalPage: result.totalPage,
    };
  }

  async getReviewsByProvince(
    province_code: string,
    page: number,
    pageSize: number,
    sortBy: string,
  ): Promise<Pagination<Review>> {
    const result = await this.reviewRepository.findAllReviewsPagination(
      {
        tagging: {
          province_code: province_code,
        },
      },
      page,
      pageSize,
      sortBy,
    );
    return {
      result: result.result,
      page: result.page,
      totalPage: result.totalPage,
    };
  }
}
