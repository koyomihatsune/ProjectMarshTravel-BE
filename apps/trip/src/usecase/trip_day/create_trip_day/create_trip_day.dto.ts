import { IsNotEmpty, Max, Min } from 'class-validator';

export class CreateTripDayDTO {
  @IsNotEmpty()
  tripId: string;

  @IsNotEmpty()
  // Nếu vị trí là n thì sẽ đẩy tiến các trip có position >= n lên 1 position
  position: number;

  @IsNotEmpty()
  @Min(0)
  @Max(82800000, {
    message: 'Time must be smaller than 23:00:00',
  })
  startOffsetFromMidnight: number;
}
