import { useAppSelector } from "@/app/hooks";
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
import { useMemo, useState } from "react";
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
import { useMediaQuery } from "react-responsive";
import MembershipBanner from "@/components/layout/MembershipBanner";

// Messages Without Author Component
function MessagesWithAuthor({ sortOption }: { sortOption: SortOptionsType }) {
  const { data, isSuccess } = useGetMessagesWithAuthorQuery();
  const [editMessageId, setEditMessageId] = useState<number | null>(null);

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
    </>
  );
}

// Messages With Author Component
function MessagesWithoutAuthor({
  sortOption,
}: {
  sortOption: SortOptionsType;
}) {
  const { data, isSuccess } = useGetMessagesWithoutAuthorQuery();

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
    </>
  );
}

export default function Home() {
  const isAuth = useAppSelector(isAuthenticated);
  const role = useAppSelector(getUserRole);

  const loginBannerWidthLimit = useMediaQuery({
    query: "(min-width: 611px)",
  });

  const [sortOption, setSortOption] = useState<SortOptionsType>("newest");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {!isAuth && loginBannerWidthLimit && <LoginBanner />}

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
    </div>
  );
}
