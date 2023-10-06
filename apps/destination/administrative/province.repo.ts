import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel, SchemaFactory } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { AbstractRepository } from '@app/common';
import { ProvinceDAO } from './schemas/province.schema';

@Injectable()
export class ProvinceRepository extends AbstractRepository<ProvinceDAO> {
  protected readonly logger = new Logger(ProvinceRepository.name);

  constructor(
    @InjectModel(ProvinceDAO.name) provinceModel: Model<ProvinceDAO>,
    @InjectConnection() connection: Connection,
  ) {
    super(provinceModel, connection);
  }
}

export const ProvinceSchema = SchemaFactory.createForClass(ProvinceDAO);
