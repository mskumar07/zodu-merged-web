/**
 * useInventoryApi.ts
 * ─────────────────────────────────────────────────────────────
 * TanStack Query hooks for:
 *   GET  /retail/api/inventory/summary  → useInventorySummary
 *   GET  /retail/api/inventory/list     → useInfiniteInventory
 *   GET  /retail/api/inventory/:uuid    → useInventoryDetail
 *   POST /retail/api/inventory/adjust   → useAdjustStock
 */

import axios from 'axios';
import { getTenantContext, getAccessToken, useTenantContext } from '@store/tenantContext';
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://api.myzodu.com';

function getRoute() {
  const { businessType } = getTenantContext();
  return businessType === 'Restaurant' ? 'restaurant' : 'retail';
}

function getApi() {
  const token = getAccessToken();
  return axios.create({
    baseURL: `${API_BASE}/${getRoute()}/api`,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

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
  stock_alert?:    number;
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
  summary:  (branchId: string, businessType: string) => ['inventory', 'summary', branchId, businessType]          as const,
  list:     (p: InventoryListParams, branchId: string, businessType: string) => ['inventory', 'list', branchId, businessType, p] as const,
  detail:   (uuid: string)     => ['inventory', uuid]                          as const,
};

// ─── API functions ────────────────────────────────────────────

async function fetchSummary(): Promise<InventorySummary> {
  const { zoduId, branchId, businessType } = getTenantContext();
  const url = businessType === 'Restaurant'
    ? `/inventory/summary`
    : `/menu/inventory/summary`;
  const { data } = await getApi().get<{ success: boolean; data: InventorySummary }>(
    url,
    { params: { zodu_id: zoduId, branch_id: branchId } }
  );
  return data.data;
}

interface RestaurantInventoryRaw {
  inventory_id:       number;
  inventory_uuid:     string;
  zodu_id:            string;
  branch_id:          string;
  category_id:        number | null;
  item_id:            string;
  item_name:          string | null;
  item_unit:          string | null;
  stock_qty:          string;
  stock_alert:        string;
  purchase_price:     string | null;
  selling_price:      string | null;
  last_purchase_date: string | null;
  updated_at:         string | null;
  inventory_type:     string | null;
  created_at:         string;
  item_uuid:          string;
  category_name:      string | null;
  gst_tax:            number | null;
  unit_name:          string | null;
  unit_short_name:    string | null;
}

interface RawInventoryListResponse {
  message:      string;
  data:         RestaurantInventoryRaw[];
  total_count:  number;
  total_pages:  number;
  current_page: number;
  limit:        number;
}

function normalizeRestaurantItem(r: RestaurantInventoryRaw): InventoryItem {
  const qty    = Number(r.stock_qty  ?? 0);
  const alert  = Number(r.stock_alert ?? 0);
  const price  = Number(r.purchase_price ?? 0);
  const status: StockStatus =
    qty === 0 ? 'out_of_stock' :
    qty <= alert ? 'low_stock' :
    'in_stock';
  return {
    inventory_uuid:    r.inventory_uuid ?? String(r.inventory_id),
    item_uuid:         r.item_uuid,
    item_id:           r.item_id,
    item_name:         r.item_name ?? '',
    available_qty:     r.stock_qty,
    reorder_level:     r.stock_alert,
    last_stock_update: r.last_purchase_date ?? r.updated_at ?? r.created_at,
    created_at:        r.created_at,
    sell_price:        r.selling_price,
    purchase_price:    r.purchase_price,
    item_img:          null,
    item_type:         r.inventory_type,
    item_status:       null,
    hsn_code:          null,
    barcode:           null,
    category_name:     r.category_name,
    unit_short_name:   r.unit_short_name,
    gst_rate:          r.gst_tax != null ? String(r.gst_tax) : null,
    stock_status:      status,
    stock_value:       String((qty * price).toFixed(2)),
  };
}

async function fetchInventoryList(
  params: InventoryListParams
): Promise<InventoryListResponse> {
  const { zoduId, branchId, businessType } = getTenantContext();

  if (businessType === 'Restaurant') {
    const { data } = await getApi().get<RawInventoryListResponse>(
      `/inventory/get/inventory-list/${zoduId}/${branchId}`,
      {
        params: {
          page:     params.page   ?? 1,
          limit:    params.limit  ?? 15,
          ...(params.search?.trim()        ? { search:   params.search.trim() }  : {}),
          ...(params.category_ids?.length  ? { category: params.category_ids }   : {}),
        },
      }
    );
    return {
      success:     true,
      total:       data.total_count,
      page:        data.current_page,
      limit:       data.limit,
      total_pages: data.total_pages,
      data:        (data.data ?? []).map(normalizeRestaurantItem),
    };
  }

  // Retail
  const { data } = await getApi().get<InventoryListResponse>(
    `/menu/inventory/list`,
    {
      params: {
        zodu_id:      zoduId,
        branch_id:    branchId,
        search:       params.search       || undefined,
        category_id:  params.category_ids || [],
        stock_status: params.stock_status || undefined,
        page:         params.page         ?? 1,
        limit:        params.limit        ?? 15,
      },
    }
  );
  return data;
}

async function fetchInventoryDetail(inventory_uuid: string): Promise<InventoryItem> {
  const { data } = await getApi().get<{ success: boolean; data: InventoryItem }>(
    `/menu/inventory/${inventory_uuid}`
  );
  return data.data;
}

async function postAdjustStock(
  payload: AdjustStockPayload
): Promise<AdjustStockResponse> {
  const { businessType } = getTenantContext();
  const url = businessType === 'Restaurant'
    ? `/inventory/adjust`
    : `/menu/inventory/adjust`;
  const { data } = await getApi().post<AdjustStockResponse>(url, payload);
  return data;
}

// ─── Hooks ────────────────────────────────────────────────────

/** Summary stats for the 4 top cards. Refreshes every 2 min. */
export function useInventorySummary(): UseQueryResult<InventorySummary> {
  const { branchId, businessType } = useTenantContext();
  return useQuery({
    queryKey:             inventoryQueryKeys.summary(branchId ?? '', businessType ?? ''),
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
  const { branchId, businessType } = useTenantContext();
  return useInfiniteQuery({
    queryKey: ['inventory', 'list', branchId ?? '', businessType ?? '', JSON.stringify(params)],
    queryFn:          ({ pageParam }) =>
                        fetchInventoryList({ ...params, page: pageParam, limit: params.limit ?? 15 }),
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
  const { zoduId, branchId, businessType } = getTenantContext();
  const url = businessType === 'Restaurant'
    ? `/inventory/stock/history/${item_uuid}`
    : `/menu/stock/history/${item_uuid}`;
  const { data } = await getApi().get<StockHistoryResponse | { success: boolean; data: StockHistoryResponse }>(url, {
    params: { zodu_id: zoduId, branch_id: branchId },
  });
  // Restaurant returns the payload at the top level; Retail wraps it under { data: ... }
  return ('item' in data ? data : (data as { data: StockHistoryResponse }).data) as StockHistoryResponse;
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
