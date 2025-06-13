import { createBrowserRouter } from "react-router";
import Home from "@/pages/Home";
import Error from "@/components/shared/Error";
import { Login, Register } from "@/features/auth";
import ProtectedRoute from "./ProtectedRoute";
import { Role } from "@blue0206/members-only-shared-types";
import UserManagement from "@/features/user/manage/UserManagement";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/error",
    Component: Error,
  },
  {
    Component: () => ProtectedRoute({ allowedRoles: [Role.ADMIN] }),
    children: [
      {
        path: "/admin/user-management",
        Component: UserManagement,
      },
    ],
  },
  {
    path: "*",
    Component: Error,
  },
]);

export default router;
