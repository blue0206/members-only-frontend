import { useAppSelector } from "@/app/hooks";
import { getUserRole, isAuthenticated } from "@/features/auth/authSlice";
import { unauthorizedRedirectionQuery } from "@/lib/constants";
import {
  ErrorPageDetailsType,
  UnauthorizedRedirectionStateType,
} from "@/types";
import { Role } from "@blue0206/members-only-shared-types";
import { Navigate, Outlet, useLocation } from "react-router";

interface ProtectedRoutePropsType {
  allowedRoles?: Role[];
}

export default function ProtectedRoute({
  allowedRoles,
}: ProtectedRoutePropsType) {
  const isAuth = useAppSelector(isAuthenticated);
  const role = useAppSelector(getUserRole);
  const location = useLocation();

  if (!isAuth) {
    return (
      <Navigate
        to={`/login?reason=${unauthorizedRedirectionQuery}`}
        state={{ from: location } satisfies UnauthorizedRedirectionStateType}
        replace
      />
    );
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to Forbidden error page and provide a message to display.
    return (
      <Navigate
        to="/error"
        state={
          {
            message: "You are not authorized to access this page.",
            statusCode: 403,
          } satisfies ErrorPageDetailsType
        }
        replace
      />
    );
  }

  return <Outlet />;
}
