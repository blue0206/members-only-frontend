import { isApiResponseError } from "@/utils/errorUtils";
import { logger } from "@/utils/logger";
import { ErrorCodes } from "@blue0206/members-only-shared-types";
import { BaseQueryApi, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import * as Sentry from "@sentry/react";
import { RootState } from "../store";
import { clearCredentials } from "@/features/auth/authSlice";
import { apiSlice } from "../services/api";
import { sessionExpiredQuery } from "@/lib/constants";

// Transforms non-auth errors (i.e., ones that do not require token refresh.)
export const transformNonAuthErrorResponse = (
  error: FetchBaseQueryError,
  api: BaseQueryApi
) => {
  // The error result can have error from either the API itself or
  // from RTK Query. In case of former, we extract the actual error
  // payload and return it as part of result, else, we return the
  // result without any mutation.

  // If the status property is a number and the data property is
  // an ApiResponseError object, the error is from the API.
  if (
    typeof error.status === "number" &&
    typeof error.data === "object" &&
    isApiResponseError(error.data)
  ) {
    // Since the result structure is confusing, here's a rough layout for its error:
    // result/
    // ├──error
    // |  ├──data
    // |  |  └──ApiResponseError
    // │  └──status

    // Capture the error in Sentry.
    Sentry.captureException(error.data.errorPayload, {
      extra: {
        endpoint: api.endpoint,
        requestId: error.data.requestId,
        code: error.data.errorPayload.code,
      },
      tags: {
        errorType: "API",
        apiCode: error.data.errorPayload.code,
      },
      user: {
        id: (api.getState() as RootState).auth.user?.id,
        username: (api.getState() as RootState).auth.user?.username,
      },
    });

    logger.error({ error: error.data.errorPayload }, "API Error");

    // Extract actual error payload and return.
    return error.data.errorPayload;
  } else {
    // Capture the error in Sentry.
    Sentry.captureException(error, {
      extra: {
        endpoint: api.endpoint,
        status: error.status,
        data: error.data,
      },
      tags: {
        errorType: "RTK_QUERY",
        code: error.status,
      },
      user: {
        id: (api.getState() as RootState).auth.user?.id,
        username: (api.getState() as RootState).auth.user?.username,
      },
    });

    logger.error({ error: error.data }, "RTK Query Error");

    // Return the error without any extraction since the
    // error is from RTK Query.
    return error;
  }
};

// Transforms errors thrown in retry queries after a successful token refresh.
export const transformRetryQueryError = (
  error: FetchBaseQueryError,
  api: BaseQueryApi
) => {
  if (
    error.status === 401 &&
    "data" in error &&
    isApiResponseError(error.data) &&
    (error.data.errorPayload.code === ErrorCodes.EXPIRED_TOKEN ||
      error.data.errorPayload.code === ErrorCodes.AUTHENTICATION_REQUIRED)
  ) {
    logger.error(
      { error: error.data },
      "Access token expired in retried query after refresh. Logging out the user."
    );

    Sentry.captureException(error.data.errorPayload, {
      extra: {
        endpoint: api.endpoint,
        requestId: error.data.requestId,
        code: error.data.errorPayload.code,
      },
      tags: {
        errorType: "API",
        apiCode: error.data.errorPayload.code,
      },
      user: {
        id: (api.getState() as RootState).auth.user?.id,
        username: (api.getState() as RootState).auth.user?.username,
      },
    });

    // Clears redux state, RTK Query Cache and remove user from Sentry.
    api.dispatch(clearCredentials());
    apiSlice.util.resetApiState();
    Sentry.setUser(null);

    logger.warn(
      "Token refresh failed. Redirecting to login page with reason query param to indicate session expiry."
    );
    // Redirect to login page with reason set to session expiry.
    // The reason will be used to display toast notification.
    window.location.replace(`/login?reason=${sessionExpiredQuery}`);
  } else {
    return transformNonAuthErrorResponse(error, api);
  }
};
