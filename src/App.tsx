import { RouterProvider } from "react-router";
import router from "@/routes/routes";
import { Toaster } from "./components/ui/sonner";
import { useAppSelector } from "./app/hooks";
import { getTheme } from "./features/ui/uiSlice";
import { useMediaQuery } from "react-responsive";
import NotificationsHandler from "./features/notification/NotificationsHandler";
import { getAccessToken, isAuthenticated } from "./features/auth/authSlice";
import { useEffect } from "react";
import { sseService } from "./features/sse/sseService";
import { store } from "./app/store";

function App() {
  const isDesktop = useMediaQuery({
    query: "(min-width: 768px)",
  });
  const currentTheme = useAppSelector(getTheme);

  const isAuth = useAppSelector(isAuthenticated);
  const accessToken = useAppSelector(getAccessToken);

  useEffect(() => {
    sseService.initializeService(store);
  }, []);

  useEffect(() => {
    if (isAuth && accessToken) {
      sseService.startSseConnection();
    } else {
      sseService.stopSseConnection();
    }

    return () => {
      sseService.stopSseConnection();
    };
  }, [isAuth, accessToken]);

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
