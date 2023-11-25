/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import { ReviewRepository } from './review.repo';
import { StorageService } from '@app/common/storage/storage.service';
import { UserId } from 'apps/auth/user/domain/user_id';
import { Result } from '@app/common/core/result';
import { Review } from './entity/review.entity';
import { ReviewId } from './entity/review_id';
import { Pagination } from '@app/common/core/pagination/pagination.type';
import { SORT_CONST } from '@app/common/constants';

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

  async getReviewsByIds(reviewIds: ReviewId[]): Promise<Review[]> {
    const result = await this.reviewRepository.findReviewByIds(reviewIds);
    return result;
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

  async getAverageReviewStarByPlaceId(place_id: string): Promise<number> {
    const result = await this.reviewRepository.findAllReviewsNonPagination(
      {
        place_id: place_id,
      },
      SORT_CONST.DATE_NEWEST,
    );
    if (result.length === 0) {
      return 0;
    }
    let totalStar = 0;
    result.forEach((review) => {
      totalStar += review.rating;
    });
    return totalStar / result.length;
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
