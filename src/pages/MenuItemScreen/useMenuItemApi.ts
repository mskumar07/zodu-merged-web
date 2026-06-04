/**
 * useMenuItemApi.ts
 * ─────────────────────────────────────────────────────────────
 * TanStack Query hooks for:
 *   - GET  /retail/get/category/:type/:branch_id  → useCategories
 *   - POST /retail/add/category                   → useAddCategory
 *   - POST /retail/api/add/menu_item              → useAddMenuItem
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
import { getTenantContext, useTenantContext } from "@store/tenantContext";
import { clearSyncMeta } from "@pages/POS/db";
import { posProductsKey } from "@pages/POS/useposproducts";

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

// Full category row used in the Category tab table
export interface CategoryRow {
  id:         number;
  zodu_id:    string;
  branch_id:  string;
  name:       string;
  type:       string;       // full name: "Sellable" | "Service" | "Expense"
  type_code:  string;       // short code: "S" | "M" | "E"
  active:     boolean;
  created_at: string;
  updated_at: string;
}

export interface AddCategoryPayload {
  name:        string;
  serviceType: "product" | "service";
  type:        "S" | "M" | "E";
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
  search?:        string;
  category_id?:   number;
  category_ids?:  number[];
  item_type?:     "S" | "P";
  status?:        "active" | "inactive";
  page?:          number;
  limit?:         number;
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
 * GET /retail/get/category/:type/:branch_id
 * type: product → "S" | service → "M" | expense → "E"
 * NOTE: API returns capital "Data" key (not lowercase "data")
 */
interface CategoryFilterPage {
  Data?: ApiCategory[];
  data?: ApiCategory[];
  pagination?: {
    current_page: number;
    total_pages:  number;
    total_count:  number;
    limit:        number;
  };
}

async function fetchCategoriesPage(
  serviceType: "product" | "service" | "expense",
  page: number,
  limit = 15
): Promise<{ categories: Category[]; currentPage: number; totalPages: number }> {
  const { branchId, zoduId } = getTenantContext();
  const type = serviceType === "product" ? "S" : serviceType === "expense" ? "E" : "M";
  const { data } = await axios.get<CategoryFilterPage>(
    `${API_BASE}/retail/get/category/${type}/${branchId}/${zoduId}`,
    { params: { page, limit } }
  );
  const rows = data.Data ?? data.data ?? [];
  return {
    categories: rows.map((c) => ({ value: String(c.id), label: c.name })),
    currentPage: data.pagination?.current_page ?? page,
    totalPages:  data.pagination?.total_pages  ?? 1,
  };
}

async function fetchCategories(
  serviceType: "product" | "service" | "expense"
): Promise<Category[]> {
  const result = await fetchCategoriesPage(serviceType, 1, 500);
  return result.categories;
}

/**
 * GET /retail/get/gst/:branch_id
 */
async function fetchGstList(): Promise<GstOption[]> {
  const { branchId, zoduId } = getTenantContext();
  const { data } = await axios.get<{ data: ApiGst[] }>(
    `${API_BASE}/retail/get/gst/${branchId}/${zoduId}`
  );
  return (data.data ?? []).map((g) => ({
    value:      g.id,                        // id → value (sent as gst_type to API)
    label:      `GST ${g.gst_rate}%`,        // "GST 18%" — built from gst_rate
    percentage: Number(g.gst_rate),          // "18" → 18
  }));
}

/**
 * GET /retail/get/units/:branch_id
 * NOTE: API returns capital "Data" key (same pattern as categories)
 */
async function fetchUnitList(): Promise<UnitOption[]> {
  const { branchId,zoduId } = getTenantContext();
  const { data } = await axios.get<{ Data?: ApiUnit[]; data?: ApiUnit[] }>(
    `${API_BASE}/retail/get/units/${branchId}/${zoduId}`
  );
  const rows = data.Data ?? data.data ?? [];
  return rows.map((u) => ({
    value:     u.id,
    label:     `${u.name} (${u.short_name})`,   // "Litre (LTR)"
    shortName: u.short_name,                     // "LTR" — for adornment
  }));
}

/**
 * GET /retail/api/menu_items
 * Paginated list with optional search + filters.
 */
async function fetchMenuItems(
  params: MenuItemListParams
): Promise<MenuItemListResponse> {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await axios.get<MenuItemListResponse>(
    `${API_BASE}/retail/api/menu/menu_items`,
    {
      params: {
        zodu_id:     zoduId,
        branch_id:   branchId,
        search:      params.search      || undefined,
        category_id: params.category_ids  || [],
        item_type:   params.item_type   || undefined,
        status:      params.status      || undefined,
        page:        params.page        ?? 1,
        limit:       params.limit       ?? 20,
      },
    }
  );
  console.log("from hook",data)
  return data;
}

/**
 * GET /retail/api/menu_item/:item_uuid
 * Single item detail by uuid.
 */
async function fetchMenuItemDetail(item_uuid: string): Promise<MenuItem> {
  const { data } = await axios.get<{ success: boolean; data: MenuItem }>(
    `${API_BASE}/retail/api/menu/menu_item/${item_uuid}`
  );
  return data.data;
}

/**
 * POST /retail/add/category
 */
async function postAddCategory(
  payload: AddCategoryPayload
): Promise<Category & { apiMessage: string }> {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await axios.post<{ message: string; data: ApiCategory }>(
    `${API_BASE}/retail/add/category`,
    {
      zodu_id:   zoduId,
      branch_id: branchId,
      name:      payload.name.trim(),
      type:      payload.type,
    }
  );
  const created = data.data;
  return {
    value:      String(created.id),
    label:      created.name,
    apiMessage: data.message ?? "Category added successfully",
  };
}

/**
 * POST /retail/api/add/menu_item
 */
async function postAddMenuItem(
  payload: AddMenuItemPayload
): Promise<AddMenuItemResponse> {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await axios.post<AddMenuItemResponse>(
    `${API_BASE}/retail/api/menu/add/menu_item`,
    { zodu_id: zoduId, branch_id: branchId, ...payload }
  );
  return data;
}

// ─── Check Item ID ────────────────────────────────────────────

export interface CheckItemIdResponse {
  success: boolean;
  exists:  boolean;
  data?:   { item_uuid: string; item_id: string; item_name: string; status: string };
}

export async function checkItemId(item_id: string): Promise<CheckItemIdResponse> {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await axios.get<CheckItemIdResponse>(
    `${API_BASE}/retail/api/menu/check/item_id`,
    { params: { zodu_id: zoduId, branch_id: branchId, item_id } }
  );
  return data;
}

/**
 * DELETE /retail/api/delete/menu_item/:item_uuid
 */


async function hardDeleteMenuItem(item_uuid: string): Promise<{ success: boolean; message: string }> {
  const { data } = await axios.delete<{ success: boolean; message: string }>(
    `${API_BASE}/retail/api/menu/remove/menu_item/${item_uuid}`
  );
  return data;
}

// ─── Hooks ────────────────────────────────────────────────────


/**
 * Delete a menu item.
 * On success:
 *  - Invalidates menu list
 */


export function useHardDeleteMenuItem(options?: {
  onSuccess?: (data: { success: boolean; message: string }) => void;
  onError?: (message: string) => void;
}): UseMutationResult<{ success: boolean; message: string }, unknown, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hardDeleteMenuItem,

    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["menu", "items"] });
      const { branchId, zoduId } = getTenantContext();
      if (branchId && zoduId) {
        await clearSyncMeta(branchId);
        queryClient.invalidateQueries({ queryKey: posProductsKey(branchId, zoduId) });
      }
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
 * PATCH status of a menu item via the edit endpoint.
 * Only sends { status } so no other fields are overwritten.
 */
async function updateMenuItemStatus(params: {
  item_uuid: string;
  status: "active" | "inactive";
}): Promise<{ success: boolean; message: string }> {
  console.log(params)
  const { data } = await axios.put<{ success: boolean; message: string }>(
    `${API_BASE}/retail/api/menu/status/${params.item_uuid}`,
    { status: params.status }
  );
  console.log(data)
  return data;
}

export function useUpdateMenuItemStatus(options?: {
  onSuccess?: (
    data: { success: boolean; message: string },
    variables: { item_uuid: string; status: "active" | "inactive" }
  ) => void;
  onError?: (message: string) => void;
}): UseMutationResult<
  { success: boolean; message: string },
  unknown,
  { item_uuid: string; status: "active" | "inactive" }
> {
  return useMutation({
    mutationFn: updateMenuItemStatus,

    onSuccess: (data, variables) => {
      options?.onSuccess?.(data, variables);
    },

    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? err.message
        : "Failed to update status";
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
  serviceType: "product" | "service" | "expense",
  enabled = true
): UseQueryResult<Category[]> {
  useTenantContext();
  return useQuery({
    queryKey:             menuQueryKeys.categories(serviceType),
    queryFn:              () => fetchCategories(serviceType),
    enabled,
    staleTime:            5 * 60 * 1000,
    gcTime:               10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry:                2,
  });
}

/**
 * Infinite-scroll hook for the category filter dropdown.
 * Loads 15 per page; next page fetches when user scrolls to the bottom of the list.
 */
export function useInfiniteCategories(serviceType: "product" | "service" | "expense") {
  const { zoduId, branchId } = useTenantContext();
  return useInfiniteQuery({
    queryKey:         ["menu", "categories-filter", zoduId, branchId, serviceType],
    queryFn:          ({ pageParam = 1 }) =>
                        fetchCategoriesPage(serviceType, pageParam as number, 15),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined,
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
  useTenantContext();
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
  useTenantContext();
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
  useTenantContext();
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
  const { zoduId, branchId } = useTenantContext();
  return useInfiniteQuery({
    queryKey: ['menu', 'items', zoduId, branchId, JSON.stringify(params)],

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
  useTenantContext();
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
  onSuccess?: (category: Category, apiMessage: string) => void;
  onError?:   (message: string) => void;
}): UseMutationResult<Category & { apiMessage: string }, unknown, AddCategoryPayload> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postAddCategory,
    onSuccess: (category, variables) => {
      // Refetch category list for the current service type
      queryClient.invalidateQueries({
        queryKey: menuQueryKeys.categories(variables.serviceType),
      });
      options?.onSuccess?.(category, category.apiMessage);
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postAddMenuItem,
    onSuccess: async (data) => {
      const { branchId, zoduId } = getTenantContext();
      if (branchId && zoduId) {
        await clearSyncMeta(branchId);
        queryClient.invalidateQueries({ queryKey: posProductsKey(branchId, zoduId) });
      }
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

// ─── Category List (full rows for Category tab — paginated) ──────

export interface CategoryListPage {
  message:    string;
  pagination: {
    current_page: number;
    total_pages:  number;
    total_count:  number;
    limit:        number;
  };
  Data: CategoryRow[];
}

/**
 * GET /retail/get/category/:zodu_id/:branch_id?type=S&type=M&page=N&limit=10
 * type = comma-separated codes split into repeated query params, e.g. "S,M" → type=S&type=M
 */
async function fetchCategoryPage(
  page:  number,
  type:  string,
  limit = 10
): Promise<CategoryListPage> {
  const { zoduId, branchId } = getTenantContext();
  const types = type.split(",").map((t) => t.trim()).filter(Boolean);
  const { data } = await axios.get<CategoryListPage>(
    `${API_BASE}/retail/get/category/${zoduId}/${branchId}`,
    { params: { type: types, page, limit } }
  );
  return data;
}

/**
 * Infinite-scroll hook for the Category management tab.
 * @param type  comma-separated type codes: "S,M" (menu) | "E" (expense)
 */
export function useInfiniteCategoryList(enabled = true, type = "S,M") {
  const { zoduId, branchId } = useTenantContext();
  return useInfiniteQuery({
    queryKey:         ["menu", "categoryList", zoduId, branchId, type],
    queryFn:          ({ pageParam = 1 }) => fetchCategoryPage(pageParam as number, type, 10),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current_page, total_pages } = lastPage.pagination;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
    enabled,
    staleTime:            2 * 60 * 1000,
    gcTime:               5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount:       false,
    retry:                2,
  });
}

// ─── Update Category ─────────────────────────────────────────

export interface UpdateCategoryPayload {
  id:   number;
  name: string;
  type: 'S' | 'M' | 'E';
}

async function patchUpdateCategory(
  payload: UpdateCategoryPayload
): Promise<{ message: string }> {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await axios.put<{ message: string }>(
    `${API_BASE}/retail/update/category/${payload.id}`,
    {
      zodu_id:   zoduId,
      branch_id: branchId,
      name:      payload.name.trim(),
      type:      payload.type,
    }
  );
  return data;
}

export function useUpdateCategory(options?: {
  onSuccess?: (message: string) => void;
  onError?:   (message: string) => void;
}): UseMutationResult<{ message: string }, unknown, UpdateCategoryPayload> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchUpdateCategory,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["menu", "categoryList"] });
      queryClient.invalidateQueries({ queryKey: ["menu", "categories"] });
      options?.onSuccess?.(data.message ?? "Category updated successfully");
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? err.message
        : "Failed to update category";
      options?.onError?.(msg);
    },
  });
}

// ─── Toggle Category Status ───────────────────────────────────

/**
 * PUT /retail/inactivate/category/:id
 * Toggles a category between active and inactive.
 */
async function putToggleCategoryStatus(payload: {
  id:          number;
  active:      boolean;
  pageExpense: boolean;
}): Promise<{ message: string }> {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await axios.put<{ message: string }>(
    `${API_BASE}/retail/inactivate/category/${payload.id}`,
    { zodu_id: zoduId, branch_id: branchId, active: payload.active, page_expense: payload.pageExpense }
  );
  return data;
}

export function useToggleCategoryStatus(options?: {
  onSuccess?: (id: number, message: string) => void;
  onError?:   (message: string) => void;
}): UseMutationResult<{ message: string }, unknown, { id: number; active: boolean; pageExpense: boolean }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: putToggleCategoryStatus,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["menu", "categoryList"] });
      queryClient.invalidateQueries({ queryKey: ["menu", "categories"] });
      options?.onSuccess?.(variables.id, data.message ?? "Status updated");
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? err.message
        : "Failed to update status";
      options?.onError?.(msg);
    },
  });
}

// ─── Delete Category ─────────────────────────────────────────

/**
 * DELETE /retail/delete/category/:id/:branch_id/:zodu_id/:page_expense
 * page_expense: true when deleting from the Expense category tab, false otherwise
 */
async function deleteCategory(payload: { id: number; pageExpense: boolean }): Promise<{ success: boolean; message: string }> {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await axios.delete<{ success: boolean; message: string }>(
    `${API_BASE}/retail/delete/category/${payload.id}/${branchId}/${zoduId}/${payload.pageExpense}`
  );
  return data;
}

export function useDeleteCategory(options?: {
  onSuccess?: (data: { success: boolean; message: string }) => void;
  onError?:   (message: string) => void;
}): UseMutationResult<{ success: boolean; message: string }, unknown, { id: number; pageExpense: boolean }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: (data) => {
      // Refresh the category list in the tab
      queryClient.invalidateQueries({ queryKey: ["menu", "categoryList"] });
      // Also refresh dropdowns that use categories
      queryClient.invalidateQueries({ queryKey: ["menu", "categories"] });
      options?.onSuccess?.(data);
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? err.message
        : "Failed to delete category";
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
    `${API_BASE}/retail/api/menu/edit/menu_item/${item_uuid}`,
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
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: menuQueryKeys.menuItemDetail(variables.item_uuid),
      });
      queryClient.invalidateQueries({ queryKey: ["menu", "items"] });
      const { branchId, zoduId } = getTenantContext();
      if (branchId && zoduId) {
        await clearSyncMeta(branchId);
        queryClient.invalidateQueries({ queryKey: posProductsKey(branchId, zoduId) });
      }
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
