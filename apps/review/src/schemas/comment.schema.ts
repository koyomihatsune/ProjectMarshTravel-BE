import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ versionKey: false, collection: 'comments' })
export class CommentDAO extends AbstractDocument {
  @Prop()
  userId: Types.ObjectId;

  @Prop()
  reviewId: Types.ObjectId;

  @Prop()
  content: string;

  @Prop()
  imageURL: string[];

  @Prop()
  likes: Types.ObjectId[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  isDeleted: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(CommentDAO);
