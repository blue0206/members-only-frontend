import {
  GetMessagesResponseDto,
  GetMessagesWithoutAuthorResponseDto,
} from "@blue0206/members-only-shared-types";
import { useEffect, useRef } from "react";

// A hook that calls the provided callback function (for smart scrolling on new messages)
// if the number of messages increases.
export default function useOnNewMessagesReceived(
  messages:
    | GetMessagesResponseDto
    | GetMessagesWithoutAuthorResponseDto
    | undefined,
  smartScrollCallback: () => void
) {
  const messageListSizeRef = useRef<number>(messages?.length ?? 0);

  useEffect(() => {
    if (messages) {
      // We only want to adjust the scroll view if the message list size has increased,
      // i.e., a new message has been added.
      if (messages.length > messageListSizeRef.current) {
        smartScrollCallback();
      }
      messageListSizeRef.current = messages.length;
    }
  }, [messages, smartScrollCallback]);
}
