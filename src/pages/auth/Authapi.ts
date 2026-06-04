import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useMutation } from '@tanstack/react-query';

// ── axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

// ── types ─────────────────────────────────────────────────────────────────────

export interface Branch {
  branch_id: string;
  branch_name: string;
  // Raw DB column names
  branch_city?: string;
  branch_district?: string;
  branch_state?: string;
  branch_area_street_name?: string;
  branch_address_line_1?: string;
  branch_floor_building_no?: string;
  branch_address_line_2?: string;
  branch_pincode?: string;
  branch_mobile_no?: string;
  branch_mail_id?: string;
  branch_image?: string | null;
  branch_manager?: string;
  branch_manager_or_admin?: string;
  branch_account_no?: string;
  branch_ifsc?: string;
  branch_account_type?: string;
  address_id?: string;
  bank_details_id?: string;
  bank_name?: string;
  bank_branch?: string;
  holder_name?: string;
  account_number?: string;
  account_type?: string;
  ifsc_code?: string;
  active?: boolean;
  zodu_id?: string;
  // Aliased fields returned by get/my-companies
  city?: string;
  district?: string;
  state?: string;
  area_street_name?: string;
  same_as_address?: boolean;
  same_as_bank_details?: boolean;
}

export interface CompanyWithBranches {
  zodu_id: string;
  id?: string;
  address_id?: string;
  bank_details_id?: string;
  is_primary?: boolean;
  restaurant_name: string;
  owner_admin_name?: string;
  gst_no?: string;
  city?: string;
  state?: string;
  district?: string;
  phone_number?: string;   // ✅ UI alias
  mobile_no?: string;      // ✅ API field name
  email?: string;          // ✅ UI alias
  mail_id?: string;        // ✅ API field name
  area_street_name?: string;
  building_no?: string;
  pincode?: string;
  account_number?: string;
  account_type?: string;
  ifsc_code?: string;
  bank_name?: string;
  bank_branch?: string;
  holder_name?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  branches: Branch[];
}

export interface SignupPayload {
  restaurant_name: string;
  email: string;
  phone_number: string;
  password: string;
  same_for_branch: boolean;
}

export interface LoginPayload {
  email?: string;
  phone_number?: string;
  password: string;
}

export interface AuthUser {
  user_id: string;
  zodu_id: string;
  restaurant_name: string;
  email: string;
  phone_number: string;
  user_type: string;
  branch_id: string;
}

export interface CompanyDetails {
  account_number?: string;
  account_type?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  district?: string;
  gst_no?: string;
  ifsc_code?: string;
  owner_admin_name?: string;
  pincode?: string;
  state?: string;
  bank_name?: string;
  bank_branch?: string;
  holder_name?: string;
}

export interface CreateCompanyPayload {
  restaurant_name: string;
  owner_admin_name?: string;
  gst_no?: string;
  phone_number: string;
  email: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  bank_name?: string;
  bank_branch?: string;
  holder_name?: string;
  account_number?: string;
  account_type?: string;
  ifsc_code?: string;
  can_use_for_branch?: boolean;
}

export interface OpeningHours {
  day: string;
  open: string;
  close: string;
}

export interface CreateBranchPayload {
  zodu_id: string;
  branch_id?: string;
  branch_name: string;
  branch_mobile_no: string;
  branch_mail_id: string;
  branch_city: string;
  branch_pincode: string;
  branch_district: string;
  branch_state: string;
  // Optional fields
  branch_manager_or_admin?: string;
  branch_image?: string;
  opening_hours?: OpeningHours[];
  // Option 1: reference existing company address and bank details
  address_id?: string;
  bank_details_id?: string;
  // Option 2: separate branch address details
  address_line_1?: string;
  address_line_2?: string;
  // Option 3: separate branch bank details
  bank_name?: string;
  bank_branch?: string;
  holder_name?: string;
  account_number?: string;
  account_type?: string;
  ifsc_code?: string;
  // Company reference flags
  use_same_address_as_company?: boolean;
  use_same_bank_as_company?: boolean;
}

export interface EditCompanyPayload {
  restaurant_name?: string;
  owner_admin_name?: string;
  gst_no?: string;
  phone_number?: string;
  email?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  bank_name?: string;
  bank_branch?: string;
  holder_name?: string;
  account_number?: string;
  account_type?: string;
  ifsc_code?: string;
}

export interface EditBranchPayload {
  // All fields optional - at least one must be sent
  zodu_id?: string;
  branch_id?: string;
  branch_name?: string;
  branch_manager_or_admin?: string;
  branch_mobile_no?: string;
  branch_mail_id?: string;
  branch_city?: string;
  branch_pincode?: string;
  branch_district?: string;
  branch_state?: string;
  branch_image?: string;
  opening_hours?: OpeningHours[];
  // Option 1: reference existing company address and bank details
  address_id?: string;
  bank_details_id?: string;
  // Option 2: separate branch address details
  address_line_1?: string;
  address_line_2?: string;
  // Option 3: separate branch bank details
  bank_name?: string;
  bank_branch?: string;
  holder_name?: string;
  account_number?: string;
  account_type?: string;
  ifsc_code?: string;
  // Company reference flags
  use_same_address_as_company?: boolean;
  use_same_bank_as_company?: boolean;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  user: AuthUser;
  company?: CompanyDetails;
  companies?: CompanyWithBranches[];
}

export interface SignupResponse {
  data: {
    insertData: {
      id: number;
      zodu_id: string;
      restaurant_name: string;
      email: string;
      phone_number: string;
    };
  };
}

// Backend wraps everything in { data: { ... } } via FormateData()
// This unwraps the inner payload and surfaces errors correctly.
async function unwrap<T>(promise: Promise<{ data: T }>): Promise<T> {
  const res = await promise;
  const payload = res.data as any;
  // FormateData error shape: { data: { error: "..." } }
  if (payload?.data?.error) throw new Error(payload.data.error);
  return (payload?.data ?? payload) as T;
}

// ── API functions ─────────────────────────────────────────────────────────────

export const authApis = {
  signup: (payload: SignupPayload) =>
    unwrap<SignupResponse['data']>(
      api.post('/auth/api/create-account', payload)
    ),

  login: (payload: LoginPayload) =>
    unwrap<LoginResponse>(
      api.post('/auth/api/login', payload)
    ),

  logout: (refresh_token: string) =>
    unwrap<{ message: string }>(
      api.post('/auth/api/logout', { refresh_token })
    ),

  refreshToken: (refresh_token: string) =>
    unwrap<{ access_token: string; refresh_token: string }>(
      api.post('/auth/api/refresh-token', { refresh_token })
    ),

  // GET /retail/get/branches/:zodu_id — branches for a specific company
  getBranches: (zoduId: string) =>
    unwrap<Branch[]>(
      api.get(`/retail/get/branches/${zoduId}`)
    ),

  // Fetches all companies (+ branches) the authenticated user belongs to.
  // Calls the auth service which joins tbl_user_companies → company details + branches.
  getMyCompanies: () =>
    unwrap<{ companies: CompanyWithBranches[] }>(
      api.get('/auth/api/my-companies')
    ).then((res) => {
      console.log(res);
      return res.companies ?? [];
    }),

  createCompany: (payload: CreateCompanyPayload) =>
    unwrap<any>(
      api.post('/auth/api/create-company', payload)
          
    ),

  createBranch: (payload: CreateBranchPayload) =>
    unwrap<any>(
      api.post('/auth/api/branch/add', payload)
    ),

  editCompany: (zoduId: string, payload: EditCompanyPayload) => {
    console.log("=== authApis.editCompany called ===");
    console.log("zoduId:", zoduId);
    console.log("payload:", payload);
    const result = api.put(`/auth/api/company/edit/${zoduId}`, payload);
    console.log("API call made to: /auth/api/company/edit/" + zoduId);
    return unwrap<any>(result);
  },

  editBranch: (zoduId: string, branchId: string, payload: EditBranchPayload) =>
    unwrap<any>(
      api.put(`/auth/api/branch/edit/${zoduId}/${branchId}`, payload)
    ),
};

// ── token helpers ─────────────────────────────────────────────────────────────

export const tokenStore = {
  save: (access_token: string, refresh_token: string) => {
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    try {
      const raw = localStorage.getItem('zodu_user_state');
      const parsed = raw ? JSON.parse(raw) : {};
      localStorage.setItem(
        'zodu_user_state',
        JSON.stringify({
          ...parsed,
          accessToken: access_token,
          refreshToken: refresh_token,
        })
      );
    } catch {
      // Ignore persistence issues and keep auth flow working.
    }
  },
  clear: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    try {
      const raw = localStorage.getItem('zodu_user_state');
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed) {
        delete parsed.accessToken;
        delete parsed.refreshToken;
        localStorage.setItem('zodu_user_state', JSON.stringify(parsed));
      }
    } catch {
      // Ignore persistence issues and keep auth flow working.
    }
  },
  getRefresh: () => localStorage.getItem('refresh_token'),
  getAccess:  () => localStorage.getItem('access_token'),
};

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const refreshToken = tokenStore.getRefresh();

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      refreshToken &&
      !String(originalRequest.url || '').includes('/auth/api/refresh-token')
    ) {
      originalRequest._retry = true;

      try {
        const refreshed = await authApis.refreshToken(refreshToken);
        if (!refreshed?.access_token || !refreshed?.refresh_token) {
          throw new Error('Invalid refresh response');
        }

        tokenStore.save(refreshed.access_token, refreshed.refresh_token);
        originalRequest.headers.Authorization = `Bearer ${refreshed.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        tokenStore.clear();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ── TanStack Query mutations ──────────────────────────────────────────────────

export function useSignupMutation() {
  return useMutation({
    mutationFn: (payload: SignupPayload) => authApis.signup(payload),
    onError: (err: AxiosError<any>) => {
      // Axios network errors surface here too
      console.error('[signup error]', err.response?.data || err.message);
    },
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApis.login(payload),
    onSuccess: (data) => {
      console.log(data)
      // Persist tokens on successful login
      tokenStore.save(data.access_token, data.refresh_token);
    },
    onError: (err: AxiosError<any>) => {
      console.error('[login error]', err.response?.data || err.message);
    },
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: () => {
      const token = tokenStore.getRefresh() || '';
      return authApis.logout(token);
    },
    onSettled: () => {
      tokenStore.clear();
    },
  });
}

export function useCreateBranchMutation() {
  return useMutation({
    mutationFn: (payload: CreateBranchPayload) => {
      console.log(payload);
      return authApis.createBranch(payload);
    },
    onError: (err: AxiosError<any>) => {
      console.error('[createBranch error]', err.response?.data || err.message);
    },
  });
}
