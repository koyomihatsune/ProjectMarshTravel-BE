import { Injectable } from '@nestjs/common';
import { TripRepository } from './trip.repo';
import { Trip } from './entity/trip.entity';
import { TripId } from './entity/trip_id';
import { UserId } from 'apps/auth/user/domain/user_id';

type TripPagination = { result: Trip[]; page: number; totalPage: number };
@Injectable()
export class TripService {
  constructor(private readonly tripRepostiory: TripRepository) {}

  async createTrip(trip: Trip): Promise<Trip> {
    const result = await this.tripRepostiory.createTrip(trip);
    return result;
  }

  async updateTrip(trip: Trip): Promise<Trip> {
    const result = await this.tripRepostiory.updateTrip(trip);
    return result;
  }

  async getTripById(tripId: TripId): Promise<Trip> {
    const trip = await this.tripRepostiory.findTripById(tripId);
    return trip;
  }

  async getTripsByUserIdPagination(
    userId: UserId,
    page: number,
    pageSize: number,
  ): Promise<TripPagination> {
    const result = await this.tripRepostiory.findTripsByUserIdPagination(
      userId,
      page,
      pageSize,
    );
    return {
      result: result.result,
      page: result.page,
      totalPage: result.totalPage,
    };
  }
}
