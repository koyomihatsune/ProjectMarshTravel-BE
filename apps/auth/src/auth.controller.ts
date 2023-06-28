import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { firebaseAdmin } from '@app/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('test')
  getHello(): string {
    return 'Hello';
  }

  @Post('authenticate')
  async authenticate(@Body() body: { token: string }) {
    const { token } = body;

    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
      const userId = decodedToken.uid;
      // eslint-disable-next-line no-console
      console.log('UserID extracted from Firebase Token is: ' + userId);

      return { success: true };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
