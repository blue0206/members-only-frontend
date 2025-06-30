import { useRouteError } from "react-router";
import * as Sentry from "@sentry/react";
import { ReactNode, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function RouterErrorBoundary(): ReactNode {
  const error = useRouteError();

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-accent px-4">
      <h1 className="text-5xl mb-5 font-semibold text-center">
        Oops! Something went wrong.
      </h1>
      <Button
        variant={"outline"}
        className="cursor-pointer mt-4"
        onClick={() => {
          window.location.replace("/");
        }}
      >
        Reload Page
      </Button>
    </div>
  );
}
