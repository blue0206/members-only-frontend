import { isAnyOf, PayloadAction, UnknownAction } from "@reduxjs/toolkit";
import { authApiSlice } from "../services/authApi";
import { ApiErrorPayload } from "@blue0206/members-only-shared-types";

// This type guard is used to determine if action is a rejected
// action from refresh endpoint.
// This is to ensure that automated refresh flow is not triggered
// for refresh endpoint as the error code returned from server is a
// little generic (EXPIRED_TOKEN) which can be either for refresh
// token or access token. However, the error code for refresh token
// is only returned from refresh endpoint.
// Therefore, we perform automated-refresh flow for all endpoints
// except refresh endpoint.
export const refreshEndpointRejectedAction = isAnyOf(
  authApiSlice.endpoints.refreshTokens.matchRejected
);

// Ensure that the action is in fact a reject action from
// the server.
export const actionHasApiErrorPayload = (
  action: UnknownAction
): action is PayloadAction<ApiErrorPayload> => {
  if (Object.prototype.hasOwnProperty.call(action.payload, "code")) {
    return true;
  }
  return false;
};
