import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserDto } from "@blue0206/members-only-shared-types";

interface AuthState {
  user: UserDto | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: "",
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthState>) => {
      state = action.payload;
      return state;
    },
  },
});

export default authSlice.reducer;
export const { setCredentials } = authSlice.actions;
