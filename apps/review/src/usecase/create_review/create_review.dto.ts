import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateReviewDTO {
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsNotEmpty()
  @MaxLength(12000)
  description: string;

  @IsNotEmpty()
  place_id: string;

  @IsNotEmpty()
  rating: number;

  hashtag: string[];

  images: Express.Multer.File[];
}
