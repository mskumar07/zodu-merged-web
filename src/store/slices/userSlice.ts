import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser, CompanyDetails, CompanyWithBranches, InvoiceSettings, PosSettings, RoleAccessItem } from "@pages/auth/Authapi";
import {
  INITIAL_USER_STATE,
  type PermissionsSyncStatus,
  type Userstate,
} from "@store/persistedUserState";

// The slice's shape and its persisted form live together in persistedUserState
// so the boot-time reconciliation can be unit tested without the store.
export type { PermissionsSyncStatus, Userstate };

const initialState: Userstate = INITIAL_USER_STATE;

/**
 * What the selectors below need off the root state.
 *
 * Deliberately not `RootState` from the store: the store's type is inferred
 * from this reducer, so importing it back here closes a type cycle that
 * configureStore then cannot resolve. Every RootState is structurally one of
 * these, so callers are unaffected.
 */
type UserRootState = { user: Userstate };

const userSlice = createSlice({
  name: "userSlice",
  initialState,
  reducers: {
    addUserData: (state, action: PayloadAction<{ branchId: string; branchName: string; zoduId: string; businessType?: string }>) => {
      state.branchId = action.payload.branchId;
      state.branchName = action.payload.branchName;
      state.zoduId = action.payload.zoduId;
      state.businessType = action.payload.businessType ?? "";
    },
    setAuthData: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        profile: AuthUser;
        company?: CompanyDetails | null;
        companies?: CompanyWithBranches[];
        roleAccess?: RoleAccessItem[];
      }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.profile = action.payload.profile;
      state.company = action.payload.company ?? state.company;
      state.companies = action.payload.companies ?? state.companies;
      state.roleAccess = action.payload.roleAccess ?? state.roleAccess;
      // zoduId, branchId, branchName are set via addUserData after branch selection
      state.isAuthenticated = Boolean(
        action.payload.accessToken &&
        action.payload.refreshToken &&
        action.payload.profile
      );
      // A fresh login is the one moment permissions are known to be current, so
      // nothing has to be reconciled behind it.
      state.permissionsStatus = "ready";
      state.permissionsBlocking = false;
    },
    setCompanies: (state, action: PayloadAction<CompanyWithBranches[]>) => {
      state.companies = action.payload;
    },
    setRoleAccess: (state, action: PayloadAction<RoleAccessItem[]>) => {
      state.roleAccess = action.payload;
    },
    setInvoiceSettings: (state, action: PayloadAction<InvoiceSettings | null>) => {
      state.invoiceSettings = action.payload;
    },
    setPosSettings: (state, action: PayloadAction<PosSettings | null>) => {
      state.posSettings = action.payload;
    },

    // ── Boot-time reconciliation of a restored session ──────────────────
    // Driven by useReconcilePersistedSession: the persisted permission fields
    // are an optimistic cache, so every restored session refetches them.

    permissionsRefreshStarted: (state) => {
      state.permissionsStatus = "refreshing";
    },
    /** Called after setRoleAccess/setInvoiceSettings/setPosSettings have landed. */
    permissionsRefreshSucceeded: (state) => {
      state.permissionsStatus = "ready";
      state.permissionsBlocking = false;
    },
    /**
     * The refetch failed (offline, 401, server error). The session is left
     * intact — we never log a valid user out over a failed refresh — but if
     * there was no trustworthy cache to fall back on, `permissionsBlocking`
     * stays true and the caller shows a retry instead of rendering the app
     * with permissions that never loaded.
     */
    permissionsRefreshFailed: (state) => {
      state.permissionsStatus = "error";
    },
    clearAuthData: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.profile = null;
      state.company = null;
      state.companies = [];
      state.roleAccess = [];
      state.invoiceSettings = null;
      state.posSettings = null;
      state.isAuthenticated = false;
      state.branchId = "";
      state.branchName = "";
      state.zoduId = "";
      state.businessType = "";
      state.permissionsStatus = "ready";
      state.permissionsBlocking = false;
    },
  },
});

export const {
  addUserData,
  setAuthData,
  setCompanies,
  setRoleAccess,
  setInvoiceSettings,
  setPosSettings,
  permissionsRefreshStarted,
  permissionsRefreshSucceeded,
  permissionsRefreshFailed,
  clearAuthData,
} = userSlice.actions;

export const BranchId = (state: UserRootState) => state.user.branchId;
export const BranchName = (state: UserRootState) => state.user.branchName;
export const ZoduId = (state: UserRootState) => state.user.zoduId;
export const BusinessType = (state: UserRootState) => state.user.businessType;
export const AllCompanies = (state: UserRootState) => state.user.companies;
export const AuthToken = (state: UserRootState) => state.user.accessToken;
export const RefreshToken = (state: UserRootState) => state.user.refreshToken;
export const UserProfile = (state: UserRootState) => state.user.profile;
export const UserCompany = (state: UserRootState) => state.user.company;
export const RoleAccess = (state: UserRootState) => state.user.roleAccess;
export const InvoiceSettingsData = (state: UserRootState) => state.user.invoiceSettings;
export const PosSettingsData = (state: UserRootState) => state.user.posSettings;
export const IsAuthenticated = (state: UserRootState) => state.user.isAuthenticated;
export const PermissionsStatus = (state: UserRootState) => state.user.permissionsStatus;
export const PermissionsBlocking = (state: UserRootState) => state.user.permissionsBlocking;

export default userSlice.reducer;
