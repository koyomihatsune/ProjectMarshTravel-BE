import { ERROR_CODE } from '@app/common/constants';
import { Result } from '@app/common/core/result';
import { UseCaseError } from '@app/common/core/usecase_error';

export class CommentIsAlreadyChild extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `This parent comment is already a child comment. You can not create a child comment of a child comment.`,
      code: ERROR_CODE.AlreadyChild,
    });
  }
}

export class CommentDoesNotBelongToUser extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `Comment does not belong to user`,
      code: ERROR_CODE.EntityNotBelongToUser,
    });
  }
}
