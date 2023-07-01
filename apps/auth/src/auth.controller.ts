import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('test')
  getHello(): string {
    return 'Hello';
  }

  @Post('login')
  async login(@Body() body: { token: string }) {
    const { token } = body;
    try {
      const result = this.authService.firebaseAuthenticateWithToken({
        token: token,
      });
      return result;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
