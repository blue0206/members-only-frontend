import {
  BaseQueryApi,
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { Mutex } from "async-mutex";
import {
  ApiResponseSuccess,
  ErrorCodes,
  RefreshResponseDto,
  RefreshResponseSchema,
} from "@blue0206/members-only-shared-types";
import { clearCredentials, setCredentials } from "@/features/auth/authSlice";
import { CustomBaseQueryError, HttpMethod } from "@/types";
import { isApiErrorPayload, isApiResponseError } from "@/utils/errorUtils";
import { logger } from "@/utils/logger";
import * as Sentry from "@sentry/react";
import { getCsrfTokenFromCookie, setCsrfHeader } from "../utils/csrfUtil";
import { serverErrorQuery, sessionExpiredQuery } from "../../lib/constants";
import {
  transformNonAuthErrorResponse,
  transformRetryQueryError,
} from "../utils/transformApiError";

// Instantiate mutex.
const mutex = new Mutex();

// Define base query.
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers, { getState, endpoint }) => {
    // Define endpoints where both access token and CSRF token are required.
    const commonEndpoints = [
      "logoutUser",
      "createMessage",
      "editMessage",
      "deleteMessage",
      "editUserDetails",
      "deleteUser",
      "resetPassword",
      "memberRoleUpdate",
      "setRole",
      "deleteAvatar",
      "likeMessage",
      "unlikeMessage",
      "addBookmark",
      "removeBookmark",
      "uploadAvatar",
      "getSessions",
      "revokeSession",
      "revokeAllSessions",
    ];
    // Define endpoints where only CSRF token is required.
    const csrfEndpoints = [...commonEndpoints, "tokenRefresh"];
    // Define endpoints where only access token is required.
    const accessTokenEndpoints = [
      ...commonEndpoints,
      "getMessagesWithAuthor",
      "getUsers",
      "getBookmarks",
    ];

    // Add access token to headers if the current endpoint
    // is listed in access token endpoints.
    if (accessTokenEndpoints.includes(endpoint)) {
      // Get access token from store.
      const accessToken = (getState() as RootState).auth.accessToken;
      // Append to headers if it is present.
      if (accessToken) headers.append("Authorization", `Bearer ${accessToken}`);
    }
    // Add CSRF token to headers if the current endpoint is listed in
    // CSRF endpoints.
    if (csrfEndpoints.includes(endpoint)) {
      // Extract CSRF token from cookie.
      const csrfToken = getCsrfTokenFromCookie();
      // If present, populate header.
      if (csrfToken) {
        if (headers.get("x-csrf-token")) {
          headers.set("x-csrf-token", csrfToken);
        } else {
          headers.append("x-csrf-token", csrfToken);
        }
      }
    }

    return headers;
  },
});

/**
 * An RTK Query base query wrapper that handles automatic token refreshing.
 *
 * If a request returns a 401 status with an `EXPIRED_TOKEN` code, it attempts
 * to fetch a new access token from the `/auth/refresh` endpoint.
 *
 * A mutex ensures only one refresh happens at a time. Other requests encountering
 * the 401 error while a refresh is in progress will wait for the refresh to
 * complete before retrying.
 *
 * On successful refresh, the new token is stored, and the original request is retried.
 * On failed refresh, the user is logged out (`clearCredentials`), and the API state is reset.
 *
 * For other errors, it standardizes the error format by extracting the `errorPayload`
 * from API responses and logs/reports all significant errors (API, RTK Query, Refresh)
 * to the console and Sentry. It also ensures the CSRF token is included in the
 * refresh request.
 *
 * @param args - The query arguments (URL string or FetchArgs object).
 * @param api - The BaseQueryApi provided by RTK Query, containing methods like `dispatch`, `getState`, etc.
 * @param extraOptions - Extra options passed to the query hook or mutation trigger.
 * @returns A Promise resolving to the query result (either successful response, transformed error payload,
 *          or an RTK Query error object).
 *
 */
// Define customized base query with re-auth logic.
const customizedBaseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  CustomBaseQueryError
> = async (args: string | FetchArgs, api: BaseQueryApi, extraOptions) => {
  // Wait for the mutex to be released.
  await mutex.waitForUnlock();

  // Get the result from base query.
  let result = await baseQuery(args, api, extraOptions);

  //----------------Re-Auth Logic starts here----------------
  // Check if error is present, its status code is 401, and the error code is "EXPIRED_TOKEN".
  if (
    result.error &&
    result.error.status === 401 &&
    "data" in result.error &&
    isApiResponseError(result.error.data) &&
    (result.error.data.errorPayload.code === ErrorCodes.EXPIRED_TOKEN ||
      result.error.data.errorPayload.code ===
        ErrorCodes.AUTHENTICATION_REQUIRED)
  ) {
    logger.warn(
      { endpoint: api.endpoint },
      "Access Token expired, attempting refresh."
    );

    if (!mutex.isLocked()) {
      // Lock the mutex.
      const release = await mutex.acquire();

      logger.info({ endpoint: api.endpoint }, "Acquired mutex.");

      try {
        logger.info("Dispatching call to refresh endpoint.");
        // Run the refresh request and check success.
        const refreshResult = await baseQuery(
          {
            url: "/auth/refresh",
            method: HttpMethod.POST,
            credentials: "include",
            headers: setCsrfHeader(),
          },
          api,
          extraOptions
        );

        // If refresh failed, logout & notify the user and reset RTKQ cache.
        // Only if the error is 401. If not 401, it is a network or server error
        // and hence no reauth is required.
        if (refreshResult.error) {
          logger.error(
            { error: refreshResult.error },
            "Token refresh failed, logging out...."
          );

          const transformedError = transformNonAuthErrorResponse(
            refreshResult.error,
            api
          );
          if (
            isApiErrorPayload(transformedError) &&
            transformedError.statusCode === 401 &&
            transformedError.code !== ErrorCodes.INCORRECT_PASSWORD
          ) {
            forceLogout(api);
          } else {
            logger.warn(
              "Token refresh failed with non-auth error. Redirecting to error page with reason query param to indicate server error."
            );

            if (
              window.location.pathname !== "/error" &&
              window.location.pathname !== `/error?reason=${serverErrorQuery}`
            ) {
              window.location.replace(`/error?reason=${serverErrorQuery}`);
            }
          }
        } else {
          // Validate the result against schema.
          const parsedResult: RefreshResponseDto = RefreshResponseSchema.parse(
            (refreshResult.data as ApiResponseSuccess<RefreshResponseDto>)
              .payload
          );

          // Re-auth was successful, log the event.
          logger.info(
            "Token refresh successful, retrying original request...."
          );

          // Refresh was successful, dispatch the access token.
          api.dispatch(
            setCredentials({
              accessToken: parsedResult.accessToken,
              authStatus: true,
              user: {
                ...parsedResult,
              },
            })
          );

          // Retry the original request and return result.
          result = await baseQuery(args, api, extraOptions);
          if (result.error) {
            return {
              error: transformRetryQueryError(result.error, api),
              data: result.data,
              meta: result.meta,
            };
          }
          return result;
        }
      } catch (error) {
        logger.error(
          { error },
          "Unexpected error during token refresh mutation call with mutex. Logging out the user...."
        );

        // Capture the error in Sentry.
        Sentry.captureException(error, {
          extra: {
            endpoint: api.endpoint,
          },
          tags: {
            errorType: "MUTEX/REFRESH",
          },
          user: {
            id: (api.getState() as RootState).auth.user?.id,
            username: (api.getState() as RootState).auth.user?.username,
          },
        });

        // Logout the user and reset RTKQ cache since refresh failed.
        forceLogout(api);
      } finally {
        logger.info({ endpoint: api.endpoint }, "Releasing mutex.");

        // Release the mutex.
        release();
      }
      //----------------Re-Auth Logic ends here---------------
    } else {
      logger.debug(
        { endpoint: api.endpoint },
        "Token refresh in progress, waiting for mutex release...."
      );

      // Wait for the mutex to be released.
      await mutex.waitForUnlock();

      logger.debug(
        { endpoint: api.endpoint },
        "Mutex unlocked, retrying request...."
      );

      result = await baseQuery(args, api, extraOptions);
      if (result.error) {
        return {
          error: transformRetryQueryError(result.error, api),
          data: result.data,
          meta: result.meta,
        };
      }
      return result;
    }
  } else if (result.error) {
    // If error is present and is not a Token Expiry error, we
    // transform the error payload here itself instead of having
    // to do the same in transformErrorResponse of every single
    // RTK endpoint.
    return {
      error: transformNonAuthErrorResponse(result.error, api),
      data: result.data,
      meta: result.meta,
    };
  }

  // If the result is not an error and is not for auto-refresh, return.
  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: customizedBaseQueryWithReauth,
  tagTypes: ["Messages", "Bookmarks", "Users", "Sessions"],
  endpoints: () => ({}),
});

const forceLogout = (api: BaseQueryApi): void => {
  // Clears redux state, RTK Query Cache and remove user from Sentry.
  api.dispatch(clearCredentials());
  api.dispatch(apiSlice.util.resetApiState());
  Sentry.setUser(null);

  logger.warn(
    "Token refresh failed. Redirecting to login page with reason query param to indicate session expiry."
  );
  // Redirect to login page with reason set to session expiry.
  // The reason will be used to display toast notification.
  window.location.replace(`/login?reason=${sessionExpiredQuery}`);
};
