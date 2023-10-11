import { IsNotEmpty } from 'class-validator';

export class GetCommentsByReviewDTO {
  @IsNotEmpty()
  reviewId: string;

  @IsNotEmpty()
  page: number;

  @IsNotEmpty()
  limit: number;

  @IsNotEmpty()
  sortBy: string;
}
