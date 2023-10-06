import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';
import { LanguageEnumValue } from '../constants/services';

export class GetDestinationDetailsRequestDTO {
  @IsNotEmpty()
  place_id: string;

  @IsIn(Object.values(LanguageEnumValue))
  language: string;
}

export class GetMultipleDestinationDetailsRequestDTO {
  @IsNotEmpty()
  place_ids: string[];

  @IsIn(Object.values(LanguageEnumValue))
  language: string;
}

export class SearchDestinationsRequestDTO {
  @IsNotEmpty()
  query: string;

  @IsOptional()
  radius?: number;

  @IsIn(Object.values(LanguageEnumValue))
  language: string;

  //   @IsOptional()
  //   @IsIn(Object.values(DestinationTypeEnumValue))
  //   type?: string;
  @IsOptional()
  lat: number;

  @IsOptional()
  lon: number;
}
