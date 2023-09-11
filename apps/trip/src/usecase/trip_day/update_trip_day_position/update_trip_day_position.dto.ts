import { IsNotEmpty } from 'class-validator';

export class UpdateTripDayPositionDTO {
  @IsNotEmpty()
  tripId: string;

  @IsNotEmpty()
  positions: number[];
}
