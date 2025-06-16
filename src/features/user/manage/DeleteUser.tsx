import { useAppDispatch } from "@/app/hooks";
import { useDeleteUserMutation } from "@/app/services/userApi";
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
import { GetUsersResponseDto } from "@blue0206/members-only-shared-types";
import { AlertTriangle, UserX, X } from "lucide-react";
import { useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import { useNavigate } from "react-router";

interface DeleteUserPropsType {
  deleteDialog: boolean;
  setDeleteDialog: React.Dispatch<React.SetStateAction<boolean>>;
  user: GetUsersResponseDto[number] | null;
}

export default function DeleteUser(props: DeleteUserPropsType) {
  const isDesktop = useMediaQuery({
    query: "(min-width: 768px)",
  });

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [deleteUser, { isSuccess, isError, error, reset, isLoading }] =
    useDeleteUserMutation();

  const errorDetails = useApiErrorHandler(error);

  // Handle api call success.
  useEffect(() => {
    if (isSuccess) {
      dispatch(
        addNotification({
          type: "success",
          message: "User account deleted successfully.",
        })
      );
      reset();
      props.setDeleteDialog(false);
    }
  }, [isSuccess, dispatch, reset, props]);

  // Handle api call errors.
  useEffect(() => {
    if (isError) {
      void navigate("/error", {
        state: {
          message: errorDetails.message,
          statusCode: errorDetails.statusCode ?? 500,
        } satisfies ErrorPageDetailsType,
      });
      reset();
    }
  }, [isError, errorDetails, reset, navigate]);

  const deleteUserHandler = async () => {
    if (props.user) {
      await deleteUser({
        username: props.user.username,
      });
    }
  };

  if (isDesktop) {
    return (
      <Dialog open={props.deleteDialog} onOpenChange={props.setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto bg-destructive/15 h-12 w-12 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6.5 w-6.5 text-destructive" />
            </div>
            <DialogTitle className="text-center">
              Delete User Account
            </DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete the account with username{" "}
              <span className="font-semibold text-primary">
                @{props.user?.username}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 border rounded-md bg-destructive/15 text-red-800 dark:text-red-200 text-sm">
            <p>
              <strong>Warning:</strong> Deleting this user will remove all their
              data, including bookmarks, likes, and profile information
              (excluding messages).
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
              className="cursor-pointer w-[16ch] space-x-2"
              disabled={isLoading}
              onClick={() => {
                void deleteUserHandler();
              }}
            >
              {isLoading ? (
                <Spinner size={"small"} className="text-white" />
              ) : (
                <>
                  <UserX className="h-4 w-4" />
                  <span>Delete User</span>
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
          <DrawerTitle className="text-center">Delete User Account</DrawerTitle>
          <DrawerDescription className="text-center">
            Are you sure you want to delete the account with username{" "}
            <span className="font-semibold text-primary">
              @{props.user?.username}
            </span>
            ? This action cannot be undone.
          </DrawerDescription>
        </DrawerHeader>

        <div className="p-4 space-y-4">
          <div className="p-4 border rounded-md bg-destructive/15 text-red-800 dark:text-red-200 text-sm">
            <p>
              <strong>Warning:</strong> Deleting this user will remove all their
              data, including bookmarks, likes, and profile information
              (excluding messages).
            </p>
          </div>
        </div>

        <DrawerFooter className="sm:justify-between">
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
            className="cursor-pointer flex items-center justify-center"
            disabled={isLoading}
            onClick={() => {
              void deleteUserHandler();
            }}
          >
            {isLoading ? (
              <Spinner size={"small"} className="text-white ml-3.5" />
            ) : (
              <>
                <UserX className="h-4 w-4 mr-2" />
                <span>Delete User</span>
              </>
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
