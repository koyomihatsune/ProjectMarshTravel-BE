export type GuardResponse = string;

import { GUARD_MESSAGE } from '../constants/string.constants';
import { Result } from './result';

export interface IGuardArgument {
  argument: any;
  argumentName: string;
}

export type GuardArgumentCollection = IGuardArgument[];

export class Guard {
  public static combine(guardResults: Result<any>[]): Result<GuardResponse> {
    for (const result of guardResults) {
      if (result.isFailure) return result;
    }

    return Result.ok<GuardResponse>();
  }

  public static greaterThan(
    minValue: number,
    actualValue: number,
  ): Result<GuardResponse> {
    return actualValue > minValue
      ? Result.ok<GuardResponse>()
      : Result.fail<GuardResponse>(
          GUARD_MESSAGE.GreaterThan(actualValue, minValue),
        );
  }

  public static greaterThanOrEqualTo(
    minValue: number,
    actualValue: number,
  ): Result<GuardResponse> {
    return actualValue >= minValue
      ? Result.ok<GuardResponse>()
      : Result.fail<GuardResponse>(
          GUARD_MESSAGE.GreaterThanOrEqualTo(actualValue, minValue),
        );
  }

  public static againstAtLeast(
    numChars: number,
    text: string,
  ): Result<GuardResponse> {
    return text.length >= numChars
      ? Result.ok<GuardResponse>()
      : Result.fail<GuardResponse>(GUARD_MESSAGE.AgainstAtLeast(numChars));
  }

  public static againstAtMost(
    numChars: number,
    text: string,
  ): Result<GuardResponse> {
    return text.length <= numChars
      ? Result.ok<GuardResponse>()
      : Result.fail<GuardResponse>(GUARD_MESSAGE.AgainstAtMost(numChars));
  }

  public static againstNullOrUndefined(
    argument: any,
    argumentName: string,
  ): Result<GuardResponse> {
    //  return argument === null || argument === undefined
    return argument === null || argument === undefined
      ? Result.fail<GuardResponse>(
          GUARD_MESSAGE.AgainstNullOrUndefined(argumentName),
        )
      : Result.ok<GuardResponse>();
  }

  public static againstNullOrUndefinedOrEmpty(
    argument: any,
    argumentName: string,
  ): Result<GuardResponse> {
    return argument === null || argument === undefined || argument === ''
      ? Result.fail<GuardResponse>(
          GUARD_MESSAGE.AgainstNullOrUndefinedOrEmpty(argumentName),
        )
      : Result.ok<GuardResponse>();
  }

  public static againstNullOrUndefinedBulk(
    args: GuardArgumentCollection,
  ): Result<GuardResponse> {
    for (const arg of args) {
      const result = this.againstNullOrUndefined(
        arg.argument,
        arg.argumentName,
      );
      if (result.isFailure) return result;
    }

    return Result.ok<GuardResponse>();
  }

  public static againstNullOrUndefinedOrEmptyBulk(
    args: GuardArgumentCollection,
  ): Result<GuardResponse> {
    for (const arg of args) {
      const result = this.againstNullOrUndefinedOrEmpty(
        arg.argument,
        arg.argumentName,
      );
      if (result.isFailure) return result;
    }

    return Result.ok<GuardResponse>();
  }

  public static isOneOf(
    value: any,
    validValues: any[],
    argumentName: string,
  ): Result<GuardResponse> {
    let isValid = false;
    for (const validValue of validValues) {
      if (value === validValue) {
        isValid = true;
      }
    }

    return isValid
      ? Result.ok<GuardResponse>()
      : Result.fail<GuardResponse>(
          GUARD_MESSAGE.IsOneOf(argumentName, validValues, value),
        );
  }

  public static inRange(
    num: number,
    min: number,
    max: number,
    argumentName: string,
  ): Result<GuardResponse> {
    const isInRange = num >= min && num <= max;

    return isInRange
      ? Result.ok<GuardResponse>()
      : Result.fail<GuardResponse>(
          GUARD_MESSAGE.InRange(argumentName, min, max),
        );
  }

  public static allInRange(
    numbers: number[],
    min: number,
    max: number,
    argumentName: string,
  ): Result<GuardResponse> {
    let failingResult: Result<GuardResponse> = Result.ok<GuardResponse>();

    for (const num of numbers) {
      const numIsInRangeResult = this.inRange(num, min, max, argumentName);
      if (!numIsInRangeResult.isFailure) failingResult = numIsInRangeResult;
    }

    return failingResult
      ? Result.fail<GuardResponse>(GUARD_MESSAGE.AllInRange(argumentName))
      : Result.ok<GuardResponse>();
  }
}
