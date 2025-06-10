import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  GetMessagesResponseDto,
  GetMessagesWithoutAuthorResponseDto,
  Role,
} from "@blue0206/members-only-shared-types";
import { Bookmark } from "lucide-react";
import { useState } from "react";
import { getUser } from "../auth/authSlice";
import { addNotification } from "../notification/notificationSlice";

interface BookmarkMessagePropsType {
  messageData:
    | GetMessagesWithoutAuthorResponseDto[number]
    | GetMessagesResponseDto[number];
}

export default function BookmarkMessage(props: BookmarkMessagePropsType) {
  const authUser = useAppSelector(getUser);
  const dispatch = useAppDispatch();

  const [bookmark, setBookmark] = useState<boolean>(
    "bookmarked" in props.messageData && props.messageData.bookmarked
      ? true
      : false
  );

  const [bookmarkFill, setBookmarkFill] = useState<string>(
    "bookmarked" in props.messageData && props.messageData.bookmarked
      ? "#ffc107" // Amber if bookmarked, else white.
      : "#ffffff"
  );
  const handleBookmarkClick = () => {
    // Unregistered Users and USER role cannot bookmark messages.
    if (!authUser) {
      dispatch(
        addNotification({
          type: "warning",
          message: "Please login to bookmark messages.",
        })
      );
      return;
    }

    if (authUser.role === Role.USER) {
      dispatch(
        addNotification({
          type: "warning",
          message:
            "Only Members can bookmark messages. Please upgrade your account to become a Member.",
        })
      );
      return;
    }

    if (!bookmark) {
      setBookmarkFill("#ffc107");
      setBookmark(true);
    } else {
      setBookmarkFill("#ffffff");
      setBookmark(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={"ghost"}
            size={"sm"}
            className="cursor-pointer flex items-center space-x-1"
            onClick={handleBookmarkClick}
          >
            <Bookmark
              className={`h-5 w-5 transition-colors duration-200 ease-in-out ${
                // If the bookmarkFill is not white (i.e., message IS bookmarked), then set text color for icon outline.
                bookmarkFill !== "#ffffff" ? "text-amber-500" : ""
              }`}
              fill={bookmarkFill}
            />
            <span>{props.messageData.bookmarks}</span>
          </Button>
        </TooltipTrigger>

        <TooltipContent>
          <p className="dark:text-foreground">Bookmark this message</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
