import {
  ApiResponse,
  ApiResponseError,
  ApiResponseSuccess,
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
  RegisterResponseSchema,
} from "@blue0206/members-only-shared-types";
import { apiSlice } from "./api";
import { HttpMethod } from "@/types";
import { ValidationError } from "@/utils/error";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Register Endpoint
    registerUser: builder.mutation<RegisterResponseDto, RegisterRequestDto>({
      query: (body: RegisterRequestDto) => ({
        url: "/auth/register",
        method: HttpMethod.POST,
        body,
      }),
      transformResponse: (result: ApiResponseSuccess<RegisterResponseDto>) => {
        // Validate the response against schema.
        const parsedResult = RegisterResponseSchema.safeParse(result.data);
        // Throw error if validation fails.
        if (!parsedResult.success) {
          throw new ValidationError(
            parsedResult.error.message,
            parsedResult.error.flatten()
          );
        }
        // Return the response payload on successful validation.
        return result.data;
      },
      transformErrorResponse: (
        result: FetchBaseQueryError | ApiResponseError
      ) => {
        // Check if the error is FetchBaseQueryError or ApiResponseError.
        // If it's FetchBaseQueryError, return the result as it is.
        // If it's ApiResponseError, extract the error payload from the
        // response body and return it.
        if ("status" in result) {
          return result;
        } else {
          return result.error;
        }
      },
    }),
    loginUser: builder.mutation<LoginResponseDto, LoginRequestDto>({
      query: (body: LoginRequestDto) => ({
        url: "/auth/login",
        method: HttpMethod.POST,
        body,
      }),
      transformResponse: (returnValue: ApiResponse<LoginResponseDto>) => {
        if (returnValue.success) {
          return returnValue.data;
        } else {
          throw new Error(returnValue.error.message);
        }
      },
    }),
  }),
});

export const { useRegisterUserMutation } = authApiSlice;
