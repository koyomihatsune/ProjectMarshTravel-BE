import { IsNotEmpty } from 'class-validator';

export class GetReviewsFeedDTO {
  @IsNotEmpty()
  page: number;

  @IsNotEmpty()
  limit: number;

  @IsNotEmpty()
  sortBy: string;
}
