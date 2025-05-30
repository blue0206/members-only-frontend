import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Theme = "light" | "dark" | "system";

interface UiState {
  theme: Theme;
}

const initialState: UiState = {
  theme: "system",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },
  },
  selectors: {
    getTheme: (state) => state.theme,
  },
});

export default uiSlice.reducer;
export const { setTheme } = uiSlice.actions;
export const { getTheme } = uiSlice.selectors;
