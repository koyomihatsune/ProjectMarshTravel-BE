interface IUseCaseError {
  code: number;
  message: string;
  payload?: any;
}

export abstract class UseCaseError implements IUseCaseError {
  public readonly code: number;
  public readonly message: string;
  public readonly payload?: any;

  constructor(code: number, message: string, payload?: any) {
    this.code = code;
    this.message = message;
    this.payload = payload;
  }
}
