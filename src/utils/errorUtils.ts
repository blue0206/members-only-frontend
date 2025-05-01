import {
  ApiErrorCode,
  ApiResponseError,
  ErrorCodes,
} from "@blue0206/members-only-shared-types";

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
