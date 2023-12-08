import { Injectable } from '@nestjs/common';
import { DestinationCacheRepository } from './destination_cache.repo';
import { DESTINATION_CACHE_EXPIRATION_DAYS } from './constants/services';
import { GoogleMapsService } from '../gmaps/gmaps.service';
import { DestinationRepository } from './destination.repo';
import { Destination } from './entity/destination.entity';

@Injectable()
export class DestinationService {
  constructor(
    private readonly destinationCacheRepository: DestinationCacheRepository,
    private readonly destinationRepository: DestinationRepository,
    private readonly googleMapsService: GoogleMapsService,
  ) {}

  async getDestinationCacheByPlaceId(
    place_id: string,
    lang: string,
  ): Promise<any> {
    const destination_cache_dao =
      await this.destinationCacheRepository.getDestinationCacheByPlaceId(
        place_id,
        lang,
      );
    if (destination_cache_dao) {
      if (
        (new Date().getTime() - destination_cache_dao.lastUpdated.getTime()) /
          (1000 * 60 * 60 * 24) <
        DESTINATION_CACHE_EXPIRATION_DAYS
      ) {
        destination_cache_dao.data = JSON.parse(destination_cache_dao.data);
        return destination_cache_dao.data;
      } else return undefined;
    }
  }

  async getDestinationByID(
    place_id: string,
    language: string,
  ): Promise<Destination | undefined> {
    const cacheResult = await this.getDestinationCacheByPlaceId(
      place_id,
      language,
    );
    const queryResult = cacheResult
      ? cacheResult
      : await this.googleMapsService.getPlaceByID({
          placeId: place_id,
          language: language,
        });

    if (!cacheResult && queryResult) {
      await this.destinationCacheRepository.upsertDestinationCache({
        place_id: place_id,
        lang: language,
        data: JSON.stringify(queryResult),
      });
    }
    const destinationDetails =
      await this.destinationRepository.getDestinationByPlaceId(place_id);

    const destinationOrError = Destination.create({
      place_id: queryResult.place_id,
      name: destinationDetails?.name ?? queryResult?.name ?? '',
      description: destinationDetails?.description ?? '',
      mapsFullDetails: queryResult,
      isRegistered: destinationDetails ? true : false,
      isCached: cacheResult ? true : false,
    });

    return destinationOrError.isSuccess
      ? destinationOrError.getValue()
      : undefined;
  }
}
