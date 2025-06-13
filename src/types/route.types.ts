import type { Location } from "react-router";

export interface ErrorPageDetailsType {
  statusCode: number;
  message: string;
}

export interface UnauthorizedRedirectionStateType {
  from: Location;
}
