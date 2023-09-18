import { IsNotEmpty } from 'class-validator';

export class GetTripDayDetailsDTO {
  @IsNotEmpty()
  tripId: string;

  tripDayId: string;

  language: string;
}
