import {
  ApiResponse,
  RegisterRequestDto,
  RegisterResponseDto,
} from "@blue0206/members-only-shared-types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL as string,
});

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery,
  endpoints: (builder) => ({
    registerUser: builder.mutation<RegisterResponseDto, RegisterRequestDto>({
      query: (body: RegisterRequestDto) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      transformResponse: (returnValue: ApiResponse<RegisterResponseDto>) => {
        if (returnValue.success) {
          return returnValue.data;
        } else {
          throw new Error(returnValue.error.message);
        }
      },
    }),
  }),
});
