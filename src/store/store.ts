import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import POSReducer from "./slices/POSslice";
import userReducer from "./slices/userSlice";
import { apiSlice } from "./services/apiSlice";

const USER_STORAGE_KEY = "zodu_user_state";

function loadUserState() {
  try {
    const savedState = localStorage.getItem(USER_STORAGE_KEY);
    const parsedState = savedState ? JSON.parse(savedState) : undefined;
    const accessToken = parsedState?.accessToken ?? localStorage.getItem("access_token");
    const refreshToken = parsedState?.refreshToken ?? localStorage.getItem("refresh_token");
    const profile = parsedState?.profile ?? null;

    if (!accessToken || !refreshToken || !profile) {
      return undefined;
    }

    return {
      ...parsedState,
      accessToken,
      refreshToken,
      profile,
      zoduId: parsedState?.zoduId ?? profile.zodu_id ?? "",
      branchId: parsedState?.branchId ?? profile.branch_id ?? "",
      isAuthenticated: true,
    };
  } catch {
    return undefined;
  }
}

export const store = configureStore({
  reducer: {
    pos: POSReducer,
    user: userReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  preloadedState: {
    user: loadUserState(),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

store.subscribe(() => {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(store.getState().user));
  } catch {
    // Ignore storage write failures so the app keeps working.
  }
});

// Types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
