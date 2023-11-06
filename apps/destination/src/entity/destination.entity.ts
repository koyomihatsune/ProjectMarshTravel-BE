import { AggregateRoot } from '@app/common/core/domain/aggregate_root';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { DestinationId } from './destination_id';
import { Result } from '@app/common/core/result';
import { Guard } from '@app/common/core/guard';

export interface DestinationProps {
  place_id: string;
  name: string | undefined;
  description: string | undefined;
  image_url?: string;
  mapsSearchDetails?: any;
  mapsFullDetails?: any;
  isRegistered: boolean;
  isCached: boolean;
}

export class Destination extends AggregateRoot<DestinationProps> {
  private constructor(props: DestinationProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get destinationId(): DestinationId {
    return DestinationId.create(this._id);
  }

  get name(): string | undefined {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get place_id(): string {
    return this.props.place_id;
  }

  get image_url(): string {
    return this.props.image_url;
  }

  get mapsSearchDetails(): any | undefined {
    return this.props.mapsSearchDetails;
  }

  set mapsSearchDetails(mapsSearchDetails: any | undefined) {
    this.props.mapsSearchDetails = mapsSearchDetails;
  }

  get mapsFullDetails(): any | undefined {
    return this.props.mapsFullDetails;
  }

  set mapsFullDetails(mapsFullDetails: any | undefined) {
    this.props.mapsFullDetails = mapsFullDetails;
  }

  get isRegistered(): boolean {
    return this.props.isRegistered;
  }

  get isCached(): boolean {
    return this.props.isCached;
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
