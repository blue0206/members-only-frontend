import { useLocation } from "react-router";
import { ErrorPageDetailsType } from "@/types";
import { Button } from "../ui/button";
import useQueryParamsSideEffects from "@/hooks/useQueryParamsSideEffects";

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

  // Set error name based on status code.
  let errorName = "Not Found";

  switch (errorDetails.statusCode) {
    case 400:
      errorName = "Bad Request";
      break;
    case 401:
      errorName = "Unauthorized";
      break;
    case 403:
      errorName = "Forbidden";
      break;
    case 404:
      errorName = "Not Found";
      break;
    case 409:
      errorName = "Conflict";
      break;
    case 422:
      errorName = "Unprocessable Entity";
      break;
    case 503:
      errorName = "Service Unavailable";
      break;
    default:
      errorName = "Internal Server Error";
      break;
  }

  // Error handling for when user is navigated to error page
  // from outside component using window.location.replace('/error?reason=server-error');
  useQueryParamsSideEffects();

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-accent px-4">
      <h1 className="text-5xl mb-5 font-semibold text-center">
        {errorDetails.statusCode}: {errorName}
      </h1>
      <div className="flex flex-col items-center gap-5">
        <p className="text-xl text-gray-500 text-center">
          {errorDetails.message}
        </p>
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
