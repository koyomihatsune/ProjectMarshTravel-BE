import { GetMultiplePlaceDistanceResponseDTO } from 'apps/destination/gmaps/types/gmaps.places.types';

export class SingleDestinationResponseDTO {
  //use placeId by Google Maps - but put in database as destinationId
  place_id: string;
  name: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  mapsSearchDetails?: any;
  mapsFullDetails?: any;
  administrative?: {
    province?: {
      code: string;
      name: string;
      name_en: string;
    };
  };
  reviews?: any[];
  isRegistered: boolean;
  isCached: boolean;
}

export class MultipleDestinationResponseDTO {
  destinations: SingleDestinationResponseDTO[];
  distanceMatrixList?: GetMultiplePlaceDistanceResponseDTO;
  nextPageToken?: string;
}
