import axios from "axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import { apiConfig } from "@config/api";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
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
  branchId: string,
  menuType: string | undefined,
  search: string,
  page: number,
  categoryIds?: number[]
): Promise<MenuListPage> {
  const url = `${API_BASE}${apiConfig.menu.getMenuItemsByType(
    branchId,
    menuType,
    search || undefined,
    page,
    PAGE_SIZE,
    categoryIds
  )}`;
  const { data } = await axios.get(url, { headers: authHeaders() });
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
  branchId: string,
  search: string,
  menuType?: string,
  categoryIds?: number[]
) {
  return useInfiniteQuery({
    queryKey: ["restaurant", "menuList", branchId, search, menuType ?? "all", categoryIds ?? []],
    queryFn: ({ pageParam }) =>
      fetchMenuList(branchId, menuType, search, pageParam as number, categoryIds),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const { current_page, total_pages } = last.pagination;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
    enabled: !!branchId,
    staleTime: 2 * 60 * 1000,
  });
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
