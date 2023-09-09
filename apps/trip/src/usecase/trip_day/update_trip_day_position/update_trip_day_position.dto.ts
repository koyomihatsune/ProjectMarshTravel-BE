import { IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateTripDayPositionDTO {
  @IsNotEmpty()
  tripId: string;

  @MaxLength(50)
  positions: number[];
}
