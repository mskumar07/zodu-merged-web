import { useSelector } from "react-redux";
import { store } from "./store";
import type { RootState } from "./store";


type PersistedUserState = {
  zoduId?: string;
  branchId?: string;
  accessToken?: string | null;
};

function readPersistedUserState(): PersistedUserState | null {
  try {
    const raw = localStorage.getItem("zodu_user_state");
    return raw ? (JSON.parse(raw) as PersistedUserState) : null;
  } catch {
    return null;
  }
}


/** Reactive hook — re-renders the caller whenever branchId / zoduId changes. */
export function useTenantContext() {
  return useSelector((state: RootState) => ({
    zoduId:   state.user.zoduId,
    branchId: state.user.branchId,
    profile:  state.user.profile,
    company:  state.user.company,
  }));
}

export function getTenantContext() {
  const state = store.getState().user;
  const persistedState = readPersistedUserState();



  return {
    zoduId:
      state.zoduId ||
      persistedState?.zoduId,
    branchId:
      state.branchId ||
      persistedState?.branchId ,
    profile: state.profile,
    company: state.company,
  };
}



export function getAccessToken() {
  const state = store.getState().user;
  const persistedState = readPersistedUserState();

  return (
    state.accessToken ||
    persistedState?.accessToken ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token")
  );
}
