import { IsNotEmpty } from 'class-validator';

export class GetOptimizedTripDayRecommendationDTO {
  @IsNotEmpty()
  tripId: string;

  tripDayId: string;

  language: string;
}
