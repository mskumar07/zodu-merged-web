import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { apiConfig } from "@config/api";
import axiosInstance from "@store/services/axiosInstance";

export interface SalesSummary {
  totalMonthlySales: number;
  totalYearlySales: number;
  growthPercent: number | null;
  topMonth: string;
  topMonthRevenue?: number;
}

export interface MonthlyBreakdownRow {
  month: string;
  bills: number;
  subtotal: number;
  tax: number;
  netSales: number;
}

export interface MonthlyBreakdownPage {
  success: boolean;
  data: MonthlyBreakdownRow[];
  total: number;
  page: number;
  limit: number;
}

export interface HistoricalYear {
  year: string | number;
  netSales: number;
}

interface SummaryParams {
  zodu_id: string;
  branch_id: string;
  year?: number | string;
}

interface BreakdownParams {
  zodu_id: string;
  branch_id: string;
  year?: number | string;
  limit?: number;
}

interface HistoricalParams {
  zodu_id: string;
  branch_id: string;
}

interface CategoryItemSalesBaseParams {
  zodu_id: string;
  branch_id: string;
  from_date?: string;
  to_date?: string;
  search?: string;
}

interface CategoryItemSalesPageParams extends CategoryItemSalesBaseParams {
  page?: number;
  limit?: number;
}

export interface CategoryItemSalesSummary {
  totalSales: number;
  totalOrders: number;
  totalQuantity: number;
  averageOrderValue: number;
  totalTaxCollected?: number;
  bestSellingCategory?: string;
  bestSellingCategoryShare?: number | null;
  bestSellingItem?: string;
  bestSellingItemUnits?: number | null;
}

export interface CategoryWiseSalesRow {
  categoryId: string;
  categoryName: string;
  quantity: number;
  orders: number;
  sales: number;
}

export interface ItemWiseSalesRow {
  itemId: string;
  itemName: string;
  categoryName: string;
  quantity: number;
  orders: number;
  sales: number;
}

export interface CategoryItemSalesPage<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface SalesVelocityPoint {
  date: string;
  sales: number;
  orders: number;
  quantity: number;
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : null;

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toNullableNumber = (value: unknown): number | null => {
  if (value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toSalesSummary = (payload: unknown): SalesSummary => {
  const source = asRecord(asRecord(payload)?.data ?? payload);
  return {
    totalMonthlySales: toNumber(source?.totalMonthlySales ?? source?.total_monthly_sales),
    totalYearlySales: toNumber(source?.totalYearlySales ?? source?.total_yearly_sales),
    growthPercent: toNullableNumber(source?.growthPercent ?? source?.growth_vs_last_year),
    topMonth: String(source?.topMonth ?? source?.top_performing_month ?? ""),
    topMonthRevenue:
      source?.topMonthRevenue == null && source?.top_month_revenue == null
        ? undefined
        : toNumber(source?.topMonthRevenue ?? source?.top_month_revenue),
  };
};

const toMonthlyBreakdownRow = (row: unknown): MonthlyBreakdownRow => {
  const source = asRecord(row);
  return {
    month: String(source?.month_name ?? "—"),
    bills: toNumber(source?.bill_count),
    subtotal: toNumber(source?.subtotal),
    tax: toNumber(source?.total_tax),
    netSales: toNumber(source?.netSales ?? source?.net_sales),
  };
};

const toMonthlyBreakdownPage = (payload: unknown): MonthlyBreakdownPage => {
  const source = asRecord(payload) ?? {};
  const pagination = asRecord(source.pagination);
  const data = Array.isArray(source.data) ? source.data.map(toMonthlyBreakdownRow) : [];

  return {
    success: source.success !== false,
    data,
    total: toNumber(source.total ?? pagination?.total),
    page: toNumber(source.page ?? pagination?.page) || 1,
    limit: toNumber(source.limit ?? pagination?.limit) || data.length || 1,
  };
};

const toHistoricalYears = (payload: unknown): HistoricalYear[] => {
    
  if (Array.isArray(payload)) {
    return payload.map((entry) => {
      const source = asRecord(entry);
      console.log("history hook",source)
      return {
        year: String(source?.year ?? ""),
        netSales: toNumber(source?.netSales ?? source?.net_sales),
      };
    });
  }

  const source = asRecord(payload);
  const candidateKeys = ["data", "years", "history", "historical", "yearly_data"];

  for (const key of candidateKeys) {
    const value = source?.[key];
    if (Array.isArray(value)) return toHistoricalYears(value);
  }

  return [];
};

const CATEGORY_ITEM_SALES_BASE = `${apiConfig.report.getReport}/category-item-sales`;

const buildReportParams = (params: Record<string, unknown>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  return searchParams;
};

const toCategoryItemSalesSummary = (payload: unknown): CategoryItemSalesSummary => {
  const source = asRecord(asRecord(payload)?.data ?? payload);
  console.log("teststs",source)
  return {
    totalSales: toNumber(source?.totalSales ?? source?.total_sales),
    totalOrders: toNumber(source?.totalOrders ?? source?.total_orders),
    totalQuantity: toNumber(source?.totalQuantity ?? source?.total_quantity),
    averageOrderValue: toNumber(source?.averageOrderValue ?? source?.average_order_value),
    totalTaxCollected:
      source?.total_tax == null && source?.total_tax_collected == null
        ? undefined
        : toNumber(source?.total_tax ?? source?.total_tax_collected),
    bestSellingCategory: source?.bestSellingCategory != null || source?.best_selling_category != null
      ? String(source?.bestSellingCategory ?? source?.best_selling_category)
      : undefined,
    bestSellingCategoryShare: toNullableNumber(source?.bestSellingCategoryShare ?? source?.best_selling_category_share),
    bestSellingItem: source?.bestSellingItem != null || source?.best_selling_item != null
      ? String(source?.bestSellingItem ?? source?.best_selling_item)
      : undefined,
    bestSellingItemUnits: toNullableNumber(source?.bestSellingItemUnits ?? source?.best_selling_item_units),
  };
};

const toCategoryWiseSalesRow = (row: unknown): CategoryWiseSalesRow => {
  const source = asRecord(row);
  console.log(source)
  return {
    categoryId: String(source?.categoryId ?? source?.category_id ?? source?.id ?? ""),
    categoryName: String(source?.categoryName ?? source?.category_name ?? source?.name ?? "—"),
    quantity: toNumber(source?.total_units ?? source?.qty_sold ?? source?.total_quantity),
    orders: toNumber(source?.orders ?? source?.order_count ?? source?.total_orders),
    sales: toNumber(source?.sales ?? source?.sale_amount ?? source?.total_sales),
  };
};

const toItemWiseSalesRow = (row: unknown): ItemWiseSalesRow => {
  const source = asRecord(row);
  console.log("item wise row",source)
  return {
    itemId: String(source?.itemId ?? source?.item_id ?? source?.id ?? ""),
    itemName: String(source?.itemName ?? source?.item_name ?? source?.name ?? "—"),
    categoryName: String(source?.categoryName ?? source?.category_name ?? "—"),
    quantity: toNumber(source?.quantity ?? source?.qty ?? source?.total_quantity),
    orders: toNumber(source?.price ?? source?.order_count ?? source?.total_orders),
    sales: toNumber(source?.total ?? source?.sale_amount ?? source?.total_sales),
  };
};

const toCategoryItemSalesPage = <T,>(
  payload: unknown,
  rowMapper: (row: unknown) => T,
): CategoryItemSalesPage<T> => {
    console.log(payload);
  const source = asRecord(payload) ?? {};
  const pagination = asRecord(source.pagination);
  const rawData =
    Array.isArray(source.data) ? source.data :
    Array.isArray(source.rows) ? source.rows :
    Array.isArray(source.items) ? source.items :
    [];

  return {
    success: source.success !== false,
    data: rawData.map(rowMapper),
    total: toNumber(source.total ?? pagination?.total),
    page: toNumber(source.page ?? pagination?.page) || 1,
    limit: toNumber(source.limit ?? pagination?.limit) || rawData.length || 1,
  };
};

const toSalesVelocity = (payload: unknown): SalesVelocityPoint[] => {
  const source = asRecord(payload);
  const rows =
    Array.isArray(payload) ? payload :
    Array.isArray(source?.data) ? source?.data :
    Array.isArray(source?.rows) ? source?.rows :
    [];

  return rows.map((entry) => {
    const row = asRecord(entry);
    return {
      date: String(row?.date ?? row?.day ?? row?.sale_date ?? ""),
      sales: toNumber(row?.sales ?? row?.sale_amount ?? row?.total_sales),
      orders: toNumber(row?.orders ?? row?.order_count ?? row?.total_orders),
      quantity: toNumber(row?.quantity ?? row?.qty_sold ?? row?.total_quantity),
    };
  });
};

export const useSalesSummary = (params: SummaryParams) => {
  return useQuery<SalesSummary>({
    queryKey: ["sales-summary", params.zodu_id, params.branch_id, params.year],
    queryFn: async () => {
      const p = new URLSearchParams({ zodu_id: params.zodu_id, branch_id: params.branch_id });
      if (params.year) p.append("year", String(params.year));
      const res = await axiosInstance.get(`${apiConfig.report.salesSummary}?${p}`);

      return toSalesSummary(res.data);
    },
    enabled: !!params.zodu_id && !!params.branch_id,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};

export const useSalesMonthlyBreakdown = (params: BreakdownParams) => {
  const limit = params.limit ?? 12;

  return useInfiniteQuery<MonthlyBreakdownPage>({
    queryKey: ["sales-monthly-breakdown", params.zodu_id, params.branch_id, params.year],
    queryFn: async ({ pageParam = 1 }) => {
      const p = new URLSearchParams({
        zodu_id: params.zodu_id,
        branch_id: params.branch_id,
        page: String(pageParam),
        limit: String(limit),
      });
      if (params.year) p.append("year", String(params.year));
      const res = await axiosInstance.get(`${apiConfig.report.salesMonthlyBreakdown}?${p}`);
      return toMonthlyBreakdownPage(res.data);
    },
    getNextPageParam: (lastPage) => {
      const { page, limit: currentLimit, total } = lastPage;
      return page * currentLimit < total ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!params.zodu_id && !!params.branch_id,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};

export const useSalesHistorical = (params: HistoricalParams) => {
  return useQuery<HistoricalYear[]>({
    queryKey: ["sales-historical", params.zodu_id, params.branch_id],
    queryFn: async () => {
      const p = new URLSearchParams({ zodu_id: params.zodu_id, branch_id: params.branch_id });
      const res = await axiosInstance.get(`${apiConfig.report.salesHistorical}?${p}`);
      console.log("api res",res)
      return toHistoricalYears(res.data.data);
    },
    enabled: !!params.zodu_id && !!params.branch_id,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useCategoryItemSalesSummary = (params: CategoryItemSalesBaseParams) => {
  return useQuery<CategoryItemSalesSummary>({
    queryKey: ["category-item-sales-summary", params],
    queryFn: async () => {
      const query = buildReportParams(params);
      const res = await axiosInstance.get(`${CATEGORY_ITEM_SALES_BASE}/summary?${query}`);
      return toCategoryItemSalesSummary(res.data);
    },
    enabled: !!params.zodu_id && !!params.branch_id,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};

export const useCategoryWiseSales = (params: CategoryItemSalesPageParams) => {
  return useQuery<CategoryItemSalesPage<CategoryWiseSalesRow>>({
    queryKey: ["category-wise-sales", params],
    queryFn: async () => {
      const query = buildReportParams({
        ...params,
        page: params.page ?? 1,
        limit: params.limit ?? 10,
      });
      const res = await axiosInstance.get(`${CATEGORY_ITEM_SALES_BASE}/category-wise?${query}`);
      console.log("category",res.data)
      return toCategoryItemSalesPage(res.data, toCategoryWiseSalesRow);
    },
    enabled: !!params.zodu_id && !!params.branch_id,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};

export const useInfiniteCategoryWiseSales = (params: CategoryItemSalesPageParams) => {
  const limit = params.limit ?? 10;

  return useInfiniteQuery<CategoryItemSalesPage<CategoryWiseSalesRow>>({
    queryKey: ["category-wise-sales-infinite", params.zodu_id, params.branch_id, params.from_date, params.to_date, params.search, limit],
    queryFn: async ({ pageParam = 1 }) => {
      const query = buildReportParams({
        ...params,
        page: pageParam,
        limit,
      });
      const res = await axiosInstance.get(`${CATEGORY_ITEM_SALES_BASE}/category-wise?${query}`);
      return toCategoryItemSalesPage(res.data, toCategoryWiseSalesRow);
    },
    getNextPageParam: (lastPage) => {
      const { page, total } = lastPage;
      return page * limit < total ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!params.zodu_id && !!params.branch_id,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};

export const useItemWiseSales = (params: CategoryItemSalesPageParams) => {
  return useQuery<CategoryItemSalesPage<ItemWiseSalesRow>>({
    queryKey: ["item-wise-sales", params],
    queryFn: async () => {
      const query = buildReportParams({
        ...params,
        page: params.page ?? 1,
        limit: params.limit ?? 10,
      });
      const res = await axiosInstance.get(`${CATEGORY_ITEM_SALES_BASE}/item-wise?${query}`);
      console.log("Item",res.data)
      return toCategoryItemSalesPage(res.data, toItemWiseSalesRow);
    },
    enabled: !!params.zodu_id && !!params.branch_id,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};

export const useInfiniteItemWiseSales = (params: CategoryItemSalesPageParams) => {
  const limit = params.limit ?? 10;

  return useInfiniteQuery<CategoryItemSalesPage<ItemWiseSalesRow>>({
    queryKey: ["item-wise-sales-infinite", params.zodu_id, params.branch_id, params.from_date, params.to_date, params.search, limit],
    queryFn: async ({ pageParam = 1 }) => {
      const query = buildReportParams({
        ...params,
        page: pageParam,
        limit,
      });
      const res = await axiosInstance.get(`${CATEGORY_ITEM_SALES_BASE}/item-wise?${query}`);
      return toCategoryItemSalesPage(res.data, toItemWiseSalesRow);
    },
    getNextPageParam: (lastPage) => {
      const { page, total } = lastPage;
      return page * limit < total ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!params.zodu_id && !!params.branch_id,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};

export const useSalesVelocity = (params: CategoryItemSalesBaseParams) => {
  return useQuery<SalesVelocityPoint[]>({
    queryKey: ["sales-velocity", params],
    queryFn: async () => {
      const query = buildReportParams(params);
      const res = await axiosInstance.get(`${CATEGORY_ITEM_SALES_BASE}/sales-velocity?${query}`);
      return toSalesVelocity(res.data);
    },
    enabled: !!params.zodu_id && !!params.branch_id,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};
