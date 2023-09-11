import { IsNotEmpty } from 'class-validator';

export class UpdateTripDestinationPositionDTO {
  @IsNotEmpty()
  tripId: string;

  @IsNotEmpty()
  tripDayId: string;

  @IsNotEmpty()
  positions: number[];
}
