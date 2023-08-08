import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { AbstractRepository } from '@app/common';
import { DestinationDAO } from './schemas/destination.schema';
import { Destination } from './entity/destination.entity';
import { DestinationMapper } from './mapper/destination.mapper';

@Injectable()
export class DestinationRepository extends AbstractRepository<DestinationDAO> {
  protected readonly logger = new Logger(DestinationRepository.name);

  constructor(
    @InjectModel(DestinationDAO.name) destinationModel: Model<DestinationDAO>,
    @InjectConnection() connection: Connection,
  ) {
    super(destinationModel, connection);
  }

  async createDestination(request: {
    place_id: string;
  }): Promise<Destination | undefined> {
    try {
      const destination = await this.create({
        place_id: request.place_id,
        reviewIds: [],
      });
      return DestinationMapper.toEntity(destination);
    } catch (err) {
      Logger.error(err);
      return undefined;
    }
  }

  // Untested
  addReviews = async (place_id: string, reviewIds: string[]) => {
    try {
      await this.findOneAndUpdate(
        {
          place_id: place_id,
        },
        { $push: { reviewIds: reviewIds } },
      );
      return true;
    } catch (err) {
      // eslint-disable-next-line no-console
      Logger.error(err);
      return false;
    }
  };

  async getDestinationByPlaceId(
    placeId: string,
  ): Promise<Destination | undefined> {
    try {
      const destination = await this.findOne({ place_id: placeId });
      return DestinationMapper.toEntity(destination);
    } catch (err) {
      return undefined;
    }
  }
}
