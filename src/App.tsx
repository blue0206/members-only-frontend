import { RouterProvider } from "react-router";
import router from "@/routes";
import { Toaster } from "./components/ui/sonner";
import { useAppSelector } from "./app/hooks";
import { getTheme } from "./features/ui/uiSlice";
import { useMediaQuery } from "react-responsive";
import NotificationsHandler from "./features/notification/NotificationsHandler";

function App() {
  const isDesktop = useMediaQuery({
    query: "(min-width: 768px)",
  });
  const currentTheme = useAppSelector(getTheme);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        richColors
        position={isDesktop ? "bottom-right" : "top-center"}
        theme={currentTheme}
      />
      <NotificationsHandler />
    </>
  );
}

export default App;
