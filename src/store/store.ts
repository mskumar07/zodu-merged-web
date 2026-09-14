import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import POSReducer from "./slices/POSslice";
import userReducer from "./slices/userSlice";
import { apiSlice } from "./services/apiSlice";
import {
  CURRENT_USER_STATE_VERSION,
  INITIAL_USER_STATE,
  USER_STORAGE_KEY,
  reconcilePersistedUserState,
  toPersistedUserState,
  type LoadUserStateResult,
} from "./persistedUserState";

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    // Private-mode/quota failures must not stop the app from booting.
    return null;
  }
}

/**
 * Restores the persisted `user` slice.
 *
 * The parsing and trust decisions live in reconcilePersistedUserState (pure,
 * unit tested); this only supplies the strings and reports what happened.
 */
export function loadUserState(): LoadUserStateResult {
  const result = reconcilePersistedUserState(readStorage(USER_STORAGE_KEY), {
    // Tokens have always also been written under these standalone keys by
    // tokenStore, and are the only thing left for sessions whose blob predates
    // the combined format.
    accessToken: readStorage("access_token"),
    refreshToken: readStorage("refresh_token"),
  });

  // Rollout health: how many sessions come back stale after a deploy, and
  // whether anyone is hitting corrupt storage.
  if (result.outcome === "restored-stale") {
    console.warn(
      `[session] persisted user state is v${result.storedVersion}, expected v${CURRENT_USER_STATE_VERSION} — ` +
        "permissions, invoice and POS settings dropped and will be refetched before the app renders."
    );
  } else if (result.outcome === "invalid-json") {
    console.warn("[session] persisted user state was unreadable — starting logged out.");
  }

  return result;
}

export const store = configureStore({
  reducer: {
    pos: POSReducer,
    user: userReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  preloadedState: {
    // A concrete slice state either way: reconcile returns undefined when there
    // is nothing to restore, which is exactly the slice's initial state.
    user: loadUserState().state ?? INITIAL_USER_STATE,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

store.subscribe(() => {
  try {
    // Only the allow-listed fields are written, stamped with the schema version
    // the next boot compares against. Transient sync bookkeeping stays in memory.
    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(toPersistedUserState(store.getState().user))
    );
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
