import { Injectable } from '@nestjs/common';
import { TripRepository } from './trip.repo';
import { Trip } from './entity/trip.entity';

@Injectable()
export class TripService {
  constructor(private readonly tripRepostiory: TripRepository) {}

  async createTrip(trip: Trip): Promise<Trip> {
    const user = await this.tripRepostiory.createTrip(trip);
    return user;
  }
}
