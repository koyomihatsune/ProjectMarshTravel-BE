export class SingleTripResponseDTO {
  id: string;
  userId: string;
  name: string;
  description: string;
  startAt: Date;
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  days: SingleTripDayWithoutDestinationDetailsResponseDTO[];
}

export class SingleTripDayWithoutDestinationDetailsResponseDTO {
  id: string;
  position: number;
  startOffsetFromMidnight: number;
  dayLength: number;
  firstDestinationName?: string;
  destinations: SingleTripDestinationWithoutDetailsResponseDTO[];
}

export class SingleTripDestinationWithoutDetailsResponseDTO {
  id: string;
  position: number;
  place_id: string;
  type: string;
}

export class SingleTripDayResponseDTO {
  id: string;
  position: number;
  startOffsetFromMidnight: number;
  dayLength: number;
  destinations: SingleTripDestinationResponseDTO[];
}

export class OptimizedResponseDTO {
  positions: number[];
}

export class SingleTripDestinationResponseDTO {
  id: string;
  position: number;
  name: string;
  place_id: string;
  type: string;
  location?: {
    lat: number;
    lng: number;
  };
  // Maps từ phần photos trong image_urls
  image_urls?: string[];
  mapsFullDetails?: any;
  reviews?: any[];
  // use distance matrix result
  distanceFromLastDestination?: number;
  timeFromLastDestination?: number;
  //
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
  isDeleted: boolean;
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
  list: SingleTripResponseWithoutDaysDTO[];
  page: number;
  totalPage: number;
}
