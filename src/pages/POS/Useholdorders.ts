/**
 * useHoldOrders.ts
 * ─────────────────────────────────────────────────────────────
 * TanStack Query hooks for the Hold API.
 *  - useHoldOrders     — fetch all holds for a branch
 *  - useSaveHold       — POST  /add/hold_menu
 *  - useDeleteHold     — DELETE /delete/hold-menu/:id
 * ─────────────────────────────────────────────────────────────
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "https://api.myzodu.com";

// ── Query key factory ─────────────────────────────────────────
export const holdKeys = {
  all: (zoduId: string, branchId: string) =>
    ["holds", zoduId, branchId] as const,
};

// ── API shape ─────────────────────────────────────────────────
export interface HoldItemPayload {
  item_uuid?:      string | null;
  item_id:         string;
  item_name:       string;
  variant_id?:     string | null;
  variant_name?:   string | null;
  unit?:           string | null;
  quantity:        number;
  price:           number;
  mrp?:            number | null;
  discount?:       number;
  hsn_code?:       string | null;
  gst_percentage?: number;
  tax_amount?:     number;
  cgst?:           number;
  sgst?:           number;
  tax_inclusive?:  boolean;
}

export interface SaveHoldPayload {
  zodu_id:          string;
  branch_id:        string;
  order_type:       "SALE" | "QUOTATION";
  table_no?:        string | null;
  notes?:           string | null;
  customer_uuid?:   string | null;
  customer_name?:   string | null;
  customer_phone?:  string | null;
  total_items:      number;
  subtotal:         number;
  total_tax:        number;
  discount_type?:   "percentage" | "flat" | null;
  discount_value?:  number;
  discount_amount?: number;
  round_off?:       number;
  total_amount:     number;
  items:            HoldItemPayload[];
}

export interface ApiHoldItem {
  id:             number;
  hold_uuid:      string;
  item_uuid:      string | null;
  item_id:        string;
  item_name:      string;
  variant_id:     string | null;
  variant_name:   string | null;
  unit:           string | null;
  quantity:       number;
  price:          number;
  mrp:            number | null;
  discount:       number;
  hsn_code:       string | null;
  gst_percentage: number;
  tax_amount:     number;
  cgst:           number;
  sgst:           number;
  tax_inclusive:  boolean;
  total_amount:   number;
}

export interface ApiHold {
  hold_uuid:       string;
  hold_id:         string;
  zodu_id:         string;
  branch_id:       string;
  order_type:      string;
  table_no:        string | null;
  notes:           string | null;
  customer_uuid:   string | null;
  customer_name:   string | null;
  customer_phone:  string | null;
  total_items:     number;
  subtotal:        number;
  total_tax:       number;
  discount_type:   string | null;
  discount_value:  number;
  discount_amount: number;
  round_off:       number;
  total_amount:    number;
  created_at:      string;
  updated_at:      string | null;
  items:           ApiHoldItem[];
}

// ── Fetch holds ───────────────────────────────────────────────
async function fetchHolds(zoduId: string, branchId: string): Promise<ApiHold[]> {
  const { data } = await axios.get(
    `${API_BASE}/retail/get/hold_menu/${zoduId}/${branchId}`
  );
  return data.data ?? [];
}

// ── Save hold ─────────────────────────────────────────────────
async function saveHold(payload: SaveHoldPayload): Promise<{ hold_uuid: string }> {
  const { data } = await axios.post(
    `${API_BASE}/retail/add/hold_menu`,
    payload
  );
  return data.data;
}

// ── Delete hold ───────────────────────────────────────────────
async function deleteHold(holdUuid: string): Promise<void> {
  await axios.delete(
    `${API_BASE}/retail/delete/hold-menu/${holdUuid}`
  );
}

// ── Hooks ─────────────────────────────────────────────────────

/**
 * Fetch all holds for a branch.
 *
 * KEY FIX: `enabled` is no longer tied to dialog open state.
 * The query runs as long as zoduId + branchId are present so
 * the badge count on the RECALL button stays accurate at all times.
 * The dialog can call `refetch` manually when it opens to get
 * the very latest data immediately.
 */
export function useHoldOrders(zoduId: string, branchId: string) {
  return useQuery({
    queryKey:             holdKeys.all(zoduId, branchId),
    queryFn:              () => fetchHolds(zoduId, branchId),
    enabled:              !!zoduId && !!branchId,   // always on — badge stays live
    staleTime:            0,                         // always refetch on focus/mount
    refetchOnWindowFocus: false,
    retry:                1,
  });
}

/**
 * Save (create) a hold.
 * Invalidates + immediately refetches the hold list on success
 * so the badge count updates right after holding an order.
 */
export function useSaveHold(zoduId: string, branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveHold,
    onSuccess: () => {
      // invalidateQueries marks stale AND triggers an immediate refetch
      // because the query is always enabled (not gated by dialog).
      queryClient.invalidateQueries({ queryKey: holdKeys.all(zoduId, branchId) });
    },
  });
}

/**
 * Delete a hold by uuid.
 * Uses optimistic removal so the dialog list updates instantly,
 * then re-syncs (and updates the badge) on settle.
 */
export function useDeleteHold(zoduId: string, branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteHold,
    onMutate: async (holdUuid) => {
      await queryClient.cancelQueries({ queryKey: holdKeys.all(zoduId, branchId) });
      const prev = queryClient.getQueryData<ApiHold[]>(holdKeys.all(zoduId, branchId));
      // Optimistic removal — list and badge update immediately
      queryClient.setQueryData<ApiHold[]>(
        holdKeys.all(zoduId, branchId),
        (old) => (old ?? []).filter((h) => h.hold_uuid !== holdUuid)
      );
      return { prev };
    },
    onError: (_err, _uuid, ctx) => {
      // Roll back on failure
      if (ctx?.prev) {
        queryClient.setQueryData(holdKeys.all(zoduId, branchId), ctx.prev);
      }
    },
    onSettled: () => {
      // Final sync — updates badge to true server count
      queryClient.invalidateQueries({ queryKey: holdKeys.all(zoduId, branchId) });
    },
  });
}