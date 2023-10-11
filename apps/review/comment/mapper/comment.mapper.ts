import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { UserId } from 'apps/auth/user/domain/user_id';
import { CommentDAO } from '../schema/comment.schema';
import { Comment } from '../entity/comment.entity';
import { ReviewId } from 'apps/review/src/entity/review_id';
import { CommentId } from '../entity/comment_id';

export class CommentMapper {
  public static toDAO(comment: Comment): CommentDAO {
    return {
      _id: comment.commentId.getValue().toMongoObjectID(),
      userId: comment.userId.getValue().toMongoObjectID(),
      reviewId: comment.reviewId.getValue().toMongoObjectID(),
      parentCommentId: comment.parentCommentId
        ? comment.parentCommentId.getValue().toMongoObjectID()
        : undefined,
      content: comment.content,
      imageURL: comment.imageURL,
      likes: comment.likes.map((userId) => userId.getValue().toMongoObjectID()),
      isDeleted: comment.isDeleted,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }

  public static toEntity(dao: CommentDAO): Comment {
    const commentIdToString = dao._id.toString();

    const commentOrError = Comment.create(
      {
        userId: UserId.create(new UniqueEntityID(dao.userId.toString())),
        reviewId: ReviewId.create(new UniqueEntityID(dao.reviewId.toString())),
        parentCommentId: dao.parentCommentId
          ? CommentId.create(new UniqueEntityID(dao.parentCommentId.toString()))
          : undefined,
        content: dao.content,
        imageURL: dao.imageURL,
        likes: dao.likes.map((userId) =>
          UserId.create(new UniqueEntityID(userId.toString())),
        ),
        isDeleted: dao.isDeleted,
        createdAt: dao.createdAt,
        updatedAt: dao.updatedAt,
      },
      new UniqueEntityID(commentIdToString),
    );

    return commentOrError.isSuccess ? commentOrError.getValue() : undefined;
  }
}
