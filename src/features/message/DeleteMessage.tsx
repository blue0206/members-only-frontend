import { useAppDispatch } from "@/app/hooks";
import { useDeleteMessageMutation } from "@/app/services/messageApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { GetMessagesResponseDto } from "@blue0206/members-only-shared-types/dtos/message.dto";
import { AlertTriangle, MessageSquareX, X } from "lucide-react";
import { useMediaQuery } from "react-responsive";
import { addNotification } from "../notification/notificationSlice";
import { useNavigate } from "react-router";
import { isApiErrorPayload, isSerializedError } from "@/utils/errorUtils";
import { ErrorPageDetailsType } from "@/types";
import { Spinner } from "@/components/ui/spinner";

interface DeleteMessagePropsType {
  deleteMessageId: GetMessagesResponseDto[number]["messageId"];
  deleteDialog: boolean;
  setDeleteDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function DeleteMessage(props: DeleteMessagePropsType) {
  const isDesktop = useMediaQuery({
    query: "(min-width: 768px)",
  });

  const [deleteMessage, { reset, isLoading }] = useDeleteMessageMutation();
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  // Message delete handler.
  // Note that the entire error handling is manually performed here because
  // the message is optimistically deleted and hence, the component is removed
  // immediately from DOM, hence making all hooks ineffective.
  const handleMessageDelete = async () => {
    await deleteMessage(props.deleteMessageId)
      .unwrap()
      .then(() => {
        dispatch(
          addNotification({
            type: "success",
            message: "The message was deleted.",
          })
        );
      })
      .catch((error: unknown) => {
        if (
          isSerializedError(error) ||
          (isApiErrorPayload(error) &&
            error.statusCode < 500 &&
            error.statusCode !== 404)
        ) {
          dispatch(
            addNotification({
              type: "error",
              message:
                "The message could not be deleted. Please try again later.",
            })
          );
        } else {
          void navigate("/error", {
            state: {
              statusCode: 500,
              message:
                "An error occurred on the server. Please try again later.",
            } satisfies ErrorPageDetailsType,
          });
        }
      })
      .finally(() => {
        reset();
        props.setDeleteDialog(false);
      });
  };

  if (isDesktop) {
    return (
      <Dialog open={props.deleteDialog} onOpenChange={props.setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto bg-destructive/15 h-12 w-12 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6.5 w-6.5 text-destructive" />
            </div>
            <DialogTitle className="text-center">Delete Message</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete this message?
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 border rounded-md text-sm bg-destructive/15 text-red-800 dark:text-red-200">
            <p>
              <strong>Warning:</strong> This action cannot be undone.
            </p>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              variant={"outline"}
              className="cursor-pointer"
              onClick={() => {
                props.setDeleteDialog(false);
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>

            <Button
              variant={"destructive"}
              className="cursor-pointer w-[18ch] space-x-2"
              disabled={isLoading}
              onClick={() => {
                void handleMessageDelete();
              }}
            >
              {isLoading ? (
                <Spinner size={"small"} className="text-white" />
              ) : (
                <>
                  <MessageSquareX className="h-4 w-4 mr-2" />
                  <span>Delete Message</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={props.deleteDialog} onOpenChange={props.setDeleteDialog}>
      <DrawerContent>
        <DrawerHeader>
          <div className="mx-auto bg-destructive/15 h-12 w-12 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6.5 w-6.5 text-destructive" />
          </div>
          <DrawerTitle className="text-center">Delete Message</DrawerTitle>
          <DrawerDescription className="text-center">
            Are you sure you want to delete this message?
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 space-y-4">
          <div className="p-4 border rounded-md text-sm bg-destructive/15 text-red-800 dark:text-destructive">
            <p>
              <strong>Warning:</strong> This action cannot be undone.
            </p>
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button
              variant={"outline"}
              className="cursor-pointer"
              onClick={() => {
                props.setDeleteDialog(false);
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </DrawerClose>
          <Button
            variant={"destructive"}
            className="cursor-pointer"
            onClick={() => void handleMessageDelete()}
          >
            <MessageSquareX className="h-4 w-4 mr-2" />
            Delete Message
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
