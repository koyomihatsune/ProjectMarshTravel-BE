import { IsDateString, IsNotEmpty, Max, MaxLength, Min } from 'class-validator';

export class CreateTripDTO {
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  description: string;

  @IsNotEmpty()
  @IsDateString()
  startAt: Date; //theo dạng iso gmt+7 00:00

  @IsNotEmpty()
  @Min(0)
  @Max(82800000, {
    message: 'Time must be smaller than 23:00:00',
  })
  initialStartOffsetFromMidnight: number;

  @IsNotEmpty()
  @Min(1)
  tripLength: number;
}
