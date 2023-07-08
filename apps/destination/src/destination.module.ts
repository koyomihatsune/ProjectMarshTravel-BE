import { Module } from '@nestjs/common';
import { DestinationController } from './destination.controller';
import { DestinationService } from './destination.service';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { DatabaseModule, RmqModule } from '@app/common';
// import { MongooseModule } from '@nestjs/mongoose';
import { DESTINATION_SERVICE } from './constants/services';
import { AuthModule } from '@app/common/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        MONGODB_URI: Joi.string().required(),
        RABBIT_MQ_URI: Joi.string().required(),
        RABBIT_MQ_AUTH_QUEUE: Joi.string().required(),
        RABBIT_MQ_DESTINATION_QUEUE: Joi.string().required(),
        FIREBASE_SA: Joi.string().required(),
      }),
      ignoreEnvFile: true,
    }),
    DatabaseModule,
    // MongooseModule.forFeature([
    //   { name: Destination.name, schema: DestinationSchema }
    // ]),
    RmqModule.register({
      name: DESTINATION_SERVICE,
    }),
    AuthModule,
  ],
  controllers: [DestinationController],
  providers: [DestinationService],
})
export class DestinationModule {}
