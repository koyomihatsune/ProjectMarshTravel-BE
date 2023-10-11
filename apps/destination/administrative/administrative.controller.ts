import { Controller, Get } from '@nestjs/common';
import { AdministrativeService } from './administrative.service';

@Controller('adm')
export class AdministrativeController {
  constructor(private readonly administrativeService: AdministrativeService) {}

  @Get('province')
  async getProvinceList() {
    const result = await this.administrativeService.getProvinceList();
    return result;
  }
}
