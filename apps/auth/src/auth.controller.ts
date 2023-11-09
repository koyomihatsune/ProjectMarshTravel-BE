import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { LoginUseCase } from './usecase/login/login.usecase';
import * as LoginUseCaseErrors from './usecase/errors/auth.errors';
import { ResponseMessage } from '@app/common/core/infra/http/decorators/response.decorator';
import { USER_RESPONSE_MESSAGES } from '@app/common/core/infra/http/decorators/response.constants';
import { Public } from './decorators/auth.decorator';
import { MessagePattern } from '@nestjs/microservices';
import { CurrentUser } from './current-user.decorator';
import { UserDAO } from '../user/schemas/user.schema';
import JwtAuthGuard from './guards/jwt-auth.guard';
import AppErrors from '@app/common/core/app.error';
import { AddPhoneNumberToRegistrationQueueDTO } from './usecase/add_phone_number_to_registration_queue/add_phone_number_to_registration_queue.dto';
import { AddPhoneNumberToRegistrationQueueUseCase } from './usecase/add_phone_number_to_registration_queue/add_phone_number_to_registration_queue.usecase';
import { LoginPhoneNumberUseCase } from './usecase/login_with_phone_number/login_with_phone_number.usecase';
import { LoginPhoneNumberDTO } from './usecase/dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly addPhoneNumberToRegistrationQueueUseCase: AddPhoneNumberToRegistrationQueueUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly loginPhoneNumberUseCase: LoginPhoneNumberUseCase,
  ) {}

  @Get('test')
  getHello(): string {
    return 'Hello';
  }

  @Public()
  @Post('registration_queue')
  @ResponseMessage(USER_RESPONSE_MESSAGES.CommonSuccess)
  async AddPhoneNumberToRegistrationQueue(
    @Body() query: AddPhoneNumberToRegistrationQueueDTO,
  ) {
    const result = await this.addPhoneNumberToRegistrationQueueUseCase.execute(
      query,
    );
    if (result.isRight()) {
      return;
    }
    const error = result.value;
    switch (error.constructor) {
      case AppErrors.EntityNotFoundError:
        throw new NotFoundException(error);
      default:
        throw new BadRequestException(error);
    }
  }

  @Public()
  @Post('login_phone')
  @ResponseMessage(USER_RESPONSE_MESSAGES.CommonSuccess)
  async loginPhoneNumber(@Body() body: LoginPhoneNumberDTO) {
    const result = await this.loginPhoneNumberUseCase.execute(body);
    if (result.isRight()) {
      const dto = result.value.getValue();
      return dto;
    }
    const error = result.value;
    switch (error.constructor) {
      case LoginUseCaseErrors.InvalidCredential:
        throw new UnauthorizedException(error.getErrorValue());
      default:
        throw new BadRequestException(error.getErrorValue());
    }
  }

  @Public()
  @Post('login')
  @ResponseMessage(USER_RESPONSE_MESSAGES.CommonSuccess)
  async login(@Body() body: { token: string }) {
    const { token } = body;
    const result = await this.loginUseCase.execute({
      token: token,
    });
    if (result.isRight()) {
      const dto = result.value.getValue();
      return dto;
    }
    const error = result.value;
    switch (error.constructor) {
      case LoginUseCaseErrors.InvalidCredential:
        throw new UnauthorizedException(error.getErrorValue());
      default:
        throw new BadRequestException(error.getErrorValue());
    }
  }

  @UseGuards(JwtAuthGuard)
  @MessagePattern('validate_user')
  async validateUser(@CurrentUser() user: UserDAO) {
    return user;
  }
}
