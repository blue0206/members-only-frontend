/* eslint-disable @typescript-eslint/no-invalid-void-type */
// This eslint rule has been disabled because void type is used
// for no arguments in RTK Query.

import {
  ApiResponseSuccess,
  EditUserRequestDto,
  EditUserResponseDto,
  EditUserResponseSchema,
  GetUserBookmarksResponseDto,
  GetUserBookmarksResponseSchema,
  GetUserMessagesResponseDto,
  GetUserMessagesResponseSchema,
  MemberRoleUpdateRequestDto,
  ResetPasswordRequestDto,
  Role,
} from "@blue0206/members-only-shared-types";
import { apiSlice } from "./api";
import { HttpMethod } from "@/types";
import { ValidationError } from "@/utils/error";
import { logger } from "@/utils/logger";
import convertToFormData from "@/utils/convertToFormData";
import {
  clearCredentials,
  setUserAvatar,
  updateUserDetails,
  updateUserRole,
} from "@/features/auth/authSlice";
import * as Sentry from "@sentry/react";
import { authApiSlice } from "./authApi";
import {
  DeleteUserEndpointQueryType,
  SetRoleEndpointQueryType,
} from "@/types/api.types";
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
      providesTags: ["Messages"],
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
      invalidatesTags: ["Messages", "Bookmarks"],
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
      invalidatesTags: ["Messages", "Bookmarks"],
    }),
    resetPassword: builder.mutation<void, ResetPasswordRequestDto>({
      query: (body: ResetPasswordRequestDto) => ({
        url: "/users/reset-password",
        method: HttpMethod.PATCH,
        body,
        credentials: "include",
      }),
    }),
    memberRoleUpdate: builder.mutation<void, MemberRoleUpdateRequestDto>({
      query: (body: MemberRoleUpdateRequestDto) => ({
        url: "/users/role",
        method: HttpMethod.PATCH,
        body,
        credentials: "include",
      }),
      onQueryStarted: async (_queryArgument, mutationLifeCycleApi) => {
        // Wait for the query to be fulfilled.
        await mutationLifeCycleApi.queryFulfilled;

        // Log the response success event.
        logger.info(
          `The user ${
            (mutationLifeCycleApi.getState() as RootState).auth.user
              ?.username ?? ""
          } is now a member.`
        );

        // Update user role in auth state.
        mutationLifeCycleApi.dispatch(updateUserRole(Role.MEMBER));

        // Refresh user tokens so that the tokens have updated details in payload.
        await mutationLifeCycleApi.dispatch(
          authApiSlice.endpoints.tokenRefresh.initiate()
        );
      },
      // Invalidate messages endpoint to fetch the new list with author names instead.
      invalidatesTags: ["Messages", "Bookmarks"],
    }),
    setRole: builder.mutation<void, SetRoleEndpointQueryType>({
      query: (queryArg: SetRoleEndpointQueryType) => ({
        url: `/users/role/${queryArg.username}/?role=${queryArg.role}`,
        method: HttpMethod.PATCH,
        credentials: "include",
      }),
      invalidatesTags: ["Messages", "Bookmarks"],
    }),
    deleteAvatar: builder.mutation<void, void>({
      query: () => ({
        url: "/users/avatar",
        method: HttpMethod.DELETE,
        credentials: "include",
      }),
      onQueryStarted: async (_queryArgument, mutationLifeCycleApi) => {
        //------------------------------OPTIMISTIC UPDATE--------------------------------

        // We perform the optimistic update to auth slice.
        const deletedAvatar = (mutationLifeCycleApi.getState() as RootState)
          .auth.user?.avatar;
        mutationLifeCycleApi.dispatch(setUserAvatar(null));

        // Next, we wait for query to fulfill and if there are any errors
        // we roll back the optimistic update.
        try {
          await mutationLifeCycleApi.queryFulfilled;
        } catch (error) {
          logger.error({ error }, "Error deleting user avatar.");

          // Roll back the optimistic update.
          mutationLifeCycleApi.dispatch(setUserAvatar(deletedAvatar));
        }
      },
      invalidatesTags: ["Messages", "Bookmarks"],
    }),
    getBookmarks: builder.query<GetUserBookmarksResponseDto, void>({
      query: () => ({
        url: "/users/bookmarks",
        method: HttpMethod.GET,
      }),
      transformResponse: (
        result: ApiResponseSuccess<GetUserBookmarksResponseDto>
      ) => {
        const parsedResult = GetUserBookmarksResponseSchema.safeParse(
          result.payload
        );

        if (!parsedResult.success) {
          throw new ValidationError(
            parsedResult.error.message,
            parsedResult.error.flatten()
          );
        }

        logger.info("Fetched user bookmarks successfully.");

        return parsedResult.data;
      },
      providesTags: ["Bookmarks"],
    }),
  }),
});

export const {
  useGetUserMessagesQuery,
  useEditUserDetailsMutation,
  useDeleteUserMutation,
  useResetPasswordMutation,
  useMemberRoleUpdateMutation,
  useSetRoleMutation,
  useDeleteAvatarMutation,
  useGetBookmarksQuery,
} = userApiSlice;
