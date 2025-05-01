import {
  createListenerMiddleware,
  isRejectedWithValue,
  UnknownAction,
} from "@reduxjs/toolkit";
import { actionHasSerializedError } from "./typeGuards";
import * as Sentry from "@sentry/react";
import { logger } from "@/utils/logger";
import { RootState } from "../store";

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
          message: "An error occurred while processing your request.",
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

export default authErrorListenerMiddleware;
