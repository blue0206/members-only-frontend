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
} from "@blue0206/members-only-shared-types/dtos/message.dto";
import { Role } from "@blue0206/members-only-shared-types/enums/roles.enum";
import { Bookmark } from "lucide-react";
import { useEffect, useState } from "react";
import { getUser } from "../auth/authSlice";
import { addNotification } from "../notification/notificationSlice";
import {
  useAddBookmarkMutation,
  useRemoveBookmarkMutation,
} from "@/app/services/userApi";
import { useNavigate } from "react-router";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import { ErrorPageDetailsType } from "@/types";

interface BookmarkMessagePropsType {
  messageData:
    | GetMessagesWithoutAuthorResponseDto[number]
    | GetMessagesResponseDto[number];
}

export default function BookmarkMessage(props: BookmarkMessagePropsType) {
  const authUser = useAppSelector(getUser);
  const dispatch = useAppDispatch();

  const [
    addBookmark,
    {
      isSuccess: addBookmarkIsSuccess,
      isError: addBookmarkIsError,
      error: addBookmarkError,
      reset: addBookmarkReset,
    },
  ] = useAddBookmarkMutation();

  const [
    removeBookmark,
    {
      isSuccess: removeBookmarkIsSuccess,
      isError: removeBookmarkIsError,
      error: removeBookmarkError,
      reset: removeBookmarkReset,
    },
  ] = useRemoveBookmarkMutation();

  const addBookmarkErrorDetails = useApiErrorHandler(addBookmarkError);
  const removeBookmarkErrorDetails = useApiErrorHandler(removeBookmarkError);

  const navigate = useNavigate();

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

  // Handle api success.
  useEffect(() => {
    if (addBookmarkIsSuccess) {
      addBookmarkReset();
    }

    if (removeBookmarkIsSuccess) {
      removeBookmarkReset();
    }
  }, [
    addBookmarkIsSuccess,
    removeBookmarkIsSuccess,
    addBookmarkReset,
    removeBookmarkReset,
  ]);

  // Handle api errors.
  useEffect(() => {
    // Api error while adding bookmark.
    if (addBookmarkIsError) {
      if (
        addBookmarkErrorDetails.isNetworkError ||
        (addBookmarkErrorDetails.isApiError &&
          addBookmarkErrorDetails.statusCode &&
          (addBookmarkErrorDetails.statusCode >= 500 ||
            addBookmarkErrorDetails.statusCode === 404))
      ) {
        void navigate("/error", {
          state: {
            message: addBookmarkErrorDetails.message,
            statusCode: addBookmarkErrorDetails.statusCode ?? 500,
          } satisfies ErrorPageDetailsType,
        });
      } else {
        dispatch(
          addNotification({
            type: "error",
            message:
              "This action could not be completed. Please try again later.",
          })
        );
      }
      addBookmarkReset();
    }

    if (removeBookmarkIsError) {
      if (
        removeBookmarkErrorDetails.isNetworkError ||
        (removeBookmarkErrorDetails.isApiError &&
          removeBookmarkErrorDetails.statusCode &&
          (removeBookmarkErrorDetails.statusCode >= 500 ||
            removeBookmarkErrorDetails.statusCode === 404))
      ) {
        void navigate("/error", {
          state: {
            message: removeBookmarkErrorDetails.message,
            statusCode: removeBookmarkErrorDetails.statusCode ?? 500,
          } satisfies ErrorPageDetailsType,
        });
      } else {
        dispatch(
          addNotification({
            type: "error",
            message:
              "This action could not be completed. Please try again later.",
          })
        );
      }
      removeBookmarkReset();
    }
  }, [
    addBookmarkIsError,
    removeBookmarkIsError,
    addBookmarkErrorDetails,
    removeBookmarkErrorDetails,
    addBookmarkReset,
    removeBookmarkReset,
    dispatch,
    navigate,
  ]);

  const bookmarkMessageHandler = async () => {
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

      await addBookmark(props.messageData.messageId)
        .unwrap()
        .catch(() => {
          // Reverse UI changes if action fails.
          setBookmarkFill("#ffffff");
          setBookmark(false);
        });
    } else {
      setBookmarkFill("#ffffff");
      setBookmark(false);

      await removeBookmark(props.messageData.messageId)
        .unwrap()
        .catch(() => {
          // Reverse UI changes if action fails.
          setBookmarkFill("#ffc107");
          setBookmark(true);
        });
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
            onClick={() => {
              void bookmarkMessageHandler();
            }}
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
