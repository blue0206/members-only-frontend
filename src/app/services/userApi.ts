/* eslint-disable @typescript-eslint/no-invalid-void-type */
// This eslint rule has been disabled because void type is used
// for no arguments in RTK Query.

import {
  ApiResponseSuccess,
  GetUserMessagesResponseDto,
  GetUserMessagesResponseSchema,
} from "@blue0206/members-only-shared-types";
import { apiSlice } from "./api";
import { HttpMethod } from "@/types";
import { ValidationError } from "@/utils/error";
import { logger } from "@/utils/logger";

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
  }),
});

export const { useGetUserMessagesQuery } = userApiSlice;
