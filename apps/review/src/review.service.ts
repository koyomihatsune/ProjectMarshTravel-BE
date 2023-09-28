/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { TripRepository } from './review.repo';

@Injectable()
export class TripService {
  constructor(private readonly tripRepostiory: TripRepository) {}

  // async createTrip(trip: Trip): Promise<Trip> {
  //   const result = await this.tripRepostiory.createTrip(trip);
  //   return result;
  // }

  // async updateTrip(trip: Trip): Promise<Trip> {
  //   const result = await this.tripRepostiory.updateTrip(trip);
  //   return result;
  // }

  // async getTripById(tripId: TripId): Promise<Trip> {
  //   const trip = await this.tripRepostiory.findTripById(tripId);
  //   return trip;
  // }

  // async getTripsByUserIdPagination(
  //   userId: UserId,
  //   page: number,
  //   pageSize: number,
  // ): Promise<Trip[]> {
  //   const trip = await this.tripRepostiory.findTripsByUserIdPagination(
  //     userId,
  //     page,
  //     pageSize,
  //   );
  //   return trip;
  // }
}
