import {
  createListenerMiddleware,
  isRejectedWithValue,
  UnknownAction,
} from "@reduxjs/toolkit";
import {
  actionHasApiErrorPayload,
  actionHasSerializedError,
} from "./typeGuards";
import * as Sentry from "@sentry/react";
import { logger } from "@/utils/logger";
import { RootState } from "../store";
import { ErrorCodes } from "@blue0206/members-only-shared-types";
import { apiSlice } from "../services/api";
import { clearCredentials } from "@/features/auth/authSlice";
import { sessionExpiredQuery } from "@/lib/constants";

// Initialize the listener middleware.
const authErrorListenerMiddleware = createListenerMiddleware();

// Listen for and handle RTK SerializedError.
authErrorListenerMiddleware.startListening({
  predicate: (action: UnknownAction) =>
    isRejectedWithValue(action) && actionHasSerializedError(action),
  effect: (action: UnknownAction, listenerApi) => {
    if (actionHasSerializedError(action)) {
      // Capture the error in Sentry.
      Sentry.captureException(
        {
          error: action.payload,
          message: "An error occurred while processing the request.",
        },
        {
          extra: {
            possibleReason:
              "Validation failure inside `transformResponse` of RTK Query.",
            username: (listenerApi.getState() as RootState).auth.user?.username,
            userId: (listenerApi.getState() as RootState).auth.user?.id,
            role: (listenerApi.getState() as RootState).auth.user?.role,
          },
        }
      );

      // Log the error for development.
      logger.error(
        { error: action.payload },
        "RTK Query Serialized error. Possible reason: Validation failure inside `transformResponse` of RTK Query."
      );
    }
  },
});

// Handle errors that require revoking/clearing the user session.
authErrorListenerMiddleware.startListening({
  predicate: (action: UnknownAction) =>
    isRejectedWithValue(action) && actionHasApiErrorPayload(action),
  effect: (action: UnknownAction, listenerApi) => {
    if (actionHasApiErrorPayload(action)) {
      if (
        action.payload.code === ErrorCodes.CSRF_TOKEN_MISMATCH ||
        action.payload.code === ErrorCodes.MISSING_CSRF_COOKIE ||
        action.payload.code === ErrorCodes.MISSING_CSRF_HEADER ||
        action.payload.code === ErrorCodes.INVALID_TOKEN
      ) {
        // Log the error for development.
        logger.error({ error: action.payload }, action.payload.message);

        // Reset the API state.
        listenerApi.dispatch(apiSlice.util.resetApiState());
        // Clear credentials.
        listenerApi.dispatch(clearCredentials());
        // Remove user from Sentry.
        Sentry.setUser(null);

        logger.warn(
          "Error caught in authErrorListenerMiddleware. Redirecting to login page with reason query param to indicate session expiry."
        );
        // Redirect to login page with reason set to session expiry.
        // The reason will be used to display toast notification.
        window.location.replace(`/login?reason=${sessionExpiredQuery}`);
      }
    }
  },
});

export default authErrorListenerMiddleware;
