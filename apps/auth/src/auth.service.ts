import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface TokenPayload {
  userId: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService) {}
}
