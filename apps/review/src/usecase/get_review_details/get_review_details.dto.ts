import { IsNotEmpty } from 'class-validator';

export class GetReviewDetailsDTO {
  @IsNotEmpty()
  reviewId: string;

  @IsNotEmpty()
  language: string;
}
