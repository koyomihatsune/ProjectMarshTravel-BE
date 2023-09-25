import { AggregateRoot } from '@app/common/core/domain/aggregate_root';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { Result } from '@app/common/core/result';
import { Guard } from '@app/common/core/guard';
import { ReviewId } from './review_id';
import { UserId } from 'apps/auth/user/domain/user_id';

export interface ReviewProps {
  userId: UserId;
  title: string;
  description: string;
  place_id: string;
  rating: number;
  imageURLs: string[];
  likes: UserId[];
  comments: {
    userId: UserId;
    content: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

export class Review extends AggregateRoot<ReviewProps> {
  private constructor(props: ReviewProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get reviewId(): ReviewId {
    return ReviewId.create(this._id);
  }

  get userId(): UserId {
    return this.props.userId;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get rating(): number {
    return this.props.rating;
  }

  get imageURLs(): string[] {
    return this.props.imageURLs;
  }

  get place_id(): string {
    return this.props.place_id;
  }

  get likes(): UserId[] {
    return this.props.likes;
  }

  get comments(): {
    userId: UserId;
    content: string;
  }[] {
    return this.props.comments;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get isDeleted(): boolean {
    return this.props.isDeleted;
  }

  // Factory method to create a new Review entity
  public static create(
    props: ReviewProps,
    id?: UniqueEntityID,
  ): Result<Review> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.title, argumentName: 'title' },
      { argument: props.description, argumentName: 'description' },
      { argument: props.rating, argumentName: 'rating' },
    ]);

    if (guardResult.isFailure) {
      return Result.fail<Review>(guardResult.getErrorValue());
    }

    const review = new Review(
      {
        ...props,
      },
      id,
    );

    return Result.ok<Review>(review);
  }
}
