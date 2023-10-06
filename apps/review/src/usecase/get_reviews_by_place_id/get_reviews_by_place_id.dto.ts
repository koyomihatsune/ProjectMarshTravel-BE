import { IsNotEmpty } from 'class-validator';

export class GetReviewsByPlaceIdDTO {
  @IsNotEmpty()
  place_id: string;

  @IsNotEmpty()
  page: number;

  @IsNotEmpty()
  limit: number;

  @IsNotEmpty()
  sortBy: string;
}
