import { IsNotEmpty } from 'class-validator';

export class DeleteTripDestinationDTO {
  @IsNotEmpty()
  tripId: string;

  @IsNotEmpty()
  tripDayId: string;

  @IsNotEmpty()
  tripDestinationId: string;
}
