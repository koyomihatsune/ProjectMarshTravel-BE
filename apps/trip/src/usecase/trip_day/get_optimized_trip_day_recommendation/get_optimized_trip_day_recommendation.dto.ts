import { IsNotEmpty } from 'class-validator';

export class GetOptimizedTripDayRecommendationDTO {
  @IsNotEmpty()
  tripId: string;

  tripDayId: string;

  fixedDestinationList: boolean[];

  language: string;
}
