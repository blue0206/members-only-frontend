/* eslint-disable @typescript-eslint/no-invalid-void-type */
// This eslint rule has been disabled because void type is used
// for no arguments in RTK Query.

import {
  ApiResponseSuccess,
  EditUserRequestDto,
  EditUserResponseDto,
  EditUserResponseSchema,
  GetUserMessagesResponseDto,
  GetUserMessagesResponseSchema,
} from "@blue0206/members-only-shared-types";
import { apiSlice } from "./api";
import { HttpMethod } from "@/types";
import { ValidationError } from "@/utils/error";
import { logger } from "@/utils/logger";
import convertToFormData from "@/utils/convertToFormData";
import { clearCredentials, updateUserDetails } from "@/features/auth/authSlice";
import * as Sentry from "@sentry/react";
import { authApiSlice } from "./authApi";
import { DeleteUserEndpointQueryType } from "@/types/api.types";
import { RootState } from "../store";
import { toast } from "sonner";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserMessages: builder.query<GetUserMessagesResponseDto, void>({
      query: () => ({
        url: "/users/messages",
        method: HttpMethod.GET,
      }),
      transformResponse: (
        result: ApiResponseSuccess<GetUserMessagesResponseDto>
      ) => {
        // Validate the result against schema.
        const parsedResult = GetUserMessagesResponseSchema.safeParse(
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
        logger.info("Fetched user messages successfully.");

        // Return the response payload conforming to the DTO.
        return parsedResult.data;
      },
    }),
    editUserDetails: builder.mutation<EditUserResponseDto, EditUserRequestDto>({
      query: (body: EditUserRequestDto) => ({
        url: "/users",
        method: HttpMethod.PATCH,
        body: convertToFormData<EditUserRequestDto>(body) satisfies
          | EditUserRequestDto
          | FormData,
        credentials: "include",
      }),
      transformResponse: (result: ApiResponseSuccess<EditUserResponseDto>) => {
        // Validate the response against schema.
        const parsedResult = EditUserResponseSchema.safeParse(result.payload);

        // Throw error if validation fails.
        if (!parsedResult.success) {
          throw new ValidationError(
            parsedResult.error.message,
            parsedResult.error.flatten()
          );
        }

        // Return the response payload conforming to the DTO.
        return parsedResult.data;
      },
      onQueryStarted: async (_queryArgument, mutationLifeCycleApi) => {
        // Remove user from Sentry since username might be updated.
        Sentry.setUser(null);

        // Wait for the query to be fulfilled.
        const { data } = await mutationLifeCycleApi.queryFulfilled;

        // Log the response success event.
        logger.info({ user: data }, "Updated user details successfully.");

        // Dispatch action to update auth state.
        mutationLifeCycleApi.dispatch(updateUserDetails(data));

        // Refresh user tokens so that the tokens have updated details in payload.
        await mutationLifeCycleApi.dispatch(
          authApiSlice.endpoints.tokenRefresh.initiate()
        );
      },
    }),
    // This endpoint serves either of the two use cases:
    // 1. User deleting their own account.
    // 2. ADMIN deleting another user's account.
    // If the username is provided, it means Case-2 else, it is Case-1
    deleteUser: builder.mutation<void, DeleteUserEndpointQueryType>({
      query: ({ username }: DeleteUserEndpointQueryType) => ({
        url: username ? `/users/${username}` : "/users",
        method: HttpMethod.DELETE,
        credentials: "include",
      }),
      onQueryStarted: async (queryArgument, mutationLifeCycleApi) => {
        // Wait for the query to be fulfilled.
        await mutationLifeCycleApi.queryFulfilled;

        // Log the response success event.
        logger.info(
          {
            user: (mutationLifeCycleApi.getState() as RootState).auth.user
              ?.username,
            role: (mutationLifeCycleApi.getState() as RootState).auth.user
              ?.role,
            userDeleted: queryArgument.username,
          },
          "User deleted."
        );

        // If user has deleted their own account (Case-1), clear auth state
        // and perform necessary actions.
        if (!queryArgument.username) {
          // Clear credentials.
          mutationLifeCycleApi.dispatch(clearCredentials());
          // Reset RTK Query cache.
          mutationLifeCycleApi.dispatch(apiSlice.util.resetApiState());
          // Remove user from Sentry.
          Sentry.setUser(null);
          // Navigate to login page.
          window.location.replace("/login");
        } else {
          // Notify ADMIN that the user has been deleted successfully.
          toast.success("The user was deleted successfully.");
        }
      },
    }),
  }),
});

export const {
  useGetUserMessagesQuery,
  useEditUserDetailsMutation,
  useDeleteUserMutation,
} = userApiSlice;
