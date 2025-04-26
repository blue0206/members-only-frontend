import { createBrowserRouter } from "react-router";
import Home from "./features/home/Home";
import Error from "./components/shared/Error";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/error",
    Component: Error,
  },
]);

export default router;
