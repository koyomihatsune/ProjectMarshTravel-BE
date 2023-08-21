import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateTripDayDTO {
  @IsNotEmpty()
  tripId: string;

  @IsNotEmpty()
  @MaxLength(50)
  // Nếu vị trí là n thì sẽ đẩy tiến các trip có position >= n lên 1 position
  position: number;

  @IsNotEmpty()
  startOffsetFromMidnight: number;
}
