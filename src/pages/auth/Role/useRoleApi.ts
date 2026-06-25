import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTenantContext } from "@store/tenantContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "https://api.myzodu.com";

// ─── Types ────────────────────────────────────────────────────

export interface ModuleItem {
  module_id: string;
  module_name: string;
  sort_order: number;
  sub_modules?: ModuleItem[];
}

export interface ModulesResponse {
  success: boolean;
  data: ModuleItem[];
}

export interface PermissionPayload {
  module_id: string;
  can_read: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface CreateRolePayload {
  zodu_id: string;
  branch_id: string;
  role_name: string;
  description: string;
  permissions: PermissionPayload[];
}

export interface RoleListItem {
  role_id: string;
  role_name: string;
  description: string;
  assigned_users: number;
  created_at: string;
}

export interface RolePermission {
  module_id: string;
  module_name: string;
  can_read: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  sub_modules?: RolePermission[];
}

export interface RoleDetail {
  role_id: string;
  role_name: string;
  description: string;
  permissions: RolePermission[];
}

// ─── Query keys ──────────────────────────────────────────────

export const roleQueryKeys = {
  all: ["roles"] as const,
  list: (zoduId: string, branchId: string) =>
    ["roles", zoduId, branchId] as const,
  detail: (roleId: string) => ["roles", roleId] as const,
  modules: ["auth-modules"] as const,
};

// ─── Fetch modules ────────────────────────────────────────────

async function fetchModules(): Promise<ModuleItem[]> {
  const { data } = await axios.get<ModulesResponse>(
    `${API_BASE}/auth/api/modules`
  );
  if (data.success) return data.data;
  return [];
}

export function useModules() {
  return useQuery({
    queryKey: roleQueryKeys.modules,
    queryFn: fetchModules,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ─── Fetch all roles ──────────────────────────────────────────

async function fetchRoles(): Promise<RoleListItem[]> {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await axios.get(`${API_BASE}/auth/api/roles`, {
    params: { zodu_id: zoduId, branch_id: branchId },
  });
  if (data.success) return data.data;
  return [];
}

export function useRoles() {
  const { zoduId, branchId } = getTenantContext();
  return useQuery({
    queryKey: roleQueryKeys.list(zoduId, branchId),
    queryFn: fetchRoles,
    staleTime: 30_000,
  });
}

// ─── Fetch single role ────────────────────────────────────────

async function fetchRoleDetail(roleId: string): Promise<RoleDetail> {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await axios.get(`${API_BASE}/auth/api/roles/${roleId}`, {
    params: { zodu_id: zoduId, branch_id: branchId },
  });
  if (data.success) return data.data;
  throw new Error("Failed to fetch role");
}

export function useRoleDetail(roleId: string | null) {
  return useQuery({
    queryKey: roleQueryKeys.detail(roleId ?? ""),
    queryFn: () => fetchRoleDetail(roleId!),
    enabled: !!roleId,
    staleTime: 30_000,
  });
}

// ─── Create role ──────────────────────────────────────────────

async function createRole(payload: CreateRolePayload) {
  const { data } = await axios.post(`${API_BASE}/auth/api/roles`, payload);
  return data;
}

export function useCreateRole(options?: {
  onSuccess?: () => void;
  onError?: (msg: string) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.all });
      options?.onSuccess?.();
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.error ?? err.response?.data?.message ?? err.message)
        : "Failed to create role";
      options?.onError?.(msg);
    },
  });
}

// ─── Update role ──────────────────────────────────────────────

interface UpdateRolePayload extends Omit<CreateRolePayload, "zodu_id" | "branch_id"> {
  zodu_id: string;
  branch_id: string;
}

async function updateRole({
  roleId,
  payload,
}: {
  roleId: string;
  payload: UpdateRolePayload;
}) {
  const { data } = await axios.put(`${API_BASE}/auth/api/roles/${roleId}`, payload);
  return data;
}

export function useUpdateRole(options?: {
  onSuccess?: () => void;
  onError?: (msg: string) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.all });
      options?.onSuccess?.();
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.error ?? err.response?.data?.message ?? err.message)
        : "Failed to update role";
      options?.onError?.(msg);
    },
  });
}

// ─── Delete role ──────────────────────────────────────────────

async function deleteRole(roleId: string) {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await axios.delete(`${API_BASE}/auth/api/roles/${roleId}`, {
    data: { zodu_id: zoduId, branch_id: branchId },
  });
  return data;
}

export function useDeleteRole(options?: {
  onSuccess?: () => void;
  onError?: (msg: string) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.all });
      options?.onSuccess?.();
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? err.message
        : "Failed to delete role";
      options?.onError?.(msg);
    },
  });
}
