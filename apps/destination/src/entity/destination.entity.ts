import { AggregateRoot } from '@app/common/core/domain/aggregate_root';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { DestinationId } from './destination_id';
import { Result } from '@app/common/core/result';
import { Guard } from '@app/common/core/guard';

export interface DestinationProps {
  place_id: string;
  name: string;
  formatted_address: string;
  image_url: string;
  lat: number;
  lon: number;
  mapsSearchDetails?: any;
  mapsFullDetails?: any;
  reviewIds: UniqueEntityID[];
  isRegistered: boolean;
}

export class Destination extends AggregateRoot<DestinationProps> {
  private constructor(props: DestinationProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get destinationId(): DestinationId {
    return DestinationId.create(this._id);
  }

  get place_id(): string {
    return this.props.place_id;
  }

  get name(): string {
    return this.props.name;
  }

  get formatted_address(): string {
    return this.props.formatted_address;
  }

  get image_url(): string {
    return this.props.image_url;
  }

  get lat(): number {
    return this.props.lat;
  }

  get lon(): number {
    return this.props.lon;
  }

  get mapsSearchDetails(): any | undefined {
    return this.props.mapsSearchDetails;
  }

  get mapsFullDetails(): any | undefined {
    return this.props.mapsFullDetails;
  }

  get isRegistered(): boolean {
    return this.props.isRegistered;
  }

  get reviewIds(): UniqueEntityID[] {
    return this.props.reviewIds;
  }

  // Factory method to create a new Destination entity
  public static create(
    props: DestinationProps,
    id?: UniqueEntityID,
  ): Result<Destination> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.place_id, argumentName: 'place_id' },
    ]);

    if (guardResult.isFailure) {
      return Result.fail<Destination>(guardResult.getErrorValue());
    }

    const destination = new Destination(
      {
        ...props,
      },
      id,
    );

    return Result.ok<Destination>(destination);
  }
}
