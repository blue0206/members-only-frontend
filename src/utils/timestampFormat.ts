import { format } from "date-fns";

export const getReadableTime = (timestamp: string): string => {
  return format(timestamp, "p");
};
