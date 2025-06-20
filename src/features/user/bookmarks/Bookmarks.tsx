import { useGetBookmarksQuery } from "@/app/services/userApi";
import { Header } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Message from "@/features/message/Message";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import { SortOptions, SortOptionsType } from "@/lib/constants";
import { ErrorPageDetailsType } from "@/types";
import bookmarksFilter from "@/utils/bookmarksFilter";
import sortMessages from "@/utils/messageSort";
import { GetUserBookmarksResponseDto } from "@blue0206/members-only-shared-types";
import { ArrowUpDown, Bookmark, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

export default function Bookmarks() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState<SortOptionsType>("newest");
  const [editMessageId, setEditMessageId] = useState<number | null>(null);

  const { data, isSuccess, isError, error } = useGetBookmarksQuery();
  const errorDetails = useApiErrorHandler(error);

  const navigate = useNavigate();

  // Handle api errors.
  useEffect(() => {
    if (isError) {
      void navigate("/error", {
        state: {
          statusCode: errorDetails.statusCode ?? 500,
          message: errorDetails.message,
        } satisfies ErrorPageDetailsType,
      });
    }
  }, [isError, errorDetails, navigate]);

  const sortedData: GetUserBookmarksResponseDto = useMemo(() => {
    return data
      ? sortMessages<GetUserBookmarksResponseDto>(data, sortOption)
      : [];
  }, [data, sortOption]);

  const filteredData: GetUserBookmarksResponseDto = useMemo(() => {
    return bookmarksFilter(sortedData, searchQuery);
  }, [sortedData, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-4xl mx-auto py-8 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="flex items-center mb-2 font-bold text-4xl">
              <Bookmark className="h-10 w-10 mr-2 text-primary" />
              Your Bookmarks
            </h1>
            <p className="text-muted-foreground">
              Messages you've saved for later.
            </p>
          </div>

          <Badge variant={"secondary"} className="text-sm w-fit rounded-xl">
            {filteredData.length} saved
          </Badge>
        </div>

        <Card className="mb-6">
          <div className="p-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookmarks...."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                />
              </div>

              <div>
                <Select
                  value={sortOption as string}
                  onValueChange={(value) => {
                    setSortOption(value as SortOptionsType);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <div className="flex items-center space-x-2">
                      <ArrowUpDown className="h-4 w-4" />
                      <SelectValue placeholder="Role" />
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
            </div>
          </div>
        </Card>

        <div className="space-y-8">
          {isSuccess &&
            filteredData.map((bookmark) => (
              <Message
                key={bookmark.messageId}
                messageData={bookmark}
                withAuthor={true}
                editMessageId={editMessageId}
                setEditMessageId={setEditMessageId}
              />
            ))}
          {isSuccess && filteredData.length === 0 && (
            <Card>
              <div className="flex flex-col items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-center">
                  No bookmarks found
                </p>
                {sortedData.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
