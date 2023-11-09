import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { AbstractRepository } from '@app/common';
import { RegistrationQueueDAO } from './schemas/registration_queue.schema';

@Injectable()
export class RegistrationQueueRepository extends AbstractRepository<RegistrationQueueDAO> {
  protected readonly logger = new Logger(RegistrationQueueRepository.name);

  constructor(
    @InjectModel(RegistrationQueueDAO.name)
    registrationQueueModel: Model<RegistrationQueueDAO>,
    @InjectConnection() connection: Connection,
  ) {
    super(registrationQueueModel, connection);
  }

  async upsertRegistration(request: {
    phoneNumber: string;
    tries: number;
  }): Promise<RegistrationQueueDAO | undefined> {
    try {
      const registration = await this.upsert(
        {
          phoneNumber: request.phoneNumber,
        },
        {
          phoneNumber: request.phoneNumber,
          lastUpdated: new Date(),
          tries: request.tries,
        },
      );
      return registration;
    } catch (err) {
      Logger.error(err, err.stack);
      return undefined;
    }
  }

  // delete registration
  async deleteRegistration(phoneNumber: string): Promise<boolean> {
    try {
      await this.model.deleteOne({
        phoneNumber: phoneNumber,
      });
      return true;
    } catch (err) {
      Logger.error(err, err.stack);
      return false;
    }
  }

  async findRegistrationByEmail(
    phoneNumber: string,
  ): Promise<RegistrationQueueDAO | undefined> {
    try {
      const registration = await this.findOne({
        phoneNumber: phoneNumber,
      });
      return registration;
    } catch (err) {
      return undefined;
    }
  }
}
