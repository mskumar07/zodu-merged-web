import axios, { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';

// ── axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

// Attach access token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── types ─────────────────────────────────────────────────────────────────────

export interface SignupPayload {
  restaurant_name: string;
  email: string;
  phone_number: string;
  password: string;
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
  account_number: string;
  account_type: string;
  area_street_name: string;
  building_no: string;
  city: string;
  district: string;
  gst_no: string;
  ifsc_code: string;
  owner_admin_name: string;
  pincode: string;
  state: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  user: AuthUser;
  company?: CompanyDetails;
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
};

// ── token helpers ─────────────────────────────────────────────────────────────

export const tokenStore = {
  save: (access_token: string, refresh_token: string) => {
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
  },
  clear: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
  getRefresh: () => localStorage.getItem('refresh_token'),
  getAccess:  () => localStorage.getItem('access_token'),
};

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
