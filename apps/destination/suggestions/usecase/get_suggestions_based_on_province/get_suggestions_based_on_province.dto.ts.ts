import { LanguageEnumValue } from 'apps/destination/src/constants/services';
import { IsIn, IsNotEmpty } from 'class-validator';

export class GetSuggestionsBasedOnProvinceDTO {
  @IsNotEmpty()
  code: string;

  @IsIn(Object.values(LanguageEnumValue))
  language: string;
}
