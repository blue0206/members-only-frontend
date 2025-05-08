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
import { updateUserDetails } from "@/features/auth/authSlice";
import * as Sentry from "@sentry/react";
import { authApiSlice } from "./authApi";

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
  }),
});

export const { useGetUserMessagesQuery } = userApiSlice;
