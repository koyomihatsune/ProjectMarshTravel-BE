// import { Test, TestingModule } from '@nestjs/testing';
// import { UsersController } from './users.controller';
// import { UpdateUserProfileUseCase } from './usecase/update_profile/update_profile.usecase';
// import { GetUserProfileUseCase } from './usecase/get_profile/get_profile.usecase';
// import { UpdateUserAvatarUseCase } from './usecase/update_avatar/update_avatar.usecase';
// import { UpdateUserProfileDTO } from './usecase/update_profile/update_profile.dto';
// import * as AppErrors from '@app/common/core/app.error';
// import {
//   BadRequestException,
//   NotFoundException,
//   UnauthorizedException,
// } from '@nestjs/common';

// describe('UsersController', () => {
//   let controller: UsersController;
//   let updateUserProfileUseCase: UpdateUserProfileUseCase;
//   let getUserProfileUseCase: GetUserProfileUseCase;
//   let updateUserAvatarUseCase: UpdateUserAvatarUseCase;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [UsersController],
//       providers: [
//         UpdateUserProfileUseCase,
//         GetUserProfileUseCase,
//         UpdateUserAvatarUseCase,
//       ],
//     }).compile();

//     controller = module.get<UsersController>(UsersController);
//     updateUserProfileUseCase = module.get<UpdateUserProfileUseCase>(
//       UpdateUserProfileUseCase,
//     );
//     getUserProfileUseCase = module.get<GetUserProfileUseCase>(
//       GetUserProfileUseCase,
//     );
//     updateUserAvatarUseCase = module.get<UpdateUserAvatarUseCase>(
//       UpdateUserAvatarUseCase,
//     );
//   });

//   describe('updateUserProfile', () => {
//     it('should update user profile successfully', async () => {
//       const req = {
//         user: {
//           sub: 'user-id',
//         },
//       };
//       const updateUserProfileDTO: UpdateUserProfileDTO = {
//         firstName: 'John',
//         lastName: 'Doe',
//       };
//       const result = {
//         isRight: () => true,
//       };
//       jest
//         .spyOn(updateUserProfileUseCase, 'execute')
//         .mockResolvedValueOnce(result as any);

//       const response = await controller.updateUserProfile(
//         req as any,
//         updateUserProfileDTO,
//       );

//       expect(response).toBeUndefined();
//     });

//     it('should throw NotFoundException if user is not found', async () => {
//       const req = {
//         user: {
//           sub: 'user-id',
//         },
//       };
//       const updateUserProfileDTO: UpdateUserProfileDTO = {
//         firstName: 'John',
//         lastName: 'Doe',
//       };
//       const error = new AppErrors.EntityNotFoundError('User not found');
//       const result = {
//         isRight: () => false,
//         value: error,
//       };
//       jest
//         .spyOn(updateUserProfileUseCase, 'execute')
//         .mockResolvedValueOnce(result as any);

//       await expect(
//         controller.updateUserProfile(req as any, updateUserProfileDTO),
//       ).rejects.toThrowError(new NotFoundException(error));
//     });

//     it('should throw BadRequestException for other errors', async () => {
//       const req = {
//         user: {
//           sub: 'user-id',
//         },
//       };
//       const updateUserProfileDTO: UpdateUserProfileDTO = {
//         firstName: 'John',
//         lastName: 'Doe',
//       };
//       const error = new AppErrors.ValidationError('Invalid input');
//       const result = {
//         isRight: () => false,
//         value: error,
//       };
//       jest
//         .spyOn(updateUserProfileUseCase, 'execute')
//         .mockResolvedValueOnce(result as any);

//       await expect(
//         controller.updateUserProfile(req as any, updateUserProfileDTO),
//       ).rejects.toThrowError(new BadRequestException(error));
//     });
//   });

//   describe('getUserProfile', () => {
//     it('should get user profile successfully', async () => {
//       const req = {
//         user: {
//           sub: 'user-id',
//         },
//       };
//       const result = {
//         isRight: () => true,
//         value: {
//           id: 'user-id',
//           firstName: 'John',
//           lastName: 'Doe',
//         },
//       };
//       jest
//         .spyOn(getUserProfileUseCase, 'execute')
//         .mockResolvedValueOnce(result as any);

//       const response = await controller.getUserProfile(req as any);

//       expect(response).toEqual(result.value);
//     });

//     it('should throw NotFoundException if user is not found', async () => {
//       const req = {
//         user: {
//           sub: 'user-id',
//         },
//       };
//       const error = new AppErrors.EntityNotFoundError('User not found');
//       const result = {
//         isRight: () => false,
//         value: error,
//       };
//       jest
//         .spyOn(getUserProfileUseCase, 'execute')
//         .mockResolvedValueOnce(result as any);

//       await expect(controller.getUserProfile(req as any)).rejects.toThrowError(
//         new NotFoundException(error),
//       );
//     });
//   });

//   describe('updateUserAvatar', () => {
//     it('should update user avatar successfully', async () => {
//       const req = {
//         user: {
//           sub: 'user-id',
//         },
//         file: {
//           mimetype: 'image/jpeg',
//         },
//       };
//       const result = {
//         isRight: () => true,
//       };
//       jest
//         .spyOn(updateUserAvatarUseCase, 'execute')
//         .mockResolvedValueOnce(result as any);

//       const response = await controller.updateUserAvatar(
//         req as any,
//         req as any,
//       );

//       expect(response).toBeUndefined();
//     });

//     it('should throw UnauthorizedException if user is not authenticated', async () => {
//       const req = {
//         user: undefined,
//         file: {
//           mimetype: 'image/jpeg',
//         },
//       };
//       const error = new AppErrors.UnauthorizedError('User not authenticated');
//       const result = {
//         isRight: () => false,
//         value: error,
//       };
//       jest
//         .spyOn(updateUserAvatarUseCase, 'execute')
//         .mockResolvedValueOnce(result as any);

//       await expect(
//         controller.updateUserAvatar(req as any, req as any),
//       ).rejects.toThrowError(new UnauthorizedException(error));
//     });

//     it('should throw BadRequestException if file type is not supported', async () => {
//       const req = {
//         user: {
//           sub: 'user-id',
//         },
//         file: {
//           mimetype: 'image/gif',
//         },
//       };
//       const error = new AppErrors.ValidationError('Invalid file type');
//       const result = {
//         isRight: () => false,
//         value: error,
//       };
//       jest
//         .spyOn(updateUserAvatarUseCase, 'execute')
//         .mockResolvedValueOnce(result as any);

//       await expect(
//         controller.updateUserAvatar(req as any, req as any),
//       ).rejects.toThrowError(new BadRequestException(error));
//     });
//   });
// });
