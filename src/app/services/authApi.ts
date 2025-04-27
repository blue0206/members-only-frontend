/* eslint-disable @typescript-eslint/no-invalid-void-type */
// This eslint rule has been disabled because void type is used
// for no arguments in RTK Query.

import {
  ApiResponseError,
  ApiResponseSuccess,
  LoginRequestDto,
  LoginResponseDto,
  LoginResponseSchema,
  RefreshResponseDto,
  RefreshResponseSchema,
  RegisterRequestDto,
  RegisterResponseDto,
  RegisterResponseSchema,
} from "@blue0206/members-only-shared-types";
import { apiSlice } from "./api";
import { HttpMethod } from "@/types";
import { ValidationError } from "@/utils/error";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {
  AuthState,
  clearCredentials,
  setCredentials,
} from "@/features/auth/authSlice";

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
        const parsedResult = RegisterResponseSchema.safeParse(result.data);
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
      transformErrorResponse: (
        result: FetchBaseQueryError | ApiResponseError
      ) => {
        // Check if the error is FetchBaseQueryError or ApiResponseError.
        // If it's FetchBaseQueryError, return the result as it is.
        // If it's ApiResponseError, extract the error payload from the
        // response body and return it.
        if ("status" in result) {
          return result;
        } else {
          return result.error;
        }
      },
      onQueryStarted: async (_queryArgument, mutationLifeCycleApi) => {
        // Wait for the query to be fulfilled.
        const queryResult = await mutationLifeCycleApi.queryFulfilled;
        // Dispatch action to update auth state.
        mutationLifeCycleApi.dispatch(setCredentials(queryResult.data));
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
        const parsedResult = LoginResponseSchema.safeParse(result.data);
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
      transformErrorResponse: (
        result: FetchBaseQueryError | ApiResponseError
      ) => {
        // Same logic as register endpoint.
        if ("status" in result) {
          return result;
        } else {
          return result.error;
        }
      },
      onQueryStarted: async (_queryArgument, mutationLifeCycleApi) => {
        // Wait for the query to be fulfilled.
        const queryResult = await mutationLifeCycleApi.queryFulfilled;
        // Dispatch action to update auth state.
        mutationLifeCycleApi.dispatch(setCredentials(queryResult.data));
      },
    }),
    // Logout Endpoint
    logoutUser: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: HttpMethod.DELETE,
      }),
      transformResponse: (result: void) => {
        return result;
      },
      transformErrorResponse: (
        result: FetchBaseQueryError | ApiResponseError
      ) => {
        if ("status" in result) {
          return result;
        } else {
          return result.error;
        }
      },
      onQueryStarted: async (_queryArgument, mutationLifeCycleApi) => {
        // Wait for the query to be fulfilled.
        await mutationLifeCycleApi.queryFulfilled;
        // Clear RTK Query cache.
        mutationLifeCycleApi.dispatch(apiSlice.util.resetApiState());
        // Clear user auth state.
        mutationLifeCycleApi.dispatch(clearCredentials());
      },
    }),
    refreshTokens: builder.mutation<RefreshResponseDto, void>({
      query: () => ({
        url: "/auth/refresh",
        method: HttpMethod.POST,
      }),
      transformResponse: (result: ApiResponseSuccess<RefreshResponseDto>) => {
        const parsedResult = RefreshResponseSchema.safeParse(result.data);
        if (!parsedResult.success) {
          throw new ValidationError(
            parsedResult.error.message,
            parsedResult.error.flatten()
          );
        }
        return parsedResult.data;
      },
      transformErrorResponse: (
        result: FetchBaseQueryError | ApiResponseError
      ) => {
        if ("status" in result) {
          return result;
        } else {
          return result.error;
        }
      },
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useRefreshTokensMutation,
} = authApiSlice;
