import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserDto, Role } from "@blue0206/members-only-shared-types";

export interface AuthState {
  user: UserDto | null;
  accessToken: string | null;
  authStatus: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: "",
  authStatus: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthState>) => {
      state = action.payload;
      return state;
    },
    clearCredentials: (state) => {
      state = initialState;
      return state;
    },
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      return state;
    },
    updateUserDetails: (state, action: PayloadAction<UserDto>) => {
      state.user = action.payload;
      return state;
    },
    updateUserRole: (state, action: PayloadAction<Role>) => {
      if (state.user) {
        state.user.role = action.payload;
      }
      return state;
    },
    setUserAvatar: (state, action: PayloadAction<UserDto["avatar"]>) => {
      if (state.user) {
        state.user.avatar = action.payload;
      }
      return state;
    },
  },
  selectors: {
    isAuthenticated: (state) => state.authStatus,
    getUserAvatar: (state) => state.user?.avatar,
    getUserRole: (state) => state.user?.role,
    getUser: (state) => state.user,
    getAccessToken: (state) => state.accessToken,
  },
});

export default authSlice.reducer;
export const {
  setCredentials,
  clearCredentials,
  updateAccessToken,
  updateUserDetails,
  updateUserRole,
  setUserAvatar,
} = authSlice.actions;
export const {
  isAuthenticated,
  getUserAvatar,
  getUserRole,
  getUser,
  getAccessToken,
} = authSlice.selectors;
