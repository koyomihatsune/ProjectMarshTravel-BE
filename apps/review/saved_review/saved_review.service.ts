/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import { StorageService } from '@app/common/storage/storage.service';
import { ReviewId } from '../src/entity/review_id';
import { Pagination } from '@app/common/core/pagination/pagination.type';
import { UserId } from 'apps/auth/user/domain/user_id';
import { Result } from '@app/common/core/result';
import { SORT_CONST } from '@app/common/constants';
import { SavedReviewRepository } from './saved_review.repo';
import { SavedReviewDAO } from './schema/saved_review.schema';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';

@Injectable()
export class SavedReviewService {
  constructor(private readonly savedReviewRepostiory: SavedReviewRepository) {}

  async createSavedReview(
    userId: UserId,
    reviewId: ReviewId,
  ): Promise<boolean> {
    const result = await this.savedReviewRepostiory.createSavedReview(
      userId,
      reviewId,
    );
    return result;
  }

  async deleteSavedReview(
    userId: UserId,
    reviewId: ReviewId,
  ): Promise<boolean> {
    const result = await this.savedReviewRepostiory.deleteSavedReview(
      userId,
      reviewId,
    );
    return result;
  }

  async getSavedReviewIdsByUserIdPagination(
    userId: UserId,
    page: number,
    pageSize: number,
  ): Promise<Pagination<ReviewId>> {
    const result =
      await this.savedReviewRepostiory.findUserSavedReviewsPagination(
        userId,
        page,
        pageSize,
      );
    return result;
  }

  async getSavedReviewIdsByUserIdNonPagination(
    userId: UserId,
  ): Promise<ReviewId[]> {
    const result = await this.savedReviewRepostiory.find({
      userId: userId.getValue().toMongoObjectID(),
    });
    const mappedResult = result.map((savedReview) => {
      return ReviewId.create(
        new UniqueEntityID(savedReview.reviewId.toString()),
      );
    });
    return mappedResult;
  }

  async getSavedReview(
    userId: UserId,
    reviewId: ReviewId,
  ): Promise<SavedReviewDAO | undefined> {
    const result = await this.savedReviewRepostiory.findSavedReview(
      userId,
      reviewId,
    );
    return result;
  }
}
