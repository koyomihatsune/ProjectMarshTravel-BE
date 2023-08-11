import { AggregateRoot } from '@app/common/core/domain/aggregate_root';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { Result } from '@app/common/core/result';
import { Guard } from '@app/common/core/guard';
import { TripDestinationId } from './trip_destination_id';

export interface TripDestinationProps {
  position: number;
  place_id: string;
}

export class TripDestination extends AggregateRoot<TripDestinationProps> {
  private constructor(props: TripDestinationProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get tripDestinationId(): TripDestinationId {
    return TripDestinationId.create(this._id);
  }

  get position(): number {
    return this.props.position;
  }

  get place_id(): string {
    return this.props.place_id;
  }

  // Factory method to create a new Destination entity
  public static create(
    props: TripDestinationProps,
    id?: UniqueEntityID,
  ): Result<TripDestination> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.place_id, argumentName: 'place_id' },
    ]);

    if (guardResult.isFailure) {
      return Result.fail<TripDestination>(guardResult.getErrorValue());
    }

    const tripDestination = new TripDestination(
      {
        ...props,
      },
      id,
    );

    return Result.ok<TripDestination>(tripDestination);
  }
}
