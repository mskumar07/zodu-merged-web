import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { apiConfig } from "@config/api";
import axiosInstance from "@store/services/axiosInstance";

export interface ExpenseSummary {
  totalExpense: number;
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
}

export interface ExpenseMonthlyBreakdownRow {
  month: string;
  expenseCount: number;
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
}

export interface ExpenseMonthlyBreakdownPage {
  success: boolean;
  data: ExpenseMonthlyBreakdownRow[];
  total: number;
  page: number;
  limit: number;
}

export interface DatewiseExpenseSummary {
  totalExpense: number;
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
}

export interface DatewiseExpenseBreakdownRow {
  expenseDate: string;
  expenseCount: number;
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
}

export interface DatewiseExpenseBreakdownPage {
  success: boolean;
  data: DatewiseExpenseBreakdownRow[];
  total: number;
  page: number;
  limit: number;
}

interface ExpenseSummaryParams {
  zodu_id: string;
  branch_id: string;
  year?: number | string;
  isRestaurant?: boolean;
}

interface ExpenseBreakdownParams extends ExpenseSummaryParams {
  limit?: number;
}

interface DatewiseExpenseParams {
  zodu_id: string;
  branch_id: string;
  from_date?: string;
  to_date?: string;
  isRestaurant?: boolean;
}

interface DatewiseExpenseBreakdownParams extends DatewiseExpenseParams {
  limit?: number;
}


const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : null;

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toExpenseSummary = (payload: unknown): ExpenseSummary => {
  // Monthly API: { data: { total_yearly_expense, total_yearly_paid, total_yearly_pending } }
  // Datewise API: { data: { total_entries, total_expense, total_paid, total_pending } }
  const source = asRecord(asRecord(payload)?.data ?? payload);
  return {
    totalExpense: toNumber(source?.total_yearly_expense_count ?? source?.total_entries ?? source?.totalExpense ?? source?.expense_count),
    totalAmount: toNumber(source?.total_yearly_expense ?? source?.total_expense ?? source?.totalAmount ?? source?.total_amount),
    pendingAmount: toNumber(source?.total_yearly_pending ?? source?.total_pending ?? source?.pendingAmount ?? source?.pending_amount),
    paidAmount: toNumber(source?.total_yearly_paid ?? source?.total_paid ?? source?.paidAmount ?? source?.paid_amount),
  };
};

const toExpenseMonthlyBreakdownRow = (row: unknown): ExpenseMonthlyBreakdownRow => {
  // API row expected: { month/month_name, total_entries, total_expense, total_paid, total_pending }
  const source = asRecord(row);
  return {
    month: String(source?.month_name ?? source?.month ?? "—"),
    expenseCount: toNumber(source?.total_entries ?? source?.expense_count ?? source?.bill_count ?? source?.count),
    totalAmount: toNumber(source?.total_expense ?? source?.total_amount ?? source?.totalAmount),
    pendingAmount: toNumber(source?.total_pending ?? source?.pending_amount ?? source?.pendingAmount),
    paidAmount: toNumber(source?.total_paid ?? source?.paid_amount ?? source?.paidAmount),
  };
};

const toExpenseMonthlyBreakdownPage = (payload: unknown): ExpenseMonthlyBreakdownPage => {
  const source = asRecord(payload) ?? {};
  const pagination = asRecord(source.pagination);
  const data = Array.isArray(source.data) ? source.data.map(toExpenseMonthlyBreakdownRow) : [];
  return {
    success: source.success !== false,
    data,
    total: toNumber(source.total ?? pagination?.total),
    page: toNumber(source.page ?? pagination?.page) || 1,
    limit: toNumber(source.limit ?? pagination?.limit) || data.length || 1,
  };
};

const toDatewiseExpenseSummary = (payload: unknown): DatewiseExpenseSummary => {
  // API: { success, data: { total_entries, total_expense, total_paid, total_pending } }
  const source = asRecord(asRecord(payload)?.data ?? payload);
  return {
    totalExpense: toNumber(source?.total_entries ?? source?.totalExpense ?? source?.total_expense),
    totalAmount: toNumber(source?.total_expense ?? source?.totalAmount ?? source?.total_amount),
    pendingAmount: toNumber(source?.total_pending ?? source?.pendingAmount ?? source?.pending_amount),
    paidAmount: toNumber(source?.total_paid ?? source?.paidAmount ?? source?.paid_amount),
  };
};

const toDatewiseExpenseBreakdownRow = (row: unknown): DatewiseExpenseBreakdownRow => {
  // API row: { date, total_entries, total_expense, total_paid, total_pending }
  const source = asRecord(row);
  return {
    expenseDate: String(source?.date ?? source?.expense_date ?? source?.expenseDate ?? ""),
    expenseCount: toNumber(source?.total_entries ?? source?.expense_count ?? source?.bill_count),
    totalAmount: toNumber(source?.total_expense ?? source?.total_amount ?? source?.totalAmount),
    pendingAmount: toNumber(source?.total_pending ?? source?.pending_amount ?? source?.pendingAmount),
    paidAmount: toNumber(source?.total_paid ?? source?.paid_amount ?? source?.paidAmount),
  };
};

const toDatewiseExpenseBreakdownPage = (payload: unknown): DatewiseExpenseBreakdownPage => {
  const source = asRecord(payload) ?? {};
  const pagination = asRecord(source.pagination);
  const data = Array.isArray(source.data) ? source.data.map(toDatewiseExpenseBreakdownRow) : [];
  return {
    success: source.success !== false,
    data,
    total: toNumber(source.total ?? pagination?.total),
    page: toNumber(source.page ?? pagination?.page) || 1,
    limit: toNumber(source.limit ?? pagination?.limit) || data.length || 1,
  };
};

const swapBase = (url: string, isRestaurant: boolean) =>
  isRestaurant ? url.replace(/^\/retail/, "/restaurant") : url;

export const useExpenseSummary = (params: ExpenseSummaryParams) => {
  return useQuery<ExpenseSummary>({
    queryKey: ["expense-summary", params.zodu_id, params.branch_id, params.year, params.isRestaurant],
    queryFn: async () => {
      const p = new URLSearchParams({ zodu_id: params.zodu_id, branch_id: params.branch_id });
      if (params.year) p.append("year", String(params.year));
      const url = swapBase(apiConfig.report.expenseSummary, !!params.isRestaurant);
      const res = await axiosInstance.get(`${url}?${p}`);
      return toExpenseSummary(res.data);
    },
    enabled: !!params.zodu_id && !!params.branch_id,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};

export const useExpenseMonthlyBreakdown = (params: ExpenseBreakdownParams) => {
  const limit = params.limit ?? 12;
  return useInfiniteQuery<ExpenseMonthlyBreakdownPage>({
    queryKey: ["expense-monthly-breakdown", params.zodu_id, params.branch_id, params.year, params.isRestaurant],
    queryFn: async ({ pageParam = 1 }) => {
      const p = new URLSearchParams({
        zodu_id: params.zodu_id,
        branch_id: params.branch_id,
        page: String(pageParam),
        limit: String(limit),
      });
      if (params.year) p.append("year", String(params.year));
      const url = swapBase(apiConfig.report.expenseMonthlyBreakdown, !!params.isRestaurant);
      const res = await axiosInstance.get(`${url}?${p}`);
      return toExpenseMonthlyBreakdownPage(res.data);
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

export const useDatewiseExpenseSummary = (params: DatewiseExpenseParams) => {
  return useQuery<DatewiseExpenseSummary>({
    queryKey: ["datewise-expense-summary", params.zodu_id, params.branch_id, params.from_date, params.to_date, params.isRestaurant],
    queryFn: async () => {
      const p = new URLSearchParams({ zodu_id: params.zodu_id, branch_id: params.branch_id });
      if (params.from_date) p.append("from_date", params.from_date);
      if (params.to_date) p.append("to_date", params.to_date);
      const url = swapBase(apiConfig.report.expenseDatewiseSummary, !!params.isRestaurant);
      const res = await axiosInstance.get(`${url}?${p}`);
      return toDatewiseExpenseSummary(res.data);
    },
    enabled: !!params.zodu_id && !!params.branch_id,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};

export const useDatewiseExpenseBreakdown = (params: DatewiseExpenseBreakdownParams) => {
  const limit = params.limit ?? 15;
  return useInfiniteQuery<DatewiseExpenseBreakdownPage>({
    queryKey: ["datewise-expense-breakdown", params.zodu_id, params.branch_id, params.from_date, params.to_date, limit, params.isRestaurant],
    queryFn: async ({ pageParam = 1 }) => {
      const p = new URLSearchParams({
        zodu_id: params.zodu_id,
        branch_id: params.branch_id,
        page: String(pageParam),
        limit: String(limit),
      });
      if (params.from_date) p.append("from_date", params.from_date);
      if (params.to_date) p.append("to_date", params.to_date);
      const url = swapBase(apiConfig.report.expenseDatewiseBreakdown, !!params.isRestaurant);
      const res = await axiosInstance.get(`${url}?${p}`);
      return toDatewiseExpenseBreakdownPage(res.data);
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
