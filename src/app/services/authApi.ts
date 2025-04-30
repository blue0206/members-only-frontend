/* eslint-disable @typescript-eslint/no-invalid-void-type */
// This eslint rule has been disabled because void type is used
// for no arguments in RTK Query.

import {
  ApiResponseSuccess,
  LoginRequestDto,
  LoginResponseDto,
  LoginResponseSchema,
  RegisterRequestDto,
  RegisterResponseDto,
  RegisterResponseSchema,
} from "@blue0206/members-only-shared-types";
import { apiSlice } from "./api";
import { HttpMethod } from "@/types";
import { ValidationError } from "@/utils/error";
import {
  AuthState,
  clearCredentials,
  setCredentials,
} from "@/features/auth/authSlice";
import * as Sentry from "@sentry/react";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Register Endpoint
    registerUser: builder.mutation<AuthState, RegisterRequestDto>({
      query: (body: RegisterRequestDto) => ({
        url: "/auth/register",
        method: HttpMethod.POST,
        body,
      }),
      transformResponse: (result: ApiResponseSuccess<RegisterResponseDto>) => {
        // Validate the response against schema.
        const parsedResult = RegisterResponseSchema.safeParse(result.payload);
        // Throw error if validation fails.
        if (!parsedResult.success) {
          throw new ValidationError(
            parsedResult.error.message,
            parsedResult.error.flatten()
          );
        }
        // Extract access token and user details from response.
        const { accessToken, ...userData } = parsedResult.data;
        // Return the response payload conforming to AuthState type.
        return {
          accessToken,
          user: userData,
          authStatus: true,
        };
      },
      onQueryStarted: async (_queryArgument, mutationLifeCycleApi) => {
        // Wait for the query to be fulfilled.
        const queryResult = await mutationLifeCycleApi.queryFulfilled;
        // Dispatch action to update auth state.
        mutationLifeCycleApi.dispatch(setCredentials(queryResult.data));
        // Set user in Sentry.
        Sentry.setUser({
          id: queryResult.data.user?.id,
          username: queryResult.data.user?.username,
        });
      },
    }),
    // Login Endpoint
    loginUser: builder.mutation<AuthState, LoginRequestDto>({
      query: (body: LoginRequestDto) => ({
        url: "/auth/login",
        method: HttpMethod.POST,
        body,
      }),
      transformResponse: (result: ApiResponseSuccess<LoginResponseDto>) => {
        // Validate the response against schema.
        const parsedResult = LoginResponseSchema.safeParse(result.payload);
        // Throw error if validation fails.
        if (!parsedResult.success) {
          throw new ValidationError(
            parsedResult.error.message,
            parsedResult.error.flatten()
          );
        }
        // Extract access token and user details from response.
        const { accessToken, ...userData } = parsedResult.data;
        // Return the response payload conforming to AuthState type.
        return {
          accessToken,
          user: userData,
          authStatus: true,
        };
      },
      onQueryStarted: async (_queryArgument, mutationLifeCycleApi) => {
        // Wait for the query to be fulfilled.
        const queryResult = await mutationLifeCycleApi.queryFulfilled;
        // Dispatch action to update auth state.
        mutationLifeCycleApi.dispatch(setCredentials(queryResult.data));
        // Set user in Sentry.
        Sentry.setUser({
          id: queryResult.data.user?.id,
          username: queryResult.data.user?.username,
        });
      },
    }),
    // Logout Endpoint
    logoutUser: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: HttpMethod.DELETE,
      }),
      onQueryStarted: async (_queryArgument, mutationLifeCycleApi) => {
        // Wait for the query to be fulfilled.
        await mutationLifeCycleApi.queryFulfilled;
        // Clear RTK Query cache.
        mutationLifeCycleApi.dispatch(apiSlice.util.resetApiState());
        // Clear user auth state.
        mutationLifeCycleApi.dispatch(clearCredentials());
        // Remove user from Sentry.
        Sentry.setUser(null);
      },
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
} = authApiSlice;
