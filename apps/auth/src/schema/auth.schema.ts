import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';

@Schema({ versionKey: false })
export class Auth extends AbstractDocument {
  @Prop()
  username: string;

  @Prop()
  googleAccountId: string;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
