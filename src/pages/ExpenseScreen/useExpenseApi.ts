import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getTenantContext } from "@store/tenantContext";
import { getAccessToken } from "@store/tenantContext";

export interface ExpenseCatalogItem {
  id: number;
  item_name: string;
  category_id: number | null;
  category_name: string | null;
  zodu_id: string;
  branch_id: string;
  active: boolean;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "https://api.myzodu.com";

function getApi() {
  const { businessType } = getTenantContext();
  console.log("Creating API instance for business type:", businessType);
  const route = businessType === "Restaurant" ? "restaurant" : "retail";
  const token = getAccessToken();
  return axios.create({
    baseURL: `${API_BASE}/${route}/api`,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export interface ExpenseRow {
  id: number;
  expense_id: string;
  zodu_id: string;
  branch_id: string;
  expense_date: string;
  category_id: number;
  total_amount: string;
  paid_amount: string;
  balance_amount: string;
  payment_status: "paid" | "partial" | "pending";
  notes: string | null;
  attachment_url: string[];
  due_date: string | null;
  created_at: string;
  updated_at: string;
  vendor_id: string;
  category_name: string;
  vendor_name: string | null;
  company_name: string | null;
  expense_date_formatted: string;
  due_date_formatted: string | null;
}

export interface ExpenseListResponse {
  data: ExpenseRow[];
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export interface ExpenseSummary {
  total_expense_count: string;
  total_paid_amount: string;
  total_unpaid_amount: string;
  pending_amount: string;
  this_month_spent: string;
  last_month_spent: string;
}

export const useExpenseSummary = () => {
  const { zoduId, branchId, businessType } = getTenantContext();
  console.log("Fetching expense summary for business type:", businessType);
  return useQuery({
    queryKey: ["expense", "summary", zoduId, branchId, businessType],
    queryFn: async () => {
      const res = await getApi().get("/expense/summary", {
        params: { zodu_id: zoduId, branch_id: branchId },
      });
      return res.data?.data as ExpenseSummary;
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useExpenseCatalog = (categoryId: string) => {
  const { zoduId, branchId, businessType } = getTenantContext();
  return useQuery({
    queryKey: ["expense", "catalog", zoduId, branchId, businessType, categoryId],
    queryFn: async () => {
      const res = await getApi().get("/expense/catalog", {
        params: {
          zodu_id: zoduId,
          branch_id: branchId,
          ...(categoryId ? { category_id: Number(categoryId) } : {}),
        },
      });
      const rows = res.data?.data ?? res.data ?? [];
      return rows as ExpenseCatalogItem[];
    },
    enabled: !!categoryId,
    staleTime: 2 * 60 * 1000,
  });
};

export interface ExpenseDetail {
  id?: number;
  expense_id: string;
  vendor_id: string | null;
  vendor_name?: string | null;
  vendor_phone?: string | null;
  vendor_gst?: string | null;
  gst?: string | null;
  vendor_address?: string | null;
  vendor_address_1?: string | null;
  vendor_address_2?: string | null;
  vendor_city?: string | null;
  vendor_state?: string | null;
  vendor_pincode?: string | null;
  expense_date: string;
  expense_date_formatted?: string;
  category_id: number;
  category_name?: string | null;
  total_amount: string;
  paid_amount: string;
  balance_amount: string;
  payment_status: string;
  notes: string | null;
  due_date: string | null;
  due_date_formatted?: string | null;
  created_at?: string;
  transaction_type: string | null;
  transaction_id: string | null;
  attachment_url?: Array<{ id: string; url: string; filename: string; size: number; mimetype: string }> | string[] | null;
  items: Array<{
    expense_item_id?: number;
    item_id?: number;
    id?: number;
    item_name: string;
    qty: number | string;
    price: number | string;
    subtotal?: number | string;
    unit?: string;
    gst_percentage?: number;
    tax_amount?: number;
    category_id: number | null;
    category_name?: string;
  }>;
  payments?: Array<{
    payment_id?: number;
    payment_date?: string;
    payment_date_formatted?: string;
    transaction_type: string | null;
    transaction_id: string | null;
    paid_amount?: string;
    status?: string;
  }>;
}

export const useExpenseDetail = (expenseId: string | null) =>
  useQuery({
    queryKey: ["expense", "detail", expenseId],
    queryFn: async () => {
      const res = await getApi().get(`/expense/${expenseId}`);
      return res.data?.data as ExpenseDetail;
    },
    enabled: !!expenseId,
    staleTime: 0,
  });

export const useExpenses = (params: {
  page?: number;
  limit?: number;
  search?: string;
  payment_status?: string;
}) => {
  const { zoduId, branchId, businessType } = getTenantContext();
  return useQuery({
    queryKey: ["expenses", zoduId, branchId, businessType, params],
    queryFn: async () => {
      const res = await getApi().get("/expense", {
        params: {
          zodu_id: zoduId,
          branch_id: branchId,
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          ...(params.search ? { search: params.search } : {}),
          ...(params.payment_status ? { payment_status: params.payment_status } : {}),
        },
      });
      const raw = res.data;
      return {
        data: (raw?.data ?? []) as ExpenseRow[],
        totalRecords: raw?.totalRecords ?? raw?.data?.length ?? 0,
        currentPage: raw?.currentPage ?? params.page ?? 1,
        totalPages: raw?.totalPages ?? 1,
        limit: raw?.limit ?? params.limit ?? 10,
      } as ExpenseListResponse;
    },
  });
};

export const useMarkExpensePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      expense_id,
      data,
    }: {
      expense_id: string;
      data: {
        zodu_id: string;
        branch_id: string;
        payment_date: string;
        paid_amount: number;
        transaction_type: string;
        transaction_id: string | null;
      };
    }) => {
      const res = await getApi().post(`/expense/payment/${expense_id}`, data);
      if (!res.data?.success) throw new Error(res.data?.message ?? "Failed to record payment");
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses-infinite"] });
      qc.invalidateQueries({ queryKey: ["expense", "summary"] });
    },
  });
};

export const useDeleteExpense = (options?: {
  onSuccess?: () => void;
  onError?: (msg: string) => void;
}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (expenseId: string) => {
      const res = await getApi().delete(`/expense/${expenseId}`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses-infinite"] });
      qc.invalidateQueries({ queryKey: ["expense", "summary"] });
      options?.onSuccess?.();
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? err.message
        : "Failed to delete expense";
      options?.onError?.(msg);
    },
  });
};

export const useInfiniteExpenses = (params: {
  limit?: number;
  search?: string;
  payment_status?: string;
}) => {
  const { zoduId, branchId, businessType } = getTenantContext();
  return useInfiniteQuery({
    queryKey: ["expenses-infinite", zoduId, branchId, businessType, params],
    enabled: !!zoduId && !!branchId,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await getApi().get("/expense", {
        params: {
          zodu_id: zoduId,
          branch_id: branchId,
          page: pageParam,
          limit: params.limit ?? 10,
          ...(params.search ? { search: params.search } : {}),
          ...(params.payment_status ? { payment_status: params.payment_status } : {}),
        },
      });
      const raw = res.data;
      return {
        data: (raw?.data ?? []) as ExpenseRow[],
        currentPage: raw?.currentPage ?? pageParam,
        totalPages: raw?.totalPages ?? 1,
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined,
  });
};
