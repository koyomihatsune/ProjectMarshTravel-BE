import { IsNotEmpty } from 'class-validator';

export class SaveCommitReviewDTO {
  @IsNotEmpty()
  reviewId: string;

  @IsNotEmpty()
  save: boolean;
}
