import { HttpException, HttpStatus } from '@nestjs/common';
import { ERROR_MESSAGE } from '@app/common/constants/string.constants';

export class CustomException extends HttpException {
  constructor(msg?: string, status?: HttpStatus) {
    super(
      msg || ERROR_MESSAGE.SomethingsWentWrong,
      status || HttpStatus.BAD_REQUEST,
    );
  }
}
