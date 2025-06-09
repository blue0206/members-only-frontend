import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";
import { ToastT } from "sonner";

interface NotificationType {
  message: string;
  type: ToastT["type"];
  id?: string; // If not provided, then set inside addNotification action.
  toastOptions: Omit<ToastT, "id">;
}

interface NotificationState {
  notifications: NotificationType[];
}

const initialState: NotificationState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<NotificationType>) => {
      const newNotification: NotificationType = {
        id: action.payload.id ?? nanoid(),
        ...action.payload,
      };
      state.notifications.push(newNotification);
      return state;
    },
    removeNotification: (
      state,
      action: PayloadAction<NotificationType["id"]>
    ) => {
      state.notifications = state.notifications.filter(
        (val) => val.id !== action.payload
      );
      return state;
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      return state;
    },
  },
  selectors: {
    getNotifications: (state) => state.notifications,
  },
});

export default notificationSlice.reducer;
export const { addNotification, removeNotification, clearAllNotifications } =
  notificationSlice.actions;
export const { getNotifications } = notificationSlice.selectors;
