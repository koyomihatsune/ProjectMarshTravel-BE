import { AuthService } from '../auth.service';
import { TokenType } from '../types/type.declare';

export const verifyTokenFromReq = async (
  req: any,
  tokenType: TokenType,
  authService: AuthService,
) => {
  const token = req?.Authentication;

  // Lack of token in header, deny it
  if (!token) {
    return false;
  }

  const valid = await authService.validateToken(token, tokenType);

  return valid;
};
