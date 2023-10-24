/* eslint-disable @typescript-eslint/no-unused-vars */
import * as AppErrors from '@app/common/core/app.error';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Injectable, Logger } from '@nestjs/common';
import { UserId } from 'apps/auth/user/domain/user_id';
import { FollowedAdministrativeService } from '../../followed_administrative.service';
import { AdministrativeService } from 'apps/destination/administrative/administrative.service';
import { SingleAdministrativeResponseDTO } from 'apps/destination/administrative/dto/administrative.response.dto';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.EntityNotFoundError | AppErrors.InvalidPayloadError,
  Result<SingleAdministrativeResponseDTO[]>
>;

type GetSuggestedProvincesByUserDTO = {
    userId: string;
}

@Injectable()
export class GetSuggestedProvincesByUserUseCase implements UseCase<GetSuggestedProvincesByUserDTO, Promise<Response>>
{
  constructor(
    private readonly administrativeService: AdministrativeService,
    private readonly followedAdministrativeService: FollowedAdministrativeService,
  ) {}

  execute = async (payload: GetSuggestedProvincesByUserDTO): Promise<Response> => {
    try {
      const { userId } = payload;
      const userIdOrError = UserId.create(new UniqueEntityID(userId));

      const followedProvincesList = await this.followedAdministrativeService.getFollowedAdministrativesByUserId(userIdOrError, 'province');
      const fullProvincesList = await this.administrativeService.getProvinceList(userId);

      const followedProvincesSet = new Set(followedProvincesList);

      // Filter followed provinces
      const filteredProvinces = fullProvincesList.filter(province => followedProvincesSet.has(province.code));
      const availableProvinces = fullProvincesList.filter(province => !followedProvincesSet.has(province.code));

      const randomProvinceCount = Math.max(10 - filteredProvinces.length, 0);

      // Randomly select random provinces
      const randomProvinces = [];
      for (let i = 0; i < randomProvinceCount; i++) {
          const randomIndex = Math.floor(Math.random() * availableProvinces.length);
          randomProvinces.push(availableProvinces.splice(randomIndex, 1)[0]);
      }

      // Combine followed and random provinces to get the final list
      const result = filteredProvinces.concat(randomProvinces);

      return right(Result.ok<SingleAdministrativeResponseDTO[]>(result));
    } catch (err) {
      Logger.log(err, err.stack);
      if (err.status === 404) {
        return left(new AppErrors.EntityNotFoundError('User'));
      }
      return left(new AppErrors.UnexpectedError(err));
    }
  };
}
