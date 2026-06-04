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

const PAGE_SIZE = 20;

async function fetchMenuList(
  branchId: string,
  search: string,
  page: number
): Promise<MenuListPage> {
  const url = `${API_BASE}${apiConfig.menu.getAllMenuItemsByBranchId(
    branchId,
    search || undefined,
    page,
    PAGE_SIZE
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

export function useInfiniteRestaurantMenu(branchId: string, search: string) {
  return useInfiniteQuery({
    queryKey: ["restaurant", "menuList", branchId, search],
    queryFn: ({ pageParam }) =>
      fetchMenuList(branchId, search, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const { current_page, total_pages } = last.pagination;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
    enabled: !!branchId,
    staleTime: 2 * 60 * 1000,
  });
}
