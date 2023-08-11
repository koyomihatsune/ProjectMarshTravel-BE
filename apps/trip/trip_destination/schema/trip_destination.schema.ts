import { AbstractDocument } from '@app/common';
import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class TripDestinationDAO extends AbstractDocument {
  @Prop()
  position: number;

  @Prop()
  place_id: string;
}
