import { Injectable, Logger } from '@nestjs/common';
import { ProvinceRepository } from './province.repo';
import { ProvinceDAO } from './schemas/province.schema';
import { SingleAdministrativeResponseDTO } from './dto/administrative.response.dto';
import { FollowedAdministrativeService } from '../followed_administrative/followed_administrative.service';
import { UserId } from 'apps/auth/user/domain/user_id';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';

@Injectable()
export class AdministrativeService {
  constructor(
    private readonly provinceRepository: ProvinceRepository,
    private readonly followedAdministrativeService: FollowedAdministrativeService,
  ) {}

  async getProvinceDetailsByName(
    name: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    language?: string,
  ): Promise<ProvinceDAO | undefined> {
    try {
      const query = { name: name };
      // language === 'vi'
      //   ? {
      //       name: name,
      //     }
      //   : { name_en: name };
      const foundProvince = await this.provinceRepository.findOne(query);
      return foundProvince;
    } catch (err) {
      Logger.error(err, err.stack);
      return undefined;
    }
  }

  async getProvinceDetailsByCode(
    code: string,
  ): Promise<ProvinceDAO | undefined> {
    try {
      const foundProvince = await this.provinceRepository.findOne({
        code: code,
      });
      return foundProvince;
    } catch (err) {
      Logger.error(err, err.stack);
      return undefined;
    }
  }

  async getProvinceList(
    userId: string,
  ): Promise<SingleAdministrativeResponseDTO[]> {
    const userFollowedProvinces =
      await this.followedAdministrativeService.getFollowedAdministrativesByUserId(
        UserId.create(new UniqueEntityID(userId)),
        'province',
      );
    const foundProvinces = await this.provinceRepository.find({});
    return foundProvinces.map((province) => {
      return {
        code: province.code,
        name: province.name,
        name_en: province.name_en,
        explore_tags: province.explore_tags ?? [],
        imageURL:
          province.imageURL ??
          'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Vietnam.svg/1200px-Flag_of_Vietnam.svg.png',
        followed: userFollowedProvinces.includes(province.code),
      };
    });
  }
}
