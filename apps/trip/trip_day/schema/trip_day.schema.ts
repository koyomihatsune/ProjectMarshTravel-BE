import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  TripDestinationDAO,
  TripDestinationSchema,
} from 'apps/trip/trip_destination/schema/trip_destination.schema';

@Schema({ versionKey: false })
export class TripDayDAO extends AbstractDocument {
  @Prop()
  position: number;

  @Prop()
  startOffsetFromMidnight: number;

  @Prop({ type: [TripDestinationSchema] })
  destinations: TripDestinationDAO[];
}

export const TripDaySchema = SchemaFactory.createForClass(TripDayDAO);
