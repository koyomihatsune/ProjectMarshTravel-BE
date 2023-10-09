/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { AbstractRepository } from '@app/common';
import { UserId } from 'apps/auth/user/domain/user_id';
import { ReviewDAO } from './schemas/review.schema';
import { ReviewMapper } from './mapper/review.mapper';
import { Review } from './entity/review.entity';
import { ReviewId } from './entity/review_id';
import { Result } from '@app/common/core/result';
@Injectable()
export class ReviewRepository extends AbstractRepository<ReviewDAO> {
  protected readonly logger = new Logger(ReviewRepository.name);

  constructor(
    @InjectModel(ReviewDAO.name) reviewModel: Model<ReviewDAO>,
    @InjectConnection() connection: Connection,
  ) {
    super(reviewModel, connection);
  }

  async createReview(review: Review): Promise<Review | undefined> {
    try {
      const reviewDAO = ReviewMapper.toDAO(review);
      await this.create({
        ...reviewDAO,
      });
      return review;
    } catch (err) {
      Logger.error(err, err.stack);
      return undefined;
    }
  }

  async updateReview(reviewInput: Review): Promise<Review | undefined> {
    try {
      const reviewDAO = ReviewMapper.toDAO(reviewInput);
      const result = await this.findOneAndUpdate(
        {
          _id: reviewInput.reviewId.getValue().toMongoObjectID(),
        },
        {
          ...reviewDAO,
        },
      );

      const review = ReviewMapper.toEntity(result);
      return review;
    } catch (err) {
      Logger.error(err, err.stack);
      return undefined;
    }
  }

  async likeReview(reviewId: ReviewId, userId: UserId): Promise<Result<void>> {
    try {
      const result = await this.likeDocument(
        {
          _id: reviewId.getValue().toMongoObjectID(),
        },
        userId.getValue().toMongoObjectID(),
      );
      return Result.ok<void>();
    } catch (err) {
      Logger.error(err, err.stack);
      return Result.fail<void>(err);
    }
  }

  async unlikeReview(
    reviewId: ReviewId,
    userId: UserId,
  ): Promise<Result<void>> {
    try {
      const result = await this.unlikeDocument(
        {
          _id: reviewId.getValue().toMongoObjectID(),
        },
        userId.getValue().toMongoObjectID(),
      );
      return Result.ok<void>();
    } catch (err) {
      Logger.error(err, err.stack);
      return Result.fail<void>(err);
    }
  }

  async findReviewById(reviewId: ReviewId): Promise<Review | undefined> {
    try {
      const result = await this.findOne({
        _id: reviewId.getValue().toMongoObjectID(),
      });
      const review = ReviewMapper.toEntity(result);
      return review;
    } catch (err) {
      Logger.error(err, err.stack);
      return undefined;
    }
  }

  // Có thể tìm review bằng UserId hoặc tìm bằng placeId
  async findAllReviewsPagination(
    params: {
      userId?: Types.ObjectId;
      place_id?: string;
      tagging?: {
        province_code?: string;
        highlighted?: boolean;
      };
    },
    page: number,
    pageSize: number,
    sortBy: string,
  ): Promise<Review[] | undefined> {
    try {
      const result = await this.findPagination(
        {
          ...params,
          isDeleted: false,
        },
        page,
        pageSize,
        sortBy,
      );
      const reviews = result.map((review) => {
        return ReviewMapper.toEntity(review);
      });
      // sort from newest to oldest
      // reviews.sort((a, b) => {
      //   return b.createdAt.getTime() - a.createdAt.getTime();
      // });
      return reviews;
    } catch (err) {
      Logger.error(err, err.stack);
      return undefined;
    }
  }
}
