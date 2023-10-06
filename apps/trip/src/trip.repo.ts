import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { AbstractRepository } from '@app/common';
import { TripDAO } from './schemas/trip.schema';
import { Trip } from './entity/trip.entity';
import { TripMapper } from './mapper/trip.mapper';
import { TripId } from './entity/trip_id';
import { UserId } from 'apps/auth/user/domain/user_id';
import { SORT_CONST } from '@app/common/constants';

@Injectable()
export class TripRepository extends AbstractRepository<TripDAO> {
  protected readonly logger = new Logger(TripRepository.name);

  constructor(
    @InjectModel(TripDAO.name) tripModel: Model<TripDAO>,
    @InjectConnection() connection: Connection,
  ) {
    super(tripModel, connection);
  }

  async createTrip(trip: Trip): Promise<Trip | undefined> {
    try {
      const tripDAO = TripMapper.toDAO(trip);
      await this.create({
        ...tripDAO,
      });
      return trip;
    } catch (err) {
      Logger.error(err, err.stack);
      return undefined;
    }
  }

  async findTripById(tripId: TripId): Promise<Trip | undefined> {
    try {
      const result = await this.findOne({
        _id: tripId.getValue().toMongoObjectID(),
      });
      const trip = TripMapper.toEntity(result);
      return trip;
    } catch (err) {
      Logger.error(err, err.stack);
      return undefined;
    }
  }

  async findTripsByUserIdPagination(
    userId: UserId,
    page: number,
    pageSize: number,
  ): Promise<Trip[] | undefined> {
    try {
      const result = await this.findPagination(
        {
          userId: userId.getValue().toMongoObjectID(),
        },
        page,
        pageSize,
        SORT_CONST.DATE_NEWEST,
      );
      const trips = result.map((trip) => {
        return TripMapper.toEntity(trip);
      });
      return trips;
    } catch (err) {
      Logger.error(err, err.stack);
      return undefined;
    }
  }

  async updateTrip(tripInput: Trip): Promise<Trip | undefined> {
    try {
      const tripDAO = TripMapper.toDAO(tripInput);
      const result = await this.findOneAndUpdate(
        {
          _id: tripInput.tripId.getValue().toMongoObjectID(),
        },
        {
          ...tripDAO,
        },
      );

      const trip = TripMapper.toEntity(result);
      return trip;
    } catch (err) {
      Logger.error(err, err.stack);
      return undefined;
    }
  }

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
