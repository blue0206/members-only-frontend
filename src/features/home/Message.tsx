import { getReadableTime } from "@/utils/timestampFormat";
import {
  GetMessagesWithoutAuthorResponseDto,
  GetMessagesResponseDto,
} from "@blue0206/members-only-shared-types";

type MessageProps =
  | GetMessagesWithoutAuthorResponseDto[number]
  | GetMessagesResponseDto[number];

export default function Message(props: MessageProps) {
  return (
    <div
      id={props.messageId.toString()}
      className="w-full rounded-xl bg-background p-4"
    >
      <div className="flex gap-4 border-b-2">
        {"username" in props ? (
          props.username ? (
            <div className="font-semibold text-md">{props.username}</div>
          ) : (
            <div className="text-muted-foreground italic text-md self-baseline-last">
              Deleted User
            </div>
          )
        ) : (
          <div className="blur-[0.5px] text-md text-muted-foreground italic self-baseline-last">
            Anonymous
          </div>
        )}
        <div className="text-muted-foreground text-xs font-semibold self-baseline-last">
          {"  " + getReadableTime(props.timestamp as string)}
        </div>
      </div>
      <div>
        {props.message}
        {"edited" in props && props.edited ? (
          <div className="text-muted-foreground text-xs">(edited)</div>
        ) : null}
      </div>
    </div>
  );
}
