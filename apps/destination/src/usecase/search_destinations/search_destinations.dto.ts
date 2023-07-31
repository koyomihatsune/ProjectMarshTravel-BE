import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';

export const DestinationTypeEnumValue = {
  RESTAURANT: 'restaurant',
} as const;

export const LanguageEnumValue = {
  ENGLISH: 'en',
  VIETNAMESE: 'vi',
} as const;

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

export class SearchDestinationsSingleResponseDTO {
  //use placeId by Google Maps - but put in database as destinationId
  destinationId: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  mapsSearchDetails?: any;
  mapsFullDetails?: any;
  reviews?: any[];
  isRegistered: boolean;
}

export class SearchDestinationsMultipleResponseDTO {
  destinations: SearchDestinationsSingleResponseDTO[];
  nextPageToken?: string;
}
