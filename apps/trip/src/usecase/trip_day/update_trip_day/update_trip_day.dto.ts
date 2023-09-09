import { IsNotEmpty, Min } from 'class-validator';

export class UpdateTripDayDTO {
  @IsNotEmpty()
  tripId: string;

  @IsNotEmpty()
  tripDayId: string;

  @Min(0)
  startOffsetFromMidnight?: number;
}
