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
  tagging: {
    province_code: string;
    district_code?: string;
    highlighted: boolean;
  };
  rating: number;
  imageURLs: string[];
  likes: UserId[];
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  isApproved: boolean;
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

  set title(title: string) {
    this.props.title = title;
  }

  get description(): string {
    return this.props.description;
  }

  set description(description: string) {
    this.props.description = description;
  }

  get rating(): number {
    return this.props.rating;
  }

  set rating(rating: number) {
    this.props.rating = rating;
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

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  set updatedAt(updatedAt: Date) {
    this.props.updatedAt = updatedAt;
  }

  get isDeleted(): boolean {
    return this.props.isDeleted;
  }

  set isDeleted(isDeleted: boolean) {
    this.props.isDeleted = isDeleted;
  }

  get isApproved(): boolean {
    return this.props.isApproved;
  }

  set isApproved(isApproved: boolean) {
    this.props.isApproved = isApproved;
  }

  get tagging(): {
    province_code: string;
    district_code?: string;
    highlighted: boolean;
  } {
    return this.props.tagging;
  }

  set tagging(tagging: {
    province_code: string;
    district_code?: string;
    highlighted: boolean;
  }) {
    this.props.tagging = tagging;
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
