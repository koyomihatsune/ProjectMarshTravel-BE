import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { ValueObject } from '@app/common/core/domain/value_object';

export class TripDayId extends ValueObject<{ value: UniqueEntityID }> {
  getValue(): UniqueEntityID {
    return this.props.value;
  }

  private constructor(value: UniqueEntityID) {
    super({ value });
  }

  public static create(value: UniqueEntityID): TripDayId {
    return new TripDayId(value);
  }
}
