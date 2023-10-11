/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import { StorageService } from '@app/common/storage/storage.service';
import { CommentRepository } from './comment.repo';
import { CommentMapper } from './mapper/comment.mapper';
import { Comment } from './entity/comment.entity';
import { CommentId } from './entity/comment_id';
import { ReviewId } from '../src/entity/review_id';
import { Pagination } from '@app/common/core/pagination/pagination.type';
import { UserId } from 'apps/auth/user/domain/user_id';
import { Result } from '@app/common/core/result';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: CommentRepository) {}

  async createComment(comment: Comment): Promise<Comment | undefined> {
    try {
      const commentDAO = CommentMapper.toDAO(comment);
      await this.commentRepository.create({
        ...commentDAO,
      });
      return comment;
    } catch (err) {
      Logger.error(err, err.stack);
      return undefined;
    }
  }

  async updateComment(comment: Comment): Promise<Comment | undefined> {
    const result = await this.commentRepository.updateComment(comment);
    return result;
  }

  async getCommentById(commentId: CommentId): Promise<Comment> {
    const review = await this.commentRepository.findCommentById(commentId);
    return review;
  }

  async getCommentsByReviewId(
    reviewId: ReviewId,
    page: number,
    pageSize: number,
  ): Promise<Pagination<Comment>> {
    const result = await this.commentRepository.findAllCommentsPagination(
      {
        reviewId: reviewId.getValue().toMongoObjectID(),
      },
      page,
      pageSize,
    );
    return result;
  }

  async getCommentsByUserId(
    userId: UserId,
    page: number,
    pageSize: number,
  ): Promise<Pagination<Comment>> {
    const result = await this.commentRepository.findAllCommentsPagination(
      {
        userId: userId.getValue().toMongoObjectID(),
      },
      page,
      pageSize,
    );
    return result;
  }

  async like(commentId: CommentId, userId: UserId): Promise<Result<void>> {
    return await this.commentRepository.likeComment(commentId, userId);
  }

  async unlike(commentId: CommentId, userId: UserId): Promise<Result<void>> {
    return await this.commentRepository.unlikeComment(commentId, userId);
  }
}
