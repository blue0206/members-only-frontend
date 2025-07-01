import { useEffect, useState } from "react";
import { useCreateMessageMutation } from "@/app/services/messageApi";
import { Card } from "@/components/ui/card";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Edit3,
  Eye,
  Command,
  CornerDownLeft,
  Send,
  SquareChevronUp,
} from "lucide-react";
import { CreateMessageRequestDto } from "@blue0206/members-only-shared-types";
import { Spinner } from "@/components/ui/spinner";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import useUiErrorHandler from "@/hooks/useUiErrorHandler";
import { useMediaQuery } from "react-responsive";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function MarkdownTextEditor() {
  const isDesktop = useMediaQuery({
    query: "(min-width: 768px)",
  });
  const isMac = navigator.userAgent.includes("Macintosh");

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
              className="resize-none min-h-[100px] sm:min-h-[50px] overflow-auto max-h-[200px]"
              placeholder={"Write your message..."}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
              }}
              maxLength={2000}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  (isMac ? e.metaKey : e.ctrlKey) &&
                  text.trim()
                ) {
                  void sendHandler();
                }
              }}
            />
            <div
              className={`w-full flex justify-end ${
                text.length < 200 ? "hidden" : ""
              }`}
            >
              <p className="text-sm text-muted-foreground">
                ({text.length} / 2000)
              </p>
            </div>
          </TabsContent>
          <TabsContent value="preview">
            <div className="min-w-full w-full border-input min-h-[100px] sm:min-h-[50px] dark:bg-input/30 px-3 py-2 rounded-md border bg-transparent shadow-xs prose prose-blue dark:prose-invert lg:prose-lg">
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
          <div className="flex items-center space-x-1">
            <p className="text-sm text-muted-foreground">Supports Markdown</p>
            {isDesktop &&
              (isMac ? (
                <>
                  <p className="text-sm text-muted-foreground">•</p>

                  <div className="text-sm text-muted-foreground flex items-center space-x-1">
                    <kbd className="kbd">
                      <Command className="h-4 w-4 mr-1" /> Return
                    </kbd>
                    <div>to Send</div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">•</p>

                  <div className="text-sm text-muted-foreground flex items-center space-x-1">
                    <kbd className="kbd">Ctrl + Enter</kbd>
                    <div>to Send</div>
                  </div>
                </>
              ))}
          </div>
          <Button
            className="cursor-pointer w-[16ch] sm:w-[18ch] flex items-center justify-center space-x-2"
            disabled={!text.trim() || isLoading || text.length > 2000}
            onClick={() => void sendHandler()}
          >
            {isLoading ? (
              <Spinner
                className="text-background dark:text-foreground"
                size={"small"}
              />
            ) : isDesktop ? (
              isMac ? (
                <>
                  <span className="mr-2">Send</span>
                  <div className="flex items-center space-x-0">
                    <Command className="h-4 w-4" />
                    <CornerDownLeft className="h-4 w-4" />
                  </div>
                </>
              ) : (
                <>
                  <span className="mr-2">Send</span>
                  <div className="flex items-center space-x-0">
                    <SquareChevronUp className="h-4 w-4" />
                    <CornerDownLeft className="h-4 w-4" />
                  </div>
                </>
              )
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                <span>Send Message</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
