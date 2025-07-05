import React, { useState } from "react";
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
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import EditMessage from "./EditMessage";
import DeleteMessage from "./DeleteMessage";
import LikeMessage from "./LikeMessage";
import BookmarkMessage from "./BookmarkMessage";
import { Badge } from "@/components/ui/badge";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

type MessagePropsType =
  | {
      messageData: GetMessagesResponseDto[number];
      withAuthor: true;
      editMessageId: number | null;
      setEditMessageId: React.Dispatch<React.SetStateAction<number | null>>;
      // ref: React.RefObject<HTMLDivElement | null> | null;
      ref: ((node: HTMLDivElement | null) => void) | null;
      bookmarkTimestamp?: string | Date;
    }
  | {
      messageData: GetMessagesWithoutAuthorResponseDto[number];
      withAuthor: false;
      // ref: React.RefObject<HTMLDivElement | null> | null;
      ref: ((node: HTMLDivElement | null) => void) | null;
      setEditMessageId?: never;
    };

function Message(props: MessagePropsType) {
  // Authenticated User
  const authUser = useAppSelector(getUser);

  const [editMessageContent, setEditMessageContent] = useState<string>("");
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);

  const handleEditOption = () => {
    if (props.setEditMessageId) {
      props.setEditMessageId(props.messageData.messageId);
      setEditMessageContent(props.messageData.message);
    }
  };

  if (props.withAuthor) {
    // For MEMBER and ADMIN roles.

    const user = props.messageData.user;
    const messageData = props.messageData;

    // Flags to allow edit and delete.
    const accessControlFlags = {
      edit: false,
      delete: false,
    };
    if (authUser?.role === Role.ADMIN) {
      accessControlFlags.edit = true;
      accessControlFlags.delete = true;
    } else {
      if (authUser?.id === user?.id) {
        accessControlFlags.edit = true;
        accessControlFlags.delete = true;
      }
    }

    return (
      <>
        <Card ref={props.ref} className="p-5 hover:shadow-md transition-shadow">
          <div className="space-y-4">
            {/* We edit message if:
                1. The user is member and the message is their own message. OR
                2. The user is admin (and hence, can edit any message).
            */}
            {props.editMessageId === messageData.messageId &&
            accessControlFlags.edit ? (
              <EditMessage
                setEditMessageId={props.setEditMessageId}
                currentMessageId={messageData.messageId}
                editMessageContent={editMessageContent}
                setEditMessageContent={setEditMessageContent}
              />
            ) : (
              <>
                {/* Message Header (Author Details + Options) */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-blue-100 dark:ring-blue-950">
                      <AvatarImage
                        src={user ? user.avatar ?? "" : ""}
                        loading={"lazy"}
                        alt="User Avatar"
                      />
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
                  <div className="flex flex-col-reverse sm:flex-row items-center space-x-2">
                    {props.bookmarkTimestamp && (
                      <Badge
                        variant={"secondary"}
                        className={`text-xs rounded-xl dark:text-foreground sm:inline-flex hidden`}
                      >
                        <>Added {getTimeElapsed(props.bookmarkTimestamp)}</>
                      </Badge>
                    )}

                    {Object.values(accessControlFlags).some((val) => val) && (
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
                            {accessControlFlags.edit && (
                              <DropdownMenuItem onClick={handleEditOption}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit Message
                              </DropdownMenuItem>
                            )}

                            {accessControlFlags.delete && (
                              <>
                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  variant={"destructive"}
                                  onClick={() => {
                                    setDeleteDialog(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Message
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TooltipProvider>
                    )}
                  </div>
                </div>

                {/* Message Content */}
                <div className="prose prose-sm max-w-none prose-blue dark:prose-invert 2xl:prose-lg">
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    children={messageData.message}
                    components={{
                      code({
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        node,
                        className,
                        children,
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        style,
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        ref,
                        ...props
                      }) {
                        const match = /language-(\w+)/.exec(className ?? "");
                        return match ? (
                          <SyntaxHighlighter
                            language={match[1]}
                            PreTag={"div"}
                            style={vscDarkPlus}
                            {...props}
                          >
                            {/* eslint-disable-next-line @typescript-eslint/no-base-to-string */}
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  />
                </div>

                {/* Message Footer (Like and Bookmark) */}
                <div className="flex items-center justify-between border-t pt-2">
                  <LikeMessage messageData={messageData} />

                  <BookmarkMessage messageData={messageData} />
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Delete Message Modal */}
        <DeleteMessage
          setDeleteDialog={setDeleteDialog}
          deleteDialog={deleteDialog}
          deleteMessageId={messageData.messageId}
        />
      </>
    );
  } else {
    const messageData = props.messageData;

    // For Unregistered Users or USER role.
    return (
      <>
        <Card ref={props.ref} className="p-5 hover:shadow-md transition-shadow">
          <div className="space-y-4">
            {/* Message Header (Author Details + Options) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-blue-100 dark:ring-blue-950">
                  {authUser && authUser.id === messageData.userId ? (
                    <>
                      <AvatarImage
                        src={authUser.avatar ?? ""}
                        loading={"lazy"}
                        alt="User Avatar"
                      />
                      <AvatarFallback>
                        <User />
                      </AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarImage src={undefined} />
                      <AvatarFallback>?</AvatarFallback>
                    </>
                  )}
                </Avatar>

                <div>
                  {authUser && authUser.id === messageData.userId ? (
                    <p className="font-medium text-muted-foreground">
                      {authUser.firstname} {authUser.middlename}{" "}
                      {authUser.lastname}
                      {getRoleBadge(authUser.role)}
                    </p>
                  ) : (
                    <p className="font-medium text-muted-foreground">
                      Anonymous Member
                    </p>
                  )}
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
                        <DropdownMenuItem
                          variant={"destructive"}
                          onClick={() => {
                            setDeleteDialog(true);
                          }}
                        >
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
              <Markdown
                remarkPlugins={[remarkGfm]}
                children={messageData.message}
                components={{
                  code({
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    node,
                    className,
                    children,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    style,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    ref,
                    ...props
                  }) {
                    const match = /language-(\w+)/.exec(className ?? "");
                    return match ? (
                      <SyntaxHighlighter
                        language={match[1]}
                        PreTag={"div"}
                        style={vscDarkPlus}
                        {...props}
                      >
                        {/* eslint-disable-next-line @typescript-eslint/no-base-to-string */}
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              />
            </div>

            {/* Message Footer (Like and Bookmark) */}
            <div className="flex items-center justify-between border-t pt-2">
              <LikeMessage messageData={messageData} />

              <BookmarkMessage messageData={messageData} />
            </div>
          </div>
        </Card>

        {/* Delete Message Modal */}
        <DeleteMessage
          deleteDialog={deleteDialog}
          setDeleteDialog={setDeleteDialog}
          deleteMessageId={messageData.messageId}
        />
      </>
    );
  }
}

export default React.memo(Message);
