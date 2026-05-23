/**
 * useInventoryApi.ts
 * ─────────────────────────────────────────────────────────────
 * TanStack Query hooks for:
 *   GET  /restaurant/api/inventory/summary  → useInventorySummary
 *   GET  /restaurant/api/inventory/list     → useInfiniteInventory
 *   GET  /restaurant/api/inventory/:uuid    → useInventoryDetail
 *   POST /restaurant/api/inventory/adjust   → useAdjustStock
 */

import axios from 'axios';
import { getTenantContext, useTenantContext } from '@store/tenantContext';
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';

const API_BASE  = import.meta.env.VITE_API_BASE_URL ?? 'https://api.myzodu.com';

// ─── Types ────────────────────────────────────────────────────

export interface InventorySummary {
  total_stock_value:  number;
  low_stock_count:    number;
  out_of_stock_count: number;
  total_skus:         number;
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type AdjustmentType = 'add' | 'subtract';

export interface InventoryItem {
  inventory_uuid:    string;
  item_uuid:         string;
  item_id:           string;
  item_name:         string;
  available_qty:     string;      // numeric from pg comes as string
  reorder_level:     string;
  last_stock_update: string;
  created_at:        string;
  sell_price:        string | null;
  purchase_price:    string | null;
  item_img:          string | null;
  item_type:         string | null;
  item_status:       string | null;
  hsn_code:          string | null;
  barcode:           string | null;
  category_name:     string | null;
  unit_short_name:   string | null;
  gst_rate:          string | null;
  stock_status:      StockStatus;
  stock_value:       string;
}

export interface InventoryListResponse {
  success:     boolean;
  total:       number;
  page:        number;
  limit:       number;
  total_pages: number;
  data:        InventoryItem[];
}

export interface InventoryListParams {
  search?:        string;
  category_id?:   number;
  category_ids?:  number[];
  stock_status?:  StockStatus;
  page?:          number;
  limit?:         number;
}

export interface AdjustStockPayload {
  inventory_uuid:  string;
  adjustment_type: AdjustmentType;
  adjustment_qty:  number;
  reason:          string;
  notes?:          string;
}

export interface AdjustStockResponse {
  success:           boolean;
  message:           string;
  data: {
    inventory_uuid:    string;
    item_id:           string;
    item_name:         string;
    previous_qty:      number;
    adjustment_type:   AdjustmentType;
    adjustment_qty:    number;
    new_qty:           number;
    reason:            string;
    notes:             string | null;
    last_stock_update: string;
  };
}

export interface StockHistoryItem {
  ledger_id: string;
  transaction_type: string;
  qty_change: string;
  stock_before: string;
  stock_after: string;
  notes: string | null;
  created_at: string;
}

export interface StockHistoryResponse {
  success: boolean;

  item: {
    item_uuid: string;
    item_id: string;
    item_name: string;
  };

  data: StockHistoryItem[];

  summary: {
    current_stock: number;
    low_stock_alert: number;
    is_low: boolean;
  };
}
// ─── Query keys ───────────────────────────────────────────────
export const inventoryQueryKeys = {
  summary:  (branchId: string) => ['inventory', 'summary', branchId]          as const,
  list:     (p: InventoryListParams, branchId: string) => ['inventory', 'list', branchId, p] as const,
  detail:   (uuid: string)     => ['inventory', uuid]                          as const,
};

// ─── API functions ────────────────────────────────────────────

async function fetchSummary(): Promise<InventorySummary> {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await axios.get<{ success: boolean; data: InventorySummary }>(
    `${API_BASE}/restaurant/api/menu/inventory/summary`,
    { params: { zodu_id: zoduId, branch_id: branchId } }
  );
  return data.data;
}

async function fetchInventoryList(
  params: InventoryListParams
): Promise<InventoryListResponse> {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await axios.get<InventoryListResponse>(
    `${API_BASE}/restaurant/api/menu/inventory/list`,
    {
      params: {
        zodu_id:      zoduId,
        branch_id:    branchId,
        search:       params.search       || undefined,
        category_id:  params.category_ids || [],
        stock_status: params.stock_status || undefined,
        page:         params.page         ?? 1,
        limit:        params.limit        ?? 30,
      },
    }
  );
  console.log(data)
  return data;
}

async function fetchInventoryDetail(inventory_uuid: string): Promise<InventoryItem> {
  const { data } = await axios.get<{ success: boolean; data: InventoryItem }>(
    `${API_BASE}/restaurant/api/menu/inventory/${inventory_uuid}`
  );
  return data.data;
}

async function postAdjustStock(
  payload: AdjustStockPayload
): Promise<AdjustStockResponse> {
  const { data } = await axios.post<AdjustStockResponse>(
    `${API_BASE}/restaurant/api/menu/inventory/adjust`,
    payload
  );
  return data;
}

// ─── Hooks ────────────────────────────────────────────────────

/** Summary stats for the 4 top cards. Refreshes every 2 min. */
export function useInventorySummary(): UseQueryResult<InventorySummary> {
  const { branchId } = useTenantContext();
  return useQuery({
    queryKey:             inventoryQueryKeys.summary(branchId ?? ''),
    queryFn:              fetchSummary,
    staleTime:            2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry:                2,
  });
}

/** Infinite-scroll inventory list. */
export function useInfiniteInventory(
  params: Omit<InventoryListParams, 'page'> = {}
) {
  const { branchId } = useTenantContext();
  return useInfiniteQuery({
    queryKey: ['inventory', 'list', branchId ?? '', JSON.stringify(params)],
    queryFn:          ({ pageParam }) =>
                        fetchInventoryList({ ...params, page: pageParam, limit: params.limit ?? 30 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    staleTime:            2 * 60 * 1000,
    gcTime:               5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry:                2,
  });
}

/** Single inventory item detail (for the Adjust Stock modal). */
export function useInventoryDetail(
  inventory_uuid: string | null
): UseQueryResult<InventoryItem> {
  return useQuery({
    queryKey:  inventoryQueryKeys.detail(inventory_uuid ?? ''),
    queryFn:   () => fetchInventoryDetail(inventory_uuid!),
    enabled:   !!inventory_uuid,
    staleTime: 1 * 60 * 1000,
    retry:     2,
  });
}

/** Adjust stock (ADD or SUBTRACT). Invalidates summary + list on success. */
export function useAdjustStock(options?: {
  onSuccess?: (data: AdjustStockResponse) => void;
  onError?:   (message: string)           => void;
}): UseMutationResult<AdjustStockResponse, unknown, AdjustStockPayload> {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: postAdjustStock,
    onSuccess: (data) => {
      // Invalidate summary cards
      qc.invalidateQueries({
        queryKey:    ['inventory', 'summary'],
        refetchType: 'active',
      });
      // Invalidate all inventory list queries (prefix match covers all params variants)
      qc.invalidateQueries({
        queryKey:    ['inventory', 'list'],
        refetchType: 'active',
        exact:       false,
      });
      // Invalidate specific item detail cache
      qc.invalidateQueries({
        queryKey:    inventoryQueryKeys.detail(data.data.inventory_uuid),
        refetchType: 'active',
      });
      options?.onSuccess?.(data);
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? err.message
        : 'Failed to adjust stock';
      options?.onError?.(msg);
    },
  });
}

async function fetchStockHistory(item_uuid: string): Promise<StockHistoryResponse> {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await axios.get<StockHistoryResponse>(
    `${API_BASE}/restaurant/api/menu/stock/history/${item_uuid}`,
    {
      params: {
        zodu_id: zoduId,
        branch_id: branchId,
      },
    }
  );
  return data.data;
}

// ─── Hook ─────────────────────────────────────────
export function useStockHistory(item_uuid: string | null) {
  return useQuery({
    queryKey: ['stock-history', item_uuid],
    queryFn: () => fetchStockHistory(item_uuid!),
    enabled: !!item_uuid,
    staleTime: 60 * 1000,
  });
}
