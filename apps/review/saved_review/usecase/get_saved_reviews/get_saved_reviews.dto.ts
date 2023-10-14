import { IsNotEmpty } from 'class-validator';

export class GetSavedReviewsDTO {
  @IsNotEmpty()
  page: number;

  @IsNotEmpty()
  limit: number;
}
