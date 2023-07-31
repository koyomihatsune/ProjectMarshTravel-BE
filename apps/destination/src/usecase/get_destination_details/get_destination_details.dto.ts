import { IsIn, IsNotEmpty } from 'class-validator';
import { LanguageEnumValue } from '../../constants/services';

export class GetDestinationDetailsRequestDTO {
  @IsNotEmpty()
  place_id: string;

  @IsIn(Object.values(LanguageEnumValue))
  language: string;
}

export class DestinationSingleResponseDTO {
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
