import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';

@Schema({ versionKey: false, collection: 'users' })
export class UserDAO extends AbstractDocument {
  @Prop({ unique: true })
  username: string;

  @Prop()
  name: string;

  @Prop()
  provider: string;

  @Prop({ unique: true })
  email: string;

  @Prop()
  phoneNumber?: string;

  @Prop()
  dob?: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  accessToken: string;

  @Prop()
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(UserDAO);
