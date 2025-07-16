import { useAppDispatch } from "@/app/hooks";
import {
  addNotification,
  removeNotification,
} from "@/features/notification/notificationSlice";
import {
  accountDeletedByAdminQuery,
  accountDeletedQuery,
  serverErrorQuery,
  sessionExpiredQuery,
  unauthorizedRedirectionQuery,
} from "@/lib/constants";
import {
  ErrorPageDetailsType,
  UnauthorizedRedirectionStateType,
} from "@/types";
import { logger } from "@/utils/logger";
import { nanoid } from "@reduxjs/toolkit";
import { useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";

const possibleReasons = [
  sessionExpiredQuery,
  unauthorizedRedirectionQuery,
  serverErrorQuery,
  accountDeletedQuery,
  accountDeletedByAdminQuery,
];

const notificationRequiringReasons = [
  sessionExpiredQuery,
  unauthorizedRedirectionQuery,
  accountDeletedQuery,
  accountDeletedByAdminQuery,
];

export default function useQueryParamsSideEffects() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const location = useLocation();
  const redirectedFrom: UnauthorizedRedirectionStateType | undefined =
    location.state
      ? (location.state as UnauthorizedRedirectionStateType)
      : undefined;

  useEffect(() => {
    const redirectReason = searchParams.get("reason");
    let notificationId = "";

    if (redirectReason && possibleReasons.includes(redirectReason)) {
      switch (redirectReason) {
        case sessionExpiredQuery: {
          notificationId = nanoid();

          dispatch(
            addNotification({
              id: notificationId,
              message:
                "Your session has expired. Please login again to continue.",
              type: "warning",
              toastOptions: {
                position: "top-center",
                closeButton: true,
                duration: 11000,
              },
            })
          );

          // Replace the current URL with the login page
          // to get rid of session expiry query param.
          void navigate("/login", { replace: true });
          break;
        }
        case unauthorizedRedirectionQuery: {
          notificationId = nanoid();

          dispatch(
            addNotification({
              id: notificationId,
              message: "Please login to continue.",
              type: "info",
              toastOptions: {
                position: "top-center",
                closeButton: true,
                duration: 11000,
              },
            })
          );

          // We persist the state to navigate the user on successful login.
          void navigate("/login", {
            replace: true,
            state: redirectedFrom,
          });
          break;
        }
        case serverErrorQuery: {
          void navigate("/error", {
            replace: true,
            state: {
              statusCode: 503,
              message:
                "Cannot connect to the server. Please check your internet connection and try again later.",
            } satisfies ErrorPageDetailsType,
          });
          break;
        }
        case accountDeletedQuery: {
          notificationId = nanoid();

          dispatch(
            addNotification({
              type: "info",
              message: "Your account has been deleted from our servers.",
              id: notificationId,
              toastOptions: {
                position: "top-center",
                closeButton: true,
                duration: 11000,
              },
            })
          );

          void navigate("/", { replace: true });
          break;
        }
        case accountDeletedByAdminQuery: {
          notificationId = nanoid();

          dispatch(
            addNotification({
              type: "info",
              message: "Your account has been deleted by an administrator.",
              id: notificationId,
              toastOptions: {
                position: "top-center",
                closeButton: true,
                duration: 11000,
              },
            })
          );

          void navigate("/", { replace: true });
          break;
        }
        default: {
          logger.warn(`Unknown redirect reason detected: ${redirectReason}`);
        }
      }
    }

    return () => {
      if (
        redirectReason &&
        notificationRequiringReasons.includes(redirectReason)
      ) {
        dispatch(removeNotification(notificationId));
      }
    };
  }, [searchParams, dispatch, navigate, redirectedFrom]);
}
