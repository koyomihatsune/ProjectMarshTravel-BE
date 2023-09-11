import { IsNotEmpty } from 'class-validator';

export class CreateTripDestinationDTO {
  @IsNotEmpty()
  tripId: string;

  @IsNotEmpty()
  tripDayId: string;

  @IsNotEmpty()
  place_id: string;

  @IsNotEmpty()
  // Nếu vị trí là n thì sẽ đẩy tiến các trip có position >= n lên 1 position
  position: number;

  @IsNotEmpty()
  type: string;
}
