import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@store/store";
import type { AuthUser } from "@pages/auth/Authapi";

interface Userstate {
  branchId: string;
  zoduId: string;
  accessToken: string | null;
  refreshToken: string | null;
  profile: AuthUser | null;
  isAuthenticated: boolean;
}

const initialState: Userstate = {
  branchId: "",
  zoduId: "",
  accessToken: null,
  refreshToken: null,
  profile: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "userSlice",
  initialState,
  reducers: {
    addUserData: (state, action: PayloadAction<{ branchId: string; zoduId: string }>) => {
      state.branchId = action.payload.branchId;
      state.zoduId = action.payload.zoduId;
    },
    setAuthData: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        profile: AuthUser;
        branchId?: string;
      }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.profile = action.payload.profile;
      state.zoduId = action.payload.profile?.zodu_id ?? state.zoduId;
      state.branchId = action.payload.profile?.branch_id ?? state.branchId;
      state.isAuthenticated = Boolean(
        action.payload.accessToken &&
        action.payload.refreshToken &&
        action.payload.profile
      );
    },
    clearAuthData: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.profile = null;
      state.isAuthenticated = false;
      state.branchId = "";
      state.zoduId = "";
    },
  },
});

export const { addUserData, setAuthData, clearAuthData } = userSlice.actions;

export const BranchId = (state: RootState) => state.user.branchId;
export const ZoduId = (state: RootState) => state.user.zoduId;
export const AuthToken = (state: RootState) => state.user.accessToken;
export const RefreshToken = (state: RootState) => state.user.refreshToken;
export const UserProfile = (state: RootState) => state.user.profile;
export const IsAuthenticated = (state: RootState) => state.user.isAuthenticated;

export default userSlice.reducer;
