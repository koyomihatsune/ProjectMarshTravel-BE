import { AggregateRoot } from '@app/common/core/domain/aggregate_root';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { Result } from '@app/common/core/result';
import { Guard } from '@app/common/core/guard';
import { TripDayId } from './trip_day_id';
import { TripDestination } from '../../trip_destination/entity/trip_destination.entity';

export interface TripDayProps {
  position: number;
  // Tính startOffsetFromMidnight từ 0:00 - cố định múi giờ Việt Nam  = startTime.getTime() - midnight.getTime();
  startOffsetFromMidnight: number;
  destinations: TripDestination[];
}

export class TripDay extends AggregateRoot<TripDayProps> {
  private constructor(props: TripDayProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get tripDayId(): TripDayId {
    return TripDayId.create(this._id);
  }

  get startOffsetFromMidnight(): number {
    return this.props.startOffsetFromMidnight;
  }

  get position(): number {
    return this.props.position;
  }

  set position(position: number) {
    this.props.position = position;
  }

  get destinations(): TripDestination[] {
    return this.props.destinations;
  }

  // Factory method to create a new Destination entity
  public static create(
    props: TripDayProps,
    id?: UniqueEntityID,
  ): Result<TripDay> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.position, argumentName: 'position' },
    ]);

    if (guardResult.isFailure) {
      return Result.fail<TripDay>(guardResult.getErrorValue());
    }

    const tripDay = new TripDay(
      {
        ...props,
      },
      id,
    );

    return Result.ok<TripDay>(tripDay);
  }
}
