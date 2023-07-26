import { Injectable } from '@nestjs/common';
import { UseCase } from '@app/common/core/usecase';
import { LoginWithProviderDTO } from './login_with_provider.dto';
import { AuthService } from 'apps/auth/src/auth.service';
import { UsersService } from '../../users.service';
import { UserEmail } from '../../domain/user_email';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { User } from '../../domain/user.entity';
import { CreateUserRequest } from '../../dto/create-user.request';
import { LoginResponseDTO } from 'apps/auth/src/usecase/login/login.dto';

@Injectable()
export class LoginWithProviderUseCase
  implements UseCase<LoginWithProviderDTO, Promise<LoginResponseDTO>>
{
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  execute = async (
    payload: LoginWithProviderDTO,
  ): Promise<LoginResponseDTO> => {
    const userEmailOrError = UserEmail.create({ value: payload.email });
    if (userEmailOrError.isFailure) {
      throw new Error('Email không hợp lệ');
    }
    // Kiểm tra email có tồn tại hay không, nếu không thì tạo user mới luôn, rồi tạo JWT.
    let user: User = await this.usersService.getUserByEmail(
      userEmailOrError.getValue(),
    );
    let initUser = false;

    // User chưa tồn tại, tạo user mới
    if (!user) {
      let decodedToken: DecodedIdToken | null;
      if (payload.provider === 'firebase_google') {
        decodedToken = payload.googleDecodedToken;
        const createUserRequestDTO: CreateUserRequest = {
          email: decodedToken.email,
          provider: decodedToken.firebase.sign_in_provider,
          name: decodedToken.name,
        };
        user = await this.usersService.createUser(createUserRequestDTO);
        initUser = true;
      }
    }

    const token = await this.authService.generateAccessToken(user);
    // Trong trường hợp token không dùng được
    // const token = {
    //   accessToken: 'a',
    //   refreshToken: 'b',
    // };

    await this.usersService.updateUserToken(user.userId, {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
    });

    return {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      isNewAccount: initUser,
    };
  };
}
