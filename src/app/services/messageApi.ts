/* eslint-disable @typescript-eslint/no-invalid-void-type */
// This eslint rule has been disabled because void type is used
// for no arguments in RTK Query.

import {
  ApiResponseSuccess,
  CreateMessageRequestDto,
  CreateMessageResponseDto,
  CreateMessageResponseSchema,
  GetMessagesResponseDto,
  GetMessagesResponseSchema,
  GetMessagesWithoutAuthorResponseDto,
  GetMessagesWithoutAuthorResponseSchema,
} from "@blue0206/members-only-shared-types";
import { apiSlice } from "./api";
import { HttpMethod } from "@/types";
import { ValidationError } from "@/utils/error";
import { logger } from "@/utils/logger";

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

        // Log the response success event and author from auth state.
        logger.info({ message: parsedResult.data }, "Created message.");

        // Return the response payload conforming to the DTO.
        return parsedResult.data;
      },
      onQueryStarted: async (_queryArgument, mutationLifeCycleApi) => {
        //--------------------REALISTIC UPDATE--------------------------

        // Wait for the query to be fulfilled.
        const { data } = await mutationLifeCycleApi.queryFulfilled;

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
              }
            )
          );
        }
      },
      // We still invalidate tag so that even though the user is given realistic
      // update, we do refresh the cache with updated data.
      invalidatesTags: ["Messages"],
    }),
  }),
});

export const {
  useGetMessagesWithoutAuthorQuery,
  useGetMessagesWithAuthorQuery,
  useCreateMessageMutation,
} = messageApiSlice;
