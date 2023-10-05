import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ versionKey: false, collection: 'review' })
export class ReviewDAO extends AbstractDocument {
  @Prop()
  userId: Types.ObjectId;

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  place_id: string;

  @Prop({
    type: {
      province_code: String,
      district_code: String,
      highlighted: Boolean,
    },
  })
  tagging: {
    province_code: string;
    district_code?: string;
    highlighted: boolean;
  };

  @Prop()
  rating: number;

  @Prop()
  imageURLs: string[];

  @Prop()
  likes: Types.ObjectId[];

  @Prop()
  comments: {
    userId: Types.ObjectId;
    content: string;
  }[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  isDeleted: boolean;
}

export const ReviewSchema = SchemaFactory.createForClass(ReviewDAO);
