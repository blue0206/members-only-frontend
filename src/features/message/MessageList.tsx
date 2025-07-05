import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { isAuthenticated } from "../auth/authSlice";
import { useNavigate } from "react-router";
import { SortOptionsType } from "@/lib/constants";
import {
  useGetMessagesWithAuthorQuery,
  useGetMessagesWithoutAuthorQuery,
} from "@/app/services/messageApi";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import { apiSlice } from "@/app/services/api";
import { ErrorPageDetailsType } from "@/types";
import {
  GetMessagesResponseDto,
  GetMessagesWithoutAuthorResponseDto,
} from "@blue0206/members-only-shared-types";
import sortMessages from "@/utils/messageSort";
import Message from "./Message";
import MessageSkeleton from "@/components/skeleton/MessageSkeleton";
import useOnNewMessagesReceived from "@/hooks/useOnNewMessagesReceived";

interface MessageListPropsType {
  sortOption: SortOptionsType;
  // firstMessageRef: RefObject<HTMLDivElement | null>;
  // fourthMessageRef: RefObject<HTMLDivElement | null>;
  // lastMessageRef: RefObject<HTMLDivElement | null>;
  // fourthLastMessageRef: RefObject<HTMLDivElement | null>;
  firstMessageRef: (node: HTMLDivElement | null) => void;
  fourthMessageRef: (node: HTMLDivElement | null) => void;
  lastMessageRef: (node: HTMLDivElement | null) => void;
  fourthLastMessageRef: (node: HTMLDivElement | null) => void;
  smartScrollCallback: () => void;
}

// Messages Without Author Component
export function MessagesWithAuthor({
  sortOption,
  smartScrollCallback,
  ...refs
}: MessageListPropsType) {
  const isAuth = useAppSelector(isAuthenticated);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { data, isSuccess, isError, error, isLoading } =
    useGetMessagesWithAuthorQuery(undefined, {
      skip: !isAuth,
    });
  const [editMessageId, setEditMessageId] = useState<number | null>(null);

  const errorDetails = useApiErrorHandler(error);

  // Handle api call errors.
  useEffect(() => {
    if (isError) {
      if (errorDetails.isNetworkError) {
        // We just dispatch a call to the health check endpoint to check if the server is up.
        // If not, the user will be redirected to the error page as set in that endpoint.
        void dispatch(apiSlice.endpoints.healthCheck.initiate());
      } else {
        void navigate("/error", {
          state: {
            statusCode: errorDetails.statusCode ?? 500,
            message: errorDetails.message,
          } satisfies ErrorPageDetailsType,
        });
      }
    }
  }, [isError, errorDetails, navigate, dispatch]);

  const sortedData: GetMessagesResponseDto = useMemo(() => {
    return data ? sortMessages<GetMessagesResponseDto>(data, sortOption) : [];
  }, [data, sortOption]);

  // Adjust scroll view on message count change.
  useOnNewMessagesReceived(data, smartScrollCallback);

  return (
    <>
      {isSuccess &&
        sortedData.map((message, index) => (
          <Message
            key={message.messageId}
            messageData={message}
            withAuthor={true}
            setEditMessageId={setEditMessageId}
            editMessageId={editMessageId}
            ref={
              index === 0
                ? refs.firstMessageRef
                : index === 3
                ? refs.fourthMessageRef
                : index === sortedData.length - 1
                ? refs.lastMessageRef
                : index === sortedData.length - 4
                ? refs.fourthLastMessageRef
                : null
            }
          />
        ))}
      {isLoading &&
        Array.from({ length: 5 }, (_, index: number) => (
          <MessageSkeleton key={index} />
        ))}
      {isSuccess && sortedData.length === 0 && (
        <div className="text-center text-muted-foreground">
          There are no messages to show.
        </div>
      )}
    </>
  );
}

// Messages With Author Component
export function MessagesWithoutAuthor({
  sortOption,
  smartScrollCallback,
  ...refs
}: MessageListPropsType) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { data, isSuccess, isError, error, isLoading } =
    useGetMessagesWithoutAuthorQuery();

  const errorDetails = useApiErrorHandler(error);

  // Handle api call errors.
  useEffect(() => {
    if (isError) {
      if (errorDetails.isNetworkError) {
        // We just dispatch a call to the health check endpoint to check if the server is up.
        // If not, the user will be redirected to the error page as set in that endpoint.
        void dispatch(apiSlice.endpoints.healthCheck.initiate());
      } else {
        void navigate("/error", {
          state: {
            statusCode: errorDetails.statusCode ?? 500,
            message: errorDetails.message,
          } satisfies ErrorPageDetailsType,
        });
      }
    }
  }, [isError, errorDetails, navigate, dispatch]);

  const sortedData: GetMessagesWithoutAuthorResponseDto = useMemo(() => {
    return data
      ? sortMessages<GetMessagesWithoutAuthorResponseDto>(data, sortOption)
      : [];
  }, [data, sortOption]);

  // Adjust scroll view on message count change.
  useOnNewMessagesReceived(data, smartScrollCallback);

  return (
    <>
      {isSuccess &&
        sortedData.map((message, index) => (
          <Message
            key={message.messageId}
            messageData={message}
            withAuthor={false}
            ref={
              index === 0
                ? refs.firstMessageRef
                : index === 3
                ? refs.fourthMessageRef
                : index === sortedData.length - 1
                ? refs.lastMessageRef
                : index === sortedData.length - 4
                ? refs.fourthLastMessageRef
                : null
            }
          />
        ))}
      {isLoading &&
        Array.from({ length: 5 }, (_, index: number) => (
          <MessageSkeleton key={index} />
        ))}
      {isSuccess && sortedData.length === 0 && (
        <div className="text-center text-muted-foreground">
          There are no messages to show.
        </div>
      )}
    </>
  );
}
