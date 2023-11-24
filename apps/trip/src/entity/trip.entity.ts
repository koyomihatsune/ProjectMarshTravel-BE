import { AggregateRoot } from '@app/common/core/domain/aggregate_root';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { Result } from '@app/common/core/result';
import { Guard } from '@app/common/core/guard';
import { TripId } from './trip_id';
import { TripDay } from 'apps/trip/trip_day/entity/trip_day.entity';

export interface TripProps {
  name: string;
  userId: UniqueEntityID;
  description: string;
  isArchived: boolean;
  isDeleted: boolean;
  startAt: Date;
  createdAt: Date;
  updatedAt: Date;
  days: TripDay[];
}

export class Trip extends AggregateRoot<TripProps> {
  private constructor(props: TripProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get tripId(): TripId {
    return TripId.create(this._id);
  }

  get name(): string {
    return this.props.name;
  }

  set name(name: string) {
    this.props.name = name;
  }

  get userId(): UniqueEntityID {
    return this.props.userId;
  }

  get description(): string {
    return this.props.description;
  }

  set description(description: string) {
    this.props.description = description;
  }

  get isArchived(): boolean {
    return this.props.isArchived;
  }

  set isArchived(isArchived: boolean) {
    this.props.isArchived = isArchived;
  }

  get isDeleted(): boolean {
    return this.props.isDeleted;
  }

  set isDeleted(isDeleted: boolean) {
    this.props.isDeleted = isDeleted;
  }

  get startAt(): Date {
    return this.props.startAt;
  }

  set startAt(startAt: Date) {
    this.props.startAt = startAt;
  }

  get days(): TripDay[] {
    return this.props.days;
  }

  set days(days: TripDay[]) {
    this.props.days = days;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Factory method to create a new Destination entity
  public static create(props: TripProps, id?: UniqueEntityID): Result<Trip> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.name, argumentName: 'name' },
    ]);

    if (guardResult.isFailure) {
      return Result.fail<Trip>(guardResult.getErrorValue());
    }

    const destination = new Trip(
      {
        ...props,
      },
      id,
    );

    return Result.ok<Trip>(destination);
  }
}
