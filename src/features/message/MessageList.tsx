import { RefObject, useEffect, useMemo, useRef, useState } from "react";
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

interface MessageListPropsType {
  sortOption: SortOptionsType;
  setMessageCountChanged: React.Dispatch<React.SetStateAction<boolean>>;
  firstMessageRef: RefObject<HTMLDivElement | null>;
  fourthMessageRef: RefObject<HTMLDivElement | null>;
  lastMessageRef: RefObject<HTMLDivElement | null>;
  fourthLastMessageRef: RefObject<HTMLDivElement | null>;
}

// Messages Without Author Component
export function MessagesWithAuthor({
  sortOption,
  setMessageCountChanged,
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

  const messageListSizeRef = useRef(data?.length ?? 0);

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
  useEffect(() => {
    if (data) {
      // We only want to adjust the scroll view if the message list size has increased,
      // i.e., a new message has been added.
      if (data.length > messageListSizeRef.current) {
        setMessageCountChanged(true);
      }
      messageListSizeRef.current = data.length;
    }
  }, [setMessageCountChanged, data]);

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
  setMessageCountChanged,
  ...refs
}: MessageListPropsType) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { data, isSuccess, isError, error, isLoading } =
    useGetMessagesWithoutAuthorQuery();

  const errorDetails = useApiErrorHandler(error);

  const messageListSizeRef = useRef(data?.length ?? 0);

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
  useEffect(() => {
    // Set to true only if new length is greater than previous.
    if (data) {
      if (data.length > messageListSizeRef.current) {
        setMessageCountChanged(true);
      }
      messageListSizeRef.current = data.length;
    }
  }, [setMessageCountChanged, data]);

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
