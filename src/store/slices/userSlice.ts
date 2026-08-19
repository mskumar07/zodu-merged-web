import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@store/store";
import type { AuthUser, CompanyDetails, CompanyWithBranches, InvoiceSettings, RoleAccessItem } from "@pages/auth/Authapi";

interface Userstate {
  branchId: string;
  branchName: string;
  zoduId: string;
  businessType: string;
  companies: CompanyWithBranches[];
  accessToken: string | null;
  refreshToken: string | null;
  profile: AuthUser | null;
  company: CompanyDetails | null;
  roleAccess: RoleAccessItem[];
  invoiceSettings: InvoiceSettings | null;
  isAuthenticated: boolean;
}

const initialState: Userstate = {
  branchId: "",
  branchName: "",
  zoduId: "",
  businessType: "",
  companies: [],
  accessToken: null,
  refreshToken: null,
  profile: null,
  company: null,
  roleAccess: [],
  invoiceSettings: null,
  isAuthenticated: false,
};

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
    clearAuthData: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.profile = null;
      state.company = null;
      state.companies = [];
      state.roleAccess = [];
      state.invoiceSettings = null;
      state.isAuthenticated = false;
      state.branchId = "";
      state.branchName = "";
      state.zoduId = "";
      state.businessType = "";
    },
  },
});

export const { addUserData, setAuthData, setCompanies, setRoleAccess, setInvoiceSettings, clearAuthData } = userSlice.actions;

export const BranchId = (state: RootState) => state.user.branchId;
export const BranchName = (state: RootState) => state.user.branchName;
export const ZoduId = (state: RootState) => state.user.zoduId;
export const BusinessType = (state: RootState) => state.user.businessType;
export const AllCompanies = (state: RootState) => state.user.companies;
export const AuthToken = (state: RootState) => state.user.accessToken;
export const RefreshToken = (state: RootState) => state.user.refreshToken;
export const UserProfile = (state: RootState) => state.user.profile;
export const UserCompany = (state: RootState) => state.user.company;
export const RoleAccess = (state: RootState) => state.user.roleAccess;
export const InvoiceSettingsData = (state: RootState) => state.user.invoiceSettings;
export const IsAuthenticated = (state: RootState) => state.user.isAuthenticated;

export default userSlice.reducer;
