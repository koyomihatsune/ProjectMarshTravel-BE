import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ versionKey: false, collection: 'saved_review' })
export class SavedReviewDAO extends AbstractDocument {
  @Prop()
  userId: Types.ObjectId;

  @Prop()
  reviewId: Types.ObjectId;
}

export const SavedReviewSchema = SchemaFactory.createForClass(SavedReviewDAO);
