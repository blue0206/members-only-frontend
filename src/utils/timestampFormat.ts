import { format } from "date-fns";

export const getReadableTime = (timestamp: string): string => {
  // 12:00 AM
  return format(timestamp, "p");
};

export const getReadableDate = (timestamp: string): string => {
  // Apr 29, 1456
  return format(timestamp, "PP");
};
