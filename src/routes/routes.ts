import { createBrowserRouter } from "react-router";
import Home from "@/pages/Home";
import RouterErrorBoundary from "./RouterErrorBoundary";
import Error from "@/components/shared/Error";
import { Login, Register } from "@/features/auth";
import ProtectedRoute from "./ProtectedRoute";
import { Role } from "@blue0206/members-only-shared-types/enums/roles.enum";
import UserManagement from "@/features/user/manage/UserManagement";
import Bookmarks from "@/features/user/bookmarks/Bookmarks";
import ProfileSettings from "@/features/user/profile/ProfileSettings";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
    ErrorBoundary: RouterErrorBoundary,
  },
  {
    path: "/login",
    Component: Login,
    ErrorBoundary: RouterErrorBoundary,
  },
  {
    path: "/register",
    Component: Register,
    ErrorBoundary: RouterErrorBoundary,
  },
  {
    path: "/error",
    Component: Error,
    ErrorBoundary: RouterErrorBoundary,
  },
  {
    Component: () =>
      ProtectedRoute({ allowedRoles: [Role.USER, Role.MEMBER, Role.ADMIN] }),
    children: [
      {
        path: "/profile-settings",
        Component: ProfileSettings,
      },
    ],
    ErrorBoundary: RouterErrorBoundary,
  },
  {
    Component: () =>
      ProtectedRoute({ allowedRoles: [Role.MEMBER, Role.ADMIN] }),
    children: [
      {
        path: "/bookmarks",
        Component: Bookmarks,
      },
    ],
    ErrorBoundary: RouterErrorBoundary,
  },
  {
    Component: () => ProtectedRoute({ allowedRoles: [Role.ADMIN] }),
    children: [
      {
        path: "/admin/user-management",
        Component: UserManagement,
      },
    ],
    ErrorBoundary: RouterErrorBoundary,
  },
  {
    path: "*",
    Component: Error,
  },
]);

export default router;
