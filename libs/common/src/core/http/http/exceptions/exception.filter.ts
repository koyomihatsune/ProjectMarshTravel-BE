import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { API_MESSAGE, STR_COMMON } from 'src/shared/constants/string.constants';
import { TransformResponse } from '../models/response_DTO';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const isHttpException = exception instanceof HttpException;

    const httpStatus = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody: TransformResponse<any> = {
      message: STR_COMMON.Fail,
      data: isHttpException
        ? (exception as HttpException).getResponse()
        : { error: API_MESSAGE.UnknownErrorHappen, payload: exception },
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
