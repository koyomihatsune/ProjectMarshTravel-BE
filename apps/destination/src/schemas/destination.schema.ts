import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';

@Schema({ versionKey: false, collection: 'destinations' })
export class DestinationDAO extends AbstractDocument {
  @Prop({ unique: true })
  place_id: string;

  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  image_url: string;
}

export const DestinationSchema = SchemaFactory.createForClass(DestinationDAO);
