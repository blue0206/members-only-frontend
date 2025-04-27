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
  ApiResponseError,
  RefreshResponseDto,
} from "@blue0206/members-only-shared-types";
import { clearCredentials, updateAccessToken } from "@/features/auth/authSlice";
import { CustomBaseQueryError } from "@/types";
import { isApiResponseError } from "@/utils/errorUtils";
import { logger } from "@/utils/logger";

// Instantiate mutex.
const mutex = new Mutex();

// Define base query.
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers, { getState, endpoint }) => {
    // Define endpoints where both access token and CSRF token are required.
    const commonEndpoints = ["logoutUser"];
    // Define endpoints where only CSRF token is required.
    const csrfEndpoints = [...commonEndpoints, "refreshTokens"];
    // Define endpoints where only access token is required.
    const accessTokenEndpoints = [...commonEndpoints];

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
      // Get all cookies in array.
      const cookies = document.cookie.split(";");
      // Get CSRF cookie from array.
      const csrfCookie = cookies.find((cookie) =>
        cookie.startsWith("csrf-token")
      );
      // Extract CSRF token from cookie.
      const csrfToken = csrfCookie?.split("=")[1];
      // If present, populate header.
      if (csrfToken) headers.append("x-csrf-token", csrfToken.trim());
    }

    return headers;
  },
});

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
    (result.error.data as ApiResponseError).error.code === "EXPIRED_TOKEN"
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
          "/refreshTokens",
          api,
          extraOptions
        );

        // If refresh failed, logout the user and reset RTKQ cache.
        if (refreshResult.error) {
          logger.error(
            { error: refreshResult.error },
            "Token refresh failed, logging out...."
          );

          api.dispatch(clearCredentials());
          apiSlice.util.resetApiState();
        } else {
          logger.info(
            "Token refresh successful, retrying original request...."
          );

          // Refresh was successful, dispatch the access token.
          api.dispatch(
            updateAccessToken(
              (refreshResult.data as RefreshResponseDto).accessToken
            )
          );

          // Retry the original request and return result.
          result = await baseQuery(args, api, extraOptions);
          return result;
        }
      } catch (error) {
        logger.error(
          { error },
          "Unexpected error during token refresh mutation call with mutex. Logging out the user...."
        );

        // Logout the user and reset RTKQ cache since refresh failed.
        api.dispatch(clearCredentials());
        apiSlice.util.resetApiState();
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
    }
  } else if (result.error) {
    // If error is present and is not a Token Expiry error, we
    // transform the error payload here itself instead of having
    // to do the same in transformErrorResponse of every single
    // RTK endpoint.
    // The error result can have error from either the API itself or
    // from RTK Query. In case of former, we extract the actual error
    // payload and return it as part of result, else, we return the
    // result without any mutation.

    // If the status property is a number and the data property is
    // an ApiResponseError object, the error is from the API.
    if (
      typeof result.error.status === "number" &&
      typeof result.error.data === "object" &&
      isApiResponseError(result.error.data)
    ) {
      // Extract actual error payload and return as part of error
      // property of result.
      return {
        error: result.error.data.error,
        data: result.data,
        meta: result.meta,
      };
    } else {
      // Return the result without any mutation since the
      // error is from RTK Query.
      return result;
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: customizedBaseQueryWithReauth,
  endpoints: () => ({}),
});
