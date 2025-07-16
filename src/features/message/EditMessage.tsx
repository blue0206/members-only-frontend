import { useEditMessageMutation } from "@/app/services/messageApi";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import useUiErrorHandler from "@/hooks/useUiErrorHandler";
import { GetMessagesResponseDto } from "@blue0206/members-only-shared-types";
import {
  X,
  Command,
  CornerDownLeft,
  Check,
  SquareChevronUp,
} from "lucide-react";
import { useEffect } from "react";
import { useMediaQuery } from "react-responsive";

interface EditMessagePropsType {
  currentMessageId: GetMessagesResponseDto[number]["messageId"];
  setEditMessageId: React.Dispatch<React.SetStateAction<number | null>>;
  editMessageContent: string;
  setEditMessageContent: React.Dispatch<React.SetStateAction<string>>;
}

export default function EditMessage({
  editMessageContent,
  setEditMessageContent,
  ...props
}: EditMessagePropsType) {
  const isDesktop = useMediaQuery({
    query: "(min-width: 768px)",
  });
  const isMac = navigator.userAgent.includes("Macintosh");

  // Message Edit Mutation
  const [editMessage, { isSuccess, reset, isError, error, isLoading }] =
    useEditMessageMutation();
  const errorDetails = useApiErrorHandler(error);

  // Handle message edit errors
  useUiErrorHandler({
    isError,
    errorDetails,
    reset,
  });

  // Handle message edit success.
  useEffect(() => {
    if (isSuccess) {
      reset();
      props.setEditMessageId(null);
    }
  }, [isSuccess, reset, props]);

  const handleMessageEdit = async () => {
    await editMessage({
      messageId: props.currentMessageId,
      messageBody: {
        newMessage: editMessageContent,
      },
    });
  };

  return (
    <>
      <div>
        <Textarea
          value={editMessageContent}
          onChange={(e) => {
            setEditMessageContent(e.target.value);
          }}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              (isMac ? e.metaKey : e.ctrlKey) &&
              editMessageContent.trim()
            ) {
              void handleMessageEdit();
            }
          }}
          className="min-h-[150px]"
        />
        {isDesktop && (
          <div className="w-full flex justify-between items-center mt-2">
            <div className="flex items-center space-x-1">
              <p className="text-sm text-muted-foreground">Supports Markdown</p>
              {isMac ? (
                <>
                  <p className="text-sm text-muted-foreground">•</p>

                  <div className="text-sm text-muted-foreground flex items-center space-x-1">
                    <kbd className="kbd">
                      <Command className="h-4 w-4 mr-1" /> Return
                    </kbd>
                    <div>to Save</div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">•</p>

                  <div className="text-sm text-muted-foreground flex items-center space-x-1">
                    <kbd className="kbd">Ctrl + Enter</kbd>
                    <div>to Save</div>
                  </div>
                </>
              )}
            </div>

            <p
              className={`text-sm text-muted-foreground ${
                editMessageContent.length < 200 ? "hidden" : ""
              }`}
            >
              ({editMessageContent.length} / 2000)
            </p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant={"outline"}
          size={"sm"}
          className="cursor-pointer"
          onClick={() => {
            props.setEditMessageId(null);
          }}
        >
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>

        <Button
          size={"sm"}
          className="cursor-pointer w-[18ch] space-x-2"
          onClick={() => void handleMessageEdit()}
          disabled={isLoading || editMessageContent.length > 2000}
        >
          {isLoading ? (
            <Spinner size={"small"} className="text-white" />
          ) : isDesktop ? (
            isMac ? (
              <>
                <span className="mr-2">Save</span>
                <div className="flex items-center space-x-0">
                  <Command className="h-4 w-4" />
                  <CornerDownLeft className="h-4 w-4" />
                </div>
              </>
            ) : (
              <>
                <span className="mr-2">Save</span>
                <div className="flex items-center space-x-0">
                  <SquareChevronUp className="h-4 w-4" />
                  <CornerDownLeft className="h-4 w-4" />
                </div>
              </>
            )
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              <span>Save Changes</span>
            </>
          )}
        </Button>
      </div>
    </>
  );
}
