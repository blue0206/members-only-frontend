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
import useUiErrorHandler from "@/hooks/useUiErrorHandler";
import { useMediaQuery } from "react-responsive";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const placeholderTextDesktop = `Write your message in Markdown...

**Bold text**, *italic text*, ~~strikethrough text~~, # headings, and [links](https://example.com) are supported!

You can also use:
- Lists
- > Blockquotes
- \`code snippets\`
- And much more!`;

const placeholderTextMobile = "Write your message...";

export default function MarkdownTextEditor() {
  const isDesktop = useMediaQuery({
    query: "(min-width: 611px)",
  });

  const [text, setText] = useState<string>("");

  const [createMessage, { isLoading, isSuccess, reset, error, isError }] =
    useCreateMessageMutation();

  const errorDetails = useApiErrorHandler(error);
  // Handle message send errors.
  useUiErrorHandler({
    errorDetails,
    isError,
    reset,
  });

  // Handle message send success.
  useEffect(() => {
    if (isSuccess) {
      setText("");
      reset();
    }
  }, [isSuccess, reset]);

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
              className="resize-none sm:min-h-[200px] min-h-[100px] overflow-auto max-h-[200px]"
              placeholder={
                isDesktop ? placeholderTextDesktop : placeholderTextMobile
              }
              value={text}
              onChange={(e) => {
                setText(e.target.value);
              }}
            />
          </TabsContent>
          <TabsContent value="preview">
            <div className="min-w-full w-full border-input sm:min-h-[200px] min-h-[100px] dark:bg-input/30 px-3 py-2 rounded-md border bg-transparent shadow-xs prose prose-blue dark:prose-invert lg:prose-lg">
              {text.trim() ? (
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  children={text}
                  components={{
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    code({ node, className, children, style, ref, ...props }) {
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
            className="cursor-pointer w-[16ch] sm:w-[18ch] flex items-center justify-center space-x-2"
            disabled={!text.trim() || isLoading}
            onClick={() => void sendHandler()}
          >
            {isLoading ? (
              <Spinner
                className="text-background dark:text-foreground"
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
