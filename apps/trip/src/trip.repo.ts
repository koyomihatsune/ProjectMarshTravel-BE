import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { AbstractRepository } from '@app/common';
import { TripDAO } from './schemas/trip.schema';

@Injectable()
export class TripRepository extends AbstractRepository<TripDAO> {
  protected readonly logger = new Logger(TripRepository.name);

  constructor(
    @InjectModel(TripDAO.name) tripModel: Model<TripDAO>,
    @InjectConnection() connection: Connection,
  ) {
    super(tripModel, connection);
  }

  // async createTrip(request: {
  //   place_id: string;
  // }): Promise<Destination | undefined> {
  //   try {
  //     const destination = await this.create({
  //       place_id: request.place_id,
  //       reviewIds: [],
  //     });
  //     return DestinationMapper.toEntity(destination);
  //   } catch (err) {
  //     Logger.error(err);
  //     return undefined;
  //   }
  // }

  // // Untested
  // addReviews = async (place_id: string, reviewIds: string[]) => {
  //   try {
  //     await this.findOneAndUpdate(
  //       {
  //         place_id: place_id,
  //       },
  //       { $push: { reviewIds: reviewIds } },
  //     );
  //     return true;
  //   } catch (err) {
  //     // eslint-disable-next-line no-console
  //     Logger.error(err);
  //     return false;
  //   }
  // };

  // async getDestinationByPlaceId(
  //   placeId: string,
  // ): Promise<Destination | undefined> {
  //   try {
  //     const destination = await this.findOne({ place_id: placeId });
  //     return DestinationMapper.toEntity(destination);
  //   } catch (err) {
  //     return undefined;
  //   }
  // }
}
