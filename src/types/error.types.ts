import { ApiErrorPayload } from "@blue0206/members-only-shared-types/api/base";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

// Define custom base query error type which is to be returned.
// It can either be from API or from RTK Query.
export type CustomBaseQueryError = FetchBaseQueryError | ApiErrorPayload;
