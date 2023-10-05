import { Injectable } from '@nestjs/common';
import { ProvinceRepository } from './province.repo';
import { ProvinceDAO } from './schemas/province.schema';

@Injectable()
export class AdministrativeService {
  constructor(private readonly provinceRepository: ProvinceRepository) {}

  async getProvinceDetailsByName(
    name: string,
    language?: string,
  ): Promise<ProvinceDAO> {
    const foundProvince = await this.provinceRepository.findOne({
      name: language === 'vi' ? name : undefined,
      name_en: language !== 'vi' ? name : undefined,
    });
    return foundProvince;
  }

  async getProvinceDetailsByCode(code: string): Promise<ProvinceDAO> {
    const foundProvince = await this.provinceRepository.findOne({
      code: code,
    });
    return foundProvince;
  }

  async getProvinceList(): Promise<
    { code: string; name: string; name_en: string }[]
  > {
    const foundProvinces = await this.provinceRepository.find({});
    return foundProvinces.map((province) => {
      return {
        code: province.code,
        name: province.name,
        name_en: province.name_en,
      };
    });
  }
}
