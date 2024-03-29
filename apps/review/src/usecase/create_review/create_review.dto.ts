import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateReviewDTO {
  @IsNotEmpty()
  @MinLength(15)
  @MaxLength(200)
  title: string;

  @IsNotEmpty()
  @MinLength(15)
  @MaxLength(40000)
  description: string;

  @IsNotEmpty()
  place_id: string;

  @IsNotEmpty()
  rating: number;

  images?: Express.Multer.File[];
}
