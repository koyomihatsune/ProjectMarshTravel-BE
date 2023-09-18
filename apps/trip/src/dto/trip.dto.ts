export class SingleTripResponseDTO {
  id: string;
  userId: string;
  name: string;
  description: string;
  startAt: Date;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  days: SingleTripDayWithoutDestinationDetailsResponseDTO[];
}

export class SingleTripDayWithoutDestinationDetailsResponseDTO {
  id: string;
  position: number;
  startOffsetFromMidnight: number;
  dayLength: number;
  destinations: SingleTripDestinationWithoutDetailsResponseDTO[];
}

export class SingleTripDestinationWithoutDetailsResponseDTO {
  position: number;
  type: string;
  place_id: string;
}

export class SingleTripDayResponseDTO {
  id: string;
  position: number;
  startOffsetFromMidnight: number;
  dayLength: number;
  destinations: SingleTripDestinationResponseDTO[];
}

export class SingleTripDestinationResponseDTO {
  place_id: string;
  name: string;
  type: string;
  position: number;
  location?: {
    lat: number;
    lng: number;
  };
  // Maps từ phần photos trong image_urls
  image_urls?: string[];
  mapsFullDetails?: any;
  reviews?: any[];
  isRegistered: boolean;
  isError: boolean;
  errorDetails?: string;
}

export class SingleTripResponseWithoutDaysDTO {
  id: string;
  userId: string;
  name: string;
  description: string;
  startAt: Date;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  daysLength: number;
}

export class SingleTripDayResponseWithoutDestinationsDTO {
  id: string;
  position: number;
  startOffsetFromMidnight: number;
}

export class MultipleTripResponseWithoutDaysDTO {
  trips: SingleTripResponseWithoutDaysDTO[];
}
