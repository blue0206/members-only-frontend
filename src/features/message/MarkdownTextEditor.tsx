import { useEffect, useState } from "react";
import { useCreateMessageMutation } from "@/app/services/messageApi";
import { Card } from "@/components/ui/card";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Edit3, Eye, Send } from "lucide-react";
import { CreateMessageRequestDto } from "@blue0206/members-only-shared-types";
import { Spinner } from "@/components/ui/spinner";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import { useNavigate } from "react-router";
import { ErrorPageDetailsType } from "@/types";
import { toast } from "sonner";

export default function MarkdownTextEditor() {
  const [text, setText] = useState<string>("");

  const navigate = useNavigate();

  const [createMessage, { isLoading, isSuccess, reset, error, isError }] =
    useCreateMessageMutation();

  const errorDetails = useApiErrorHandler(error);

  // Handle message send success.
  useEffect(() => {
    if (isSuccess) {
      setText("");
      reset();
    }
  }, [isSuccess, reset]);

  // Handle message send errors.
  useEffect(() => {
    if (isError) {
      if (errorDetails.isApiError) {
        // Navigate to error page for server errors, else show toast.
        if (errorDetails.statusCode && errorDetails.statusCode >= 500) {
          void navigate("/error", {
            state: {
              statusCode: errorDetails.statusCode,
              message: errorDetails.message,
            } satisfies ErrorPageDetailsType,
          });
        } else {
          toast.error(errorDetails.message);
        }
        reset();
      } else if (errorDetails.isValidationError) {
        toast.error(errorDetails.message);
        reset();
      } else {
        // Navigate to error page for all other errors.
        void navigate("/error", {
          state: {
            statusCode: errorDetails.statusCode ?? 500,
            message: errorDetails.message,
          } satisfies ErrorPageDetailsType,
        });
        reset();
      }
    }
  }, [errorDetails, isError, navigate, reset]);

  const sendHandler = async () => {
    if (!text.trim()) return;

    const messageBody: CreateMessageRequestDto = {
      message: text,
    };
    await createMessage(messageBody);
  };

  return (
    <Card className="w-full h-full p-5">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Edit3 className="text-blue-500" />
          <h2 className="font-semibold">Share your thoughts</h2>
        </div>

        <Tabs defaultValue={"edit"} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger
              className="w-1/2 cursor-pointer space-x-2 flex items-center justify-center"
              value="edit"
            >
              <Edit3 />
              <span>Edit</span>
            </TabsTrigger>
            <TabsTrigger
              className="w-1/2 cursor-pointer space-x-2 flex items-center justify-center"
              value="preview"
            >
              <Eye />
              <span>Preview</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="w-full space-y-4">
            <Textarea
              className="resize-none min-h-[200px]"
              placeholder="Write your message in Markdown...

**Bold text**, *italic text*, ~~strikethrough text~~, # headings, and [links](https://example.com) are supported!

You can also use:
- Lists
- > Blockquotes
- `code snippets`
- And much more!"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
              }}
            />
          </TabsContent>
          <TabsContent value="preview">
            <div className="min-w-full w-full border-input min-h-[200px] dark:bg-input/30 px-3 py-2 rounded-md border bg-transparent shadow-xs prose prose-blue dark:prose-invert lg:prose-lg">
              {text.trim() ? (
                <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>
              ) : (
                <p className="text-muted-foreground italic text-sm">
                  Nothing to preview yet. Switch to Edit tab to write your
                  message.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">Supports Markdown</p>
          <Button
            className="cursor-pointer flex items-center justify-center space-x-2"
            disabled={!text.trim() || isLoading}
            onClick={() => void sendHandler()}
          >
            {isLoading ? (
              <Spinner
                className="text-background dark:text-foreground w-30"
                size={"small"}
              />
            ) : (
              <>
                <Send />
                <span>Send Message</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
