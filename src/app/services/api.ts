import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

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

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery,
  endpoints: () => ({}),
});
