import { useAppSelector } from "@/app/hooks";
import { Header } from "@/components/layout";
import { getUserRole, isAuthenticated } from "../auth/authSlice";
import {
  useGetMessagesWithAuthorQuery,
  useGetMessagesWithoutAuthorQuery,
} from "@/app/services/messageApi";
import Message from "./Message";
import {
  GetMessagesResponseDto,
  GetMessagesWithoutAuthorResponseDto,
  Role,
} from "@blue0206/members-only-shared-types";
import MarkdownTextEditor from "./MarkdownTextEditor";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";
import sortMessages, {
  SortOptions,
  SortOptionsType,
} from "@/utils/messageSort";

// Messages Without Author Component
function MessagesWithAuthor({ sortOption }: { sortOption: SortOptionsType }) {
  const { data, isSuccess } = useGetMessagesWithAuthorQuery();
  const [editMessageId, setEditMessageId] = useState<number | null>(null);

  const sortedData: GetMessagesResponseDto = data
    ? sortMessages<GetMessagesResponseDto>(data, sortOption)
    : [];

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

  const sortedData: GetMessagesWithoutAuthorResponseDto = data
    ? sortMessages<GetMessagesWithoutAuthorResponseDto>(data, sortOption)
    : [];

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

  const [sortOption, setSortOption] = useState<SortOptionsType>("newest");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-end-safe">
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
