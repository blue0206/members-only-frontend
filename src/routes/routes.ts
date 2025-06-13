import { createBrowserRouter } from "react-router";
import Home from "@/pages/Home";
import Error from "@/components/shared/Error";
import { Login, Register } from "@/features/auth";

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
]);

export default router;
