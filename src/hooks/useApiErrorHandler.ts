import { useMemo } from "react";
import { ErrorCodes } from "@blue0206/members-only-shared-types";
import { CustomBaseQueryError } from "@/types";
import { SerializedError } from "@reduxjs/toolkit";
import { isApiErrorPayload, isSerializedError } from "@/utils/errorUtils";

// Define possible error to be received.
type ErrorType = CustomBaseQueryError | SerializedError | null | undefined;

// Define error details type.
interface ErrorDetailsType {
  isApiError: boolean;
  isNetworkError: boolean;
  isValidationError: boolean;
  message: string;
  statusCode?: number;
  code?: string;
  details?: unknown;
  originalError?: ErrorType;
}

// Initialize error details.
const initialError: ErrorDetailsType = {
  isApiError: false,
  isNetworkError: false,
  isValidationError: false,
  message: "",
  originalError: null,
};

// Hook to handle API errors.
export function useApiErrorHandler(error: ErrorType): ErrorDetailsType {
  const errorDetails: ErrorDetailsType = useMemo(() => {
    initialError.originalError = error;

    // Check if error is null or undefined.
    if (!error) {
      return initialError;
    }

    // Check if error is a Serialized error, possibly thrown in
    // validation failure inside `transformResponse` of RTK Query.
    if (isSerializedError(error)) {
      initialError.isNetworkError = true;
      initialError.message = "An error occurred while processing your request.";
      return initialError;

      // Next, we check if the error is from API response.
    } else if (isApiErrorPayload(error)) {
      initialError.isApiError = true;
      initialError.statusCode = error.statusCode;
      initialError.code = error.code;

      switch (error.code) {
        case ErrorCodes.VALIDATION_ERROR: {
          if (
            error.message.includes("parameter") ||
            error.message.includes("query")
          ) {
            initialError.isValidationError = true;
            initialError.message = "Invalid request.";
            initialError.details = error.details;
          } else {
            initialError.isValidationError = true;
            initialError.details = error.details;
            initialError.message = error.message;
          }
          break;
        }
        case ErrorCodes.AUTHENTICATION_REQUIRED:
        case ErrorCodes.FORBIDDEN: {
          initialError.message =
            "You are not authorized to perform this action.";
          break;
        }
        case ErrorCodes.UNAUTHORIZED: {
          initialError.message = "The username or password is incorrect.";
          break;
        }
        case ErrorCodes.NOT_FOUND: {
          initialError.message = "The requested resource could not be found.";
          break;
        }
        case ErrorCodes.INCORRECT_PASSWORD: {
          initialError.message = "The password you entered is incorrect.";
          break;
        }
        case ErrorCodes.INCORRECT_SECRET_KEY: {
          initialError.message = "The secret key is invalid.";
          break;
        }
        case ErrorCodes.UNIQUE_CONSTRAINT_VIOLATION: {
          if (error.message.includes("username")) {
            initialError.message = "This username is already taken.";
          } else {
            initialError.message =
              "An error occurred while processing your request.";
          }
          break;
        }
        case ErrorCodes.REQUIRED_CONSTRAINT_VIOLATION: {
          if (error.message.includes("username")) {
            initialError.message = "A username is required.";
          } else if (error.message.includes("password")) {
            initialError.message = "A password is required.";
          } else if (error.message.includes("content")) {
            initialError.message = "The message cannot be empty.";
          } else {
            initialError.message =
              "An error occurred while processing your request.";
          }
          break;
        }
        case ErrorCodes.RANGE_ERROR: {
          initialError.message = error.message;
          break;
        }
        case ErrorCodes.VALUE_TOO_LONG: {
          if (error.message.includes("username")) {
            initialError.message = "The username is too long.";
          } else if (error.message.includes("content")) {
            initialError.message = "The message is too long.";
          } else {
            initialError.message =
              "This request could not be processed as the input provided is too long.";
          }
          break;
        }
        case ErrorCodes.FOREIGN_KEY_VIOLATION: {
          initialError.message =
            "An error occurred while processing your request. Please ensure all inputs are correct.";
          break;
        }
        case ErrorCodes.INVALID_VALUE: {
          initialError.message =
            "Invalid value provided. Please ensure the input is correct.";
          break;
        }
        case ErrorCodes.DATABASE_CONNECTION_ERROR:
        case ErrorCodes.DATABASE_ERROR:
        case ErrorCodes.DATABASE_VALIDATION_ERROR:
        case ErrorCodes.INTERNAL_SERVER_ERROR: {
          initialError.message =
            "An error occurred on the server. Please try again later.";
          break;
        }
        default: {
          initialError.message =
            "An error occurred while processing your request.";
        }
      }

      // Finally, if the error is not from API, or is not RTKQ SerializedError,
      // it must be a network/fetch/parse/custom/timeout error from RTKQ.
    } else {
      initialError.isNetworkError = true;
      initialError.statusCode =
        typeof error.status === "number" ? error.status : undefined;

      if (error.status === "FETCH_ERROR") {
        initialError.message =
          "Cannot connect to the server. Please check your network connection.";
      } else if (error.status === "PARSING_ERROR") {
        initialError.message = "An error occurred while parsing the response.";
      } else if (error.status === "TIMEOUT_ERROR") {
        initialError.message = "Request timed out. Please try again later.";
      } else if (error.status === "CUSTOM_ERROR") {
        initialError.message =
          "An unexpected error occurred. Please try again later.";
      } else if (error.status >= 500) {
        initialError.message =
          "An error occurred on the server. Please try again later.";
      }
    }

    return initialError;
  }, [error]);

  return errorDetails;
}
