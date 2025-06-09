import { useNavigate } from "react-router";
import { ErrorDetailsType } from "./useApiErrorHandler";
import { useEffect } from "react";
import { ErrorPageDetailsType } from "@/types";
import { useAppDispatch } from "@/app/hooks";
import { addNotification } from "@/features/notification/notificationSlice";

interface UiErrorHandlerHookParamsType {
  errorDetails: ErrorDetailsType;
  isError: boolean;
  reset: () => void;
}

/**
 * Handles display of errors.
 *
 * This hook is to be used on the returned object from `useApiErrorHandler` hook
 * which processes the API errors and categorizes them.
 * This hook makes use of that data to display errors accordingly.
 *
 * @param errorDetails - An `ErrorDetailsType` object containing categorized error
 *                       attributes, including flags for API, network, and validation
 *                       errors, error message, status code, error code, and details.
 * @param isError - A boolean indicating whether an error occurred.
 * @param reset - A function to be called when error has been processed.
 */
export default function useUiErrorHandler({
  errorDetails,
  isError,
  reset,
}: UiErrorHandlerHookParamsType) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isError) {
      if (errorDetails.isApiError) {
        // Navigate to error page for server errors, else show toast.
        if (errorDetails.statusCode && errorDetails.statusCode >= 500) {
          void navigate("/error", {
            state: {
              statusCode: errorDetails.statusCode,
              message: errorDetails.message,
            } satisfies ErrorPageDetailsType,
          });
        } else {
          dispatch(
            addNotification({
              type: "error",
              message: errorDetails.message,
            })
          );
        }
        reset();
      } else if (errorDetails.isValidationError) {
        dispatch(
          addNotification({
            type: "error",
            message: errorDetails.message,
          })
        );
        reset();
      } else {
        // Navigate to error page for all other errors.
        void navigate("/error", {
          state: {
            statusCode: errorDetails.statusCode ?? 500,
            message: errorDetails.message,
          } satisfies ErrorPageDetailsType,
        });
        reset();
      }
    }
  }, [dispatch, errorDetails, isError, navigate, reset]);
}
