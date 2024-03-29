import { Module, forwardRef } from '@nestjs/common';
import { UsersRepository } from './users.repo';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserDAO, UserSchema } from './schemas/user.schema';
import { AuthModule } from '../src/auth.module';
import { JwtService } from '@nestjs/jwt';
import { LoginWithProviderUseCase } from './usecase/login_with_provider/login_with_provider.usecase';
import { UpdateUserProfileUseCase } from './usecase/update_profile/update_profile.usecase';
import { GetUserProfileUseCase } from './usecase/get_profile/get_profile.usecase';
import { StorageModule } from '@app/common/storage/storage.module';
import { UpdateUserAvatarUseCase } from './usecase/update_avatar/update_avatar.usecase';
import { GetPublicUserProfilesUseCase } from './usecase/get_public_profiles/get_public_profiles.usecase';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserDAO.name, schema: UserSchema }]),
    forwardRef(() => AuthModule),
    StorageModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    JwtService,
    LoginWithProviderUseCase,
    UpdateUserProfileUseCase,
    GetUserProfileUseCase,
    UpdateUserAvatarUseCase,
    GetPublicUserProfilesUseCase,
  ],
  exports: [
    UsersService,
    LoginWithProviderUseCase,
    UpdateUserProfileUseCase,
    GetUserProfileUseCase,
    UpdateUserAvatarUseCase,
    GetPublicUserProfilesUseCase,
  ],
})
export class UsersModule {}
