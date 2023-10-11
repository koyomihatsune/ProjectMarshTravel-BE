/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { AbstractRepository } from '@app/common';
import { UserId } from 'apps/auth/user/domain/user_id';
import { CommentDAO } from './schema/comment.schema';
import { CommentMapper } from './mapper/comment.mapper';
import { Comment } from './entity/comment.entity';
import { CommentId } from './entity/comment_id';
import { Result } from '@app/common/core/result';
import { ReviewId } from '../src/entity/review_id';
import { Pagination } from '@app/common/core/pagination/pagination.type';
import { SORT_CONST } from '@app/common/constants';

@Injectable()
export class CommentRepository extends AbstractRepository<CommentDAO> {
  protected readonly logger = new Logger(CommentRepository.name);

  constructor(
    @InjectModel(CommentDAO.name) commentModel: Model<CommentDAO>,
    @InjectConnection() connection: Connection,
  ) {
    super(commentModel, connection);
  }

  async createComment(comment: Comment): Promise<Comment | undefined> {
    try {
      const commentDAO = CommentMapper.toDAO(comment);
      await this.create({
        ...commentDAO,
      });
      return comment;
    } catch (err) {
      Logger.error(err, err.stack);
      return undefined;
    }
  }

  async updateComment(comment: Comment): Promise<Comment | undefined> {
    try {
      const commentDAO = CommentMapper.toDAO(comment);
      const result = await this.findOneAndUpdate(
        {
          _id: comment.commentId.getValue().toMongoObjectID(),
        },
        {
          ...commentDAO,
        },
      );

      return CommentMapper.toEntity(result);
    } catch (err) {
      Logger.error(err, err.stack);
      return undefined;
    }
  }

  async likeComment(
    commentId: CommentId,
    userId: UserId,
  ): Promise<Result<void>> {
    try {
      const result = await this.likeDocument(
        {
          _id: commentId.getValue().toMongoObjectID(),
        },
        userId.getValue().toMongoObjectID(),
      );
      return Result.ok<void>();
    } catch (err) {
      Logger.error(err, err.stack);
      return Result.fail<void>(err);
    }
  }

  async unlikeComment(
    commentId: CommentId,
    userId: UserId,
  ): Promise<Result<void>> {
    try {
      const result = await this.unlikeDocument(
        {
          _id: commentId.getValue().toMongoObjectID(),
        },
        userId.getValue().toMongoObjectID(),
      );
      return Result.ok<void>();
    } catch (err) {
      Logger.error(err, err.stack);
      return Result.fail<void>(err);
    }
  }

  async findCommentById(commentId: CommentId): Promise<Comment | undefined> {
    try {
      const result = await this.findOne({
        _id: commentId.getValue().toMongoObjectID(),
      });
      const review = CommentMapper.toEntity(result);
      return review;
    } catch (err) {
      Logger.error(err, err.stack);
      return undefined;
    }
  }

  // Có thể tìm comment bằng ReviewId
  async findAllCommentsPagination(
    filterQuery: { reviewId?: Types.ObjectId; userId?: Types.ObjectId },
    page: number,
    pageSize: number,
  ): Promise<Pagination<Comment> | undefined> {
    try {
      const result = await this.findPagination(
        {
          ...filterQuery,
          isDeleted: false,
        },
        page,
        pageSize,
        SORT_CONST.DATE_NEWEST,
      );
      // sort from newest to oldest
      // reviews.sort((a, b) => {
      //   return b.createdAt.getTime() - a.createdAt.getTime();
      // });
      return {
        result: result.results.map((comment) => {
          return CommentMapper.toEntity(comment);
        }),
        page: result.page,
        totalPage: result.totalPages,
      };
    } catch (err) {
      Logger.error(err, err.stack);
      return undefined;
    }
  }

  async findFirstCommentByReview(
    reviewId: ReviewId,
  ): Promise<Comment | undefined> {
    const result = await this.findPagination(
      {
        reviewId: reviewId.getValue().toMongoObjectID(),
      },
      1,
      1,
      SORT_CONST.DATE_NEWEST,
    );
    return result.results.length > 0
      ? CommentMapper.toEntity(result.results[0])
      : undefined;
  }
}
