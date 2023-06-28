import { AbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { Auth } from '../schema/auth.schema';
import { Connection, Model } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AuthRepository extends AbstractRepository<Auth> {
  protected readonly logger = new Logger(AuthRepository.name);

  constructor(
    @InjectModel(Auth.name) authModel: Model<Auth>,
    @InjectConnection() connection: Connection,
  ) {
    super(authModel, connection);
  }
}
