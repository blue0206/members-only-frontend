/* eslint-disable @typescript-eslint/no-invalid-void-type */
// This eslint rule has been disabled because void type is used
// for no arguments in RTK Query.

import {
  CreateMessageRequestDto,
  CreateMessageResponseDto,
  CreateMessageResponseSchema,
  EditMessageResponseDto,
  EditMessageResponseSchema,
  GetMessagesResponseDto,
  GetMessagesResponseSchema,
  GetMessagesWithoutAuthorResponseDto,
  GetMessagesWithoutAuthorResponseSchema,
  MessageParamsDto,
} from "@blue0206/members-only-shared-types/dtos/message.dto";
import { ApiResponseSuccess } from "@blue0206/members-only-shared-types/api/base";
import { Role } from "@blue0206/members-only-shared-types/enums/roles.enum";
import { apiSlice } from "./api";
import { HttpMethod } from "@/types";
import { ValidationError } from "@/utils/error";
import { logger } from "@/utils/logger";
import { EditMessageEndpointQueryType } from "@/types/";
import { RootState } from "../store";

export const messageApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMessagesWithoutAuthor: builder.query<
      GetMessagesWithoutAuthorResponseDto,
      void
    >({
      query: () => ({
        url: "/messages/public",
        method: HttpMethod.GET,
      }),
      transformResponse: (
        result: ApiResponseSuccess<GetMessagesWithoutAuthorResponseDto>
      ) => {
        // Validate the result against schema.
        const parsedResult = GetMessagesWithoutAuthorResponseSchema.safeParse(
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
        logger.info(
          { messages: parsedResult.data },
          "Fetched messages without author."
        );

        // Return the response payload conforming to the DTO.
        return parsedResult.data;
      },
      providesTags: ["Messages"],
    }),
    getMessagesWithAuthor: builder.query<GetMessagesResponseDto, void>({
      query: () => ({
        url: "/messages",
        method: HttpMethod.GET,
      }),
      transformResponse: (
        result: ApiResponseSuccess<GetMessagesResponseDto>
      ) => {
        // Validate the result against schema.
        const parsedResult = GetMessagesResponseSchema.safeParse(
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
        logger.info(
          { messages: parsedResult.data },
          "Fetched messages with author."
        );

        // Return the response payload conforming to the DTO.
        return parsedResult.data;
      },
      providesTags: ["Messages"],
    }),
    createMessage: builder.mutation<
      CreateMessageResponseDto,
      CreateMessageRequestDto
    >({
      query: (body: CreateMessageRequestDto) => ({
        url: "/messages",
        method: HttpMethod.POST,
        body,
        credentials: "include",
      }),
      transformResponse: (
        result: ApiResponseSuccess<CreateMessageResponseDto>
      ) => {
        // Validate the result against schema.
        const parsedResult = CreateMessageResponseSchema.safeParse(
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
        //--------------------REALISTIC UPDATE--------------------------

        // Wait for the query to be fulfilled.
        const { data } = await mutationLifeCycleApi.queryFulfilled;

        // Log the success event and author from auth state.
        logger.info(
          {
            user: (mutationLifeCycleApi.getState() as RootState).auth.user
              ?.username,
            message: data,
          },
          "Created message."
        );

        // Check whether message has edited flag and conditionally
        // dispatch action to update messages with/without author.
        if ("edited" in data) {
          mutationLifeCycleApi.dispatch(
            messageApiSlice.util.updateQueryData(
              "getMessagesWithAuthor",
              undefined,
              (draft) => {
                // Append the data to cached list of messages.
                if (Array.isArray(draft)) draft.push(data);
              }
            )
          );
        } else {
          mutationLifeCycleApi.dispatch(
            messageApiSlice.util.updateQueryData(
              "getMessagesWithoutAuthor",
              undefined,
              (draft) => {
                // Append the data to cached list of messages.
                if (Array.isArray(draft)) draft.push(data);
                return draft;
              }
            )
          );
        }
      },
      // We still invalidate tag so that even though the user is given realistic
      // update, we do refresh the cache with updated data.
      invalidatesTags: ["Messages"],
    }),
    editMessage: builder.mutation<
      EditMessageResponseDto,
      EditMessageEndpointQueryType
    >({
      query: ({ messageBody, messageId }: EditMessageEndpointQueryType) => ({
        url: `/messages/${messageId.toString()}`,
        method: HttpMethod.PATCH,
        body: messageBody,
        credentials: "include",
      }),
      transformResponse: (
        result: ApiResponseSuccess<EditMessageResponseDto>
      ) => {
        // Validate the result against schema.
        const parsedResult = EditMessageResponseSchema.safeParse(
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
      onQueryStarted: async (queryArgument, mutationLifeCycleApi) => {
        //--------------------OPTIMISTIC UPDATE--------------------------

        // First we check user role to ascertain which endpoint to update (with/without author).
        const userRole = (mutationLifeCycleApi.getState() as RootState).auth
          .user?.role;
        const isMember = userRole === Role.MEMBER || userRole === Role.ADMIN;

        // We perform the optimistic update.
        const patchResult = mutationLifeCycleApi.dispatch(
          messageApiSlice.util.updateQueryData(
            isMember ? "getMessagesWithAuthor" : "getMessagesWithoutAuthor",
            undefined,
            (draft) => {
              logger.debug(
                "Running updateQueryData for optimistic update of editMessage endpoint"
              );

              if (Array.isArray(draft)) {
                // Check if cache entry has the message being edited.
                const messageIndex = draft.findIndex(
                  (draftMessage) =>
                    draftMessage.messageId === queryArgument.messageId
                );

                if (messageIndex === -1) {
                  // Warn if message not found in cache.
                  logger.warn(
                    `Message with id ${queryArgument.messageId.toString()} not found in cache.`
                  );
                } else {
                  // Update the message using the index.
                  draft[messageIndex].message =
                    queryArgument.messageBody.newMessage;
                  if ("edited" in draft[messageIndex]) {
                    draft[messageIndex].edited = true;
                  }

                  // Log event.
                  logger.info("Optimistically updated the message in cache.");
                }
              } else {
                // Log if cache entry is not an array.
                logger.debug(
                  "Cache entry for messages not found or not an array."
                );
              }
            }
          )
        );

        // Next, we wait for query to fulfill and if there are any errors
        // we roll back the optimistic update.
        try {
          const { data } = await mutationLifeCycleApi.queryFulfilled;

          // Log the success event and author from auth state.
          logger.info(
            {
              user: (mutationLifeCycleApi.getState() as RootState).auth.user
                ?.username,
              role: (mutationLifeCycleApi.getState() as RootState).auth.user
                ?.role,
              message: data,
            },
            "Optimistic update successful, message updated."
          );
        } catch (error) {
          // Query failed, we log the error and roll back.
          logger.error({ error }, "Optimistic update failed, rolling back...");
          patchResult.undo();
        }
      },
      invalidatesTags: ["Messages", "Bookmarks"],
    }),
    deleteMessage: builder.mutation<void, MessageParamsDto["messageId"]>({
      query: (messageId: MessageParamsDto["messageId"]) => ({
        url: `/messages/${messageId.toString()}`,
        method: HttpMethod.DELETE,
        credentials: "include",
      }),
      onQueryStarted: async (queryArgument, mutationLifeCycleApi) => {
        //-----------------------------OPTIMISTIC UPDATE---------------------------

        // First we check user role to ascertain which endpoint to update (with/without author).
        const userRole = (mutationLifeCycleApi.getState() as RootState).auth
          .user?.role;
        const isMember = userRole === Role.MEMBER || userRole === Role.ADMIN;

        // We perform the optimistic delete.
        const patchResult = mutationLifeCycleApi.dispatch(
          messageApiSlice.util.updateQueryData(
            isMember ? "getMessagesWithAuthor" : "getMessagesWithoutAuthor",
            undefined,
            (draft) => {
              logger.debug(
                "Running updateQueryData for optimistic delete of deleteMessage endpoint"
              );

              if (Array.isArray(draft)) {
                // Check if cache entry has the message being deleted.
                const messageIndex = draft.findIndex(
                  (draftMessage) => draftMessage.messageId === queryArgument
                );

                if (messageIndex === -1) {
                  // Warn if message not found in cache.
                  logger.warn(
                    `Message with id ${queryArgument.toString()} not found in cache.`
                  );
                } else {
                  // Delete the message using the index.
                  draft.splice(messageIndex, 1);

                  // Log event.
                  logger.info("Optimistically deleted the message in cache.");
                }
              } else {
                // Log if cache entry is not an array.
                logger.debug(
                  "Cache entry for messages not found or not an array."
                );
              }
            }
          )
        );

        // Next, we wait for query to fulfill and if there are any errors
        // we roll back the optimistic delete.
        try {
          await mutationLifeCycleApi.queryFulfilled;

          // Log the success event and author from auth state.
          logger.info(
            {
              user: (mutationLifeCycleApi.getState() as RootState).auth.user
                ?.username,
              role: (mutationLifeCycleApi.getState() as RootState).auth.user
                ?.role,
              messageId: queryArgument,
            },
            "Optimistic update successful, message deleted."
          );
        } catch (error) {
          // Query failed, we log the error and roll back.
          logger.error({ error }, "Optimistic delete failed, rolling back...");
          patchResult.undo();
        }
      },
      invalidatesTags: ["Messages", "Bookmarks"],
    }),
    likeMessage: builder.mutation<null, MessageParamsDto["messageId"]>({
      query: (messageId: MessageParamsDto["messageId"]) => ({
        url: `/messages/${messageId.toString()}/like`,
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
                "Running updateQueryData for optimistic update of likeMessage endpoint"
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
                  draft[messageIndex].likes += 1;

                  if ("liked" in draft[messageIndex]) {
                    draft[messageIndex].liked = true;
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
            "Optimistic update successful, message liked."
          );
        } catch (error) {
          logger.error({ error }, "Optimistic update failed, rolling back...");
          patchResult.undo();
        }
      },
      invalidatesTags: ["Messages", "Bookmarks"],
    }),
    unlikeMessage: builder.mutation<void, MessageParamsDto["messageId"]>({
      query: (messageId: MessageParamsDto["messageId"]) => ({
        url: `/messages/${messageId.toString()}/like`,
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
                "Running updateQueryData for optimistic update of unlikeMessage endpoint"
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
                  draft[messageIndex].likes = Math.max(
                    0,
                    draft[messageIndex].likes - 1
                  );

                  if ("liked" in draft[messageIndex]) {
                    draft[messageIndex].liked = false;
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
            "Optimistic update successful, message unliked."
          );
        } catch (error) {
          logger.error({ error }, "Optimistic update failed, rolling back...");
          patchResult.undo();
        }
      },
      invalidatesTags: ["Messages", "Bookmarks"],
    }),
    healthCheck: builder.query<string, void>({
      query: () => ({
        url: "/messages/healthcheck",
        method: HttpMethod.GET,
      }),
    }),
  }),
});

export const {
  useGetMessagesWithoutAuthorQuery,
  useGetMessagesWithAuthorQuery,
  useCreateMessageMutation,
  useEditMessageMutation,
  useDeleteMessageMutation,
  useLikeMessageMutation,
  useUnlikeMessageMutation,
  useHealthCheckQuery,
} = messageApiSlice;
