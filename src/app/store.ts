import authSlice from "@/features/auth/authSlice";
import uiSlice from "@/features/ui/uiSlice";
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { apiSlice } from "./services/api";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import authErrorListenerMiddleware from "./middlewares/authErrorListenerMiddleware";

// Combine all the reducers.
const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  auth: authSlice,
  ui: uiSlice,
});

// redux-persist config
const persistConfig = {
  key: "members-only-root",
  storage, // local storage
  version: 1,
  whitelist: ["auth", "ui"], // only persist auth and ui state
};

// Wrap the root reducer with the persisted reducer
// (with its config defined above in persistConfig).
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store.
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Ignore actions from redux-persist.
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .prepend(authErrorListenerMiddleware.middleware) // Error listener middleware.
      .concat(apiSlice.middleware), // RTK Query middleware.
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
