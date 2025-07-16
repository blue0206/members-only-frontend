/* eslint-disable @typescript-eslint/no-invalid-void-type */
// This eslint rule has been disabled because void type is used
// for no arguments in RTK Query.

import {
  EditUserRequestDto,
  EditUserResponseDto,
  EditUserResponseSchema,
  GetUserBookmarksResponseDto,
  GetUserBookmarksResponseSchema,
  GetUsersResponseSchema,
  GetUsersResponseDto,
  MemberRoleUpdateRequestDto,
  ResetPasswordRequestDto,
  UploadAvatarResponseDto,
  UploadAvatarResponseSchema,
} from "@blue0206/members-only-shared-types/dtos/user.dto";
import { ApiResponseSuccess } from "@blue0206/members-only-shared-types/api/base";
import { Role } from "@blue0206/members-only-shared-types/enums/roles.enum";
import { apiSlice } from "./api";
import { HttpMethod } from "@/types";
import { ValidationError } from "@/utils/error";
import { logger } from "@/utils/logger";
import convertToFormData, {
  UploadAvatarRequestDto,
} from "@/utils/convertToFormData";
import {
  clearCredentials,
  setUserAvatar,
  updateUserDetails,
} from "@/features/auth/authSlice";
import * as Sentry from "@sentry/react";
import { authApiSlice } from "./authApi";
import {
  DeleteUserEndpointQueryType,
  SetRoleEndpointQueryType,
} from "@/types/";
import { RootState } from "../store";
import { messageApiSlice } from "./messageApi";
import {
  accountDeletedQuery,
  unauthorizedRedirectionQuery,
} from "@/lib/constants";
import { addNotification } from "@/features/notification/notificationSlice";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<GetUsersResponseDto, void>({
      query: () => ({
        url: "/users",
        method: HttpMethod.GET,
      }),
      transformResponse: (result: ApiResponseSuccess<GetUsersResponseDto>) => {
        // Validate the result against schema.
        const parsedResult = GetUsersResponseSchema.safeParse(result.payload);

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
      providesTags: ["Users"],
    }),
    editUserDetails: builder.mutation<EditUserResponseDto, EditUserRequestDto>({
      query: (body: EditUserRequestDto) => ({
        url: "/users",
        method: HttpMethod.PATCH,
        body,
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

        // Reset user in Sentry.
        Sentry.setUser({
          id: data.id,
          username: data.username,
        });

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
        // and perform necessary actions (which are handled in useQueryParamsSideEffects hook).
        if (!queryArgument.username) {
          mutationLifeCycleApi.dispatch(clearCredentials());
          mutationLifeCycleApi.dispatch(apiSlice.util.resetApiState());
          Sentry.setUser(null);
          window.location.replace(`/?reason=${accountDeletedQuery}`);
        } else {
          // Only invalidate tags if user is not deleting their account.
          mutationLifeCycleApi.dispatch(
            apiSlice.util.invalidateTags(["Users", "Bookmarks", "Messages"])
          );
        }
      },
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

        try {
          await mutationLifeCycleApi.dispatch(
            authApiSlice.endpoints.tokenRefresh.initiate()
          );
          mutationLifeCycleApi.dispatch(
            addNotification({
              type: "success",
              message: "Congratulations! You are now a member.",
            })
          );
        } catch (error: unknown) {
          logger.error(
            error,
            "Error refreshing token after member role update."
          );
          // In case of refresh failure, we log out the user
          // and prompt them to log in again to ensure
          // the page doesn't crash and the user gets
          // a fresh session with no stale data.
          mutationLifeCycleApi.dispatch(clearCredentials());
          mutationLifeCycleApi.dispatch(apiSlice.util.resetApiState());
          Sentry.setUser(null);
          window.location.replace(
            `/login?reason=${unauthorizedRedirectionQuery}`
          );
        }
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
      invalidatesTags: ["Messages", "Bookmarks", "Users"],
    }),
    uploadAvatar: builder.mutation<
      UploadAvatarResponseDto,
      UploadAvatarRequestDto
    >({
      query: (body: UploadAvatarRequestDto) => ({
        url: "/users/avatar",
        method: HttpMethod.PATCH,
        body: convertToFormData<UploadAvatarRequestDto>(body) satisfies
          | UploadAvatarRequestDto
          | FormData,
        credentials: "include",
      }),
      transformResponse: (
        result: ApiResponseSuccess<UploadAvatarResponseDto>
      ) => {
        // Validate the response against schema.
        const parsedResult = UploadAvatarResponseSchema.safeParse(
          result.payload
        );

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
        // Wait for the query to be fulfilled.
        const { data } = await mutationLifeCycleApi.queryFulfilled;

        // Log the response success event.
        logger.info(
          { newAvatar: data.avatar },
          "Uploaded user avatar successfully."
        );

        // Dispatch action to update auth state.
        mutationLifeCycleApi.dispatch(setUserAvatar(data.avatar));
      },
      invalidatesTags: ["Users", "Messages", "Bookmarks"],
    }),
    deleteAvatar: builder.mutation<void, void>({
      query: () => ({
        url: "/users/avatar",
        method: HttpMethod.DELETE,
        credentials: "include",
      }),
      onQueryStarted: async (_queryArgument, mutationLifeCycleApi) => {
        // Update user state on successful delete.
        await mutationLifeCycleApi.queryFulfilled;
        mutationLifeCycleApi.dispatch(setUserAvatar(null));
      },
      invalidatesTags: ["Messages", "Bookmarks", "Users"],
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
    addBookmark: builder.mutation<null, number>({
      query: (messageId: number) => ({
        url: `/users/bookmarks/${messageId.toString()}`,
        method: HttpMethod.POST,
        credentials: "include",
      }),
      transformResponse: (result: ApiResponseSuccess<null>) => {
        return result.payload;
      },
      onQueryStarted: async (queryArgument, mutationLifeCycleApi) => {
        //-----------------------------OPTIMISTIC UPDATE---------------------------

        // First we check user role to ascertain which endpoint to update (with/without author).
        const userRole = (mutationLifeCycleApi.getState() as RootState).auth
          .user?.role;
        const isMember = userRole === Role.MEMBER || userRole === Role.ADMIN;

        const patchResult = mutationLifeCycleApi.dispatch(
          messageApiSlice.util.updateQueryData(
            isMember ? "getMessagesWithAuthor" : "getMessagesWithoutAuthor",
            undefined,
            (draft) => {
              logger.debug(
                "Running updateQueryData for optimistic update of addBookmark endpoint"
              );

              if (Array.isArray(draft)) {
                const messageIndex = draft.findIndex(
                  (draftMessage) => draftMessage.messageId === queryArgument
                );

                if (messageIndex === -1) {
                  logger.warn(
                    `Message with id ${queryArgument.toString()} not found in cache.`
                  );
                } else {
                  draft[messageIndex].bookmarks += 1;

                  if ("bookmarked" in draft[messageIndex]) {
                    draft[messageIndex].bookmarked = true;
                  }

                  logger.info("Optimistically updated the message in cache.");
                }
              } else {
                logger.debug(
                  "Cache entry for messages not found or not an array."
                );
              }
            }
          )
        );

        try {
          await mutationLifeCycleApi.queryFulfilled;

          logger.info(
            {
              user: (mutationLifeCycleApi.getState() as RootState).auth.user
                ?.username,
              role: (mutationLifeCycleApi.getState() as RootState).auth.user
                ?.role,
            },
            "Optimistic update successful, message bookmarked."
          );
        } catch (error) {
          logger.error({ error }, "Optimistic update failed, rolling back...");
          patchResult.undo();
        }
      },
      invalidatesTags: ["Messages", "Bookmarks"],
    }),
    removeBookmark: builder.mutation<void, number>({
      query: (messageId: number) => ({
        url: `/users/bookmarks/${messageId.toString()}`,
        method: HttpMethod.DELETE,
        credentials: "include",
      }),
      onQueryStarted: async (queryArgument, mutationLifeCycleApi) => {
        //-----------------------------OPTIMISTIC UPDATE---------------------------

        // First we check user role to ascertain which endpoint to update (with/without author).
        const userRole = (mutationLifeCycleApi.getState() as RootState).auth
          .user?.role;
        const isMember = userRole === Role.MEMBER || userRole === Role.ADMIN;

        const patchResult = mutationLifeCycleApi.dispatch(
          messageApiSlice.util.updateQueryData(
            isMember ? "getMessagesWithAuthor" : "getMessagesWithoutAuthor",
            undefined,
            (draft) => {
              logger.debug(
                "Running updateQueryData for optimistic update of removeBookmark endpoint"
              );

              if (Array.isArray(draft)) {
                const messageIndex = draft.findIndex(
                  (draftMessage) => draftMessage.messageId === queryArgument
                );

                if (messageIndex === -1) {
                  logger.warn(
                    `Message with id ${queryArgument.toString()} not found in cache.`
                  );
                } else {
                  draft[messageIndex].bookmarks = Math.max(
                    0,
                    draft[messageIndex].bookmarks - 1
                  );

                  if ("bookmarked" in draft[messageIndex]) {
                    draft[messageIndex].bookmarked = false;
                  }

                  logger.info("Optimistically updated the message in cache.");
                }
              } else {
                logger.debug(
                  "Cache entry for messages not found or not an array."
                );
              }
            }
          )
        );

        try {
          await mutationLifeCycleApi.queryFulfilled;

          logger.info(
            {
              user: (mutationLifeCycleApi.getState() as RootState).auth.user
                ?.username,
              role: (mutationLifeCycleApi.getState() as RootState).auth.user
                ?.role,
            },
            "Optimistic update successful, message has been removed from bookmarks."
          );
        } catch (error) {
          logger.error({ error }, "Optimistic update failed, rolling back...");
          patchResult.undo();
        }
      },
      invalidatesTags: ["Messages", "Bookmarks"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useEditUserDetailsMutation,
  useDeleteUserMutation,
  useResetPasswordMutation,
  useMemberRoleUpdateMutation,
  useSetRoleMutation,
  useDeleteAvatarMutation,
  useGetBookmarksQuery,
  useAddBookmarkMutation,
  useRemoveBookmarkMutation,
  useUploadAvatarMutation,
} = userApiSlice;
