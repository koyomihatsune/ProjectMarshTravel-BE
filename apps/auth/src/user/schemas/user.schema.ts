import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';

@Schema({ versionKey: false })
export class UserDAO extends AbstractDocument {
  @Prop()
  username?: string;

  @Prop()
  name: string;

  @Prop()
  provider: string;

  @Prop()
  email: string;

  @Prop()
  phoneNumber?: string;

  @Prop()
  createdAt: Date;

  @Prop()
  accessToken: string;

  @Prop()
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(UserDAO);
