import { useAppDispatch } from "@/app/hooks";
import { useRevokeAllSessionsMutation } from "@/app/services/authApi";
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
import { AlertTriangle, MonitorX, LogOut, X } from "lucide-react";
import { useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import { useNavigate } from "react-router";

interface RevokeSessionPropsType {
  revokeAllDialog: boolean;
  setRevokeAllDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function RevokeAllSessions(props: RevokeSessionPropsType) {
  const isDesktop = useMediaQuery({
    query: "(min-width: 768px)",
  });

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [revokeAllSessions, { isSuccess, isError, error, reset, isLoading }] =
    useRevokeAllSessionsMutation();

  const errorDetails = useApiErrorHandler(error);

  // Handle revoke session success.
  useEffect(() => {
    if (isSuccess) {
      dispatch(
        addNotification({
          type: "success",
          message: "All sessions have been revoked.",
        })
      );
      reset();
      props.setRevokeAllDialog(false);
    }
  }, [isSuccess, dispatch, reset, props]);

  // Handle revoke session error.
  useEffect(() => {
    if (isError) {
      void navigate("/error", {
        state: {
          statusCode: errorDetails.statusCode ?? 500,
          message: errorDetails.message,
        } satisfies ErrorPageDetailsType,
      });
      reset();
    }
  }, [isError, errorDetails, navigate, reset]);

  const handleSessionRevoke = async () => {
    await revokeAllSessions();
  };

  if (isDesktop) {
    return (
      <Dialog
        open={props.revokeAllDialog}
        onOpenChange={props.setRevokeAllDialog}
      >
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto bg-destructive/15 h-12 w-12 rounded-full flex items-center justify-center mb-4">
              <LogOut className="h-6.5 w-6.5 text-destructive" />
            </div>
            <DialogTitle className="text-center text-lg">
              Revoke All Other Sessions
            </DialogTitle>
            <DialogDescription className="text-center text-md">
              This will log you out of all other devices and sessions. You'll
              remain logged in on this device.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="sm:justify-between mt-5">
            <Button
              variant={"outline"}
              className="cursor-pointer"
              onClick={() => {
                props.setRevokeAllDialog(false);
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
                void handleSessionRevoke();
              }}
            >
              {isLoading ? (
                <Spinner size={"small"} className="text-white" />
              ) : (
                <>
                  <MonitorX className="h-4 w-4 mr-2" />
                  <span>Revoke Sessions</span>
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
      open={props.revokeAllDialog}
      onOpenChange={props.setRevokeAllDialog}
    >
      <DrawerContent>
        <DrawerHeader>
          <div className="mx-auto bg-destructive/15 h-12 w-12 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6.5 w-6.5 text-destructive" />
          </div>
          <DrawerTitle className="text-center text-lg">
            Revoke All Other Sessions
          </DrawerTitle>
          <DrawerDescription className="text-center text-md">
            This will log you out of all other devices and sessions. You'll
            remain logged in on this device.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="mt-5">
          <DrawerClose asChild>
            <Button
              variant={"outline"}
              className="cursor-pointer"
              onClick={() => {
                props.setRevokeAllDialog(false);
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
            onClick={() => void handleSessionRevoke()}
          >
            {isLoading ? (
              <Spinner size={"small"} className="text-white ml-3.5" />
            ) : (
              <>
                <MonitorX className="h-4 w-4 mr-2" />
                Revoke Sessions
              </>
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
