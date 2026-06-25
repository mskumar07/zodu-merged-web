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
}

export interface EmployeeDetail {
  employee_id: string;
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
  role_id: string;
  access_level: string;
  notes: string | null;
  password?: string;
}

export interface EmployeePage {
  data: EmployeeListItem[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

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

// ─── Delete employee ──────────────────────────────────────────

async function deleteEmployee(employeeId: string) {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await axios.delete(`${EMP_BASE}/${employeeId}`, {
    data: { zodu_id: zoduId, branch_id: branchId },
  });
  return data;
}

export function useDeleteEmployee(options?: {
  onSuccess?: () => void;
  onError?: (msg: string) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: empQueryKeys.all });
      options?.onSuccess?.();
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.error ?? err.response?.data?.message ?? err.message)
        : "Failed to delete employee";
      options?.onError?.(msg);
    },
  });
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
    role_id: String(form.role_id ?? ""),
    access_level: String(form.access_level ?? ""),
    notes: form.notes ? String(form.notes) : null,
    password: form.password ? String(form.password) : undefined,
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

export const EMPLOYMENT_TYPES = ["Full Time", "Part Time", "Contract", "Internship"];
export const PAYMENT_TYPES    = ["Monthly", "Weekly", "Bi-Weekly", "Daily"];
export const GENDERS          = ["Male", "Female", "Other"];
export const ACCESS_LEVELS    = ["Full Access", "View Only", "Custom", "No Access"];
