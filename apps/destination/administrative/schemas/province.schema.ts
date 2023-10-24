import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';

@Schema({ versionKey: false, collection: 'provinces' })
export class ProvinceDAO extends AbstractDocument {
  @Prop({
    required: true,
    unique: true,
  })
  code: string;

  @Prop({
    required: true,
  })
  name: string;

  @Prop()
  name_en: string;

  @Prop({
    required: true,
  })
  full_name: string;

  @Prop()
  full_name_en: string;

  @Prop()
  code_name: string;

  @Prop()
  administrative_unit_id: string;

  @Prop()
  administrative_region_id: number;

  @Prop()
  explore_tags: string[];

  @Prop()
  imageURL: string;
}

export const ProvinceSchema = SchemaFactory.createForClass(ProvinceDAO);
