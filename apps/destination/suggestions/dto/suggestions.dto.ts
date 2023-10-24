import { SingleDestinationResponseDTO } from 'apps/destination/src/dtos/destination.response.dto';

export type CategoryDestinationsList = {
  name: string;
  id: string;
  list: SingleDestinationResponseDTO[];
};
export type SuggestionsResponseDTO = {
  name: string;
  listRating: SingleDestinationResponseDTO[];
  categories: CategoryDestinationsList[];
};
