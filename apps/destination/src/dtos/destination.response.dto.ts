export class SingleDestinationResponseDTO {
  //use placeId by Google Maps - but put in database as destinationId
  place_id: string;
  name: string;
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
}

export class MultipleDestinationResponseDTO {
  destinations: SingleDestinationResponseDTO[];
  nextPageToken?: string;
}
