import { useEditMessageMutation } from "@/app/services/messageApi";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import useUiErrorHandler from "@/hooks/useUiErrorHandler";
import { GetMessagesResponseDto } from "@blue0206/members-only-shared-types";
import { Check, X } from "lucide-react";
import { useEffect } from "react";

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
      <Textarea
        value={editMessageContent}
        onChange={(e) => {
          setEditMessageContent(e.target.value);
        }}
        className="min-h-[150px]"
      />
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
          className="cursor-pointer w-[15ch] space-x-2"
          onClick={() => void handleMessageEdit()}
          disabled={isLoading}
        >
          {isLoading ? (
            <Spinner size={"small"} className="text-white" />
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
