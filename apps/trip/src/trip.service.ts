import { Injectable } from '@nestjs/common';
import { TripRepository } from './trip.repo';
import { Trip } from './entity/trip.entity';
import { TripId } from './entity/trip_id';

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
}
