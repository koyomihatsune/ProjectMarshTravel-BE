import { IsNotEmpty } from 'class-validator';

export class DeleteTripDayDTO {
  @IsNotEmpty()
  tripId: string;

  @IsNotEmpty()
  tripDayId: string;
}
