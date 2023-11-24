import { IsNotEmpty } from 'class-validator';

export class UpdateTripDTO {
  @IsNotEmpty()
  tripId: string;

  name?: string;

  description?: string;

  startAt?: Date;

  isArchived?: boolean;

  isDeleted?: boolean;
}
