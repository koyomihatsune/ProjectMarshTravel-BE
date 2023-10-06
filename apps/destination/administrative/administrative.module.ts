import { MongooseModule } from '@nestjs/mongoose';
import { ProvinceDAO, ProvinceSchema } from './schemas/province.schema';
import { Module } from '@nestjs/common';
import { AdministrativeService } from './administrative.service';
import { ProvinceRepository } from './province.repo';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProvinceDAO.name, schema: ProvinceSchema },
    ]),
  ],
  controllers: [],
  providers: [AdministrativeService, ProvinceRepository],
  exports: [AdministrativeService, ProvinceRepository],
})
export class AdministrativeModule {}
