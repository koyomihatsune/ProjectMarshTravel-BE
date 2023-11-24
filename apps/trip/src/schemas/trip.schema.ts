import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  TripDayDAO,
  TripDaySchema,
} from 'apps/trip/trip_day/schema/trip_day.schema';
import { Types } from 'mongoose';

@Schema({ versionKey: false, collection: 'trips' })
export class TripDAO extends AbstractDocument {
  @Prop()
  name: string;

  @Prop()
  userId: Types.ObjectId;

  @Prop()
  description: string;

  @Prop()
  isArchived: boolean;

  @Prop()
  isDeleted: boolean;

  @Prop()
  startAt: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ type: [TripDaySchema] }) // Nested array of TripDayDAO
  days: TripDayDAO[];
}

export const TripSchema = SchemaFactory.createForClass(TripDAO);
