import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class UpdateReviewDTO {
  @IsNotEmpty()
  reviewId: string;

  @IsNotEmpty()
  @MaxLength(200)
  @MinLength(15)
  title: string;

  @IsNotEmpty()
  @MinLength(15)
  @MaxLength(40000)
  description: string;

  @IsNotEmpty()
  rating: number;
}
