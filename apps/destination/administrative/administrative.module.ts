import { MongooseModule } from '@nestjs/mongoose';
import { ProvinceDAO, ProvinceSchema } from './schemas/province.schema';
import { Module } from '@nestjs/common';
import { AdministrativeService } from './administrative.service';
import { ProvinceRepository } from './province.repo';
import { AdministrativeController } from './administrative.controller';
import {
  FollowedAdministrativeDAO,
  FollowedAdministrativeSchema,
} from '../followed_administrative/schema/followed_administrative.schema';
import { FollowedAdministrativeService } from '../followed_administrative/followed_administrative.service';
import { FollowedAdministrativeRepository } from '../followed_administrative/followed_administrative.repo';
import { ProvinceFollowCommitUseCase } from '../followed_administrative/usecase/province_follow_commit/province_follow_commit.usecase';
import { GetSuggestedProvincesByUserUseCase } from '../followed_administrative/usecase/get_suggested_provinces_by_user/get_suggested_provinces_by_user.usecase';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProvinceDAO.name, schema: ProvinceSchema },
    ]),
    MongooseModule.forFeature([
      {
        name: FollowedAdministrativeDAO.name,
        schema: FollowedAdministrativeSchema,
      },
    ]),
  ],
  controllers: [AdministrativeController],
  providers: [
    AdministrativeService,
    ProvinceRepository,
    FollowedAdministrativeRepository,
    FollowedAdministrativeService,
    ProvinceFollowCommitUseCase,
    GetSuggestedProvincesByUserUseCase,
  ],
  exports: [
    AdministrativeService,
    ProvinceRepository,
    FollowedAdministrativeService,
    ProvinceFollowCommitUseCase,
    GetSuggestedProvincesByUserUseCase,
  ],
})
export class AdministrativeModule {}
