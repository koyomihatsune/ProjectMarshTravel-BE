import { IsNotEmpty } from 'class-validator';

export class GetReviewsByUserDTO {
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  page: number;

  @IsNotEmpty()
  limit: number;

  @IsNotEmpty()
  sortBy: string;
}
