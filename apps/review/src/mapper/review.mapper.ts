import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { ReviewDAO } from '../schemas/review.schema';
import { Review } from '../entity/review.entity';
import { UserId } from 'apps/auth/user/domain/user_id';

export class ReviewMapper {
  public static toDAO(review: Review): ReviewDAO {
    return {
      _id: review.reviewId.getValue().toMongoObjectID(),
      userId: review.userId.getValue().toMongoObjectID(),
      title: review.title,
      description: review.description,
      tagging: review.tagging,
      place_id: review.place_id,
      rating: review.rating,
      imageURLs: review.imageURLs,
      likes: review.likes.map((like) => like.getValue().toMongoObjectID()),
      comments: review.comments.map((comment) => ({
        userId: comment.userId.getValue().toMongoObjectID(),
        content: comment.content,
      })),
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      isDeleted: review.isDeleted,
      isApproved: review.isApproved,
    };
  }

  public static toEntity(dao: ReviewDAO): Review {
    const reviewIdToString = dao._id.toString();

    const reviewOrError = Review.create(
      {
        userId: UserId.create(new UniqueEntityID(dao.userId.toString())),
        title: dao.title,
        description: dao.description,
        place_id: dao.place_id,
        tagging: dao.tagging,
        rating: dao.rating,
        imageURLs: dao.imageURLs,
        likes: dao.likes.map((user) =>
          UserId.create(new UniqueEntityID(user.toString())),
        ),
        comments: dao.comments.map((comment) => ({
          userId: UserId.create(new UniqueEntityID(comment.userId.toString())),
          content: comment.content,
        })),
        createdAt: dao.createdAt,
        updatedAt: dao.updatedAt,
        isDeleted: dao.isDeleted,
        isApproved: dao.isApproved,
      },
      new UniqueEntityID(reviewIdToString),
    );

    return reviewOrError.isSuccess ? reviewOrError.getValue() : undefined;
  }
}
