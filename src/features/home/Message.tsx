import React from "react";
import { getTimeElapsed } from "@/utils/timestampFormat";
import {
  GetMessagesWithoutAuthorResponseDto,
  GetMessagesResponseDto,
  Role,
} from "@blue0206/members-only-shared-types";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Clock, MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import { getRoleBadge } from "@/utils/getRoleBadge";
import { TooltipProvider } from "@/components/ui/tooltip";
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
        </div>
      </Card>
    );
  } else {
    // For Unregistered Users or USER role.
    return (
      <>
        <h1>USER / Unregistered</h1>
        {props.messageData.message}
      </>
    );
  }
}
