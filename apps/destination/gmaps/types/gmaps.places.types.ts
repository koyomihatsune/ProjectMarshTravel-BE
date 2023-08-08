export type GetOnePlaceFromTextDTO = {
  input: string;
  lat?: number;
  lon?: number;
  language?: string;
};

export type GetMultiplePlacesFromTextDTO = {
  input: string;
  radius?: number;
  //The location parameter may be overriden if the query contains an explicit location such as Market in Barcelona. Using quotes around the query may also influence the weight given to the location and radius
  lat?: number;
  lon?: number;
  language: string;
  opennow?: boolean;
  type?: string;
};

export type GetMultiplePlacesFromPageTokenDTO = {
  pageToken: string;
};

export type GetPlaceDetailsDTO = {
  placeId: string;
  language: string;
  sessionToken?: string;
};

export type GetPlaceAutocompleteDTO = {
  input: string;
  radius?: number;
  language: string;
  sessionToken?: string;
};

// export type FindOnePlaceFromTextResponse = {
//   candidates: {
//     formatted_address?: string;
//     place_id?: string;
//     name?: string;
//     opening_hours?: any; // Replace 'any' with the appropriate type if known
//     types?: string[]; // Replace 'string[]' with the appropriate type if known
//     rating?: number; // Replace 'number' with the appropriate type if known
//     geometry?: any; // Replace 'any' with the appropriate type if known
//   }[];
//   status: string;
//   error_message?: string;
//   info_messages?: string[];
// };
