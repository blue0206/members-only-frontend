import {
  ApiErrorCode,
  ErrorCodes,
} from "@blue0206/members-only-shared-types/api/error-codes";
import {
  ApiErrorPayload,
  ApiResponseError,
} from "@blue0206/members-only-shared-types/api/base";
import { SerializedError } from "@reduxjs/toolkit";

export const isApiResponseError = (
  error: unknown
): error is ApiResponseError => {
  if (
    typeof error === "object" &&
    error &&
    "success" in error &&
    "errorPayload" in error
  ) {
    return true;
  }
  return false;
};

export const isApiErrorCode = (code: unknown): code is ApiErrorCode => {
  const search = Object.values(ErrorCodes).find((value) => value === code);
  if (search) return true;
  return false;
};

export const isApiErrorPayload = (error: unknown): error is ApiErrorPayload => {
  if (
    typeof error === "object" &&
    error &&
    "code" in error &&
    isApiErrorCode(error.code)
  ) {
    return true;
  }
  return false;
};

export const isSerializedError = (error: unknown): error is SerializedError => {
  if (
    typeof error === "object" &&
    error &&
    "code" in error &&
    !isApiErrorCode(error.code)
  ) {
    return true;
  }
  return false;
};
