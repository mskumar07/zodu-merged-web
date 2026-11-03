import axios, { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { API_BASE, getAccessToken, logout as endServerSession, setAccessToken } from '@utils/authSession';
import { serviceClient } from '@store/services/axiosInstance';

// ── HTTP client ───────────────────────────────────────────────────────────────
// The app's one client (token, platform header, 401 → refresh: utils/authSession).
const api = serviceClient(API_BASE, { timeout: 10_000 });

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
  address_line_1?: string;
  address_line_2?: string;
  pincode?: string;
  same_as_address?: boolean;
  same_as_bank_details?: boolean;
  // Subscription lives per branch (tbl_subscription, joined in getBranches).
  subscription_status?: string | null;           // "trial" | "active" | ...
  subscription_effective_status?: string | null; // adds "trial_expired" / "subscription_expired"
  subscription_plan_code?: string | null;
  trial_end_date?: string | null;
  subscription_end_date?: string | null;
  trial_days_left?: number | null;
}

export interface CompanyWithBranches {
  zodu_id: string;
  id?: string;
  address_id?: string;
  bank_details_id?: string;
  is_primary?: boolean;
  restaurant_name: string;
  business_name?: string;
  store_name?: string;
  company_name?: string;
  business_type?: string;
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
  address_line_1?: string;
  address_line_2?: string;
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
  is_subscripted?: boolean;
  subscription_start_date?: string;
  subscription_expiry_date?: string;
  // Returned by GET /my-companies. Null/absent when no logo has been uploaded.
  company_logo_url?: string | null;
  branches: Branch[];
}

export interface SignupPayload {
  restaurant_name: string;
  email: string;
  phone_number: string;
  password: string;
  same_for_branch: boolean;
  business_type: "Retail" | "Restaurant";
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
  branch_id?: string;
  employee_branch?: string;
  employee_code?: string;
  employee_id?: string;
  employee_name?: string;
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
  type?: string;
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
  // Attach a File to send the whole form as multipart/form-data in one request —
  // the endpoint accepts either JSON or multipart, so this is only used when a
  // logo is actually picked.
  company_logo?: File | null;
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
  clear_address?: boolean;
  clear_bank_details?: boolean;
}

export interface EditCompanyPayload {
  type?: string;
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
  // Three ways to change the logo, per the API contract:
  //   • attach a File as `company_logo`  → sent as multipart
  //   • `company_logo_url: "<url>"`      → point at an already-uploaded file
  //   • `company_logo_url: null`         → clear the stored logo
  // Omitting both leaves the stored logo untouched. A logo-only edit (every other
  // field absent) is accepted — the server relaxes its minimum-keys check when a
  // file is attached.
  company_logo?: File | null;
  company_logo_url?: string | null;
  // When true the server wipes the whole address / bank block; the individual
  // address / bank keys are then left out of the request.
  clear_address?: boolean;
  clear_bank_details?: boolean;
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

export interface InvoiceSettings {
  id: number;
  zodu_id: string;
  branch_id: string;
  invoice_prefix: string;
  // Whether the prefix is applied. Absent on rows that predate the toggle —
  // see InvoiceSettingsResponse in useInvoiceSettingApi.ts for how a missing
  // flag is read. The suffix and its toggle live on the POS settings row.
  invoice_prefix_enabled?: boolean;
  invoice_start_number: number;
  default_tax_label: string;
  invoice_due_days: number;
  default_payment_method: string;
  printer_inch: string;
  invoice_theme_color?: string | null;
  show_company_logo: boolean;
  print_thank_you_message: boolean;
  show_description: boolean;
  show_item_id: boolean;
  show_serial_no: boolean;
  show_customer_details: boolean;
  // Whether the Ship To block is printed. Absent on rows that predate this
  // field — treat a missing value as true, which is how invoices behaved
  // before the toggle existed.
  show_shipping_address?: boolean;
  show_tax_details: boolean;
  show_payment_details: boolean;
  show_terms_conditions: boolean;
  terms_conditions: string;
  // Printed instead of terms_conditions on that document type when on.
  show_quotation_terms?: boolean;
  quotation_terms?: string | null;
  show_proforma_terms?: boolean;
  proforma_terms?: string | null;
  show_notes: boolean;
  notes: string;
  show_signature: boolean;
  signature_url?: string | null;
  show_bank_details: boolean;
  // Payment types offered at POS checkout, as canonical labels
  // (e.g. ["Cash", "UPI", "Others"]). Stored server-side as TEXT[].
  // Absent on rows that predate this field.
  payment_types?: string[];
  // Which copy markings the user can download/print ("Original" | "Duplicate" |
  // "Transport"). Absent on rows that predate this field — treat a missing or
  // empty value as ["Original"].
  invoice_copy_types?: string[];
  // Which invoice layout to render — "classic" (default), "classic2" (Classic without HSN/tax breakdowns), "modern" or "modern2" on A4.
  // Thermal receipts read it too: "modern"/"modern2" print the Modern receipt, anything else Classic.
  invoice_template?: string;
  // POS settings — "Additional Settings". Absent on rows that predate this field.
  stock_check_enabled?: boolean;
  customer_mandatory?: boolean;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Sale types the POS offers for this branch, and which one it opens on.
// Absent on branches with no POS-settings row yet — treat that as the default
// of every type enabled with Invoice first (see normalizePosSettings).
export interface PosSettings {
  zodu_id?: string;
  branch_id?: string;
  pos_types?: string[];
  default_pos_type?: string;
  // Whether POS shows the buyer's purchase-order number/date fields.
  purchase_order_enabled?: boolean;
  // Whether POS offers Hold/Recall. Treat a missing value as on.
  hold_enabled?: boolean;
  // Whether POS shows the Item Description / Vehicle No fields. Missing = on.
  item_description_enabled?: boolean;
  vehicle_no_enabled?: boolean;
  // Restaurant-only: which billing layout the restaurant POS screen opens on
  // ("Touch" | "Keyboard"). Treat a missing value as "Touch".
  pos_screen_type?: string;
  // Restaurant-only: print a KOT with the bill. Treat a missing value as off.
  kot_print_enabled?: boolean;
  /** Restaurant POS: show menu item photos on the cards (absent = on). */
  show_item_image?: boolean;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BranchSettingsResponse {
  settings: {
    invoice: InvoiceSettings;
    // Retail branches also get their own quotation and proforma rows.
    quotation?: InvoiceSettings;
    proforma?: InvoiceSettings;
    pos?: PosSettings;
  };
}

export interface RoleAccessItem {
  module_id: string;
  module_name: string;
  parent_module_id: string | null;
  sort_order: number;
  can_read: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  role_id: string;
  role_name: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  expires_in?: number;
  // Web: never in the body. The server keeps it in an HttpOnly cookie.
  refresh_token?: string;
  // The company / branch / role the access token acts on.
  context?: { zodu_id: string; branch_id?: string | null; role?: string | null };
  user: AuthUser;
  company?: CompanyDetails;
  companies?: CompanyWithBranches[];
  role_access?: RoleAccessItem[];
}

export interface UserSession {
  session_id: string;
  platform: string;
  user_agent?: string | null;
  ip_address?: string | null;
  created_at: string;
  last_used_at?: string | null;
  current: boolean;
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
  let res: { data: T };
  try {
    res = await promise;
  } catch (err) {
    // Errors (400 password rules, 409 account exists, ...) keep the server's own
    // text as the message; `response` stays on the error for status checks.
    if (axios.isAxiosError(err)) {
      const body = err.response?.data as any;
      // Validation errors arrive as one string: { errors: "a, b" }.
      const fieldErrors = typeof body?.errors === 'string' ? body.errors : null;
      const text = body?.data?.error ?? body?.error ?? body?.message ?? fieldErrors;
      if (typeof text === 'string' && text) err.message = text;
    }
    throw err;
  }
  const payload = res.data as any;
  // FormateData error shape: { data: { error: "..." } }
  if (payload?.data?.error) throw new Error(payload.data.error);
  return (payload?.data ?? payload) as T;
}

// Uploads need far longer than the instance's 10s default — a logo on a slow
// mobile connection routinely takes more than that.
const UPLOAD_CONFIG = {
  headers: { 'Content-Type': 'multipart/form-data' },
  timeout: 60_000,
} as const;

// Flattens a company payload into FormData so a picked logo file can ride along
// with the rest of the form in a single request. Only called when there IS a
// file — with no file the endpoints take plain JSON, which is cheaper and keeps
// booleans/nulls typed instead of stringified.
function toCompanyFormData(payload: Record<string, unknown>): FormData {
  const fd = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined) return;
    if (value instanceof File) {
      fd.append(key, value);
    } else if (value === null) {
      // Multipart has no null — the server reads the empty string as "clear this".
      fd.append(key, '');
    } else {
      fd.append(key, String(value));
    }
  });
  return fd;
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

  // Revokes this session on the server and clears the refresh cookie.
  logout: () => endServerSession(),

  // POST /auth/api/logout-all — ends every session of the user, on every device.
  logoutAll: () =>
    unwrap<{ message?: string }>(
      api.post('/auth/api/logout-all')
    ),

  // GET /auth/api/sessions — the user's signed-in devices; `current` is this one.
  getSessions: () =>
    unwrap<{ sessions: UserSession[] }>(
      api.get('/auth/api/sessions')
    ).then((res) => res.sessions ?? []),

  // DELETE /auth/api/sessions/:session_id — signs that device out.
  revokeSession: (sessionId: string) =>
    unwrap<{ message?: string }>(
      api.delete(`/auth/api/sessions/${encodeURIComponent(sessionId)}`)
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
    ).then((res) => res.companies ?? []),

  createCompany: ({ company_logo, ...payload }: CreateCompanyPayload) =>
    unwrap<any>(
      company_logo
        ? api.post('/auth/api/create-company', toCompanyFormData({ ...payload, company_logo }), UPLOAD_CONFIG)
        : api.post('/auth/api/create-company', payload)
    ),

  createBranch: (payload: CreateBranchPayload) =>
    unwrap<any>(
      api.post('/auth/api/branch/add', payload)
    ),

  editCompany: (zoduId: string, { company_logo, ...payload }: EditCompanyPayload) => {
    const url = `/auth/api/company/edit/${zoduId}`;
    // `company_logo_url: null` (clear the logo) has to survive into the request, so
    // it stays in `payload` — only the File is split out to pick the encoding.
    return unwrap<any>(
      company_logo
        ? api.put(url, toCompanyFormData({ ...payload, company_logo }), UPLOAD_CONFIG)
        : api.put(url, payload)
    );
  },

  // POST /auth/api/company/:zodu_id/logo — dedicated upload, mirroring the invoice
  // signature endpoints. Returns the updated company.
  uploadCompanyLogo: (zoduId: string, file: File) => {
    const fd = new FormData();
    fd.append('company_logo', file);
    return unwrap<CompanyWithBranches>(
      api.post(`/auth/api/company/${zoduId}/logo`, fd, UPLOAD_CONFIG)
    );
  },

  deleteCompanyLogo: (zoduId: string) =>
    unwrap<CompanyWithBranches>(
      api.delete(`/auth/api/company/${zoduId}/logo`)
    ),

  editBranch: (zoduId: string, branchId: string, payload: EditBranchPayload) =>
    unwrap<any>(
      api.put(`/auth/api/branch/edit/${zoduId}/${branchId}`, payload)
    ),

  // DELETE /auth/api/branch/:zodu_id/:branch_id — cascades across every service
  // (retail, restaurant, employee, payroll, checklist, auth) and cannot be undone.
  // On a mid-purge failure the backend stops safely and reports which services
  // already had their rows removed via `partial_results`.
  deleteBranch: (zoduId: string, branchId: string) =>
    unwrap<{ message?: string; results?: unknown }>(
      api.delete(`/auth/api/branch/${zoduId}/${branchId}`)
    ),

  // DELETE /auth/api/company/:zodu_id — cascades across every service and
  // every branch on the company, and cannot be undone. Same shape/failure
  // mode as deleteBranch: the endpoint always answers HTTP 200 (FormateData
  // wraps both success and error as { data: {...} }), so a mid-purge failure
  // is reported via unwrap() throwing with the real message, and — when the
  // backend includes one — `partial_results` names the services that were
  // already purged before the failure.
  deleteCompany: (zoduId: string) =>
    unwrap<{ message?: string; results?: unknown; partial_results?: unknown }>(
      api.delete(`/auth/api/company/${zoduId}`)
    ),

  // GET /auth/api/role-access?zodu_id=...&branch_id=... — called once a branch is
  // selected, since permissions are scoped per zodu_id + branch_id rather than
  // returned with the login response.
  getRoleAccess: (zoduId: string, branchId: string) =>
    unwrap<{ role_access: RoleAccessItem[] }>(
      api.get('/auth/api/role-access', { params: { zodu_id: zoduId, branch_id: branchId } })
    ).then((res) => res.role_access ?? []),

  // GET /auth/api/settings/:zodu_id/:branch_id — company/branch settings.
  // Can 400 with an access error, which callers should surface to the user.
  getSettings: (zoduId: string, branchId: string) =>
    unwrap<BranchSettingsResponse>(
      api.get(`/auth/api/settings/${zoduId}/${branchId}`)
    ),
};

// ── token helpers ─────────────────────────────────────────────────────────────

// The access token is held in memory by utils/authSession and the refresh token
// is an HttpOnly cookie, so nothing here touches localStorage any more.
export const tokenStore = {
  save: (access_token: string) => setAccessToken(access_token),
  clear: () => setAccessToken(null),
  getAccess: () => getAccessToken(),
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
      tokenStore.save(data.access_token);
    },
    onError: (err: AxiosError<any>) => {
      // Never the request body: it holds the password.
      console.error('[login error]', err.response?.status, err.response?.data?.data?.error ?? err.message);
    },
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: () => authApis.logout(),
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
