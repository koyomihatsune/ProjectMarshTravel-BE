import { AggregateRoot } from '@app/common/core/domain/aggregate_root';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { Result } from '@app/common/core/result';
import { Guard } from '@app/common/core/guard';
import { UserId } from 'apps/auth/user/domain/user_id';
import { ReviewId } from 'apps/review/src/entity/review_id';
import { CommentId } from './comment_id';

export interface CommentProps {
  userId: UserId;
  reviewId: ReviewId;
  parentCommentId?: CommentId | undefined;
  content: string;
  imageURL: string;
  likes: UserId[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Comment extends AggregateRoot<CommentProps> {
  private constructor(props: CommentProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get commentId(): CommentId {
    return CommentId.create(this._id);
  }

  get userId(): UserId {
    return this.props.userId;
  }

  get reviewId(): ReviewId {
    return this.props.reviewId;
  }

  get parentCommentId(): CommentId | undefined {
    return this.props.parentCommentId;
  }

  get content(): string {
    return this.props.content;
  }

  set content(content: string) {
    this.props.content = content;
  }

  get imageURL(): string {
    return this.props.imageURL;
  }

  get likes(): UserId[] {
    return this.props.likes;
  }

  get isDeleted(): boolean {
    return this.props.isDeleted;
  }

  set isDeleted(isDeleted: boolean) {
    this.props.isDeleted = isDeleted;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  set updatedAt(updatedAt: Date) {
    this.props.updatedAt = updatedAt;
  }

  // Factory method to create a new Comment entity
  public static create(
    props: CommentProps,
    id?: UniqueEntityID,
  ): Result<Comment> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.content, argumentName: 'content' },
    ]);

    if (guardResult.isFailure) {
      return Result.fail<Comment>(guardResult.getErrorValue());
    }

    const review = new Comment(
      {
        ...props,
      },
      id,
    );

    return Result.ok<Comment>(review);
  }
}
