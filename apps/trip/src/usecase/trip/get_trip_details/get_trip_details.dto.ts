import { IsNotEmpty } from 'class-validator';

export class GetTripDetailsDTO {
  @IsNotEmpty()
  tripId: string;
}
