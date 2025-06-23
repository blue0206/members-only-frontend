import { RouterProvider } from "react-router";
import router from "@/routes/routes";
import { Toaster } from "./components/ui/sonner";
import { useAppSelector } from "./app/hooks";
import { getTheme } from "./features/ui/uiSlice";
import { useMediaQuery } from "react-responsive";
import NotificationsHandler from "./features/notification/NotificationsHandler";
import { getAccessToken, isAuthenticated } from "./features/auth/authSlice";
import { useEffect, useState } from "react";
import { sseService } from "./features/sse/sseService";
import { store } from "./app/store";
import { useHealthCheckQuery } from "./app/services/api";
import { logger } from "./utils/logger";
import { serverErrorQuery } from "./lib/constants";

function App() {
  const isDesktop = useMediaQuery({
    query: "(min-width: 768px)",
  });
  const currentTheme = useAppSelector(getTheme);

  const isAuth = useAppSelector(isAuthenticated);
  const accessToken = useAppSelector(getAccessToken);

  // Healthcheck; retries 5 times before redirecting to error page.
  const { isError, isSuccess, refetch } = useHealthCheckQuery();
  const MAX_ATTEMPTS = 5;
  const [attempts, setAttempts] = useState<number>(0);

  // Reset attempts on successful healthcheck.
  useEffect(() => {
    if (isSuccess) {
      logger.info("Healthcheck successful.");
      setAttempts(0);
    }
  }, [isSuccess]);

  // We retry healthcheck after failed attempt up to 5 times.
  // If the healthcheck still fails, we redirect to error page.
  // This is primarily been placed because when users' account was
  // deleted and they were redirected to home page, the api calls
  // failed continuously for a small window of time until they were
  // back to normal. This is probably because the home page essentially
  // makes 2 api calls: GetMessages without and with authors. The two
  // api calls failing back-to-back as a result of page reload caused
  // the error-handling logic to navigate to error page prematurely.
  // Therefore, a healthcheck endpoint is now used to ascertain server
  // availability upto 5 times before finally redirecting to error page.
  useEffect(() => {
    if (isError) {
      if (attempts < MAX_ATTEMPTS) {
        logger.warn(
          `Healthcheck failed. ${(
            MAX_ATTEMPTS - attempts
          ).toString()} attempts left.`
        );
        setAttempts((prevAttempts) => prevAttempts + 1);
        void refetch();
      } else {
        logger.error(
          "Healthcheck failed. Max attempts reached. Redirecting to error page."
        );

        if (
          window.location.pathname !== "/error" &&
          window.location.pathname !== `/error?reason=${serverErrorQuery}`
        ) {
          window.location.replace(`/error?reason=${serverErrorQuery}`);
        }
      }
    }
  }, [isError, attempts, refetch]);

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
