import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';

@Schema({ versionKey: false, collection: 'destination_cache' })
export class DestinationCacheDAO extends AbstractDocument {
  @Prop({ unique: true })
  place_id: string;

  @Prop()
  lang: string;

  @Prop()
  data?: string;

  @Prop()
  lastUpdated: Date;
}

export const DestinationCacheSchema =
  SchemaFactory.createForClass(DestinationCacheDAO);
