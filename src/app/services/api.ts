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
    if (!mutex.isLocked()) {
      // Lock the mutex.
      const release = await mutex.acquire();
      try {
        // Run the refresh request and unwrap to check success.
        const refreshResult = await baseQuery(
          "/refreshTokens",
          api,
          extraOptions
        );
        if (refreshResult.error) {
          // Logout the user and reset RTKQ cache since refresh failed.
          api.dispatch(clearCredentials());
          apiSlice.util.resetApiState();
          console.error(refreshResult.error);
        } else {
          // Refresh was successful, dispatch the access token and
          // run the initial query again.
          api.dispatch(
            updateAccessToken(
              (refreshResult.data as RefreshResponseDto).accessToken
            )
          );
          result = await baseQuery(args, api, extraOptions);
          return result;
        }
      } catch (error) {
        // Logout the user and reset RTKQ cache since refresh failed.
        api.dispatch(clearCredentials());
        apiSlice.util.resetApiState();
        console.error(error);
      } finally {
        // Release the mutex.
        release();
      }
      //----------------Re-Auth Logic ends here---------------
    } else {
      // Wait for the mutex to be released.
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: customizedBaseQueryWithReauth,
  endpoints: () => ({}),
});
