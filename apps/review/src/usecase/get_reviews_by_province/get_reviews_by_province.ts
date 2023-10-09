import { IsNotEmpty } from 'class-validator';

export class GetReviewsByProvinceDTO {
  @IsNotEmpty()
  province_code: string;

  @IsNotEmpty()
  page: number;

  @IsNotEmpty()
  limit: number;

  @IsNotEmpty()
  sortBy: string;
}
