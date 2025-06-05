import React, { useState } from "react";
import { getTimeElapsed } from "@/utils/timestampFormat";
import {
  GetMessagesWithoutAuthorResponseDto,
  GetMessagesResponseDto,
  Role,
} from "@blue0206/members-only-shared-types";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Clock,
  MoreHorizontal,
  Edit2,
  Trash2,
  ThumbsUp,
  Bookmark,
} from "lucide-react";
import { getRoleBadge } from "@/utils/getRoleBadge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/app/hooks";
import { getUser } from "../auth/authSlice";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

type MessagePropsType =
  | {
      messageData: GetMessagesResponseDto[number];
      withAuthor: true;
      setEditMessageId: React.Dispatch<React.SetStateAction<number | null>>;
    }
  | {
      messageData: GetMessagesWithoutAuthorResponseDto[number];
      withAuthor: false;
      setEditMessageId?: never;
    };

export default function Message(props: MessagePropsType) {
  const authUser = useAppSelector(getUser);

  // Initialize like fill to blue if user has liked the message, or else default to white.
  const [likeFill, setLikeFill] = useState<string>(
    "liked" in props.messageData && props.messageData.liked
      ? "#1e90ff"
      : "#ffffff"
  );
  // Initialize bookmark fill to amber if user has bookmarked the message, or else default to white.
  const [bookmarkFill, setBookmarkFill] = useState<string>(
    "bookmarked" in props.messageData && props.messageData.bookmarked
      ? "#ffc107"
      : "#ffffff"
  );

  const handleLikeClick = () => {
    if (likeFill === "#ffffff") {
      setLikeFill("#1e90ff");
    } else {
      setLikeFill("#ffffff");
    }
  };

  const handleBookmarkClick = () => {
    if (bookmarkFill === "#ffffff") {
      setBookmarkFill("#ffc107");
    } else {
      setBookmarkFill("#ffffff");
    }
  };

  if (props.withAuthor) {
    // For MEMBER and ADMIN roles.

    const user = props.messageData.user;
    const messageData = props.messageData;

    return (
      <Card className="p-5 hover:shadow-md transition-shadow">
        <div className="space-y-4">
          {/* Message Header (Author Details + Options) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-blue-100 dark:ring-blue-950">
                <AvatarImage src={user ? user.avatar ?? "" : ""} />
                <AvatarFallback>
                  <User />
                </AvatarFallback>
              </Avatar>

              <div>
                <div className="flex items-center gap-2.5">
                  {user ? (
                    <>
                      <p className="font-medium">
                        {user.firstname} {user.middlename} {user.lastname}
                      </p>
                      {getRoleBadge(user.role)}
                    </>
                  ) : (
                    <p className="italic font-medium text-muted-foreground">
                      Deleted User
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{getTimeElapsed(messageData.timestamp)}</span>
                  </div>
                  {messageData.edited && (
                    <span className="italic text-xs">(edited)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Message Options */}
            <TooltipProvider>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size={"sm"}
                    variant={"ghost"}
                    className="cursor-pointer"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Message
                  </DropdownMenuItem>

                  {(authUser?.role === Role.ADMIN ||
                    authUser?.username === messageData.user?.username) && (
                    <>
                      <DropdownMenuSeparator />

                      <DropdownMenuItem variant={"destructive"}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Message
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipProvider>
          </div>

          {/* Message Content */}
          <div className="prose prose-sm max-w-none prose-blue dark:prose-invert 2xl:prose-lg">
            <Markdown remarkPlugins={[remarkGfm]}>
              {messageData.message}
            </Markdown>
          </div>

          {/* Message Footer (Like and Bookmark) */}
          <div className="flex items-center justify-between border-t pt-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={"ghost"}
                    size={"sm"}
                    className="flex items-center space-x-1 cursor-pointer"
                    onClick={handleLikeClick}
                  >
                    <ThumbsUp
                      className={`h-5 w-5 ${
                        // If the likeFill is not white (i.e., message IS liked), then set text color for icon outline.
                        likeFill !== "#ffffff" ? "text-blue-500" : ""
                      } transition-colors duration-200 ease-in-out`}
                      fill={likeFill}
                    />
                    <span>{messageData.likes}</span>
                  </Button>
                </TooltipTrigger>

                <TooltipContent>
                  <p className="dark:text-foreground">Like this message</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

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
                    <span>{messageData.bookmarks}</span>
                  </Button>
                </TooltipTrigger>

                <TooltipContent>
                  <p className="dark:text-foreground">Bookmark this message</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </Card>
    );
  } else {
    const messageData = props.messageData;

    // For Unregistered Users or USER role.
    return (
      <Card className="p-5 hover:shadow-md transition-shadow">
        <div className="space-y-4">
          {/* Message Header (Author Details + Options) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-blue-100 dark:ring-blue-950">
                <AvatarImage src={""} />
                <AvatarFallback>?</AvatarFallback>
              </Avatar>

              <div>
                <p className="font-medium text-muted-foreground">
                  Anonymous Member
                </p>

                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{getTimeElapsed(messageData.timestamp)}</span>
                </div>
              </div>
            </div>

            {/* Message Options (USER only) */}
            {authUser?.role === Role.USER &&
              messageData.userId &&
              authUser.id === messageData.userId && (
                <TooltipProvider>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size={"sm"}
                        variant={"ghost"}
                        className="cursor-pointer"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem variant={"destructive"}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Message
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipProvider>
              )}
          </div>

          {/* Message Content */}
          <div className="prose prose-sm max-w-none prose-blue dark:prose-invert 2xl:prose-lg">
            <Markdown remarkPlugins={[remarkGfm]}>
              {messageData.message}
            </Markdown>
          </div>

          {/* Message Footer (Like and Bookmark) */}
          <div className="flex items-center justify-between border-t pt-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={"ghost"}
                    size={"sm"}
                    className="flex items-center space-x-1 cursor-pointer"
                    onClick={() => {
                      if (authUser) {
                        // Show the modal to become a member.
                      } else {
                        toast.warning("Please login to like messages.");
                      }
                    }}
                  >
                    <ThumbsUp className="h-5 w-5" />
                    <span>{messageData.likes}</span>
                  </Button>
                </TooltipTrigger>

                <TooltipContent>
                  <p className="dark:text-foreground">Like this message</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={"ghost"}
                    size={"sm"}
                    className="cursor-pointer flex items-center space-x-1"
                    onClick={() => {
                      if (authUser) {
                        // Show the modal to become a member.
                      } else {
                        toast.warning("Please login to bookmark messages.");
                      }
                    }}
                  >
                    <Bookmark className="h-5 w-5" />
                    <span>{messageData.bookmarks}</span>
                  </Button>
                </TooltipTrigger>

                <TooltipContent>
                  <p className="dark:text-foreground">Bookmark this message</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </Card>
    );
  }
}
