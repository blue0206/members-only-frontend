import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { store, persistor } from "./app/store.ts";
import { PersistGate } from "redux-persist/integration/react";
import { ThemeProvider } from "./components/layout/";
import * as Sentry from "@sentry/react";
import { Button } from "./components/ui/button.tsx";
import { Spinner } from "./components/ui/spinner.tsx";

// Sentry initialization for production.
if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    sendDefaultPii: true,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.breadcrumbsIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 0.8,
    tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
  });
  console.log("Sentry initialized for production.");
} else {
  console.log("Sentry not initialized for development.");
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate
        loading={<Spinner size={"medium"} className="text-background" />}
        persistor={persistor}
      >
        <ThemeProvider>
          {/* Sentry Error Boundary wrapper for App. */}
          <Sentry.ErrorBoundary
            fallback={
              <div className="w-screen h-screen flex flex-col items-center justify-center bg-accent px-4">
                <h1 className="text-5xl mb-5 font-semibold text-center">
                  Oops! Something went wrong.
                </h1>
                <Button
                  variant={"outline"}
                  className="cursor-pointer mt-4"
                  onClick={() => {
                    window.location.reload();
                  }}
                >
                  Reload Page
                </Button>
              </div>
            }
            showDialog={import.meta.env.DEV}
          >
            <App />
          </Sentry.ErrorBoundary>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);
