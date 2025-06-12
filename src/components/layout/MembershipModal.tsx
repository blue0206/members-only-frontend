import { useMediaQuery } from "react-responsive";
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
import { Bookmark, Crown, Edit, Key, Lock, ThumbsUp, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/app/hooks";
import { useMemberRoleUpdateMutation } from "@/app/services/userApi";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import { addNotification } from "@/features/notification/notificationSlice";
import { useNavigate } from "react-router";
import { ErrorPageDetailsType } from "@/types";
import { ErrorCodes } from "@blue0206/members-only-shared-types";

interface MembershipModalPropsType {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function MembershipModal(props: MembershipModalPropsType) {
  const isDesktop = useMediaQuery({
    query: "(min-width: 768px)",
  });

  const [secretKey, setSecretKey] = useState<string>("");
  const [formError, setFormError] = useState<string>("");

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [memberRoleUpdate, { isSuccess, isError, error, reset }] =
    useMemberRoleUpdateMutation();
  const errorDetails = useApiErrorHandler(error);

  // Handle api success.
  useEffect(() => {
    if (isSuccess) {
      reset();
      dispatch(
        addNotification({
          type: "success",
          message: "Congratulations! You are now a member.",
        })
      );
      props.setOpenModal(false);
    }
  }, [isSuccess, dispatch, props, reset]);

  // Handle api errors.
  useEffect(() => {
    if (isError) {
      if (errorDetails.isApiError) {
        if (
          errorDetails.statusCode &&
          (errorDetails.statusCode >= 500 || errorDetails.statusCode === 404)
        ) {
          void navigate("/error", {
            state: {
              statusCode: errorDetails.statusCode,
              message: errorDetails.message,
            } satisfies ErrorPageDetailsType,
          });
        } else {
          switch (errorDetails.code) {
            case ErrorCodes.INCORRECT_SECRET_KEY: {
              setSecretKey("");
              setFormError(errorDetails.message);
              break;
            }
            default: {
              dispatch(
                addNotification({
                  type: "error",
                  message: errorDetails.message,
                })
              );
            }
          }
        }
      } else if (errorDetails.isValidationError) {
        dispatch(
          addNotification({
            type: "error",
            message: errorDetails.message,
          })
        );
      } else {
        void navigate("/error", {
          state: {
            statusCode: errorDetails.statusCode ?? 500,
            message: errorDetails.message,
          } satisfies ErrorPageDetailsType,
        });
      }
      reset();
    }
  }, [isError, errorDetails, dispatch, navigate, reset]);

  const upgradeHandler = async () => {
    if (secretKey) {
      setFormError("");
      await memberRoleUpdate({ secretKey });
    }
  };

  if (isDesktop) {
    return (
      <Dialog open={props.openModal} onOpenChange={props.setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto bg-blue-100 h-12 w-12 rounded-full flex items-center justify-center mb-4">
              <Crown className="h-6.5 w-6.5 text-blue-500" />
            </div>
            <DialogTitle className="text-center">Become a Member</DialogTitle>
            <DialogDescription className="text-center">
              Enter the secret key to unlock member privileges and see who's
              posting.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <div className="grid grid-cols-3 grid-rows-2 gap-4 text-center">
                <div className="flex flex-col items-center p-5 rounded-lg bg-blue-50">
                  <Lock className="h-5 w-5 text-blue-500 mb-1" />
                  <span className="text-xs font-medium dark:text-background">
                    See Authors
                  </span>
                </div>
                <div className="flex flex-col items-center p-5 rounded-lg bg-blue-50">
                  <Edit className="h-5 w-5 text-blue-500 mb-1" />
                  <span className="text-xs font-medium dark:text-background">
                    Edit Messages
                  </span>
                </div>
                <div className="flex flex-col items-center p-5 rounded-lg bg-blue-50">
                  <Crown className="h-5 w-5 text-blue-500 mb-1" />
                  <span className="text-xs font-medium dark:text-background">
                    Member Badge
                  </span>
                </div>
                <div className="flex flex-col items-center p-5 rounded-lg bg-blue-50">
                  <ThumbsUp className="h-5 w-5 text-blue-500 mb-1" />
                  <span className="text-xs font-medium dark:text-background">
                    Like Messages
                  </span>
                </div>

                {/* Dummy div to make a 2x2 grid */}
                <div className="self-center text-muted-foreground">
                  and much more!
                </div>

                <div className="flex flex-col items-center p-5 rounded-lg bg-blue-50">
                  <Bookmark className="h-5 w-5 text-blue-500 mb-1" />
                  <span className="text-xs font-medium dark:text-background">
                    Bookmark Messages
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                (Hint: The name of Kazuma's sword)
              </p>
              <div className="relative">
                <Input
                  id="secretKey"
                  type="password"
                  placeholder="Enter secret key"
                  className="pr-10"
                  aria-label="Secret Key"
                  value={secretKey}
                  onChange={(e) => {
                    setSecretKey(e.target.value);
                    if (formError) setFormError("");
                  }}
                />
                <Key className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-destructive text-sm">{formError}</p>
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button
              variant={"outline"}
              className="cursor-pointer"
              onClick={() => {
                props.setOpenModal(false);
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>

            <Button
              className="cursor-pointer"
              onClick={() => {
                void upgradeHandler();
              }}
              disabled={!secretKey}
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={props.openModal} onOpenChange={props.setOpenModal}>
      <DrawerContent className="p-0">
        <DrawerHeader>
          <div className="mx-auto bg-blue-100 h-12 w-12 rounded-full flex items-center justify-center mb-4">
            <Crown className="h-6.5 w-6.5 text-blue-500" />
          </div>
          <DrawerTitle className="text-center">Become a Member</DrawerTitle>
          <DrawerDescription className="text-center">
            Enter the secret key to unlock member privileges and see who's
            posting.
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-6 p-4">
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center p-5 rounded-lg bg-blue-50">
                <Lock className="h-5 w-5 text-blue-500 mb-1" />
                <span className="text-xs font-medium dark:text-background">
                  See Authors
                </span>
              </div>
              <div className="flex flex-col items-center p-5 rounded-lg bg-blue-50">
                <Edit className="h-5 w-5 text-blue-500 mb-1" />
                <span className="text-xs font-medium dark:text-background">
                  Edit Messages
                </span>
              </div>
              <div className="flex flex-col items-center p-5 rounded-lg bg-blue-50">
                <Crown className="h-5 w-5 text-blue-500 mb-1" />
                <span className="text-xs font-medium dark:text-background">
                  Member Badge
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              (Hint: The name of Kazuma's sword)
            </p>
            <div className="relative">
              <Input
                id="secretKey"
                type="password"
                placeholder="Enter secret key"
                className="pr-10"
                aria-label="Secret Key"
                value={secretKey}
                onChange={(e) => {
                  setSecretKey(e.target.value);
                  if (formError) setFormError("");
                }}
              />
              <Key className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-destructive text-sm">{formError}</p>
          </div>
        </div>

        <DrawerFooter className="sm:justify-between">
          <DrawerClose asChild>
            <Button
              variant={"outline"}
              className="cursor-pointer"
              onClick={() => {
                props.setOpenModal(false);
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </DrawerClose>

          <Button
            className="cursor-pointer"
            onClick={() => {
              void upgradeHandler();
            }}
            disabled={!secretKey}
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
