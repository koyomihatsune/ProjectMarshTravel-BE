export const AUTH_SERVICE = 'RABBIT_MQ_AUTH_SERVICE';

export const GOOGLE_MAPS_API = {
  BASE_URL: 'https://maps.googleapis.com/maps/api',
  ROUTES: {
    DISTANCE_MATRIX: '/distancematrix/json',
    GEOCODE: '/geocode/json',
    PLACE: {
      FIND_PLACE: '/place/findplacefromtext/json',
      TEXT_SEARCH: '/place/textsearch/json',
      NEARBY_SEARCH: '/place/nearbysearch/json',
      PLACE_DETAILS: '/place/details/json',
      PLACE_PHOTO: '/place/photo',
      PLACE_AUTO_COMPLETE: '/place/autocomplete/json',
      QUERY_AUTO_COMPLETE: '/queryautocomplete/json',
    },
  },
  QUERY_PARAMS: {
    LANGUAGE: {
      VIETNAMESE: 'vi',
      ENGLISH: 'en',
    },
  },
  STATUS_CODE: {
    OK: 'OK',
    ZERO_RESULTS: 'ZERO_RESULTS',
    INVALID_REQUEST: 'INVALID_REQUEST',
    OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT',
    REQUEST_DENIED: 'REQUEST_DENIED',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  },
};

export const PLACE_TYPES = {
  PARK: 'park',
  MUSEUM: 'museum',
  ZOO: 'zoo',
  AMUSEMENT_PARK: 'amusement_park',
};
