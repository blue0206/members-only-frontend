import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { store } from "./app/store.ts";
import * as Sentry from "@sentry/react";
import { Button } from "./components/ui/button.tsx";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <Sentry.ErrorBoundary
        fallback={
          <div>
            <h2>Oops! Something went wrong.</h2>
            <Button
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
    </Provider>
  </StrictMode>
);
