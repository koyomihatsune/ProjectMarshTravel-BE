import { IsNotEmpty } from 'class-validator';

export class LikeCommitReviewDTO {
  @IsNotEmpty()
  reviewId: string;

  @IsNotEmpty()
  like: boolean;
}
