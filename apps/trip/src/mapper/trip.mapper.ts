import { Trip } from '../entity/trip.entity';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { GoogleMapsService } from 'apps/destination/gmaps/gmaps.service';
import { Inject, Logger } from '@nestjs/common';
import { TripDAO } from '../schemas/trip.schema';
import { TripDay } from 'apps/trip/trip_day/entity/trip_day.entity';
import { TripDayDAO } from 'apps/trip/trip_day/schema/trip_day.schema';
import { TripDestination } from 'apps/trip/trip_destination/entity/trip_destination.entity';
import { TripDestinationDAO } from 'apps/trip/trip_destination/schema/trip_destination.schema';

export class TripMapper {
  constructor(
    @Inject() private readonly googleMapsService: GoogleMapsService,
  ) {}

  public static async toDAO(trip: Trip): Promise<TripDAO> {
    Logger.log(trip.days);
    return {
      _id: trip.tripId.getValue().toMongoObjectID(),
      name: trip.name,
      userId: trip.userId.toMongoObjectID(),
      description: trip.description ?? '',
      isArchived: trip.isArchived,
      startAt: trip.startAt,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
      days: await Promise.all(trip.days.map((day) => this.toDayDAO(day))),
    };
  }

  private static async toDayDAO(day: TripDay): Promise<TripDayDAO> {
    Logger.log(day.destinations);
    return {
      _id: day.tripDayId.getValue().toMongoObjectID(),
      position: day.position,
      startOffsetFromMidnight: day.startOffsetFromMidnight,
      destinations: await Promise.all(
        day.destinations.map((destination) =>
          this.toDestinationDAO(destination),
        ),
      ),
    };
  }

  private static async toDestinationDAO(
    destination: TripDestination,
  ): Promise<TripDestinationDAO> {
    return {
      _id: destination.tripDestinationId.getValue().toMongoObjectID(),
      position: destination.position,
      type: destination.type,
      place_id: destination.place_id,
    };
  }

  public static async toEntity(dao: TripDAO): Promise<Trip | undefined> {
    const tripIdToString = dao._id.toString();
    const userIdToString = dao.userId.toString();

    const tripOrError = Trip.create(
      {
        name: dao.name,
        userId: new UniqueEntityID(userIdToString),
        description: dao.description,
        isArchived: dao.isArchived,
        startAt: dao.startAt,
        createdAt: dao.createdAt,
        updatedAt: dao.updatedAt,
        days: await Promise.all(dao.days.map((day) => this.toDayEntity(day))),
      },
      new UniqueEntityID(tripIdToString),
    );

    return tripOrError.isSuccess ? tripOrError.getValue() : undefined;
  }

  private static async toDayEntity(dayDao: TripDayDAO): Promise<TripDay> {
    const tripDayOrError = TripDay.create(
      {
        position: dayDao.position,
        startOffsetFromMidnight: dayDao.startOffsetFromMidnight,
        destinations: await Promise.all(
          dayDao.destinations.map((destination) =>
            this.toDestinationEntity(destination),
          ),
        ),
      },
      new UniqueEntityID(dayDao._id.toString()),
    );
    return tripDayOrError.isSuccess ? tripDayOrError.getValue() : undefined;
  }

  private static async toDestinationEntity(
    destinationDao: TripDestinationDAO,
  ): Promise<TripDestination> {
    const tripDestinationOrError = TripDestination.create(
      {
        position: destinationDao.position,
        type: 'destination',
        place_id: destinationDao.place_id,
      },
      new UniqueEntityID(destinationDao._id.toString()),
    );
    return tripDestinationOrError.isSuccess
      ? tripDestinationOrError.getValue()
      : undefined;
  }
}
