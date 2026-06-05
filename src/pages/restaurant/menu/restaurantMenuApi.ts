import axios from "axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import { apiConfig } from "@config/api";
import { getTenantContext, getAccessToken } from "@store/tenantContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

function authHeaders() {
  const token = getAccessToken() ?? localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getRoute() {
  const { businessType } = getTenantContext();
  return businessType === "Restaurant" ? "restaurant" : "retail";
}

export interface RestaurantMenuListItem {
  zodu_id: string;
  branch_id: string;
  menu_id: string;
  menu_name: string;
  menu_code: string;
  menu_type: string;
  menu_image: string | null;
  variants: { variant_name: string; price: string }[] | null;
  sell_price: string;
  purchase_price: string | null;
  hsn_code: string | null;
  gst_id: number | null;
  gst_tax: string;
  unit_id: number | null;
  unit_name: string | null;
  menu_unit: string | null;
  category: string;
  category_id: number;
  stock_qty: string;
  stock_alert: string;
  active: boolean;
  food_type: string | null;
  tax_include_or_exclude: boolean | null;
  favorites: boolean;
  count: number;
  items: unknown[];
}

export interface RestaurantCategory {
  id: number;
  name: string;
  type?: string;
  type_code?: string;
  active: boolean;
  zodu_id: string;
  branch_id: string;
}

export interface MenuListPagination {
  total_count: number;
  total_pages: number;
  current_page: number;
  limit: number;
}

export interface MenuListPage {
  data: RestaurantMenuListItem[];
  pagination: MenuListPagination;
}

export interface CategoryPage {
  data: RestaurantCategory[];
  pagination: MenuListPagination;
}

const PAGE_SIZE = 20;
const CATEGORY_PAGE_SIZE = 10;

async function fetchMenuList(
  zoduId: string,
  branchId: string,
  menuType: string | undefined,
  search: string,
  page: number,
  categoryIds?: number[]
): Promise<MenuListPage> {
  const route = getRoute();
  const params: Record<string, string | number> = { page, limit: PAGE_SIZE };
  if (menuType) params.type = menuType;
  if (search)   params.search = search;
  if (categoryIds?.length) params.category_ids = categoryIds.join(",");

  const { data } = await axios.get(
    `${API_BASE}/${route}/api/menu/get/menu_item/${zoduId}/${branchId}`,
    { params, headers: authHeaders() }
  );
  return {
    data: (data?.data ?? []) as RestaurantMenuListItem[],
    pagination: data?.pagination ?? {
      total_count: 0,
      total_pages: 1,
      current_page: page,
      limit: PAGE_SIZE,
    },
  };
}

export function useInfiniteRestaurantMenu(
  zoduId: string,
  branchId: string,
  search: string,
  menuType?: string | undefined,
  categoryIds?: number[]
) {
  return useInfiniteQuery({
    queryKey: ["restaurant", "menuList", zoduId, branchId, search, menuType ?? "all", categoryIds ?? []],
    queryFn: ({ pageParam }) =>
      fetchMenuList(zoduId, branchId, menuType, search, pageParam as number, categoryIds),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const { current_page, total_pages } = last.pagination;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
    enabled: !!zoduId && !!branchId,
    staleTime: 2 * 60 * 1000,
  });
}

export async function updateMenuFav(menuId: string, fav: boolean): Promise<void> {
  const route = getRoute();
  await axios.put(
    `${API_BASE}/${route}/api/menu/update/menusfav/${fav}/${menuId}`,
    {},
    { headers: authHeaders() }
  );
}

export async function updateMenuStatus(menuId: string, active: boolean): Promise<void> {
  const route = getRoute();
  await axios.put(
    `${API_BASE}/${route}/api/menu/update/menustatus/${active}/${menuId}`,
    {},
    { headers: authHeaders() }
  );
}

export async function deleteMenuItem(menuId: string): Promise<void> {
  const route = getRoute();
  await axios.delete(
    `${API_BASE}/${route}/api/menu/delete/menu_item/${menuId}`,
    { headers: authHeaders() }
  );
}

async function fetchCategories(
  zoduId: string,
  branchId: string,
  types: string[] | undefined,
  page: number
): Promise<CategoryPage> {
  const url = `${API_BASE}${apiConfig.menu.getCategoryList(
    zoduId,
    branchId,
    types,
    page,
    CATEGORY_PAGE_SIZE
  )}`;
  const { data } = await axios.get(url, { headers: authHeaders() });
  return {
    data: (data?.Data ?? []) as RestaurantCategory[],
    pagination: data?.pagination ?? {
      total_count: 0,
      total_pages: 1,
      current_page: page,
      limit: CATEGORY_PAGE_SIZE,
    },
  };
}

export function useInfiniteRestaurantCategories(
  zoduId: string,
  branchId: string,
  types?: string[]
) {
  return useInfiniteQuery({
    queryKey: ["restaurant", "categories", zoduId, branchId, types ?? []],
    queryFn: ({ pageParam }) =>
      fetchCategories(zoduId, branchId, types, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const { current_page, total_pages } = last.pagination;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
    enabled: !!zoduId && !!branchId,
    staleTime: 5 * 60 * 1000,
  });
}
