import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserDto } from "@blue0206/members-only-shared-types";

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
  },
  selectors: {
    isAuthenticated: (state) => state.authStatus,
  },
});

export default authSlice.reducer;
export const { setCredentials, clearCredentials } = authSlice.actions;
export const { isAuthenticated } = authSlice.selectors;
