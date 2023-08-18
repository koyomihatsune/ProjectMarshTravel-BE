export class SingleTripResponseDTO {
  id: string;
  userId: string;
  name: string;
  description: string;
  startAt: Date;
  isArchived: boolean;
  tripLength: number;
  createdAt: Date;
  updatedAt: Date;
  days: SingleTripDayResponseDTO[];
}

export class SingleTripDayResponseDTO {
  id: string;
  position: number;
  startOffsetFromMidnight: number;
  destinations: SingleTripDestinationResponseDTO[];
}

export class SingleTripDestinationResponseDTO {
  destinationId: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  // Maps từ phần photos trong image_urls
  image_urls: string[];
  mapsFullDetails?: any;
  reviews?: any[];
  isRegistered: boolean;
}

export class SingleTripResponseWithoutDaysDTO {
  id: string;
  userId: string;
  name: string;
  description: string;
  startAt: Date;
  tripLength: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class SingleTripDayResponseWithoutDestinationsDTO {
  id: string;
  position: number;
  startOffsetFromMidnight: number;
}

export class MultipleTripsResponseDTO {
  trips: SingleTripResponseDTO[];
  startOffset: number; // offset theo trip từ mới nhất tới cũ nhất
}
