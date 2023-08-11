import { AbstractDocument } from '@app/common';
import { Prop, Schema } from '@nestjs/mongoose';
import { TripDestinationDAO } from 'apps/trip/trip_destination/schema/trip_destination.schema';

@Schema({ versionKey: false })
export class TripDayDAO extends AbstractDocument {
  @Prop()
  position: number;

  @Prop()
  startOffsetFromMidnight: number;

  @Prop({ type: [TripDestinationDAO] })
  destinations: TripDestinationDAO[];
}
