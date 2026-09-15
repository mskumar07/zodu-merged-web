/**
 * kotApi.ts
 * ─────────────────────────────────────────────────────────────
 * TanStack Query hooks for the KOT printer counter feature (Bulk Assign
 * KOT Printer modal):
 *   - GET  /restaurant/get/kot-counters/:zodu_id/:branch_id    → useKotCounters
 *   - POST /restaurant/add/kot-counter                          → useAddKotCounter
 *   - GET  /restaurant/get/kot-assignment/:zodu_id/:branch_id  → useKotAssignment
 *   - POST /restaurant/assign/kot-counter-items                → useAssignKotCounterItems
 */

import axios, { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiConfig } from "@config/api";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Types ──────────────────────────────────────────────────────

export interface KotCounter {
  id: number;
  zodu_id: string;
  branch_id: string;
  counter_name: string;
  counter_code: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface KotAssignmentItem {
  menu_item_id: string;
  menu_id: string;
  menu_name: string;
  kot_counter_id: number | null;
}

export interface KotAssignmentCategory {
  category_id: number;
  category_name: string;
  items: KotAssignmentItem[];
}

interface ApiFieldError {
  field: string;
  message: string;
}

// The backend answers either `{ message }` (duplicate/db-level errors) or
// `{ errors: [{ field, message }] }` (Joi-style validation) — normalise
// both into one readable string for the caller's error state.
function extractErrorMessage(err: unknown, fallback: string): string {
  const axiosErr = err as AxiosError<{ message?: string; errors?: ApiFieldError[] }>;
  const body = axiosErr?.response?.data;
  if (body?.errors?.length) return body.errors.map((e) => e.message).join(", ");
  if (body?.message) return body.message;
  return fallback;
}

const KOT_COUNTERS_KEY = (zoduId: string, branchId: string) => ["kot", "counters", zoduId, branchId];
const KOT_ASSIGNMENT_KEY = (zoduId: string, branchId: string) => ["kot", "assignment", zoduId, branchId];

// ─── GET counters ───────────────────────────────────────────────

export function useKotCounters(zoduId: string, branchId: string) {
  return useQuery({
    queryKey: KOT_COUNTERS_KEY(zoduId, branchId),
    queryFn: async (): Promise<KotCounter[]> => {
      const { data } = await axios.get(
        `${API_BASE}${apiConfig.menu.getKotCounters(zoduId, branchId)}`,
        { headers: authHeaders() }
      );
      return data?.data ?? [];
    },
    enabled: !!zoduId && !!branchId,
    staleTime: 60 * 1000,
  });
}

// ─── POST add counter ───────────────────────────────────────────

export function useAddKotCounter(zoduId: string, branchId: string, opts?: {
  onSuccess?: (counter: KotCounter) => void;
  onError?: (message: string) => void;
}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (counterName: string): Promise<KotCounter> => {
      const { data } = await axios.post(
        `${API_BASE}${apiConfig.menu.addKotCounter()}`,
        { zodu_id: zoduId, branch_id: branchId, counter_name: counterName },
        { headers: authHeaders() }
      );
      return data?.data;
    },
    onSuccess: (counter) => {
      qc.invalidateQueries({ queryKey: KOT_COUNTERS_KEY(zoduId, branchId) });
      opts?.onSuccess?.(counter);
    },
    onError: (err) => {
      opts?.onError?.(extractErrorMessage(err, "Unable to create KOT counter"));
    },
  });
}

// ─── GET assignment data (categories + items + current counter) ─

export function useKotAssignment(zoduId: string, branchId: string) {
  return useQuery({
    queryKey: KOT_ASSIGNMENT_KEY(zoduId, branchId),
    queryFn: async (): Promise<KotAssignmentCategory[]> => {
      const { data } = await axios.get(
        `${API_BASE}${apiConfig.menu.getKotAssignment(zoduId, branchId)}`,
        { headers: authHeaders() }
      );
      return data?.data ?? [];
    },
    enabled: !!zoduId && !!branchId,
    staleTime: 30 * 1000,
  });
}

// ─── POST assign items to a counter ──────────────────────────────

interface AssignPayload {
  kotCounterId: number;
  menuItemIds: string[];
}

export function useAssignKotCounterItems(zoduId: string, branchId: string, opts?: {
  onSuccess?: () => void;
  onError?: (message: string) => void;
}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ kotCounterId, menuItemIds }: AssignPayload) => {
      const { data } = await axios.post(
        `${API_BASE}${apiConfig.menu.assignKotCounterItems()}`,
        {
          zodu_id: zoduId,
          branch_id: branchId,
          kot_counter_id: kotCounterId,
          menu_item_ids: menuItemIds,
        },
        { headers: authHeaders() }
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KOT_ASSIGNMENT_KEY(zoduId, branchId) });
      opts?.onSuccess?.();
    },
    onError: (err) => {
      opts?.onError?.(extractErrorMessage(err, "Unable to assign items to KOT counter"));
    },
  });
}
