import { store } from "./store";


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
