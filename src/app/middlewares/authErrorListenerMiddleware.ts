import {
  createListenerMiddleware,
  isRejectedWithValue,
  UnknownAction,
} from "@reduxjs/toolkit";
import { authApiSlice } from "../services/authApi";
import {
  refreshEndpointRejectedAction,
  actionHasApiErrorPayload,
} from "./typeGuards";

// Initialize the listener middleware.
const authErrorListenerMiddleware = createListenerMiddleware();

// Create listener entry for expired access tokens.
// If the access token is expired, we need to refresh it.
// Upon refresh, we any error is encountered, we logout the user.
// TODO: Finish implementation with mutex.
authErrorListenerMiddleware.startListening({
  predicate: (action: UnknownAction) =>
    !refreshEndpointRejectedAction(action) && isRejectedWithValue(action),
  effect: async (action: UnknownAction, listenerApi) => {
    console.log("Action Rejected");
    if (actionHasApiErrorPayload(action)) {
      if (action.payload.code === "EXPIRED_TOKEN") {
        await listenerApi.dispatch(
          authApiSlice.endpoints.refreshTokens.initiate()
        );
      }
    }
  },
});

export default authErrorListenerMiddleware;
