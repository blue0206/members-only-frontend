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
import { useEffect, useMemo, useState } from "react";
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

// Messages Without Author Component
function MessagesWithAuthor({ sortOption }: { sortOption: SortOptionsType }) {
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

  return (
    <>
      {isSuccess &&
        sortedData.map((message) => (
          <Message
            key={message.messageId}
            messageData={message}
            withAuthor={true}
            setEditMessageId={setEditMessageId}
            editMessageId={editMessageId}
          />
        ))}
      {isLoading &&
        Array.from({ length: 5 }, (_, index: number) => (
          <MessageSkeleton key={index} />
        ))}
      {sortedData.length === 0 && (
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
}: {
  sortOption: SortOptionsType;
}) {
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

  return (
    <>
      {isSuccess &&
        sortedData.map((message) => (
          <Message
            key={message.messageId}
            messageData={message}
            withAuthor={false}
          />
        ))}
      {isLoading &&
        Array.from({ length: 5 }, (_, index: number) => (
          <MessageSkeleton key={index} />
        ))}
      {sortedData.length === 0 && (
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

  // Show notification when user logged out as a result of account deletion
  // by themselves or by an admin.
  useQueryParamsSideEffects();

  const [sortOption, setSortOption] = useState<SortOptionsType>("oldest");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
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
                <MessagesWithAuthor sortOption={sortOption} />
              ) : (
                <MessagesWithoutAuthor sortOption={sortOption} />
              )}
            </div>
          </div>
          {isAuth && <MarkdownTextEditor />}
        </div>
      </main>
      <ScrollButtons />
    </div>
  );
}
