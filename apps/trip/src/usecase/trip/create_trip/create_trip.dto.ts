import { IsDateString, IsNotEmpty, MaxLength, Min } from 'class-validator';

export class CreateTripDTO {
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  description: string;

  @IsNotEmpty()
  @IsDateString()
  startAt: Date;

  @IsNotEmpty()
  @Min(1)
  tripLength: number;
}
