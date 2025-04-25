import {
  ApiResponse,
  RegisterRequestDto,
  RegisterResponseDto,
} from "@blue0206/members-only-shared-types";
import { apiSlice } from "./api";

export const authApiSlice = apiSlice.injectEndpoints({
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

export const { useRegisterUserMutation } = authApiSlice;
