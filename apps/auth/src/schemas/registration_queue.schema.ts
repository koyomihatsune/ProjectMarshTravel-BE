import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';

@Schema({ versionKey: false, collection: 'registration_queue' })
export class RegistrationQueueDAO extends AbstractDocument {
  @Prop({ unique: true })
  phoneNumber: string;

  @Prop()
  lastUpdated: Date;

  @Prop()
  tries: number;
}

export const RegistrationQueueSchema =
  SchemaFactory.createForClass(RegistrationQueueDAO);
