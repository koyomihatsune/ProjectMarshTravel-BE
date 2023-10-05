import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { AbstractRepository } from '@app/common';
import { ProvinceDAO } from './schemas/province.schema';

@Injectable()
export class ProvinceRepository extends AbstractRepository<ProvinceDAO> {
  protected readonly logger = new Logger(ProvinceRepository.name);

  constructor(
    @InjectModel(ProvinceDAO.name) userModel: Model<ProvinceDAO>,
    @InjectConnection() connection: Connection,
  ) {
    super(userModel, connection);
  }
}
