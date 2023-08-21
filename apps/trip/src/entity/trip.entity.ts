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

  get userId(): UniqueEntityID {
    return this.props.userId;
  }

  get description(): string {
    return this.props.description;
  }

  get isArchived(): boolean {
    return this.props.isArchived;
  }

  get startAt(): Date {
    return this.props.startAt;
  }

  get days(): TripDay[] {
    return this.props.days;
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
