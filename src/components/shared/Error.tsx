import { useLocation } from "react-router";
import { ErrorPageDetailsType } from "@/types/error.types";
import { Button } from "../ui/button";

export default function Error() {
  // Extract data from location state.
  const locationState: unknown = useLocation().state;

  // Conditionally populate errorDetails based on location state.
  const errorDetails: ErrorPageDetailsType = locationState
    ? (locationState as ErrorPageDetailsType)
    : {
        statusCode: 404,
        message: "The requested resource was not found.",
      };

  // Setup error name and message based on status code.
  let errorName = "Not Found";
  let message = errorDetails.message;

  if (errorDetails.statusCode === 404) {
    errorName = "Not Found";
    message = errorDetails.message;
  } else if (errorDetails.statusCode === 403) {
    errorName = "Forbidden";
    message = errorDetails.message;
  } else if (errorDetails.statusCode >= 500) {
    errorName = "Internal Server Error";
    message = "Something went wrong on the server.";
  }

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-accent">
      <h1 className="text-5xl mb-5 font-semibold">
        {errorDetails.statusCode}: {errorName}
      </h1>
      <div className="flex flex-col items-center gap-5">
        <p className="text-xl text-gray-500">{message}</p>
        <Button
          variant={"outline"}
          className="cursor-pointer"
          onClick={() => {
            window.location.replace("/");
          }}
        >
          Go To Homepage
        </Button>
      </div>
    </div>
  );
}
