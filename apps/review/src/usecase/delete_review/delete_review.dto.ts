import { IsNotEmpty } from 'class-validator';

export class DeleteReviewDTO {
  @IsNotEmpty()
  reviewId: string;
}
