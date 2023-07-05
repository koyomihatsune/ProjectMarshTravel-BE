import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ERROR_CODE } from '@app/common/constants/';
import { API_MESSAGE } from '@app/common/constants/string.constants';
import { TransformInterceptor } from '@app/common/core/infra/http/interceptors/transform_interceptor';

export default function registerGlobals(app: INestApplication) {
  app.useGlobalInterceptors(new TransformInterceptor(new Reflector()));
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      disableErrorMessages: true,
      transform: true,
      exceptionFactory: (errors) => {
        const combineMsgs = errors
          .map((e) =>
            `${e.value} ${
              e.constraints
                ? Object.values(e.constraints).join(', ')
                : API_MESSAGE.InvalidRequestField
            }`.trim(),
          )
          .join(', ');
        return new BadRequestException({
          code: ERROR_CODE.InvalidClassValidator,
          message: combineMsgs,
        });
      },
    }),
  );
  // app.enableCors({
  //   origin: process.env.FRONTEND_URL,
  //   credentials: true,
  // });
}
