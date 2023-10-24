import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ versionKey: false, collection: 'followed_administrative' })
export class FollowedAdministrativeDAO extends AbstractDocument {
  @Prop()
  userId: Types.ObjectId;

  @Prop()
  code: string;

  @Prop()
  type: string;
}

export const FollowedAdministrativeSchema = SchemaFactory.createForClass(
  FollowedAdministrativeDAO,
);
