/**
 * useMenuItemApi.ts
 * ─────────────────────────────────────────────────────────────
 * TanStack Query hooks for:
 *   - GET  /restaurant/get/category/:type/:branch_id  → useCategories
 *   - POST /restaurant/add/category                   → useAddCategory
 *   - POST /restaurant/api/add/menu_item              → useAddMenuItem
 */

import axios from "axios";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  type UseQueryResult,
  type UseMutationResult,
  type InfiniteData,
} from "@tanstack/react-query";
import { getTenantContext } from "@store/tenantContext";

const API_BASE  = import.meta.env.VITE_API_BASE_URL ?? "https://api.myzodu.com";

// ─── Types ────────────────────────────────────────────────────

export interface Category {
  value: string;   // category_id as string — used as <Select> value
  label: string;   // category_name        — displayed in dropdown
}

// Raw shape returned by GET /get/category/:type/:branch_id
interface ApiCategory {
  id:         number;    // ← actual field (not category_id)
  name:       string;    // ← actual field (not category_name)
  type:       string;
  zodu_id:    string;
  branch_id:  string;
  active:     boolean;
}

export interface AddCategoryPayload {
  name:        string;
  serviceType: "product" | "service";
}

export interface AddMenuItemPayload {
  item_type:      "S" | "P";
  item_name:      string;
  category_id:    number | null;
  unit:           number | null;   // ← now sends unit id (number) not string
  purchase_price: number | null;
  mrp:            number | null;
  sell_price:     number | null;
  gst_type:       number | null;
  tax_incl_type:  boolean;
  hsn_code:       string | null;
  barcode:        string | null;
  item_img:       string | null;
  status:         "active" | "inactive";
}

export interface AddMenuItemResponse {
  success: boolean;
  message: string;
  data:    Record<string, unknown>;
}

// Shape of a single menu item returned by GET /api/menu_item/:item_uuid
export interface MenuItem {
  item_uuid:        string;
  item_id:          string;
  zodu_id:          string;
  branch_id:        string;
  item_type:        string;
  item_name:        string;
  category_id:      number | null;
  unit:             number | null;
  mrp:              string | null;
  sell_price:       string | null;
  purchase_price:   string | null;
  gst_type:         number | null;
  tax_incl_type:    boolean;
  sku:              string | null;
  barcode:          string | null;
  hsn_code:         string | null;
  item_img:         string | null;
  status:           string;
  created_at:       string;
  // ── Joined lookup fields ──────────────────────────────────
  category_name:    string | null;   // from tbl_category.name
  unit_name:        string | null;   // from tbl_units.name
  unit_short_name:  string | null;   // from tbl_units.short_name
  gst_rate:         string | null;   // from tbl_gst.gst_rate  e.g. "18"
}

// Shape of paginated list response
export interface MenuItemListResponse {
  success:     boolean;
  total:       number;
  page:        number;
  limit:       number;
  total_pages: number;
  data:        MenuItem[];
}

// Params for GET /api/menu_items
export interface MenuItemListParams {
  search?:      string;
  category_id?: number;
  item_type?:   "S" | "P";
  status?:      "active" | "inactive";
  page?:        number;
  limit?:       number;
}

// Raw shape from GET /get/gst/:branch_id
export interface ApiGst {
  id:         number;    // ← actual field (not gst_id)
  gst_rate:   string;    // ← actual field, string e.g. "18" (not gst_percentage)
  zodu_id:    string;
  branch_id:  string;
}

export interface GstOption {
  value:      number;   // gst_id — sent to API as gst_type
  label:      string;   // "GST 18%" — shown in dropdown
  percentage: number;   // 18 — used for tax calculation
}

// Raw shape from GET /get/units/:branch_id
export interface ApiUnit {
  id:         number;
  name:       string;       // "Litre"
  short_name: string;       // "LTR"
  zodu_id:    string;
  branch_id:  string;
}

export interface UnitOption {
  value:      number;   // id — sent to API as unit
  label:      string;   // "Litre (LTR)" — shown in dropdown
  shortName:  string;   // "LTR" — shown in adornment
}

// ─── Query keys ───────────────────────────────────────────────
export const menuQueryKeys = {
  categories:     (serviceType: "product" | "service") =>
                    ["menu", "categories", serviceType, getTenantContext().branchId] as const,
  gstList:        () => ["menu", "gst", getTenantContext().branchId]          as const,
  unitList:       () => ["menu", "units", getTenantContext().branchId]         as const,
  menuItems:      (params: MenuItemListParams) =>
                    ["menu", "items", getTenantContext().zoduId, getTenantContext().branchId, params]      as const,
  menuItemDetail: (item_uuid: string) =>
                    ["menu", "item", getTenantContext().branchId, item_uuid]    as const,
};

// ─── API functions ────────────────────────────────────────────

/**
 * GET /restaurant/get/category/:type/:branch_id
 * type: product → "S" | service → "M"
 * NOTE: API returns capital "Data" key (not lowercase "data")
 */
async function fetchCategories(
  serviceType: "product" | "service"
): Promise<Category[]> {
  const { branchId, zoduId } = getTenantContext();
  const type = serviceType === "product" ? "S" : "M";
  const { data } = await axios.get<{ Data?: ApiCategory[]; data?: ApiCategory[] }>(
    `${API_BASE}/restaurant/get/category/${type}/${branchId}/${zoduId}`
  );
  // Handle both capital "Data" and lowercase "data" for safety
  const rows = data.Data ?? data.data ?? [];
  return rows.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));
}

/**
 * GET /restaurant/get/gst/:branch_id
 */
async function fetchGstList(): Promise<GstOption[]> {
  const { branchId, zoduId } = getTenantContext();
  const { data } = await axios.get<{ data: ApiGst[] }>(
    `${API_BASE}/restaurant/get/gst/${branchId}/${zoduId}`
  );
  return (data.data ?? []).map((g) => ({
    value:      g.id,                        // id → value (sent as gst_type to API)
    label:      `GST ${g.gst_rate}%`,        // "GST 18%" — built from gst_rate
    percentage: Number(g.gst_rate),          // "18" → 18
  }));
}

/**
 * GET /restaurant/get/units/:branch_id
 * NOTE: API returns capital "Data" key (same pattern as categories)
 */
async function fetchUnitList(): Promise<UnitOption[]> {
  const { branchId,zoduId } = getTenantContext();
  const { data } = await axios.get<{ Data?: ApiUnit[]; data?: ApiUnit[] }>(
    `${API_BASE}/restaurant/get/units/${branchId}/${zoduId}`
  );
  const rows = data.Data ?? data.data ?? [];
  return rows.map((u) => ({
    value:     u.id,
    label:     `${u.name} (${u.short_name})`,   // "Litre (LTR)"
    shortName: u.short_name,                     // "LTR" — for adornment
  }));
}

/**
 * GET /restaurant/api/menu_items
 * Paginated list with optional search + filters.
 */
async function fetchMenuItems(
  params: MenuItemListParams
): Promise<MenuItemListResponse> {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await axios.get<MenuItemListResponse>(
    `${API_BASE}/restaurant/api/menu/menu_items`,
    {
      params: {
        zodu_id:     zoduId,
        branch_id:   branchId,
        search:      params.search      || undefined,
        category_id: params.category_id || undefined,
        item_type:   params.item_type   || undefined,
        status:      params.status      || undefined,
        page:        params.page        ?? 1,
        limit:       params.limit       ?? 20,
      },
    }
  );
  return data;
}

/**
 * GET /restaurant/api/menu_item/:item_uuid
 * Single item detail by uuid.
 */
async function fetchMenuItemDetail(item_uuid: string): Promise<MenuItem> {
  const { data } = await axios.get<{ success: boolean; data: MenuItem }>(
    `${API_BASE}/restaurant/api/menu/menu_item/${item_uuid}`
  );
  return data.data;
}

/**
 * POST /restaurant/add/category
 */
async function postAddCategory(payload: AddCategoryPayload): Promise<Category> {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await axios.post<{ data: ApiCategory }>(
    `${API_BASE}/restaurant/add/category`,
    {
      zodu_id:   zoduId,
      branch_id: branchId,
      name:      payload.name.trim(),
      type:      payload.serviceType === "product" ? "S" : "M",
    }
  );
  const created = data.data;
  return {
    value: String(created.id),   // id → value
    label: created.name,          // name → label
  };
}

/**
 * POST /restaurant/api/add/menu_item
 */
async function postAddMenuItem(
  payload: AddMenuItemPayload
): Promise<AddMenuItemResponse> {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await axios.post<AddMenuItemResponse>(
    `${API_BASE}/restaurant/api/menu/add/menu_item`,
    { zodu_id: zoduId, branch_id: branchId, ...payload }
  );
  return data;
}

/**
 * DELETE /restaurant/api/delete/menu_item/:item_uuid
 */
async function deleteMenuItem(item_uuid: string): Promise<{ success: boolean; message: string }> {
  const { data } = await axios.delete<{ success: boolean; message: string }>(
    `${API_BASE}/restaurant/api/delete/menu_item/${item_uuid}`
  );
  return data;
}

// ─── Hooks ────────────────────────────────────────────────────


/**
 * Delete a menu item.
 * On success:
 *  - Invalidates menu list
 */
export function useDeleteMenuItem(options?: {
  onSuccess?: (data: { success: boolean; message: string }) => void;
  onError?: (message: string) => void;
}): UseMutationResult<{ success: boolean; message: string }, unknown, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMenuItem,

    onSuccess: (data) => {
      // 🔥 refresh list after delete
      queryClient.invalidateQueries({ queryKey: ["menu", "items"] });

      options?.onSuccess?.(data);
    },

    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? err.message
        : "Failed to delete item";

      options?.onError?.(msg);
    },
  });
}

/**
 * Fetch categories for a given service type.
 * Re-fetches automatically when serviceType changes (different queryKey).
 * No enabled flag — always fetches on mount so data is ready when dialog opens.
 */
export function useCategories(
  serviceType: "product" | "service"
): UseQueryResult<Category[]> {
  return useQuery({
    queryKey:             menuQueryKeys.categories(serviceType),
    queryFn:              () => fetchCategories(serviceType),
    staleTime:            5 * 60 * 1000,
    gcTime:               10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry:                2,
  });
}

/**
 * Fetch GST options from GET /get/gst/:branch_id.
 * Always fetches on mount — no enabled flag.
 */
export function useGstList(): UseQueryResult<GstOption[]> {
  return useQuery({
    queryKey:             menuQueryKeys.gstList(),
    queryFn:              fetchGstList,
    staleTime:            30 * 60 * 1000,
    gcTime:               60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry:                2,
  });
}

/**
 * Fetch unit options from GET /get/units/:branch_id.
 * Cached for 30 min — units rarely change.
 */
export function useUnitList(): UseQueryResult<UnitOption[]> {
  return useQuery({
    queryKey:             menuQueryKeys.unitList(),
    queryFn:              fetchUnitList,
    staleTime:            30 * 60 * 1000,
    gcTime:               60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry:                2,
  });
}

/**
 * Fetch paginated menu items list.
 * Re-fetches automatically when params change.
 */
export function useMenuItems(
  params: MenuItemListParams = {}
): UseQueryResult<MenuItemListResponse> {
  return useQuery({
    queryKey:             menuQueryKeys.menuItems(params),
    queryFn:              () => fetchMenuItems(params),
    staleTime:            2 * 60 * 1000,
    gcTime:               5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry:                2,
  });
}

/**
 * Infinite-scroll version of the menu items list.
 * Each page is fetched automatically as the user scrolls.
 * Params (search, item_type, status) are applied to every page.
 */
export function useInfiniteMenuItems(
  params: Omit<MenuItemListParams, "page"> = {}
) {
  return useInfiniteQuery({
    queryKey: ['menu', 'items', getTenantContext().zoduId, getTenantContext().branchId, JSON.stringify(params)],

    queryFn: ({ pageParam = 1 }) =>
      fetchMenuItems({
        ...params,
        page: pageParam,
        limit: params.limit ?? 20,
      }),

    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      return lastPage.page < lastPage.total_pages
        ? lastPage.page + 1
        : undefined;
    },

    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,

    // 🔥 IMPORTANT: prevent refetch loop
    refetchOnMount: false,
  });
}

/**
 * Fetch a single menu item by item_uuid.
 * Only runs when item_uuid is provided.
 */
export function useMenuItemDetail(
  item_uuid: string | null | undefined
): UseQueryResult<MenuItem> {
  return useQuery({
    queryKey:             menuQueryKeys.menuItemDetail(item_uuid ?? ""),
    queryFn:              () => fetchMenuItemDetail(item_uuid!),
    enabled:              !!item_uuid,    // only fetch when uuid is available
    staleTime:            5 * 60 * 1000,
    gcTime:               10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry:                2,
  });
}

/**
 * Add a new category.
 * On success:
 *  - Invalidates the category list so the dropdown refetches
 *  - Returns the newly created Category to the caller via onSuccess
 */
export function useAddCategory(options?: {
  onSuccess?: (category: Category) => void;
  onError?:   (message: string) => void;
}): UseMutationResult<Category, unknown, AddCategoryPayload> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postAddCategory,
    onSuccess: (category, variables) => {
      // Refetch category list for the current service type
      queryClient.invalidateQueries({
        queryKey: menuQueryKeys.categories(variables.serviceType),
      });
      options?.onSuccess?.(category);
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? err.message
        : "Failed to add category";
      options?.onError?.(msg);
    },
  });
}

/**
 * Create a new menu item.
 * On success: calls onSuccess with the created item data.
 */
export function useAddMenuItem(options?: {
  onSuccess?: (data: AddMenuItemResponse) => void;
  onError?:   (message: string) => void;
}): UseMutationResult<AddMenuItemResponse, unknown, AddMenuItemPayload> {
  return useMutation({
    mutationFn: postAddMenuItem,
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? err.message
        : "Failed to save item";
      options?.onError?.(msg);
    },
  });
}

// ─── Edit menu item ───────────────────────────────────────────

// Partial update payload — all fields optional except item_uuid
export type EditMenuItemPayload = Partial<AddMenuItemPayload>;

async function postEditMenuItem({
  item_uuid,
  ...payload
}: EditMenuItemPayload & { item_uuid: string }): Promise<AddMenuItemResponse> {
  const { data } = await axios.put<AddMenuItemResponse>(
    `${API_BASE}/restaurant/api/menu/edit/menu_item/${item_uuid}`,
    payload
  );
  return data;
}

/**
 * Edit an existing menu item.
 * On success: invalidates both the list and the detail cache for this item.
 */
export function useEditMenuItem(options?: {
  onSuccess?: (data: AddMenuItemResponse) => void;
  onError?:   (message: string) => void;
}): UseMutationResult<AddMenuItemResponse, unknown, EditMenuItemPayload & { item_uuid: string }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postEditMenuItem,
    onSuccess: (data, variables) => {
      // Invalidate detail cache for this specific item
      queryClient.invalidateQueries({
        queryKey: menuQueryKeys.menuItemDetail(variables.item_uuid),
      });
      // Invalidate list cache (sell price / name may have changed)
      queryClient.invalidateQueries({ queryKey: ["menu", "items"] });
      options?.onSuccess?.(data);
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? err.message
        : "Failed to update item";
      options?.onError?.(msg);
    },
  });
}
