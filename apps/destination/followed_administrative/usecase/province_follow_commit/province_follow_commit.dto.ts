import { IsNotEmpty } from 'class-validator';

export class ProvinceFollowCommitDTO {
  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  follow: boolean;
}
