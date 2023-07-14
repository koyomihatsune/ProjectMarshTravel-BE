import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { LoginUseCase } from './usecase/login/login.usecase';
import * as LoginUseCaseErrors from './usecase/login/login.errors';
import { ResponseMessage } from '@app/common/core/infra/http/decorators/response.decorator';
import { USER_RESPONSE_MESSAGES } from '@app/common/core/infra/http/decorators/response.constants';
import { Public } from './decorators/auth.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { MessagePattern } from '@nestjs/microservices';
import { CurrentUser } from './current-user.decorator';
import { User } from './users/schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Get('test')
  getHello(): string {
    return 'Hello';
  }

  @Public()
  @Post('login')
  @ResponseMessage(USER_RESPONSE_MESSAGES.CommonSuccess)
  async login(@Body() body: { token: string }) {
    const { token } = body;
    const result = await this.loginUseCase.execute({
      token: token,
    });
    console.log("Finish");
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
  async validateUser(@CurrentUser() user: User) {
    return user;
  }
}
