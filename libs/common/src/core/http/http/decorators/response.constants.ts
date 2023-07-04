import { WORD_MESSAGE } from '../../../../constants/string.constants';
import { API_MESSAGE, STR_COMMON } from 'src/shared/constants/string.constants';

export const USER_RESPONSE_MESSAGES = {
  UserCreated: API_MESSAGE.CreateUserSuccess,
  UserUpdated: API_MESSAGE.UpdateUserSuccess,
  UserSuccessfullyCreated: API_MESSAGE.CreateUserSuccess,
  LoginSuccess: API_MESSAGE.LoginSuccess,
  RefreshTokenSuccess: API_MESSAGE.TokenRefreshSuccess,
  CommonSuccess: STR_COMMON.Success,
  CommonFail: STR_COMMON.Fail,
};

export const ROLE_RESPONSE_MESSAGES = {
  GetByIdSuccess: API_MESSAGE.GetRoleSuccess,

  CommonSuccess: STR_COMMON.Success,
};

export const RESULT_RESPONSE_MESSAGE = {
  CommonSuccess: STR_COMMON.Success,
};

export const WORD_RESPONSE_MESSAGES = {
  WordDeleted: WORD_MESSAGE.DeleteWordSuccess,
  WordUpdated: WORD_MESSAGE.UpdateWordSuccess,
};
