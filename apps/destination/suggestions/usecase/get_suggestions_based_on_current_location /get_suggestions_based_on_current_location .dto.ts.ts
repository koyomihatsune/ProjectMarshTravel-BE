import { LanguageEnumValue } from 'apps/destination/src/constants/services';
import { IsIn, IsNotEmpty } from 'class-validator';

export class GetSuggestionsBasedOnCurrentLocationDTO {
  @IsNotEmpty()
  lat: number;

  @IsNotEmpty()
  lon: number;

  @IsIn(Object.values(LanguageEnumValue))
  language: string;
}
