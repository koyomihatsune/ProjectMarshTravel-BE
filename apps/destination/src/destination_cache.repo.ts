import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { AbstractRepository } from '@app/common';
import { DestinationCacheDAO } from './schemas/destination_cache.schema';

@Injectable()
export class DestinationCacheRepository extends AbstractRepository<DestinationCacheDAO> {
  protected readonly logger = new Logger(DestinationCacheRepository.name);

  constructor(
    @InjectModel(DestinationCacheDAO.name)
    destinationModel: Model<DestinationCacheDAO>,
    @InjectConnection() connection: Connection,
  ) {
    super(destinationModel, connection);
  }

  async upsertDestinationCache(request: {
    place_id: string;
    lang: string;
    data: any;
  }): Promise<DestinationCacheDAO | undefined> {
    try {
      const destination_cache = await this.upsert(
        {
          place_id: request.place_id,
          lang: request.lang,
        },
        {
          place_id: request.place_id,
          data: request.data,
          lastUpdated: new Date(),
        },
      );
      return destination_cache;
    } catch (err) {
      Logger.error(err, err.stack);
      return undefined;
    }
  }

  async getDestinationCacheByPlaceId(
    placeId: string,
    lang: string,
  ): Promise<DestinationCacheDAO | undefined> {
    try {
      const destinationCache = await this.findOne({
        place_id: placeId,
        lang: lang,
      });
      return destinationCache;
    } catch (err) {
      return undefined;
    }
  }
}
