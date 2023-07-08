import { Request } from 'express';

export type JWTPayload = {
  sub: string;
  username: string;
};

export type RequestWithJWTPayload = Request & { user: JWTPayload };

export type TokenType = 'accessToken' | 'refreshToken';
