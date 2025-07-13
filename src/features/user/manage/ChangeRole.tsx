import { useAppDispatch } from "@/app/hooks";
import { useSetRoleMutation } from "@/app/services/userApi";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { addNotification } from "@/features/notification/notificationSlice";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import { ErrorPageDetailsType } from "@/types";
import { getRoleBadge } from "@/utils/getRoleBadge";
import { GetUsersResponseDto } from "@blue0206/members-only-shared-types/dtos/user.dto";
import { Role } from "@blue0206/members-only-shared-types/enums/roles.enum";
import { Check, Crown, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useNavigate } from "react-router";

interface ChangeRolePropsType {
  changeRoleDialog: boolean;
  setChangeRoleDialog: React.Dispatch<React.SetStateAction<boolean>>;
  user: GetUsersResponseDto[number] | null;
}

export default function ChangeRole(props: ChangeRolePropsType) {
  const isDesktop = useMediaQuery({
    query: "(min-width: 768px)",
  });

  const [role, setRole] = useState<Role>(
    props.user ? props.user.role : Role.USER
  );

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [setRoleMutation, { isSuccess, isError, error, reset, isLoading }] =
    useSetRoleMutation();
  const errorDetails = useApiErrorHandler(error);

  // Reset the role state when the dialog opens or the user prop changes.
  useEffect(() => {
    if (props.user && props.changeRoleDialog) {
      setRole(props.user.role);
    }
  }, [props.user, props.changeRoleDialog]);

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
  }, [isError, errorDetails, navigate, reset]);

  // Handle api call success.
  useEffect(() => {
    if (isSuccess) {
      dispatch(
        addNotification({
          type: "success",
          message: "User role updated successfully.",
        })
      );
      reset();
      props.setChangeRoleDialog(false);
    }
  }, [isSuccess, dispatch, props.user, reset, role, props]);

  const updateRoleHandler = async () => {
    if (props.user) {
      await setRoleMutation({
        username: props.user.username,
        role,
      });
    }
  };

  if (isDesktop) {
    return (
      <Dialog
        open={props.changeRoleDialog}
        onOpenChange={props.setChangeRoleDialog}
      >
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto bg-blue-100 h-12 w-12 rounded-full flex items-center justify-center mb-4">
              <Crown className="h-6.5 w-6.5 text-primary" />
            </div>
            <DialogTitle className="text-center">Change User Role</DialogTitle>
            <DialogDescription className="text-center">
              Update the role and permissions for{" "}
              <span className="font-semibold text-primary">
                @{props.user?.username}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-center">Current Role</p>
              <div className="flex items-center justify-center">
                {props.user && getRoleBadge(props.user.role)}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">New Role</p>
              <Select
                value={role as string}
                onValueChange={(value) => {
                  setRole(value as Role);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value={Role.ADMIN}>ADMIN</SelectItem>
                  <SelectItem value={Role.MEMBER}>MEMBER</SelectItem>
                  <SelectItem value={Role.USER}>USER</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 text-sm">
              {role === Role.ADMIN && (
                <div className="p-3.5 rounded-md border bg-red-100 text-red-800 dark:bg-destructive/15 dark:text-red-100 border-red-200">
                  <p className="font-medium">
                    Administrator permissions include:
                  </p>
                  <ul className="list-disc list-inside mt-1">
                    <li>Delete user messages</li>
                    <li>Edit user messages</li>
                    <li>Delete user accounts</li>
                    <li>Manage user roles</li>
                    <li>All member permissions</li>
                  </ul>
                </div>
              )}
              {role === Role.MEMBER && (
                <div className="p-3.5 rounded-md border bg-blue-100 text-blue-800 border-blue-200 dark:bg-primary/25 dark:text-blue-100">
                  <p className="font-medium">Member permissions include:</p>
                  <ul className="list-disc list-inside mt-1">
                    <li>See message authors</li>
                    <li>Edit own messages</li>
                    <li>Bookmark and like messages</li>
                    <li>Know edited messages</li>
                    <li>All user permissions</li>
                  </ul>
                </div>
              )}
              {role === Role.USER && (
                <div className="p-3.5 rounded-md border bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100">
                  <p className="font-medium">User permissions include:</p>
                  <ul className="list-disc list-inside mt-1">
                    <li>Post and delete messages</li>
                    <li>View messages (without authors)</li>
                    <li>Session management</li>
                    <li>Update profile</li>
                    <li>Delete own account</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant={"outline"}
              className="cursor-pointer"
              onClick={() => {
                props.setChangeRoleDialog(false);
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              className="cursor-pointer w-[15ch] space-x-2"
              disabled={isLoading || role === props.user?.role}
              onClick={() => {
                void updateRoleHandler();
              }}
            >
              {isLoading ? (
                <Spinner size={"small"} className="text-white" />
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Update Role</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer
      open={props.changeRoleDialog}
      onOpenChange={props.setChangeRoleDialog}
    >
      <DrawerContent>
        <DrawerHeader>
          <div className="mx-auto bg-blue-100 h-12 w-12 rounded-full flex items-center justify-center mb-4">
            <Crown className="h-6.5 w-6.5 text-primary" />
          </div>
          <DrawerTitle className="text-center">Change User Role</DrawerTitle>
          <DrawerDescription className="text-center">
            Update the role and permissions for{" "}
            <span className="font-semibold text-primary">
              @{props.user?.username}
            </span>
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-4 p-4 pb-0">
          <div className="space-y-2">
            <p className="text-sm font-medium text-center">Current Role</p>
            <div className="flex items-center justify-center">
              {props.user && getRoleBadge(props.user.role)}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">New Role</p>
            <Select
              value={role as string}
              onValueChange={(value) => {
                setRole(value as Role);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={Role.ADMIN}>ADMIN</SelectItem>
                <SelectItem value={Role.MEMBER}>MEMBER</SelectItem>
                <SelectItem value={Role.USER}>USER</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button
              variant={"outline"}
              className="cursor-pointer"
              onClick={() => {
                props.setChangeRoleDialog(false);
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </DrawerClose>
          <Button
            className="cursor-pointer flex items-center justify-center"
            disabled={isLoading || role === props.user?.role}
            onClick={() => {
              void updateRoleHandler();
            }}
          >
            {isLoading ? (
              <Spinner size={"small"} className="text-white ml-3.5" />
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                <span>Update Role</span>
              </>
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
