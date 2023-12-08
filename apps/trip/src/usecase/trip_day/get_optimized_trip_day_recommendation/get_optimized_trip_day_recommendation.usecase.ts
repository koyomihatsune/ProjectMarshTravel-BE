import { AUTH_SERVICE, DESTINATION_SERVICE } from '@app/common/global/services';
import * as AppErrors from '@app/common/core/app.error';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { OptimizedResponseDTO } from 'apps/trip/src/dtos/trip.response.dto';
import { TripService } from 'apps/trip/src/trip.service';
import { firstValueFrom } from 'rxjs';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { GetOptimizedTripDayRecommendationDTO } from './get_optimized_trip_day_recommendation.dto';
import { TripId } from 'apps/trip/src/entity/trip_id';
import * as TripErrors from '../../errors/trip.errors';
import { TripDayId } from 'apps/trip/trip_day/entity/trip_day_id';
import { UserProfileResponseDTO } from '../../../../../auth/user/usecase/get_profile/get_profile.dto';
import { GetMultiplePlaceDistanceResponseDTO } from 'apps/destination/gmaps/types/gmaps.places.types';
import { TripDestination } from 'apps/trip/trip_destination/entity/trip_destination.entity';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.InvalidPayloadError,
  Result<OptimizedResponseDTO | GetMultiplePlaceDistanceResponseDTO>
>;

type GetOptimizedTripDayRecommendationWithUserIDDTO = {
    userId: string,
    request: GetOptimizedTripDayRecommendationDTO,
    type: string,
} 

@Injectable()
export class GetOptimizedTripDayRecommendationUseCase
  implements UseCase<GetOptimizedTripDayRecommendationWithUserIDDTO, Promise<Response>>
{
  constructor(
    private readonly tripService: TripService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
    @Inject(DESTINATION_SERVICE) private readonly destinationClient: ClientProxy,
  ) {}

  private getOptimizedTripDestinationArrangement = (
    destinations: TripDestination[],
    fixedPlaceIdRule: boolean[],
    distanceMatrixList: GetMultiplePlaceDistanceResponseDTO
  ): string[] => {
    const placeIds = destinations.map(destination => destination.place_id);

    // Tạo array cho địa điểm cố định và địa điểm không cố định, dành để kết hợp sau
    const fixedPlaceIds = placeIds.filter((_, index) => fixedPlaceIdRule[index]);
    const nonFixedPlaceIds = placeIds.filter((_, index) => !fixedPlaceIdRule[index]);
    // console.log("MAIN ALGORITHM PLACE_ID")
    // console.log(fixedPlaceIds);

    // tạo 1 list các kết hợp của địa điểm không cố định 
    const nonFixedPermutations = this.permuteArray(nonFixedPlaceIds);

    let shortestDistance = Number.MAX_VALUE;
    let shortestArrangement: string[] = [];

    // Kiểm tra từng kết hợp
    nonFixedPermutations.forEach((permutation) =>  {
      // console.log(fixedPlaceIds)
      const fixedPlaceIdsTemp =  Array.from(fixedPlaceIds);
      const fullArrangement = this.combineFixedAndNonFixed(fixedPlaceIdsTemp, permutation, fixedPlaceIdRule);
      // console.log(fullArrangement);

      // Tính tổng khoảng cách đi từ các địa điểm này
      const totalDistance = this.calculateTotalDistance(fullArrangement, distanceMatrixList);

      // Cập nhật khoảng cách và sắp xếp ngắn nhất nếu gặp khoảng cách ngắn nhất
      if (totalDistance < shortestDistance) {
        shortestDistance = totalDistance;
        shortestArrangement = fullArrangement;
      }
    })

    return shortestArrangement;
  };

  // Hàm tính tổng khoảng cách
  private calculateTotalDistance = (
    arrangement: string[],
    distanceMatrixList: GetMultiplePlaceDistanceResponseDTO
  ): number => {
    let totalDistance = 0;

    for (let i = 0; i < arrangement.length - 1; i++) {
      const origin = arrangement[i];
      const destination = arrangement[i + 1];

      // Tìm trong matrix khoảng cách của địa điểm A và B
      const distanceEntry = distanceMatrixList.find(
        (entry) =>
          entry.origin_place_id === origin &&
          entry.destination_place_id === destination
      );

      // Nếu khoảng cách không tìm được trong matrix thì để là infinity
      const distance = distanceEntry?.distance || Infinity;

      totalDistance += distance;
    }

    return totalDistance;
  };

    // Tạo các kết hợp khác nhau
    private permuteArray = (arr: string[]): string[][] => {
      if (arr.length <= 1) {
        return [arr];
      }

      const permutations: string[][] = [];

      for (let i = 0; i < arr.length; i++) {
        const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
        const restPermutations = this.permuteArray(rest);

        for (const permutation of restPermutations) {
          permutations.push([arr[i], ...permutation]);
        }
      }

      return permutations;
    };

  // Kết hợp các địa điểm cố định và không cố định vào cùng một mảng
  private combineFixedAndNonFixed = (fixedIds: string[], nonFixedIds: string[], fixedPlaceIdRule: boolean[],): string[] => {
    const fullArrangement: string[] = [];
    // console.log("combineFixedAndNonFixed");
    // console.log(fixedIds, nonFixedIds);
    fixedPlaceIdRule.forEach(placeIdRule =>  {
      if (placeIdRule) {
        fullArrangement.push(fixedIds.shift());
      } else {
        fullArrangement.push(nonFixedIds.shift());
      }
    })

    return fullArrangement;
  };

  // Sắp xếp mảng entity trip destination dựa theo đầu vào
  private sortTripDestinationsByArrangement = (
    tripDestinations: TripDestination[],
    optimizedArrangement: string[]
  ): TripDestination[] => {
    const destinationMap = new Map<string, TripDestination>();
    
    // Create a map with place_id as the key and TripDestination as the value
    tripDestinations.forEach(destination => {
      destinationMap.set(destination.place_id, destination);
    });
    
    // Sort the TripDestination array based on the optimized arrangement
    const sortedTripDestinations = optimizedArrangement.map(placeId => destinationMap.get(placeId));
    
    return sortedTripDestinations;
  };


  execute = async (dto: GetOptimizedTripDayRecommendationWithUserIDDTO): Promise<Response> => {
    try {
      const { userId, request, type } = dto;

      const userOrError = await firstValueFrom<UserProfileResponseDTO>(this.authClient.send('get_user_profile', { userId: userId})); 

      const tripIdOrError = TripId.create(new UniqueEntityID(request.tripId));
      const tripDayIdOrError = TripDayId.create(new UniqueEntityID(request.tripDayId));

      // Kiểm tra trip có tồn tại hay không
      const trip = await this.tripService.getTripById(tripIdOrError);
      if (trip === undefined) return left(new AppErrors.EntityNotFoundError('Trip'));
      if (trip.userId.toString() !== userOrError.id) return left(new TripErrors.TripDoesNotBelongToUser());

      // Kiểm tra trip day tồn tại hay không
      const tripDay = trip.days.find((day) => day.tripDayId.equals(tripDayIdOrError));
      if (tripDay === undefined) return left(new AppErrors.EntityNotFoundError('TripDay'));

      // if (request.fixedDestinationList.length !== tripDay.destinations.length) {
      //   return left(new TripErrors.FixedPlaceSequenceInvalidError())
      // }

      // Lấy list place_id để query bên Destinations service
      const placeIds = tripDay.destinations.map((destination) => {
        return destination.place_id
      });

      // Query lấy details bên Destinations service
      const destinationQueryResult : {distanceMatrixList?: GetMultiplePlaceDistanceResponseDTO} = await firstValueFrom(this.destinationClient.send('get_multiple_destinations', { place_ids: placeIds, language: request.language ?? 'vi', getMatrixOnly: true}));

      // // dùng thuật toán để tìm sắp xếp địa điểm tối ưu
      if (type === 'matrix') {

        return destinationQueryResult.distanceMatrixList ? right(Result.ok<GetMultiplePlaceDistanceResponseDTO>(destinationQueryResult.distanceMatrixList)) : left(new AppErrors.UnexpectedError('Distance matrix not found'));
        
      } else if (type === 'optimize') {
        const arrangedPlaceIDs = this.getOptimizedTripDestinationArrangement(tripDay.destinations, tripDay.destinations.map(() => false), destinationQueryResult.distanceMatrixList); 
        tripDay.destinations = this.sortTripDestinationsByArrangement(tripDay.destinations, arrangedPlaceIDs);
        const optimizedResult: OptimizedResponseDTO = {
          positions: tripDay.destinations.map((destination) => destination.position)
        }
        return right(Result.ok<OptimizedResponseDTO>(optimizedResult));
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      Logger.log(err);
      return left(new AppErrors.UnexpectedError(err.toString()));
    }
  };
}
