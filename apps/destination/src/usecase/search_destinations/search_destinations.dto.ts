import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';
import { LanguageEnumValue } from '../../constants/services';
import { DestinationSingleResponseDTO } from '../get_destination_details/get_destination_details.dto';

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

export class DestinationMultipleResponseDTO {
  destinations: DestinationSingleResponseDTO[];
  nextPageToken?: string;
}
