import { useAppDispatch } from "@/app/hooks";
import { useDeleteAvatarMutation } from "@/app/services/userApi";
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
import { Spinner } from "@/components/ui/spinner";
import { addNotification } from "@/features/notification/notificationSlice";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import { ErrorPageDetailsType } from "@/types";
import { AlertTriangle, FileX, X } from "lucide-react";
import { useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import { useNavigate } from "react-router";

interface DeleteAvatarPropsType {
  deleteDialog: boolean;
  setDeleteDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function DeleteAvatarModal(props: DeleteAvatarPropsType) {
  const isDesktop = useMediaQuery({
    query: "(min-width: 768px)",
  });

  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const [deleteAvatar, { isSuccess, isError, error, isLoading, reset }] =
    useDeleteAvatarMutation();

  const errorDetails = useApiErrorHandler(error);

  // Handle avatar delete success.
  useEffect(() => {
    if (isSuccess) {
      dispatch(
        addNotification({
          type: "success",
          message: "Your avatar has been deleted.",
        })
      );
      reset();
      props.setDeleteDialog(false);
    }
  }, [isSuccess, props, dispatch, reset]);

  // Handle avatar delete errors.
  useEffect(() => {
    if (isError) {
      // Only server errors are possible here, so we just
      // navigate to error page with error details.
      void navigate("/error", {
        state: {
          statusCode: errorDetails.statusCode ?? 500,
          message: errorDetails.message,
        } satisfies ErrorPageDetailsType,
      });
    }
  }, [isError, errorDetails, navigate]);

  const handleAvatarDelete = async () => {
    await deleteAvatar();
  };

  if (isDesktop) {
    return (
      <Dialog open={props.deleteDialog} onOpenChange={props.setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto bg-destructive/15 h-12 w-12 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6.5 w-6.5 text-destructive" />
            </div>
            <DialogTitle className="text-center text-lg">
              Delete Avatar
            </DialogTitle>
            <DialogDescription className="text-center text-md">
              Are you sure you want to delete your current avatar?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="sm:justify-between mt-5">
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
                void handleAvatarDelete();
              }}
            >
              {isLoading ? (
                <Spinner size={"small"} className="text-white" />
              ) : (
                <>
                  <FileX className="h-4 w-4 mr-2" />
                  <span>Delete Avatar</span>
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
          <DrawerTitle className="text-center text-lg">
            Delete Avatar
          </DrawerTitle>
          <DrawerDescription className="text-center text-md">
            Are you sure you want to delete your current avatar?
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="mt-5">
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
            disabled={isLoading}
            onClick={() => void handleAvatarDelete()}
          >
            {isLoading ? (
              <Spinner size={"small"} className="text-white ml-3.5" />
            ) : (
              <>
                <FileX className="h-4 w-4 mr-2" />
                Delete Avatar
              </>
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
