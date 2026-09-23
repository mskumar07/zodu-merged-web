/**
 * kotApi.ts
 * ─────────────────────────────────────────────────────────────
 * TanStack Query hooks for KOT counters, printers and tickets:
 *   - counters:   GET /get/kot-counters, POST /add/kot-counter,
 *                 PUT /update/kot-counter/:id, DELETE /delete/kot-counter/:id
 *   - mapping:    GET /get/kot-assignment, POST /assign/kot-counter-items,
 *                 GET|PUT kot-item-routing (one item's counter + fallback)
 *   - printers:   GET /get/kot-printers, POST /add/kot-printer,
 *                 PUT /update/kot-printer/:id, DELETE /delete/kot-printer/:id
 *   - settings:   GET /get/kot-settings, PUT /update/kot-settings
 *   - POS:        GET /get/kot-config (counters + printers + settings),
 *                 GET /get/kot-tickets/:api_order_id, POST /add/kot-print-log
 * All under /restaurant, all scoped by zodu_id + branch_id.
 */

import axios, { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiConfig } from "@config/api";
import { getAccessToken } from "@store/tenantContext";
import type { KotBatch } from "@utils/kot/kotTicket";
import type {
  BillingCopyMode,
  KotConfig,
  KotCounterConfig,
  KotPrinter,
  KotSettings,
  PrintLogEntry,
} from "@utils/kot/kotDispatch";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Types ──────────────────────────────────────────────────────

export interface KotCounter extends KotCounterConfig {
  zodu_id: string;
  branch_id: string;
  created_at: string;
  updated_at: string;
}

export type { KotPrinter, KotSettings, KotConfig, BillingCopyMode };

export interface KotAssignmentItem {
  menu_item_id: string;
  menu_id: string;
  menu_name: string;
  kot_counter_id: number | null;
  fallback_counter_id?: number | null;
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
const KOT_PRINTERS_KEY = (zoduId: string, branchId: string) => ["kot", "printers", zoduId, branchId];
const KOT_SETTINGS_KEY = (zoduId: string, branchId: string) => ["kot", "settings", zoduId, branchId];
const KOT_CONFIG_KEY = (zoduId: string, branchId: string) => ["kot", "config", zoduId, branchId];
const KOT_ROUTING_KEY = (zoduId: string, branchId: string, menuId: string) => ["kot", "routing", zoduId, branchId, menuId];

// Counters, printers, settings and item routing all feed each other (counter
// lists show printers, the POS config bundles all three), so any change
// refreshes every KOT query rather than guessing which ones went stale.
const invalidateKot = (qc: ReturnType<typeof useQueryClient>) => qc.invalidateQueries({ queryKey: ["kot"] });

export { extractErrorMessage };

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

export interface KotCounterInput {
  counter_name: string;
  printer_id?: number | null;
  print_billing_copy?: boolean;
  is_default?: boolean;
  active?: boolean;
}

export function useAddKotCounter(zoduId: string, branchId: string, opts?: {
  onSuccess?: (counter: KotCounter) => void;
  onError?: (message: string) => void;
}) {
  const qc = useQueryClient();
  return useMutation({
    // A bare name is what the bulk-assign modal sends; Settings sends the full counter.
    mutationFn: async (input: string | KotCounterInput): Promise<KotCounter> => {
      const body = typeof input === "string" ? { counter_name: input } : input;
      const { data } = await axios.post(
        `${API_BASE}${apiConfig.menu.addKotCounter()}`,
        { zodu_id: zoduId, branch_id: branchId, ...body },
        { headers: authHeaders() }
      );
      return data?.data;
    },
    onSuccess: (counter) => {
      invalidateKot(qc);
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
      invalidateKot(qc);
      opts?.onSuccess?.();
    },
    onError: (err) => {
      opts?.onError?.(extractErrorMessage(err, "Unable to assign items to KOT counter"));
    },
  });
}

// ─── Counter edit / delete ──────────────────────────────────────

export function useUpdateKotCounter(zoduId: string, branchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: Required<KotCounterInput> & { id: number }): Promise<KotCounter> => {
      const { data } = await axios.put(
        `${API_BASE}${apiConfig.menu.updateKotCounter(id)}`,
        { zodu_id: zoduId, branch_id: branchId, ...input },
        { headers: authHeaders() }
      );
      return data?.data;
    },
    onSuccess: () => invalidateKot(qc),
  });
}

export function useDeleteKotCounter(zoduId: string, branchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`${API_BASE}${apiConfig.menu.deleteKotCounter(id, zoduId, branchId)}`, { headers: authHeaders() });
    },
    onSuccess: () => invalidateKot(qc),
  });
}

// ─── Printers ───────────────────────────────────────────────────

export function useKotPrinters(zoduId: string, branchId: string) {
  return useQuery({
    queryKey: KOT_PRINTERS_KEY(zoduId, branchId),
    queryFn: async (): Promise<KotPrinter[]> => {
      const { data } = await axios.get(`${API_BASE}${apiConfig.menu.getKotPrinters(zoduId, branchId)}`, { headers: authHeaders() });
      return data?.data ?? [];
    },
    enabled: !!zoduId && !!branchId,
    staleTime: 60 * 1000,
  });
}

export type KotPrinterInput = Omit<KotPrinter, "id">;

export function useSaveKotPrinter(zoduId: string, branchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: KotPrinterInput & { id?: number }): Promise<KotPrinter> => {
      // Only the editable fields: a printer being edited arrives as the full row, and the
      // API rejects server-owned ones (printer_uuid, created_at, updated_at, ...).
      const body = {
        zodu_id:         zoduId,
        branch_id:       branchId,
        printer_name:    input.printer_name,
        connection_type: input.connection_type,
        ip_address:      input.ip_address,
        // USB/Bluetooth printers have no port; the schema takes a number or nothing, not null.
        port:            input.port ?? undefined,
        device_name:     input.device_name,
        paper_size:      input.paper_size,
        cut_mode:        input.cut_mode,
        role:            input.role,
        active:          input.active,
      };
      const { data } = id
        ? await axios.put(`${API_BASE}${apiConfig.menu.updateKotPrinter(id)}`, body, { headers: authHeaders() })
        : await axios.post(`${API_BASE}${apiConfig.menu.addKotPrinter()}`, body, { headers: authHeaders() });
      return data?.data;
    },
    onSuccess: () => invalidateKot(qc),
  });
}

export function useDeleteKotPrinter(zoduId: string, branchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`${API_BASE}${apiConfig.menu.deleteKotPrinter(id, zoduId, branchId)}`, { headers: authHeaders() });
    },
    onSuccess: () => invalidateKot(qc),
  });
}

// ─── Settings ───────────────────────────────────────────────────

export function useKotSettings(zoduId: string, branchId: string) {
  return useQuery({
    queryKey: KOT_SETTINGS_KEY(zoduId, branchId),
    queryFn: async (): Promise<KotSettings> => {
      const { data } = await axios.get(`${API_BASE}${apiConfig.menu.getKotSettings(zoduId, branchId)}`, { headers: authHeaders() });
      return data?.data;
    },
    enabled: !!zoduId && !!branchId,
    staleTime: 60 * 1000,
  });
}

export function useUpdateKotSettings(zoduId: string, branchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: KotSettings): Promise<KotSettings> => {
      const { data } = await axios.put(
        `${API_BASE}${apiConfig.menu.updateKotSettings()}`,
        { zodu_id: zoduId, branch_id: branchId, ...settings },
        { headers: authHeaders() }
      );
      return data?.data;
    },
    onSuccess: () => invalidateKot(qc),
  });
}

// ─── POS: config, item routing, tickets, print log ──────────────

export const kotConfigQuery = (zoduId: string, branchId: string) => ({
  queryKey: KOT_CONFIG_KEY(zoduId, branchId),
  queryFn: async (): Promise<KotConfig> => {
    const { data } = await axios.get(`${API_BASE}${apiConfig.menu.getKotConfig(zoduId, branchId)}`, { headers: authHeaders() });
    return data?.data;
  },
});

/** Everything the POS routes tickets with. Kept warm so a send doesn't wait on it. */
export function useKotConfig(zoduId: string, branchId: string) {
  return useQuery({
    ...kotConfigQuery(zoduId, branchId),
    enabled: !!zoduId && !!branchId,
    staleTime: 60 * 1000,
    // A branch on a backend without KOT routes simply prints nothing.
    retry: false,
  });
}

export interface KotItemRouting {
  menu_id: string;
  kot_counter_id: number | null;
  fallback_counter_id: number | null;
}

export function useKotItemRouting(zoduId: string, branchId: string, menuId: string | null | undefined) {
  return useQuery({
    queryKey: KOT_ROUTING_KEY(zoduId, branchId, menuId ?? ""),
    queryFn: async (): Promise<KotItemRouting> => {
      const { data } = await axios.get(`${API_BASE}${apiConfig.menu.getKotItemRouting(zoduId, branchId, menuId!)}`, { headers: authHeaders() });
      return data?.data;
    },
    enabled: !!zoduId && !!branchId && !!menuId,
    staleTime: 0,
  });
}

export async function updateKotItemRouting(zoduId: string, branchId: string, routing: KotItemRouting): Promise<KotItemRouting> {
  const { data } = await axios.put(
    `${API_BASE}${apiConfig.menu.updateKotItemRouting()}`,
    { zodu_id: zoduId, branch_id: branchId, ...routing },
    { headers: authHeaders() }
  );
  return data?.data;
}

export async function fetchKotTickets(zoduId: string, branchId: string, apiOrderId: string): Promise<KotBatch[]> {
  const { data } = await axios.get(`${API_BASE}${apiConfig.menu.getKotTickets(zoduId, branchId, apiOrderId)}`, { headers: authHeaders() });
  return data?.data ?? [];
}

export async function postKotPrintLog(zoduId: string, branchId: string, entries: PrintLogEntry[]): Promise<void> {
  await axios.post(
    `${API_BASE}${apiConfig.menu.addKotPrintLog()}`,
    { zodu_id: zoduId, branch_id: branchId, entries },
    { headers: authHeaders() }
  );
}
