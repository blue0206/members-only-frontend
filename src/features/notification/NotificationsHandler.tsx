import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useEffect } from "react";
import { getNotifications, removeNotification } from "./notificationSlice";
import { toast } from "sonner";

// This component is responsible for displaying notifications
// based on the notifications present in the Redux store.
export default function NotificationsHandler() {
  const notifications = useAppSelector(getNotifications);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (notifications.length > 0) {
      const selectedNotification = notifications[0];

      switch (selectedNotification.type) {
        case "success": {
          toast.success(selectedNotification.message, {
            id: selectedNotification.id,
            ...selectedNotification.toastOptions,
          });
          break;
        }
        case "error": {
          toast.error(selectedNotification.message, {
            id: selectedNotification.id,
            ...selectedNotification.toastOptions,
          });
          break;
        }
        case "info": {
          toast.info(selectedNotification.message, {
            id: selectedNotification.id,
            ...selectedNotification.toastOptions,
          });
          break;
        }
        case "warning": {
          toast.warning(selectedNotification.message, {
            id: selectedNotification.id,
            ...selectedNotification.toastOptions,
          });
          break;
        }
        case "loading": {
          toast.loading(selectedNotification.message, {
            id: selectedNotification.id,
            ...selectedNotification.toastOptions,
          });
          break;
        }
        default: {
          toast(selectedNotification.message, {
            id: selectedNotification.id,
            ...selectedNotification.toastOptions,
          });
        }
      }
      dispatch(removeNotification(selectedNotification.id));
    }
  }, [dispatch, notifications]);

  return null;
}
