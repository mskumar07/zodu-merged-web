import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { apiConfig } from "@config/api";
import axiosInstance from "@store/services/axiosInstance";

export interface PurchaseSummary {
  totalPurchase: number;
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
}

export interface PurchaseMonthlyBreakdownRow {
  month: string;
  purchaseCount: number;
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
}

export interface PurchaseMonthlyBreakdownPage {
  success: boolean;
  data: PurchaseMonthlyBreakdownRow[];
  total: number;
  page: number;
  limit: number;
}

export interface DatewisePurchaseSummary {
  totalPurchase: number;
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
}

export interface DatewisePurchaseBreakdownRow {
  purchaseDate: string;
  purchaseCount: number;
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
}

export interface DatewisePurchaseBreakdownPage {
  success: boolean;
  data: DatewisePurchaseBreakdownRow[];
  total: number;
  page: number;
  limit: number;
}

interface PurchaseSummaryParams {
  zodu_id: string;
  branch_id: string;
  year?: number | string;
  isRestaurant?: boolean;
}

interface PurchaseBreakdownParams extends PurchaseSummaryParams {
  limit?: number;
}

interface DatewisePurchaseParams {
  zodu_id: string;
  branch_id: string;
  from_date?: string;
  to_date?: string;
  isRestaurant?: boolean;
}

interface DatewisePurchaseBreakdownParams extends DatewisePurchaseParams {
  limit?: number;
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : null;

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toPurchaseSummary = (payload: unknown): PurchaseSummary => {
  // Monthly API: { data: { total_yearly_purchase, total_yearly_paid, total_yearly_pending } }
  // Datewise API: { data: { total_orders, total_purchase, total_paid, total_pending } }
  const source = asRecord(asRecord(payload)?.data ?? payload);
  return {
    totalPurchase: toNumber(source?.total_yearly_purchase_count ?? source?.total_orders ?? source?.totalPurchase ?? source?.purchase_count),
    totalAmount: toNumber(source?.total_yearly_purchase ?? source?.total_purchase ?? source?.totalAmount ?? source?.total_amount),
    pendingAmount: toNumber(source?.total_yearly_pending ?? source?.total_pending ?? source?.pendingAmount ?? source?.pending_amount),
    paidAmount: toNumber(source?.total_yearly_paid ?? source?.total_paid ?? source?.paidAmount ?? source?.paid_amount),
  };
};

const toPurchaseMonthlyBreakdownRow = (row: unknown): PurchaseMonthlyBreakdownRow => {
  // API row expected: { month/month_name, total_orders, total_purchase, total_paid, total_pending }
  const source = asRecord(row);
  return {
    month: String(source?.month_name ?? source?.month ?? "—"),
    purchaseCount: toNumber(source?.total_orders ?? source?.purchase_count ?? source?.bill_count ?? source?.count),
    totalAmount: toNumber(source?.total_purchase ?? source?.total_amount ?? source?.totalAmount),
    pendingAmount: toNumber(source?.total_pending ?? source?.pending_amount ?? source?.pendingAmount),
    paidAmount: toNumber(source?.total_paid ?? source?.paid_amount ?? source?.paidAmount),
  };
};

const toPurchaseMonthlyBreakdownPage = (payload: unknown): PurchaseMonthlyBreakdownPage => {
  const source = asRecord(payload) ?? {};
  const pagination = asRecord(source.pagination);
  const data = Array.isArray(source.data) ? source.data.map(toPurchaseMonthlyBreakdownRow) : [];
  return {
    success: source.success !== false,
    data,
    total: toNumber(source.total ?? pagination?.total),
    page: toNumber(source.page ?? pagination?.page) || 1,
    limit: toNumber(source.limit ?? pagination?.limit) || data.length || 1,
  };
};

const toDatewisePurchaseSummary = (payload: unknown): DatewisePurchaseSummary => {
  // API: { success, data: { total_orders, total_purchase, total_paid, total_pending } }
  const source = asRecord(asRecord(payload)?.data ?? payload);
  return {
    totalPurchase: toNumber(source?.total_orders ?? source?.totalPurchase ?? source?.total_purchase ?? source?.purchase_count),
    totalAmount: toNumber(source?.total_purchase ?? source?.totalAmount ?? source?.total_amount),
    pendingAmount: toNumber(source?.total_pending ?? source?.pendingAmount ?? source?.pending_amount),
    paidAmount: toNumber(source?.total_paid ?? source?.paidAmount ?? source?.paid_amount),
  };
};

const toDatewisePurchaseBreakdownRow = (row: unknown): DatewisePurchaseBreakdownRow => {
  // API row: { date, total_orders, total_purchase, total_paid, total_pending }
  const source = asRecord(row);
  return {
    purchaseDate: String(source?.date ?? source?.purchase_date ?? source?.purchaseDate ?? ""),
    purchaseCount: toNumber(source?.total_orders ?? source?.purchase_count ?? source?.bill_count),
    totalAmount: toNumber(source?.total_purchase ?? source?.total_amount ?? source?.totalAmount),
    pendingAmount: toNumber(source?.total_pending ?? source?.pending_amount ?? source?.pendingAmount),
    paidAmount: toNumber(source?.total_paid ?? source?.paid_amount ?? source?.paidAmount),
  };
};

const toDatewisePurchaseBreakdownPage = (payload: unknown): DatewisePurchaseBreakdownPage => {
  const source = asRecord(payload) ?? {};
  const pagination = asRecord(source.pagination);
  const data = Array.isArray(source.data) ? source.data.map(toDatewisePurchaseBreakdownRow) : [];
  return {
    success: source.success !== false,
    data,
    total: toNumber(source.total ?? pagination?.total),
    page: toNumber(source.page ?? pagination?.page) || 1,
    limit: toNumber(source.limit ?? pagination?.limit) || data.length || 1,
  };
};

const swapBase = (url: string, isRestaurant: boolean) =>
  isRestaurant ? url : url.replace(/^\/restaurant/, "/retail");

export const usePurchaseSummary = (params: PurchaseSummaryParams) => {
  return useQuery<PurchaseSummary>({
    queryKey: ["purchase-summary", params.zodu_id, params.branch_id, params.year, params.isRestaurant],
    queryFn: async () => {
      const p = new URLSearchParams({ zodu_id: params.zodu_id, branch_id: params.branch_id });
      if (params.year) p.append("year", String(params.year));
      const url = swapBase(apiConfig.report.purchaseSummary, !!params.isRestaurant);
      const res = await axiosInstance.get(`${url}?${p}`);
      return toPurchaseSummary(res.data);
    },
    enabled: !!params.zodu_id && !!params.branch_id,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};

export const usePurchaseMonthlyBreakdown = (params: PurchaseBreakdownParams) => {
  const limit = params.limit ?? 12;
  return useInfiniteQuery<PurchaseMonthlyBreakdownPage>({
    queryKey: ["purchase-monthly-breakdown", params.zodu_id, params.branch_id, params.year, params.isRestaurant],
    queryFn: async ({ pageParam = 1 }) => {
      const p = new URLSearchParams({
        zodu_id: params.zodu_id,
        branch_id: params.branch_id,
        page: String(pageParam),
        limit: String(limit),
      });
      if (params.year) p.append("year", String(params.year));
      const url = swapBase(apiConfig.report.purchaseMonthlyBreakdown, !!params.isRestaurant);
      const res = await axiosInstance.get(`${url}?${p}`);
      return toPurchaseMonthlyBreakdownPage(res.data);
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

export const useDatewisePurchaseSummary = (params: DatewisePurchaseParams) => {
  return useQuery<DatewisePurchaseSummary>({
    queryKey: ["datewise-purchase-summary", params.zodu_id, params.branch_id, params.from_date, params.to_date, params.isRestaurant],
    queryFn: async () => {
      const p = new URLSearchParams({ zodu_id: params.zodu_id, branch_id: params.branch_id });
      if (params.from_date) p.append("from_date", params.from_date);
      if (params.to_date) p.append("to_date", params.to_date);
      const url = swapBase(apiConfig.report.purchaseDatewiseSummary, !!params.isRestaurant);
      const res = await axiosInstance.get(`${url}?${p}`);
      return toDatewisePurchaseSummary(res.data);
    },
    enabled: !!params.zodu_id && !!params.branch_id,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};

export const useDatewisePurchaseBreakdown = (params: DatewisePurchaseBreakdownParams) => {
  const limit = params.limit ?? 15;
  return useInfiniteQuery<DatewisePurchaseBreakdownPage>({
    queryKey: ["datewise-purchase-breakdown", params.zodu_id, params.branch_id, params.from_date, params.to_date, limit, params.isRestaurant],
    queryFn: async ({ pageParam = 1 }) => {
      const p = new URLSearchParams({
        zodu_id: params.zodu_id,
        branch_id: params.branch_id,
        page: String(pageParam),
        limit: String(limit),
      });
      if (params.from_date) p.append("from_date", params.from_date);
      if (params.to_date) p.append("to_date", params.to_date);
      const url = swapBase(apiConfig.report.purchaseDatewiseBreakdown, !!params.isRestaurant);
      const res = await axiosInstance.get(`${url}?${p}`);
      return toDatewisePurchaseBreakdownPage(res.data);
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
