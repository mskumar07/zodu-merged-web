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
  disabled?: boolean;
}

interface BreakdownParams {
  zodu_id: string;
  branch_id: string;
  year?: number | string;
  limit?: number;
  disabled?: boolean;
}

interface HistoricalParams {
  zodu_id: string;
  branch_id: string;
  disabled?: boolean;
}

interface CategoryItemSalesBaseParams {
  zodu_id: string;
  branch_id: string;
  from_date?: string;
  to_date?: string;
  search?: string;
  disabled?: boolean;
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

const EXCLUDED_PARAMS = new Set(["disabled"]);

const buildReportParams = (params: Record<string, unknown>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (!EXCLUDED_PARAMS.has(key) && value !== undefined && value !== null && value !== "") {
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
    enabled: !params.disabled && !!params.zodu_id && !!params.branch_id,
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
    enabled: !params.disabled && !!params.zodu_id && !!params.branch_id,
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
    enabled: !params.disabled && !!params.zodu_id && !!params.branch_id,
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
    enabled: !params.disabled && !!params.zodu_id && !!params.branch_id,
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
    enabled: !params.disabled && !!params.zodu_id && !!params.branch_id,
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
    enabled: !params.disabled && !!params.zodu_id && !!params.branch_id,
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
    enabled: !params.disabled && !!params.zodu_id && !!params.branch_id,
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
    enabled: !params.disabled && !!params.zodu_id && !!params.branch_id,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};

// ── Datewise sale report ───────────────────────────────────────────────────

export interface DatewiseSummary {
  totalOrders: number;
  totalSales: number;
  totalTax: number;
  netSales: number;
}

export interface DatewiseBreakdownRow {
  saleDate: string;
  billCount: number;
  totalAmount: number;
  taxAmount: number;
  netSales: number;
}

export interface DatewiseBreakdownPage {
  success: boolean;
  data: DatewiseBreakdownRow[];
  total: number;
  page: number;
  limit: number;
}

interface DatewiseParams {
  zodu_id: string;
  branch_id: string;
  from_date?: string;
  to_date?: string;
  disabled?: boolean;
}

interface DatewiseBreakdownParams extends DatewiseParams {
  limit?: number;
}

const toDatewiseSummary = (payload: unknown): DatewiseSummary => {
  const source = asRecord(asRecord(payload)?.data ?? payload);
  console.log("datewise summary",source)
  return {
    totalOrders: toNumber(source?.totalOrders ?? source?.total_orders),
    totalSales: toNumber(source?.totalSales ?? source?.total_sales),
    totalTax: toNumber(source?.totalTax ?? source?.total_tax ?? source?.tax_amount),
    netSales: toNumber(source?.netSales ?? source?.net_sales ?? source?.total_profit),
  };
};

const toDatewiseBreakdownRow = (row: unknown): DatewiseBreakdownRow => {
  const source = asRecord(row);
  return {
    saleDate: String(source?.sale_date ?? source?.saleDate ?? source?.date ?? ""),
    billCount: toNumber(source?.total_orders ?? source?.bill_count ?? source?.billCount),
    totalAmount: toNumber(source?.total_sales ?? source?.total_amount ?? source?.totalAmount),
    taxAmount: toNumber(source?.total_tax ?? source?.tax_amount ?? source?.taxAmount),
    netSales: toNumber(source?.net_sales ?? source?.netSales ?? source?.total_profit),
  };
};

const toDatewiseBreakdownPage = (payload: unknown): DatewiseBreakdownPage => {
  const source = asRecord(payload) ?? {};
  const pagination = asRecord(source.pagination);
  const data = Array.isArray(source.data) ? source.data.map(toDatewiseBreakdownRow) : [];
  return {
    success: source.success !== false,
    data,
    total: toNumber(source.total ?? pagination?.total),
    page: toNumber(source.page ?? pagination?.page) || 1,
    limit: toNumber(source.limit ?? pagination?.limit) || data.length || 1,
  };
};

export const useDatewiseSaleSummary = (params: DatewiseParams) => {
  return useQuery<DatewiseSummary>({
    queryKey: ["datewise-sale-summary", params.zodu_id, params.branch_id, params.from_date, params.to_date],
    queryFn: async () => {
      const p = new URLSearchParams({ zodu_id: params.zodu_id, branch_id: params.branch_id });
      if (params.from_date) p.append("from_date", params.from_date);
      if (params.to_date) p.append("to_date", params.to_date);
      const res = await axiosInstance.get(`${apiConfig.report.salesDatewiseSummary}?${p}`);
      return toDatewiseSummary(res.data);
    },
    enabled: !params.disabled && !!params.zodu_id && !!params.branch_id,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};

export const useDatewiseSaleBreakdown = (params: DatewiseBreakdownParams) => {
  const limit = params.limit ?? 15;
  return useInfiniteQuery<DatewiseBreakdownPage>({
    queryKey: ["datewise-sale-breakdown", params.zodu_id, params.branch_id, params.from_date, params.to_date, limit],
    queryFn: async ({ pageParam = 1 }) => {
      const p = new URLSearchParams({
        zodu_id: params.zodu_id,
        branch_id: params.branch_id,
        page: String(pageParam),
        limit: String(limit),
      });
      if (params.from_date) p.append("from_date", params.from_date);
      if (params.to_date) p.append("to_date", params.to_date);
      const res = await axiosInstance.get(`${apiConfig.report.salesDatewiseBreakdown}?${p}`);
      return toDatewiseBreakdownPage(res.data);
    },
    getNextPageParam: (lastPage) => {
      const { page, limit: currentLimit, total } = lastPage;
      return page * currentLimit < total ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !params.disabled && !!params.zodu_id && !!params.branch_id,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};

// ── Restaurant datewise order report ──────────────────────────────────────

export interface RestaurantDatewiseSummaryRow {
  date: string;
  total_orders: number;
  total_items: number;
  total_tax: number;
  total_amt: number;
  payment_type: string;
}

export interface RestaurantDatewiseReportPage {
  success: boolean;
  data: RestaurantDatewiseSummaryRow[];
  totalAmount: number;
  totalItems: number;
  total: number;
  page: number;
  limit: number;
}

interface RestaurantDatewiseParams {
  zodu_id: string;
  branch_id: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  disabled?: boolean;
}

const toRestaurantDatewisePage = (payload: unknown): RestaurantDatewiseReportPage => {
  const source = asRecord(payload) ?? {};
  const pagination = asRecord(source.pagination);
  const rows = Array.isArray(source.datewise_summary) ? source.datewise_summary : [];

  const data: RestaurantDatewiseSummaryRow[] = rows.map((entry) => {
    const row = asRecord(entry);
    return {
      date: String(row?.created_at ?? row?.date ?? ""),
      total_orders: toNumber(row?.total_orders),
      total_items: toNumber(row?.total_items),
      total_tax: toNumber(row?.total_tax),
      total_amt: toNumber(row?.all_total_amount ?? row?.total_amt),
      payment_type: String(row?.payment_type ?? ""),
    };
  });

  const total = toNumber(pagination?.totalRecords ?? source.total);
  const page = toNumber(pagination?.page ?? source.page) || 1;
  const limit = toNumber(pagination?.limit ?? source.limit) || data.length || 1;

  return {
    success: source.success !== false,
    data,
    totalAmount: toNumber(source.totalAmount),
    totalItems: toNumber(source.totalItems),
    total,
    page,
    limit,
  };
};

export const useRestaurantDatewiseSaleReport = (params: RestaurantDatewiseParams) => {
  const limit = params.limit ?? 15;
  return useInfiniteQuery<RestaurantDatewiseReportPage>({
    queryKey: ["restaurant-datewise-orders", params.zodu_id, params.branch_id, params.start_date, params.end_date, limit],
    queryFn: async ({ pageParam = 1 }) => {
      const p = new URLSearchParams({
        filtered_type: "date_wise",
        zodu_id: params.zodu_id,
        branch_id: params.branch_id,
        page: String(pageParam),
        limit: String(limit),
      });
      if (params.start_date) p.append("start_date", params.start_date);
      if (params.end_date) p.append("end_date", params.end_date);
      const res = await axiosInstance.get(`${apiConfig.report.restaurantDatewiseOrders}?${p}`);
      return toRestaurantDatewisePage(res.data);
    },
    getNextPageParam: (lastPage) => {
      const { page, limit: currentLimit, total } = lastPage;
      return page * currentLimit < total ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !params.disabled && !!params.zodu_id && !!params.branch_id,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};

// ── Restaurant monthwise order report ─────────────────────────────────────

export interface RestaurantMonthwiseSummaryRow {
  month: string;
  month_number: number;
  total_orders: number;
  total_amount: number;
}

export interface RestaurantMonthwiseReportPage {
  success: boolean;
  data: RestaurantMonthwiseSummaryRow[];
  totalAmount: number;
  totalItems: number;
  total: number;
  page: number;
  limit: number;
}

interface RestaurantMonthwiseParams {
  zodu_id: string;
  branch_id: string;
  year?: number | string;
  limit?: number;
  disabled?: boolean;
}

const toRestaurantMonthwisePage = (payload: unknown): RestaurantMonthwiseReportPage => {
  const source = asRecord(payload) ?? {};

  // Response shape: { monthly_summary: [{ year, total_orders, total_amount, months: [...] }] }
  const monthlySummaryArr = Array.isArray(source.monthly_summary) ? source.monthly_summary : [];
  const firstEntry = asRecord(monthlySummaryArr[0]);
  const monthsArr = Array.isArray(firstEntry?.months) ? firstEntry.months : [];

  const data: RestaurantMonthwiseSummaryRow[] = monthsArr.map((entry) => {
    const row = asRecord(entry);
    return {
      month: String(row?.month ?? ""),
      month_number: toNumber(row?.month_number),
      total_orders: toNumber(row?.total_orders),
      total_amount: toNumber(row?.total_amount),
    };
  });

  return {
    success: source.success !== false,
    data,
    totalAmount: toNumber(source.totalAmount ?? firstEntry?.total_amount),
    totalItems: toNumber(source.totalItems),
    total: data.length,
    page: 1,
    limit: data.length || 12,
  };
};

export const useRestaurantMonthwiseSaleReport = (params: RestaurantMonthwiseParams) => {
  const limit = params.limit ?? 12;
  const year = params.year ?? new Date().getFullYear();
  return useInfiniteQuery<RestaurantMonthwiseReportPage>({
    queryKey: ["restaurant-monthwise-orders", params.zodu_id, params.branch_id, year, limit],
    queryFn: async () => {
      const p = new URLSearchParams({
        filtered_type: "month_year_wise",
        zodu_id: params.zodu_id,
        branch_id: params.branch_id,
        year: String(year),
      });
      const res = await axiosInstance.get(`${apiConfig.report.restaurantDatewiseOrders}?${p}`);
      return toRestaurantMonthwisePage(res.data);
    },
    getNextPageParam: () => undefined,
    initialPageParam: 1,
    enabled: !params.disabled && !!params.zodu_id && !!params.branch_id,
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
    enabled: !params.disabled && !!params.zodu_id && !!params.branch_id,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};

// ── Restaurant category/item sales report ─────────────────────────────────

export interface RestaurantCategoryItem {
  item_id: number;
  item_name: string;
  total_qty: number;
  total_amount: number;
  price: number;
}

export interface RestaurantCategoryRow {
  category_id: number;
  category_name: string;
  total_qty: number;
  total_amount: number;
  items: RestaurantCategoryItem[];
}

export interface RestaurantCategoryReportSummary {
  totalOrders: number;
  totalQty: number;
  totalAmount: number;
}

export interface RestaurantCategoryReportData {
  summary: RestaurantCategoryReportSummary;
  categories: RestaurantCategoryRow[];
  total: number;
  page: number;
  limit: number;
}

interface RestaurantCategoryParams {
  zodu_id: string;
  branch_id: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  disabled?: boolean;
}

const toRestaurantCategoryReport = (payload: unknown): RestaurantCategoryReportData => {
  const source = asRecord(payload) ?? {};
  const summaryRaw = asRecord(source.summary);
  const pagination = asRecord(source.pagination);

  const summary: RestaurantCategoryReportSummary = {
    totalOrders: toNumber(summaryRaw?.totalOrders),
    totalQty: toNumber(summaryRaw?.totalQty),
    totalAmount: toNumber(summaryRaw?.totalAmount),
  };

  const rawData = Array.isArray(source.data) ? source.data : [];
  const categories: RestaurantCategoryRow[] = rawData.map((entry) => {
    const cat = asRecord(entry);
    const items: RestaurantCategoryItem[] = Array.isArray(cat?.items)
      ? cat.items.map((i: unknown) => {
          const item = asRecord(i);
          return {
            item_id: toNumber(item?.item_id),
            item_name: String(item?.item_name ?? ""),
            total_qty: toNumber(item?.total_qty),
            total_amount: toNumber(item?.total_amount),
            price: toNumber(item?.price),
          };
        })
      : [];
    return {
      category_id: toNumber(cat?.category_id),
      category_name: String(cat?.category_name ?? ""),
      total_qty: toNumber(cat?.total_qty),
      total_amount: toNumber(cat?.total_amount),
      items,
    };
  });

  return {
    summary,
    categories,
    total: toNumber(pagination?.totalRecords ?? source.total) || categories.length,
    page: toNumber(pagination?.page ?? source.page) || 1,
    limit: toNumber(pagination?.limit ?? source.limit) || categories.length || 10,
  };
};

export const useRestaurantCategoryReport = (params: RestaurantCategoryParams) => {
  const limit = params.limit ?? 10;
  return useInfiniteQuery<RestaurantCategoryReportData>({
    queryKey: ["restaurant-category-report", params.zodu_id, params.branch_id, params.from_date, params.to_date, limit],
    queryFn: async ({ pageParam = 1 }) => {
      const p = new URLSearchParams({
        zodu_id: params.zodu_id,
        branch_id: params.branch_id,
        page: String(pageParam),
        limit: String(limit),
      });
      if (params.from_date) p.append("from_date", params.from_date);
      if (params.to_date) p.append("to_date", params.to_date);
      const res = await axiosInstance.get(`${apiConfig.report.restaurantOrderCategory}?${p}`);
      return toRestaurantCategoryReport(res.data);
    },
    getNextPageParam: (lastPage) => {
      const { page, limit: lim, total } = lastPage;
      return page * lim < total ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !params.disabled && !!params.zodu_id && !!params.branch_id,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};
