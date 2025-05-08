/* eslint-disable @typescript-eslint/no-invalid-void-type */
// This eslint rule has been disabled because void type is used
// for no arguments in RTK Query.

import {
  ApiResponseSuccess,
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
  }),
});

export const {
  useGetMessagesWithoutAuthorQuery,
  useGetMessagesWithAuthorQuery,
} = messageApiSlice;
