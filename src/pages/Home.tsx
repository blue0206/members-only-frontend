import { useAppSelector } from "@/app/hooks";
import { Header } from "@/components/layout";
import { getUserRole, isAuthenticated } from "@/features/auth/authSlice";
import { Role } from "@blue0206/members-only-shared-types";
import MarkdownTextEditor from "@/features/message/MarkdownTextEditor";
import { useCallback, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";
import { SortOptions, SortOptionsType } from "@/lib/constants";
import LoginBanner from "@/components/layout/LoginBanner";
import MembershipBanner from "@/features/user/MembershipBanner";
import ScrollButtons from "@/components/shared/ScrollButtons";
import useQueryParamsSideEffects from "@/hooks/useQueryParamsSideEffects";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import {
  MessagesWithAuthor,
  MessagesWithoutAuthor,
} from "@/features/message/MessageList";

export default function Home() {
  const isAuth = useAppSelector(isAuthenticated);
  const role = useAppSelector(getUserRole);

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
      rootMargin: isAuth ? "0px 0px -208px 0px" : undefined,
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
                  smartScrollCallback={scrollToNewestMessage}
                  firstMessageRef={firstMessageRef}
                  fourthMessageRef={fourthMessageRef}
                  lastMessageRef={lastMessageRef}
                  fourthLastMessageRef={fourthLastMessageRef}
                />
              ) : (
                <MessagesWithoutAuthor
                  sortOption={sortOption}
                  smartScrollCallback={scrollToNewestMessage}
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
