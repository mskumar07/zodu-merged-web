/**
 * useKdsData.ts
 * Data hook for the Kitchen Display Screen.
 *
 * GET  /restaurant/api/orders/get/kot-list/:zodu_id/:branch_id
 *   Returns one row per KOT ticket (already grouped server-side), sorted
 *   newest-first. Several rows can share the same `api_order_id` when a
 *   table has sent more than one KOT — those are combined client-side into
 *   a single order card.
 *
 * PUT  /restaurant/api/orders/api/kot/order-ready
 *   Marks every pending item on one order ready and removes it from the
 *   kitchen's queue server-side. There is no per-KOT "ready" — "Order Ready"
 *   always applies to the whole order, matching what the API supports.
 *
 * The kot-list response also carries two pre-aggregated summaries alongside
 * `data` — `item_summary` (total qty per item, across every pending ticket)
 * and `order_type_summary` (order count per Dine-In/Takeaway/Delivery). Both
 * are computed server-side so the board doesn't need to re-derive totals
 * from tickets that may already be paginated/filtered.
 */
import { useMemo, useState } from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiConfig } from "@config/api";
import { getAccessToken } from "@store/tenantContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** tbl_kot_list.status: "P" = Pending, "C" = Completed (marked ready from the item modal). */
export const KOT_ITEM_COMPLETED = "C";

export interface KdsKotListItem {
  item_id: string;
  item_name: string;
  qty: number;
  status: string;
}

/** One row from the KOT list = one KOT ticket sent to the kitchen. */
export interface KdsKotTicket {
  api_order_id: string;
  legacy_order_ref: string | null;
  public_order_no: string | null;
  kot_no: string;
  table_no: string | null;
  order_type: string;
  created_at: string;
  items: KdsKotListItem[];
}

export interface KdsItemSummaryEntry {
  item_name: string;
  qty: number;
}

export interface KdsOrderTypeSummaryEntry {
  order_type: string;
  order_count: number;
}

interface KdsKotListResponse {
  data: KdsKotTicket[];
  item_summary?: KdsItemSummaryEntry[];
  order_type_summary?: KdsOrderTypeSummaryEntry[];
}

async function fetchKotList(zoduId: string, branchId: string): Promise<KdsKotListResponse> {
  const { data } = await axios.get(
    `${API_BASE}${apiConfig.menu.getKdsKotList(zoduId, branchId)}`,
    // `_t` keeps the browser from answering a poll with a cached / 304 copy that predates an item being marked ready.
    { headers: authHeaders(), params: { _t: Date.now() } }
  );
  return {
    data: (data?.data ?? []) as KdsKotTicket[],
    item_summary: data?.item_summary ?? [],
    order_type_summary: data?.order_type_summary ?? [],
  };
}

async function markOrderReady(zoduId: string, branchId: string, apiOrderId: string): Promise<void> {
  await axios.put(
    `${API_BASE}${apiConfig.menu.markKdsOrderReady()}`,
    { zodu_id: zoduId, branch_id: branchId, api_order_id: apiOrderId },
    { headers: authHeaders() }
  );
}

async function markItemReady(zoduId: string, branchId: string, apiOrderId: string, itemName: string): Promise<void> {
  await axios.put(
    `${API_BASE}${apiConfig.menu.markKdsItemReady()}`,
    { zodu_id: zoduId, branch_id: branchId, api_order_id: apiOrderId, item_name: itemName },
    { headers: authHeaders() }
  );
}

interface ItemReadyVars {
  apiOrderId: string;
  itemName: string;
}

const itemKey = ({ apiOrderId, itemName }: ItemReadyVars) => `${apiOrderId}::${itemName}`;

/** One kitchen-ready card: a table/order with all its KOT tickets, newest send first. */
export interface KdsOrderCard {
  apiOrderId: string;
  tableNo: string | null;
  orderType: string;
  createdAt: string;
  legacyOrderRef: string | null;
  publicOrderNo: string | null;
  kotTickets: KdsKotTicket[];
}

function groupByOrder(rows: KdsKotTicket[]): KdsOrderCard[] {
  const map = new Map<string, KdsOrderCard>();
  // Rows arrive newest-first; keep that as each card's tickets order and use
  // the newest row's own timestamp/table/type/refs as the card's own — a
  // table's running order can't change type or reference numbers mid-flight,
  // so any row's is correct.
  rows.forEach((row) => {
    const existing = map.get(row.api_order_id);
    if (existing) {
      existing.kotTickets.push(row);
    } else {
      map.set(row.api_order_id, {
        apiOrderId: row.api_order_id,
        tableNo: row.table_no,
        orderType: row.order_type,
        createdAt: row.created_at,
        legacyOrderRef: row.legacy_order_ref,
        publicOrderNo: row.public_order_no,
        kotTickets: [row],
      });
    }
  });
  return [...map.values()];
}

const KOT_LIST_KEY = (zoduId: string, branchId: string) => ["restaurant", "kdsKotList", zoduId, branchId];

export function useKdsData(zoduId: string, branchId: string, pollMs = 8000) {
  const queryClient = useQueryClient();

  const kotListQuery = useQuery({
    queryKey: KOT_LIST_KEY(zoduId, branchId),
    queryFn: () => fetchKotList(zoduId, branchId),
    enabled: !!zoduId && !!branchId,
    refetchInterval: pollMs,
  });

  // Items marked ready here. Applied over whatever the server last sent, so a poll that lands
  // before the server reflects the change can't un-strike the item on the card.
  const [completedItemKeys, setCompletedItemKeys] = useState<Set<string>>(new Set());

  const rows = useMemo(() => {
    const raw = kotListQuery.data?.data ?? [];
    if (completedItemKeys.size === 0) return raw;
    return raw.map((ticket) => ({
      ...ticket,
      items: ticket.items.map((item) =>
        completedItemKeys.has(itemKey({ apiOrderId: ticket.api_order_id, itemName: item.item_name }))
          ? { ...item, status: KOT_ITEM_COMPLETED }
          : item
      ),
    }));
  }, [kotListQuery.data, completedItemKeys]);
  const cards = useMemo(() => groupByOrder(rows), [rows]);

  // The server's summary counts pending items only; take off whatever it still counts
  // for items completed here.
  const itemSummary = useMemo(() => {
    const summary = kotListQuery.data?.item_summary ?? [];
    if (completedItemKeys.size === 0) return summary;
    const stale = new Map<string, number>();
    (kotListQuery.data?.data ?? []).forEach((ticket) =>
      ticket.items.forEach((item) => {
        if (item.status !== KOT_ITEM_COMPLETED && completedItemKeys.has(itemKey({ apiOrderId: ticket.api_order_id, itemName: item.item_name }))) {
          stale.set(item.item_name, (stale.get(item.item_name) ?? 0) + item.qty);
        }
      })
    );
    if (stale.size === 0) return summary;
    return summary
      .map((entry) => ({ ...entry, qty: entry.qty - (stale.get(entry.item_name) ?? 0) }))
      .filter((entry) => entry.qty > 0);
  }, [kotListQuery.data, completedItemKeys]);
  const orderTypeSummary = kotListQuery.data?.order_type_summary ?? [];

  // Tracks in-flight "Order Ready" calls so a card can show a busy state and
  // the button can't be double-clicked into two requests for the same order.
  const [pendingOrderIds, setPendingOrderIds] = useState<Set<string>>(new Set());

  const readyMutation = useMutation({
    mutationFn: (apiOrderId: string) => markOrderReady(zoduId, branchId, apiOrderId),
    onMutate: async (apiOrderId: string) => {
      setPendingOrderIds((prev) => new Set(prev).add(apiOrderId));

      // Optimistic update: drop the card immediately so the board feels
      // instant, then reconcile with the server on settle. The summaries are
      // left stale here (not worth recomputing client-side) — the settle-time
      // refetch corrects them within a poll cycle.
      await queryClient.cancelQueries({ queryKey: KOT_LIST_KEY(zoduId, branchId) });
      const previousData = queryClient.getQueryData<KdsKotListResponse>(KOT_LIST_KEY(zoduId, branchId));
      queryClient.setQueryData<KdsKotListResponse>(KOT_LIST_KEY(zoduId, branchId), (old) =>
        old ? { ...old, data: old.data.filter((row) => row.api_order_id !== apiOrderId) } : old
      );
      return { previousData };
    },
    onError: (_err, _apiOrderId, context) => {
      // Roll back — the order is still pending on the kitchen's end.
      if (context?.previousData) {
        queryClient.setQueryData(KOT_LIST_KEY(zoduId, branchId), context.previousData);
      }
    },
    onSettled: (_data, _err, apiOrderId) => {
      setPendingOrderIds((prev) => {
        const next = new Set(prev);
        next.delete(apiOrderId);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: KOT_LIST_KEY(zoduId, branchId) });
    },
  });

  const markOrderReadyNow = (apiOrderId: string) => {
    if (pendingOrderIds.has(apiOrderId)) return;
    readyMutation.mutate(apiOrderId);
  };

  // Item-level "Mark Ready" from the item modal. Unlike the order-level call it
  // keeps the card on the board — the item is only flagged "C" so the card can
  // strike it through; the card itself goes when "Order Ready" is clicked.
  const [pendingItemKeys, setPendingItemKeys] = useState<Set<string>>(new Set());

  const itemReadyMutation = useMutation({
    mutationFn: ({ apiOrderId, itemName }: ItemReadyVars) => markItemReady(zoduId, branchId, apiOrderId, itemName),
    onMutate: async (vars: ItemReadyVars) => {
      setPendingItemKeys((prev) => new Set(prev).add(itemKey(vars)));
      setCompletedItemKeys((prev) => new Set(prev).add(itemKey(vars)));

      await queryClient.cancelQueries({ queryKey: KOT_LIST_KEY(zoduId, branchId) });
      const previousData = queryClient.getQueryData<KdsKotListResponse>(KOT_LIST_KEY(zoduId, branchId));
      queryClient.setQueryData<KdsKotListResponse>(KOT_LIST_KEY(zoduId, branchId), (old) => {
        if (!old) return old;
        let completedQty = 0;
        const data = old.data.map((ticket) => {
          if (ticket.api_order_id !== vars.apiOrderId) return ticket;
          return {
            ...ticket,
            items: ticket.items.map((item) => {
              if (item.item_name !== vars.itemName || item.status === KOT_ITEM_COMPLETED) return item;
              completedQty += item.qty;
              return { ...item, status: KOT_ITEM_COMPLETED };
            }),
          };
        });
        // Mirror the server's pending-only item_summary so the rail count drops at once.
        const item_summary = (old.item_summary ?? [])
          .map((entry) => (entry.item_name === vars.itemName ? { ...entry, qty: entry.qty - completedQty } : entry))
          .filter((entry) => entry.qty > 0);
        return { ...old, data, item_summary };
      });
      return { previousData };
    },
    onError: (_err, vars, context) => {
      setCompletedItemKeys((prev) => {
        const next = new Set(prev);
        next.delete(itemKey(vars));
        return next;
      });
      if (context?.previousData) {
        queryClient.setQueryData(KOT_LIST_KEY(zoduId, branchId), context.previousData);
      }
    },
    onSettled: (_data, _err, vars) => {
      setPendingItemKeys((prev) => {
        const next = new Set(prev);
        next.delete(itemKey(vars));
        return next;
      });
      queryClient.invalidateQueries({ queryKey: KOT_LIST_KEY(zoduId, branchId) });
    },
  });

  const markItemReadyNow = (apiOrderId: string, itemName: string) => {
    const vars = { apiOrderId, itemName };
    if (pendingItemKeys.has(itemKey(vars))) return;
    itemReadyMutation.mutate(vars);
  };

  const refreshNow = () => {
    queryClient.invalidateQueries({ queryKey: KOT_LIST_KEY(zoduId, branchId) });
  };

  return {
    cards,
    itemSummary,
    orderTypeSummary,
    isLoading: kotListQuery.isLoading,
    isFetching: kotListQuery.isFetching,
    pendingOrderIds,
    markOrderReady: markOrderReadyNow,
    pendingItemKeys,
    markItemReady: markItemReadyNow,
    refreshNow,
  };
}
