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
import { useState } from "react";
import { getUser } from "../auth/authSlice";
import { addNotification } from "../notification/notificationSlice";

interface LikeMessagePropsType {
  messageData:
    | GetMessagesWithoutAuthorResponseDto[number]
    | GetMessagesResponseDto[number];
}

export default function LikeMessage(props: LikeMessagePropsType) {
  const authUser = useAppSelector(getUser);
  const dispatch = useAppDispatch();

  const [like, setLike] = useState<boolean>(
    "liked" in props.messageData && props.messageData.liked ? true : false
  );

  const [likeFill, setLikeFill] = useState<string>(
    "liked" in props.messageData && props.messageData.liked
      ? "#1e90ff" // Blue if liked, else white.
      : "#ffffff"
  );

  const handleLikeClick = () => {
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
    } else {
      setLikeFill("#ffffff");
      setLike(false);
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
            onClick={handleLikeClick}
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
