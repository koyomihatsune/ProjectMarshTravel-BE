import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class TripDestinationDAO extends AbstractDocument {
  @Prop()
  position: number;

  @Prop()
  type: string;

  @Prop()
  place_id: string;
}

export const TripDestinationSchema =
  SchemaFactory.createForClass(TripDestinationDAO);
