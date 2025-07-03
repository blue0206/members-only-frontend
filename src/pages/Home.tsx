import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Header } from "@/components/layout";
import { getUserRole, isAuthenticated } from "@/features/auth/authSlice";
import {
  useGetMessagesWithAuthorQuery,
  useGetMessagesWithoutAuthorQuery,
} from "@/app/services/messageApi";
import Message from "@/features/message/Message";
import {
  GetMessagesResponseDto,
  GetMessagesWithoutAuthorResponseDto,
  Role,
} from "@blue0206/members-only-shared-types";
import MarkdownTextEditor from "@/features/message/MarkdownTextEditor";
import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";
import sortMessages from "@/utils/messageSort";
import { SortOptions, SortOptionsType } from "@/lib/constants";
import LoginBanner from "@/components/layout/LoginBanner";
import MembershipBanner from "@/features/user/MembershipBanner";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import ScrollButtons from "@/components/shared/ScrollButtons";
import useQueryParamsSideEffects from "@/hooks/useQueryParamsSideEffects";
import MessageSkeleton from "@/components/skeleton/MessageSkeleton";
import { apiSlice } from "@/app/services/api";
import { useNavigate } from "react-router";
import { ErrorPageDetailsType } from "@/types";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";

interface MessageListPropsType {
  sortOption: SortOptionsType;
  setMessageCountChanged: React.Dispatch<React.SetStateAction<boolean>>;
  firstMessageRef: RefObject<HTMLDivElement | null>;
  fourthMessageRef: RefObject<HTMLDivElement | null>;
  lastMessageRef: RefObject<HTMLDivElement | null>;
  fourthLastMessageRef: RefObject<HTMLDivElement | null>;
}

// Messages Without Author Component
function MessagesWithAuthor({
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
function MessagesWithoutAuthor({
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

export default function Home() {
  const isAuth = useAppSelector(isAuthenticated);
  const role = useAppSelector(getUserRole);

  const [messageCountChanged, setMessageCountChanged] = useState(false);

  const [sortOption, setSortOption] = useState<SortOptionsType>("oldest");

  // Show notification when user logged out as a result of account deletion
  // by themselves or by an admin.
  useQueryParamsSideEffects();

  // Refs and intersection observer entries for first-fourth message (top range) and
  // fourthLast-last message (bottom range). This helps us create a range within which if
  // the user is present, we scroll them automatically to the latest message
  // if received. This also prevents the user from being forcibly scrolled
  // to latest message if they're viewing older messages.
  const { ref: firstMessageRef, entry: firstMessageEntry } =
    useIntersectionObserver();
  // We set root margin for top similar to that for the scroll-to-top button,
  // ensuring that message is not considered visible when behind header.
  const { ref: fourthMessageRef, entry: fourthMessageEntry } =
    useIntersectionObserver({
      rootMargin: "-88px 0px 0px 0px",
    });
  const { ref: lastMessageRef, entry: lastMessageEntry } =
    useIntersectionObserver();
  // We set root margin for bottom similar to that for the scroll-to-bottom button,
  // ensuring that message is not considered visible when behind text editor.
  const { ref: fourthLastMessageRef, entry: fourthLastMessageEntry } =
    useIntersectionObserver({
      rootMargin: "0px 0px -208px 0px",
    });

  // If the sorting is based on newest message, then newly received messages will
  // be on top and hence we track the top-range with intersection observer.
  // Vice-versa for oldest sorting and other sorting (as newest message will mostly
  // be at bottom for other sorting in most cases).
  // If in range, we scroll the user to the latest message (which will always be at extreme top or bottom).
  const scrollToNewestMessage = useCallback(() => {
    if (sortOption !== "newest") {
      if (
        (typeof fourthLastMessageEntry?.isIntersecting === "boolean" &&
          fourthLastMessageEntry.isIntersecting) ||
        (typeof lastMessageEntry?.isIntersecting === "boolean" &&
          lastMessageEntry.isIntersecting)
      ) {
        scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }
    } else {
      if (
        (typeof firstMessageEntry?.isIntersecting === "boolean" &&
          firstMessageEntry.isIntersecting) ||
        (typeof fourthMessageEntry?.isIntersecting === "boolean" &&
          fourthMessageEntry.isIntersecting)
      ) {
        scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    }
  }, [
    sortOption,
    firstMessageEntry?.isIntersecting,
    fourthMessageEntry?.isIntersecting,
    lastMessageEntry?.isIntersecting,
    fourthLastMessageEntry?.isIntersecting,
  ]);

  // If the message count has changed, invokes the scrollToNewestMessage function
  // to decide whether to auto-scroll to newest message or not based on user position.
  useEffect(() => {
    if (messageCountChanged) {
      scrollToNewestMessage();
      setMessageCountChanged(false);
    }
  }, [messageCountChanged, sortOption, scrollToNewestMessage]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8 relative">
          {!isAuth && <LoginBanner />}

          {role === Role.USER && <MembershipBanner />}

          <div className="space-y-4">
            <div className="flex items-center justify-end">
              <Select
                value={sortOption as string}
                onValueChange={(value) => {
                  setSortOption(value as SortOptionsType);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center space-x-2">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value={SortOptions.newest}>
                    Newest First
                  </SelectItem>
                  <SelectItem value={SortOptions.oldest}>
                    Oldest First
                  </SelectItem>
                  <SelectItem value={SortOptions.mostLikes}>
                    Most Likes
                  </SelectItem>
                  <SelectItem value={SortOptions.mostBookmarks}>
                    Most Bookmarks
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-8">
              {isAuth && role !== Role.USER ? (
                <MessagesWithAuthor
                  sortOption={sortOption}
                  setMessageCountChanged={setMessageCountChanged}
                  firstMessageRef={firstMessageRef}
                  fourthMessageRef={fourthMessageRef}
                  lastMessageRef={lastMessageRef}
                  fourthLastMessageRef={fourthLastMessageRef}
                />
              ) : (
                <MessagesWithoutAuthor
                  sortOption={sortOption}
                  setMessageCountChanged={setMessageCountChanged}
                  firstMessageRef={firstMessageRef}
                  fourthMessageRef={fourthMessageRef}
                  lastMessageRef={lastMessageRef}
                  fourthLastMessageRef={fourthLastMessageRef}
                />
              )}
            </div>
          </div>
        </div>
        {isAuth && (
          <div className="sticky bottom-1 z-50 mt-5">
            <MarkdownTextEditor
              messageViewType={sortOption}
              className="bg-background/85 backdrop-blur-sm dark:backdrop-blur-xl supports-[backdrop-filter]:bg-background/55"
            />
          </div>
        )}
      </main>
      <ScrollButtons
        topElementIntersectionEntry={firstMessageEntry}
        bottomElementIntersectionEntry={lastMessageEntry}
      />
    </div>
  );
}
