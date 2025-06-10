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
import { ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import { getUser } from "../auth/authSlice";
import { addNotification } from "../notification/notificationSlice";
import {
  useLikeMessageMutation,
  useUnlikeMessageMutation,
} from "@/app/services/messageApi";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import { useNavigate } from "react-router";
import { ErrorPageDetailsType } from "@/types";

interface LikeMessagePropsType {
  messageData:
    | GetMessagesWithoutAuthorResponseDto[number]
    | GetMessagesResponseDto[number];
}

export default function LikeMessage(props: LikeMessagePropsType) {
  const authUser = useAppSelector(getUser);
  const dispatch = useAppDispatch();

  const [
    likeMessage,
    {
      isSuccess: likeIsSuccess,
      isError: likeIsError,
      error: likeError,
      reset: likeReset,
    },
  ] = useLikeMessageMutation();

  const [
    unlikeMessage,
    {
      isSuccess: unlikeIsSuccess,
      isError: unlikeIsError,
      error: unlikeError,
      reset: unlikeReset,
    },
  ] = useUnlikeMessageMutation();

  const likeErrorDetails = useApiErrorHandler(likeError);
  const unlikeErrorDetails = useApiErrorHandler(unlikeError);

  const navigate = useNavigate();

  const [like, setLike] = useState<boolean>(
    "liked" in props.messageData && props.messageData.liked ? true : false
  );

  const [likeFill, setLikeFill] = useState<string>(
    "liked" in props.messageData && props.messageData.liked
      ? "#1e90ff" // Blue if liked, else white.
      : "#ffffff"
  );

  // Handle api success.
  useEffect(() => {
    if (likeIsSuccess) {
      likeReset();
    }
    if (unlikeIsSuccess) {
      unlikeReset();
    }
  }, [likeIsSuccess, unlikeIsSuccess, likeReset, unlikeReset]);

  // Handle api errors.
  useEffect(() => {
    // Api errors while liking the message.
    if (likeIsError) {
      if (
        likeErrorDetails.isNetworkError ||
        (likeErrorDetails.isApiError &&
          likeErrorDetails.statusCode &&
          likeErrorDetails.statusCode >= 500)
      ) {
        void navigate("/error", {
          state: {
            message: likeErrorDetails.message,
            statusCode: likeErrorDetails.statusCode ?? 500,
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
    }

    // Api errors while unliking the message.
    if (unlikeIsError) {
      if (
        unlikeErrorDetails.isNetworkError ||
        (unlikeErrorDetails.isApiError &&
          unlikeErrorDetails.statusCode &&
          unlikeErrorDetails.statusCode >= 500)
      ) {
        void navigate("/error", {
          state: {
            message: likeErrorDetails.message,
            statusCode: likeErrorDetails.statusCode ?? 500,
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
    }
  }, [
    likeIsError,
    unlikeIsError,
    likeErrorDetails,
    unlikeErrorDetails,
    navigate,
    dispatch,
  ]);

  const likeMessageHandler = async () => {
    // Unregistered Users and USER role cannot like messages.
    if (!authUser) {
      dispatch(
        addNotification({
          type: "warning",
          message: "Please login to like messages.",
        })
      );
      return;
    }

    if (authUser.role === Role.USER) {
      dispatch(
        addNotification({
          type: "warning",
          message:
            "Only Members can like messages. Please upgrade your account to become a Member.",
        })
      );
      return;
    }

    if (!like) {
      setLikeFill("#1e90ff");
      setLike(true);

      await likeMessage(props.messageData.messageId)
        .unwrap()
        .catch(() => {
          // Reverse UI changes if action fails.
          setLikeFill("#ffffff");
          setLike(false);
        });
    } else {
      setLikeFill("#ffffff");
      setLike(false);

      await unlikeMessage(props.messageData.messageId)
        .unwrap()
        .catch(() => {
          // Reverse UI changes if action fails.
          setLikeFill("#1e90ff");
          setLike(true);
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
            className="flex items-center space-x-1 cursor-pointer"
            onClick={() => {
              void likeMessageHandler();
            }}
          >
            <ThumbsUp
              className={`h-5 w-5 ${
                // If the message is liked, then set text color for icon outline.
                like ? "text-blue-500" : ""
              } transition-colors duration-200 ease-in-out`}
              fill={likeFill}
            />
            <span>{props.messageData.likes}</span>
          </Button>
        </TooltipTrigger>

        <TooltipContent>
          <p className="dark:text-foreground">Like this message</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
