/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { AbstractRepository } from '@app/common';
import { UserId } from 'apps/auth/user/domain/user_id';
import { Result } from '@app/common/core/result';
import { ReviewId } from '../src/entity/review_id';
import { Pagination } from '@app/common/core/pagination/pagination.type';
import { SORT_CONST } from '@app/common/constants';
import { SavedReviewDAO } from './schema/saved_review.schema';
import { UniqueEntityID } from '../../../libs/common/src/core/domain/unique_entity_id';
import { Review } from '../src/entity/review.entity';
import { ReviewMapper } from '../src/mapper/review.mapper';

@Injectable()
export class SavedReviewRepository extends AbstractRepository<SavedReviewDAO> {
  protected readonly logger = new Logger(SavedReviewRepository.name);

  constructor(
    @InjectModel(SavedReviewDAO.name) commentModel: Model<SavedReviewDAO>,
    @InjectConnection() connection: Connection,
  ) {
    super(commentModel, connection);
  }

  async createSavedReview(
    userId: UserId,
    reviewId: ReviewId,
  ): Promise<boolean> {
    try {
      const DAO = {
        userId: userId.getValue().toMongoObjectID(),
        reviewId: reviewId.getValue().toMongoObjectID(),
      };

      await this.create({
        ...DAO,
      });
      return true;
    } catch (err) {
      Logger.error(err, err.stack);
      return false;
    }
  }

  async deleteSavedReview(
    userId: UserId,
    reviewId: ReviewId,
  ): Promise<boolean> {
    try {
      const result = await this.model.deleteOne({
        userId: userId.getValue().toMongoObjectID(),
        reviewId: reviewId.getValue().toMongoObjectID(),
      });
      return true;
    } catch (err) {
      Logger.error(err, err.stack);
      return false;
    }
  }

  async findSavedReview(
    userId: UserId,
    reviewId: ReviewId,
  ): Promise<SavedReviewDAO | undefined> {
    try {
      const result = await this.model.findOne({
        userId: userId.getValue().toMongoObjectID(),
        reviewId: reviewId.getValue().toMongoObjectID(),
      });
      return result ?? undefined;
    } catch (err) {
      Logger.error(err, err.stack);
      return undefined;
    }
  }

  async findUserSavedReviewsPagination(
    userId: UserId,
    page: number,
    pageSize: number,
  ): Promise<Pagination<ReviewId>> {
    try {
      const result = await this.findPagination(
        {
          userId: userId.getValue().toMongoObjectID(),
        },
        page,
        pageSize,
        SORT_CONST.DATE_NEWEST,
      );
      return {
        result: result.results.map((savedReview) => {
          return ReviewId.create(
            new UniqueEntityID(savedReview.reviewId.toString()),
          );
        }),
        page: result.page,
        totalPage: result.totalPages,
      };
    } catch (err) {
      Logger.error(err, err.stack);
      return {
        result: [],
        page: 1,
        totalPage: 1,
      };
    }
  }
}
