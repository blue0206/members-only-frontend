import { ApiResponseError } from "@blue0206/members-only-shared-types";

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
