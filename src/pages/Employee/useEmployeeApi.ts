import { useEffect } from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { getTenantContext } from "@store/tenantContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "https://api.myzodu.com";
const EMP_BASE = `${API_BASE}/employee/api/employees`;

// ─── Types ────────────────────────────────────────────────────

export interface EmployeeListItem {
  employee_id: string;
  employee_code: string;
  name: string;
  phone: string;
  email: string;
  status: "active" | "inactive";
  date_of_joining: string;
  employment_type: string;
  department_name: string;
  reporting_manager_name: string;
  branch_id: string;
  created_at: string;
  has_password?: boolean;
  has_role?: boolean;
  // Whether the employee's login is switched on — drives the list's User Login toggle.
  login_user?: boolean;
}

export interface EmployeeDetail {
  employee_id: string;
  login_user?: boolean;
  employee_code: string;
  user_id: string;
  name: string;
  phone: string;
  email: string;
  status: "active" | "inactive";
  date_of_birth: string;
  gender: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  employment_type: string;
  date_of_joining: string;
  reporting_manager_id: string;
  reporting_manager_name: string;
  emergency_contact_name: string;
  emergency_relationship: string;
  emergency_mobile: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  documents: {
    id: string;
    document_type: string;
    file_name: string;
    file_url: string;
    uploaded_on: string;
  }[];
  role_info: {
    success: boolean;
    data: {
      role_id: string;
      role_name: string;
      access_level: string;
      permissions: {
        module_name: string;
        can_read: boolean;
        can_create: boolean;
        can_edit: boolean;
        can_delete: boolean;
      }[];
    };
  } | null;
  salary: {
    success: boolean;
    data: {
      basic_salary: string;
      allowances: string;
      payment_type: string;
      bank_account_number: string;
      bank_name: string;
      ifsc_code: string;
      effective_from: string;
    };
  } | null;
}

export interface CreateEmployeePayload {
  zodu_id: string;
  branch_id: string;
  name: string;
  phone: string;
  email: string;
  status: "active" | "inactive";
  date_of_birth: string;
  gender: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  employment_type: string;
  date_of_joining: string;
  reporting_manager_id: string;
  reporting_manager_name: string;
  emergency_contact_name: string;
  emergency_relationship: string;
  emergency_mobile: string;
  basic_salary: number;
  allowances: number;
  payment_type: string;
  bank_account_number: string;
  bank_name: string;
  ifsc_code: string;
  notes: string | null;
}


export interface EmployeePage {
  data: EmployeeListItem[];
  // `login_user_count` is the number of employees whose login is switched on.
  pagination: { total: number; page: number; limit: number; pages: number; login_user_count?: number };
}

/** The default Admin (EMP001) is the super admin: it already has a login and no assignable role. */
export const isSuperAdmin = (e: Pick<EmployeeListItem, "employee_code" | "name">) =>
  e.employee_code === "EMP001" && e.name?.trim().toLowerCase() === "admin";

// ─── Query keys ───────────────────────────────────────────────

export const empQueryKeys = {
  all: ["employees"] as const,
  list: (zoduId: string, branchId: string, status: string) =>
    ["employees", zoduId, branchId, status] as const,
  detail: (id: string) => ["employee", id] as const,
};

// ─── Fetch list (infinite) ────────────────────────────────────

async function fetchEmployeePage(
  page: number,
  status: "active" | "inactive",
  search: string
): Promise<EmployeePage> {
  const { zoduId, branchId } = getTenantContext();
  const params: Record<string, string> = {
    zodu_id: zoduId ?? "",
    branch_id: branchId ?? "",
    status,
    page: String(page),
    limit: "10",
  };
  if (search) params.search = search;
  const { data } = await axios.get(EMP_BASE, { params });
  if (data.success) return { data: data.data ?? [], pagination: data.pagination };
  return { data: [], pagination: { total: 0, page, limit: 10, pages: 1 } };
}

export function useInfiniteEmployees(status: "active" | "inactive", search: string) {
  const { zoduId, branchId } = getTenantContext();
  return useInfiniteQuery({
    queryKey: [...empQueryKeys.list(zoduId ?? "", branchId ?? "", status), search],
    queryFn: ({ pageParam = 1 }) =>
      fetchEmployeePage(pageParam as number, status, search),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.pages
        ? last.pagination.page + 1
        : undefined,
  });
}

// ─── Summary cards ────────────────────────────────────────────

export interface EmployeeStats {
  totalEmployees: number;
  loginUsers: number;
}

// The totals ride on the list endpoint's pagination block, so one row is all
// that's needed. Kept separate from the list query so the cards don't change
// with the Active/Inactive tab or the search box, and under the "employees"
// key so every save, delete or login change refreshes them.
async function fetchEmployeeStats(): Promise<EmployeeStats> {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await axios.get(EMP_BASE, {
    params: { zodu_id: zoduId ?? "", branch_id: branchId ?? "", status: "active", page: 1, limit: 1 },
  });
  return {
    totalEmployees: data?.pagination?.total ?? 0,
    loginUsers: data?.pagination?.login_user_count ?? 0,
  };
}

export function useEmployeeStatsKey() {
  const { zoduId, branchId } = getTenantContext();
  return [...empQueryKeys.all, zoduId ?? "", branchId ?? "", "stats"] as const;
}

// `listStats` are the totals carried by the unsearched Active list. They are
// mirrored into this query's cache, so on the Inactive tab the cards reuse the
// last known numbers instead of firing their own request. The request only runs
// when nothing is known yet (e.g. the page was opened straight on Inactive).
export function useEmployeeStats(listStats?: EmployeeStats) {
  const queryClient = useQueryClient();
  const key = useEmployeeStatsKey();
  const keyStr = key.join("|");
  useEffect(() => {
    if (listStats) queryClient.setQueryData(key, listStats);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listStats, keyStr]);
  const query = useQuery({
    queryKey: key,
    queryFn: fetchEmployeeStats,
    staleTime: Infinity,
    enabled: !listStats,
  });
  return listStats ? { data: listStats, isLoading: false } : query;
}

// ─── Fetch all active employees (for dropdowns) ──────────────

async function fetchAllActiveEmployees(): Promise<EmployeeListItem[]> {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await axios.get(EMP_BASE, {
    params: { zodu_id: zoduId ?? "", branch_id: branchId ?? "", status: "active", page: 1, limit: 200 },
  });
  if (data.success) return data.data ?? [];
  return [];
}

export function useActiveEmployees(enabled = true) {
  const { zoduId, branchId } = getTenantContext();
  return useQuery({
    queryKey: ["employees-active-dropdown", zoduId, branchId],
    queryFn: fetchAllActiveEmployees,
    staleTime: 60_000,
    enabled,
  });
}

// ─── Fetch single employee ────────────────────────────────────

async function fetchEmployee(employeeId: string): Promise<EmployeeDetail> {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await axios.get(`${EMP_BASE}/${employeeId}`, {
    params: { zodu_id: zoduId, branch_id: branchId },
  });
  if (data.success) return data.data;
  throw new Error("Failed to fetch employee");
}

export function useEmployeeDetail(employeeId: string | null) {
  return useQuery({
    queryKey: empQueryKeys.detail(employeeId ?? ""),
    queryFn: () => fetchEmployee(employeeId!),
    enabled: !!employeeId,
    staleTime: 30_000,
  });
}

// ─── Create employee ──────────────────────────────────────────

async function createEmployee(payload: CreateEmployeePayload) {
  const { data } = await axios.post(EMP_BASE, payload);
  return data;
}

export function useCreateEmployee(options?: {
  onSuccess?: (result: any) => void;
  onError?: (msg: string) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: empQueryKeys.all });
      options?.onSuccess?.(result);
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.error ?? err.response?.data?.message ?? err.message)
        : "Failed to create employee";
      options?.onError?.(msg);
    },
  });
}

// ─── Update employee ──────────────────────────────────────────

async function updateEmployee({
  employeeId,
  payload,
}: {
  employeeId: string;
  payload: Partial<CreateEmployeePayload>;
}) {
  const { data } = await axios.put(`${EMP_BASE}/${employeeId}`, payload);
  return data;
}

export function useUpdateEmployee(options?: {
  onSuccess?: () => void;
  onError?: (msg: string) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: empQueryKeys.all });
      options?.onSuccess?.();
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.error ?? err.response?.data?.message ?? err.message)
        : "Failed to update employee";
      options?.onError?.(msg);
    },
  });
}

// ─── Set user / login details ─────────────────────────────────

export interface LoginDetailsPayload {
  role_id?: string;
  password?: string;
  confirm_password?: string;
}

interface LoginDetailsResult {
  success: boolean;
  data: { employee_id: string; user_id: string; has_password: boolean | null; has_role: boolean | null };
}

/** Validation failures come back as `errors`, everything else as `error`. */
const apiErrorMessage = (err: unknown, fallback: string) =>
  axios.isAxiosError(err)
    ? (err.response?.data?.errors ?? err.response?.data?.error ?? err.response?.data?.message ?? err.message)
    : fallback;

interface SetLoginDetailsArgs {
  employeeId: string;
  payload: LoginDetailsPayload;
  /**
   * Set only by the Add/Edit Employee form's "Set user / login" section (not the row shortcut):
   * true = create/update the login, false = switch the login off (box unticked).
   */
  loginUser?: boolean;
}

async function setLoginDetails({ employeeId, payload, loginUser }: SetLoginDetailsArgs) {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await axios.put<LoginDetailsResult>(
    `${EMP_BASE}/${employeeId}/login-details`,
    {
      zodu_id: zoduId ?? "",
      branch_id: branchId ?? "",
      ...payload,
      ...(loginUser !== undefined && { login_user: loginUser }),
    },
  );
  return data;
}

export function useSetLoginDetails(options?: {
  onSuccess?: () => void;
  onError?: (msg: string) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setLoginDetails,
    onSuccess: (_res, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: empQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: empQueryKeys.detail(employeeId) });
      options?.onSuccess?.();
    },
    onError: (err: unknown) => options?.onError?.(apiErrorMessage(err, "Failed to update login details")),
  });
}

// ─── Upload employee document / profile photo ─────────────────

export interface UploadedDocument {
  id: string;
  employee_id: string;
  zodu_id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  uploaded_on: string;
  uploaded_by: string | null;
  created_at: string;
}

export async function uploadEmployeeDocument(
  employeeId: string,
  file: File,
  documentType: string
): Promise<UploadedDocument> {
  const { zoduId, branchId } = getTenantContext();
  const fd = new FormData();
  fd.append("file", file);
  fd.append("zodu_id", zoduId ?? "");
  fd.append("branch_id", branchId ?? "");
  fd.append("document_type", documentType);
  const { data } = await axios.post(`${EMP_BASE}/${employeeId}/documents`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  if (data.success) return data.data as UploadedDocument;
  throw new Error(data.error ?? "Upload failed");
}

export function useUploadEmployeeDocument(options?: {
  onSuccess?: (doc: UploadedDocument) => void;
  onError?: (msg: string) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      employeeId,
      file,
      documentType,
    }: {
      employeeId: string;
      file: File;
      documentType: string;
    }) => uploadEmployeeDocument(employeeId, file, documentType),
    onSuccess: (doc) => {
      queryClient.invalidateQueries({ queryKey: empQueryKeys.detail(doc.employee_id) });
      options?.onSuccess?.(doc);
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.error ?? err.response?.data?.message ?? err.message)
        : "Upload failed";
      options?.onError?.(msg);
    },
  });
}

// ─── Delete employee document ────────────────────────────────

export async function deleteEmployeeDocument(
  employeeId: string,
  docId: string
): Promise<void> {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await axios.delete(`${EMP_BASE}/${employeeId}/documents/${docId}`, {
    data: { zodu_id: zoduId, branch_id: branchId },
  });
  if (!data.success) throw new Error(data.error ?? "Delete failed");
}

// ─── Delete / re-activate employee ────────────────────────────
// Neither removes the row: both are a PUT that flips the employee's status, so
// "delete" moves them to the Inactive tab and "activate" brings them back.

async function setEmployeeStatus(employeeId: string, status: "active" | "inactive") {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await axios.put(`${EMP_BASE}/active-inactive/${employeeId}`, {
    zodu_id: zoduId,
    branch_id: branchId,
    status,
  });
  return data;
}

function useEmployeeStatusMutation(
  status: "active" | "inactive",
  failureMessage: string,
  options?: { onSuccess?: () => void; onError?: (msg: string) => void },
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employeeId: string) => setEmployeeStatus(employeeId, status),
    onSuccess: () => {
      // Refetch the lists only. The cards' cached totals (used on the Inactive
      // tab) are nudged instead of refetched; the Active list refreshes them.
      const { zoduId, branchId } = getTenantContext();
      const statsKey = [...empQueryKeys.all, zoduId ?? "", branchId ?? "", "stats"];
      queryClient.setQueryData<EmployeeStats>(statsKey, (old) =>
        old && { ...old, totalEmployees: Math.max(0, old.totalEmployees + (status === "active" ? 1 : -1)) });
      queryClient.invalidateQueries({
        queryKey: empQueryKeys.all,
        predicate: (q) => q.queryKey[3] !== "stats",
      });
      options?.onSuccess?.();
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.error ?? err.response?.data?.message ?? err.message)
        : failureMessage;
      options?.onError?.(msg);
    },
  });
}

export function useDeleteEmployee(options?: { onSuccess?: () => void; onError?: (msg: string) => void }) {
  return useEmployeeStatusMutation("inactive", "Failed to delete employee", options);
}

export function useActivateEmployee(options?: { onSuccess?: () => void; onError?: (msg: string) => void }) {
  return useEmployeeStatusMutation("active", "Failed to activate employee", options);
}

// ─── Helpers ──────────────────────────────────────────────────

export function buildEmployeePayload(
  form: Record<string, string | number | null>
): CreateEmployeePayload {
  const { zoduId, branchId } = getTenantContext();
  return {
    zodu_id: zoduId ?? "",
    branch_id: branchId ?? "",
    name: String(form.name ?? ""),
    phone: String(form.phone ?? ""),
    email: String(form.email ?? ""),
    status: (form.status as "active" | "inactive") ?? "active",
    date_of_birth: String(form.date_of_birth ?? ""),
    gender: String(form.gender ?? ""),
    address_line1: String(form.address_line1 ?? ""),
    address_line2: form.address_line2 ? String(form.address_line2) : null,
    city: String(form.city ?? ""),
    state: String(form.state ?? ""),
    pincode: String(form.pincode ?? ""),
    employment_type: String(form.employment_type ?? ""),
    date_of_joining: String(form.date_of_joining ?? ""),
    reporting_manager_id: String(form.reporting_manager_id ?? ""),
    reporting_manager_name: String(form.reporting_manager_name ?? ""),
    emergency_contact_name: String(form.emergency_contact_name ?? ""),
    emergency_relationship: String(form.emergency_relationship ?? ""),
    emergency_mobile: String(form.emergency_mobile ?? ""),
    basic_salary: Number(form.basic_salary ?? 0),
    allowances: Number(form.allowances ?? 0),
    payment_type: String(form.payment_type ?? ""),
    bank_account_number: String(form.bank_account_number ?? ""),
    bank_name: String(form.bank_name ?? ""),
    ifsc_code: String(form.ifsc_code ?? ""),
    notes: form.notes ? String(form.notes) : null,
  };
}

export const INDIA_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli",
  "Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

export const EMPLOYMENT_TYPES = ["Full Time", "Part Time"];
export const PAYMENT_TYPES    = ["Monthly", "Weekly", "Bi-Weekly", "Daily"];
export const GENDERS          = ["Male", "Female", "Other"];
export const ACCESS_LEVELS    = ["Full Access", "View Only", "Custom", "No Access"];
