/* eslint-disable @typescript-eslint/no-invalid-void-type */
// This eslint rule has been disabled because void type is used
// for no arguments in RTK Query.

import {
  ApiResponseSuccess,
  CreateMessageRequestDto,
  CreateMessageResponseDto,
  CreateMessageResponseSchema,
  EditMessageResponseDto,
  EditMessageResponseSchema,
  GetMessagesResponseDto,
  GetMessagesResponseSchema,
  GetMessagesWithoutAuthorResponseDto,
  GetMessagesWithoutAuthorResponseSchema,
  Role,
} from "@blue0206/members-only-shared-types";
import { apiSlice } from "./api";
import { HttpMethod } from "@/types";
import { ValidationError } from "@/utils/error";
import { logger } from "@/utils/logger";
import { EditMessageEndpointQueryType } from "@/types/api.types";
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
        response: ApiResponseSuccess<GetMessagesWithoutAuthorResponseDto>
      ) => {
        // Validate the response against schema.
        const parsedResult = GetMessagesWithoutAuthorResponseSchema.safeParse(
          response.payload
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
        response: ApiResponseSuccess<GetMessagesResponseDto>
      ) => {
        // Validate the response against schema.
        const parsedResult = GetMessagesResponseSchema.safeParse(
          response.payload
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
      }),
      transformResponse: (
        response: ApiResponseSuccess<CreateMessageResponseDto>
      ) => {
        // Validate the response against schema.
        const parsedResult = CreateMessageResponseSchema.safeParse(
          response.payload
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
      query: ({ newMessage, messageId }: EditMessageEndpointQueryType) => ({
        url: `/messages/${messageId.toString()}`,
        method: HttpMethod.PATCH,
        body: newMessage,
      }),
      transformResponse: (Response: EditMessageResponseDto) => {
        // Validate the response against schema.
        const parsedResult = EditMessageResponseSchema.safeParse(Response);

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
                  draft[messageIndex].message = queryArgument.newMessage;

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
          await mutationLifeCycleApi.queryFulfilled;

          logger.debug("Optimistic update successful, message updated.");
        } catch (error) {
          // Query failed, we log the error and roll back.
          logger.error({ error }, "Optimistic update failed, rolling back...");
          patchResult.undo();
        }
      },
      invalidatesTags: ["Messages"],
    }),
  }),
});

export const {
  useGetMessagesWithoutAuthorQuery,
  useGetMessagesWithAuthorQuery,
  useCreateMessageMutation,
} = messageApiSlice;
