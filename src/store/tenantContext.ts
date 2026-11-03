import { shallowEqual, useSelector } from "react-redux";
import { store } from "./store";
import type { RootState } from "./store";


type PersistedUserState = {
  zoduId?: string;
  branchId?: string;
  businessType?: string;
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
    company: state.user.company,
    businessType: state.user.businessType,
  }), shallowEqual);
}

export function getTenantContext() {
  const state = store.getState().user;
  const persistedState = readPersistedUserState();

  const businessType = state.businessType || persistedState?.businessType || "";

  return {
    zoduId: state.zoduId || persistedState?.zoduId,
    branchId: state.branchId || persistedState?.branchId,
    businessType,
    profile: state.profile,
    company: state.company,
  };
}



// The access token is held in memory by utils/authSession (never in storage).
// Callers that set Authorization themselves get the current one; the session
// interceptor sets it on every API request anyway.
export { getAccessToken } from "@utils/authSession";
