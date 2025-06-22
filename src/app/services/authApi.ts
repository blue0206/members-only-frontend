/* eslint-disable @typescript-eslint/no-invalid-void-type */
// This eslint rule has been disabled because void type is used
// for no arguments in RTK Query.

import {
  ApiResponseSuccess,
  ErrorCodes,
  LoginRequestDto,
  LoginResponseDto,
  LoginResponseSchema,
  RefreshResponseDto,
  RefreshResponseSchema,
  RegisterRequestDto,
  RegisterResponseDto,
  RegisterResponseSchema,
  SessionIdParamsDto,
  UserSessionsResponseDto,
  UserSessionsResponseSchema,
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
import convertToFormData from "@/utils/convertToFormData";
import { logger } from "@/utils/logger";
import { RootState } from "../store";
import { serverErrorQuery, sessionExpiredQuery } from "@/lib/constants";
import { isApiErrorPayload } from "@/utils/errorUtils";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Register Endpoint
    registerUser: builder.mutation<AuthState, RegisterRequestDto>({
      query: (body: RegisterRequestDto) => ({
        url: "/auth/register",
        method: HttpMethod.POST,
        body: convertToFormData<RegisterRequestDto>(body) satisfies
          | RegisterRequestDto
          | FormData,
        credentials: "include",
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
        credentials: "include",
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
        credentials: "include",
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
    tokenRefresh: builder.mutation<RefreshResponseDto, void>({
      query: () => ({
        url: "/auth/refresh",
        method: HttpMethod.POST,
        credentials: "include",
      }),
      transformResponse: (result: ApiResponseSuccess<RefreshResponseDto>) => {
        // Validate the response against schema.
        const parsedResult = RefreshResponseSchema.safeParse(result.payload);

        // Throw error if validation fails.
        if (!parsedResult.success) {
          throw new ValidationError(
            parsedResult.error.message,
            parsedResult.error.flatten()
          );
        }

        // Return the response payload conforming to the DTO.
        return result.payload;
      },
      onQueryStarted: async (_queryArgument, mutationLifeCycleApi) => {
        try {
          // Wait for the query to be fulfilled.
          const { data } = await mutationLifeCycleApi.queryFulfilled;

          // Log the response success event.
          logger.info(
            {
              user: (mutationLifeCycleApi.getState() as RootState).auth.user
                ?.username,
            },
            "The tokens have been refreshed successfully."
          );

          // Dispatch action to update the access token in auth state.
          mutationLifeCycleApi.dispatch(
            setCredentials({
              accessToken: data.accessToken,
              authStatus: true,
              user: {
                ...data,
              },
            })
          );

          // Set user in Sentry.
          Sentry.setUser({
            id: (mutationLifeCycleApi.getState() as RootState).auth.user?.id,
            username: (mutationLifeCycleApi.getState() as RootState).auth.user
              ?.username,
          });
        } catch (error: unknown) {
          // Log the error.
          logger.error({ error }, "Unexpected error during token refresh.");

          // Capture the error in Sentry.
          Sentry.captureException(error, {
            extra: {
              endpoint: "tokenRefresh",
            },
            tags: {
              errorType: "MANUAL_REFRESH",
            },
            user: {
              id: (mutationLifeCycleApi.getState() as RootState).auth.user?.id,
              username: (mutationLifeCycleApi.getState() as RootState).auth.user
                ?.username,
            },
          });

          // ONLY LOGOUT FOR UNAUTHORIZED ERRORS
          if (
            isApiErrorPayload(error) &&
            error.statusCode === 401 &&
            error.code !== ErrorCodes.INCORRECT_PASSWORD
          ) {
            // Reset RTK Query cache.
            mutationLifeCycleApi.dispatch(apiSlice.util.resetApiState());
            // Dispatch action to clear auth state.
            mutationLifeCycleApi.dispatch(clearCredentials());
            // Remove user from Sentry.
            Sentry.setUser(null);

            logger.warn(
              "Token refresh failed. Redirecting to login page with reason query param to indicate session expiry."
            );
            // Redirect to login page with reason set to session expiry.
            // The reason will be used to display toast notification.
            window.location.replace(`/login?reason=${sessionExpiredQuery}`);
          } else {
            logger.warn(
              "Token refresh failed with non-auth error. Redirecting to error page with reason query param to indicate server error."
            );

            // Redirect to error page with reason set to server error.
            // The reason will be used to set error page message.
            // The logic is placed inside if statement to prevent
            // multiple re-renders.
            if (
              window.location.pathname !== "/error" &&
              window.location.pathname !== `/error?reason=${serverErrorQuery}`
            ) {
              window.location.replace(`/error?reason=${serverErrorQuery}`);
            }
          }
        }
      },
    }),
    getSessions: builder.query<UserSessionsResponseDto, void>({
      query: () => ({
        url: "/auth/sessions",
        method: HttpMethod.GET,
        credentials: "include",
      }),
      transformResponse: (
        result: ApiResponseSuccess<UserSessionsResponseDto>
      ) => {
        // Validate the result against schema.
        const parsedResult = UserSessionsResponseSchema.safeParse(
          result.payload
        );

        // Throw error if validation fails.
        if (!parsedResult.success) {
          throw new ValidationError(
            parsedResult.error.message,
            parsedResult.error.flatten()
          );
        }

        // Log the response success event.
        logger.info("Fetched user sessions successfully.");

        // Return the response payload conforming to the DTO.
        return parsedResult.data;
      },
      providesTags: ["Sessions"],
    }),
    revokeSession: builder.mutation<void, SessionIdParamsDto>({
      query: (queryArg: SessionIdParamsDto) => ({
        url: `/auth/sessions/${queryArg.sessionId}`,
        method: HttpMethod.DELETE,
        credentials: "include",
      }),
      invalidatesTags: ["Sessions"],
    }),
    revokeAllSessions: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/sessions",
        method: HttpMethod.DELETE,
        credentials: "include",
      }),
      invalidatesTags: ["Sessions"],
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useTokenRefreshMutation,
  useGetSessionsQuery,
  useRevokeSessionMutation,
  useRevokeAllSessionsMutation,
} = authApiSlice;
