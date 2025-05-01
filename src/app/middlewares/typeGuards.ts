import {
  PayloadAction,
  SerializedError,
  UnknownAction,
} from "@reduxjs/toolkit";
import { ApiErrorPayload } from "@blue0206/members-only-shared-types";
import { isApiErrorCode } from "@/utils/errorUtils";

// Type guard to check if the error payload of action
// is from the server.
export const actionHasApiErrorPayload = (
  action: UnknownAction
): action is PayloadAction<ApiErrorPayload> => {
  if (
    "payload" in action &&
    typeof action.payload === "object" &&
    action.payload &&
    "code" in action.payload &&
    isApiErrorCode(action.payload.code)
  ) {
    return true;
  }
  return false;
};

// Type guard to check if the error payload of action is
// from RTK Query SerializedError (errors thrown in transformResponse for example).
export const actionHasSerializedError = (
  action: UnknownAction
): action is PayloadAction<SerializedError> => {
  if (
    "payload" in action &&
    typeof action.payload === "object" &&
    action.payload &&
    "code" in action.payload &&
    !isApiErrorCode(action.payload.code)
  ) {
    return true;
  }
  return false;
};
