import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getTenantContext, getAccessToken } from "@store/tenantContext";

/* =========================================================
   🔹 AXIOS INSTANCE
========================================================= */
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "https://api.myzodu.com";
export const getZoduId = () => getTenantContext().zoduId;
export const getBranchId = () => getTenantContext().branchId;

function getApi() {
  const { businessType } = getTenantContext();
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

/* =========================================================
   🔹 TYPES
========================================================= */

export interface Vendor {
  id?: string;
  vendor_id: string;
  zodu_id?: string;
  branch_id?: string;
  vendor_name: string;
  company_name?: string;
  gst?: string;
  vendor_phone?: string;
  vendor_email?: string;
  city?: string;
}

/** One row inserted into tbl_purchase_items */
export interface PurchaseItemPayload {
  item_uuid: string;
  item_id: string;
  item_name: string;
  qty: number;
  unit?: string;
  purchase_price: number;
  gst_percentage?: number;
  tax_amount?: number;
  cgst?: number;
  sgst?: number;
  category_id?: number | null;
}

/** Body sent to POST /purchase */
export interface PurchasePayload {
  zodu_id: string;
  branch_id: string;
  vendor_id: string;
  purchase_date: string;
  total_amount: number;
  paid_amount: number;
  due_date: any;
  payment_status?: "pending" | "partial" | "paid";
  notes?: string;
  attachment_url?: Array<{ id: string; url: string; filename: string; size: number; mimetype: string }> | null;
  transaction_type?: string;
  transaction_id?: string | null;
  payment_date?: string | null;
  items: PurchaseItemPayload[];
}

export interface PurchaseStatsData {
  total_purchase_count: string;
  total_paid_amount: string;
  total_unpaid_amount: string;
  this_month_spent: string;
  last_month_spent?: string;
}

/** Body sent to POST /purchase/payment/:id */
export interface MarkPaymentPayload {
  zodu_id: string;
  branch_id: string;
  payment_date: string;
  paid_amount: number;
  transaction_type?: string;
  transaction_id?: string | null;
  status?: "completed" | "pending";
}

/** Row returned by GET /purchase (list) — includes joined vendor fields */
export interface PurchaseRow {
  id: string;
  purchase_id: string;
  purchase_date: string;
  total_amount: string;
  paid_amount: string;
  balance_amount: string;
  payment_status: "paid" | "partial" | "pending";
  notes: string | null;
  zodu_id: string;
  branch_id: string;
  created_at: string;
  due_date_formated: string | null;
  due_date_formatted?: string | null;
  attachment_url: string | null;
  // joined from tbl_vendor
  vendor_id: string | null;
  vendor_name: string | null;
  company_name: string | null;
  vendor_phone: string | null;
}

/** Item row returned by GET /purchase/:id */
export interface PurchaseItemRow {
  purchase_item_id: number;
  item_id: string | null;
  item_uuid: string | null;
  item_name: string;
  hsn_code?: string | null;
  hsn?: string | null;
  qty: string;
  unit: string | null;
  purchase_price: string;
  gst_percentage: string | null;
  tax_amount: string | null;
  cgst: string | null;
  sgst: string | null;
  subtotal: string;
  total_price: string | null;
  category_id: number | null;
}

/** Payment row returned by GET /purchase/:id */
export interface PurchasePaymentRow {
  payment_id: string;
  payment_date: string;
  paid_amount: string;
  transaction_type: string | null;
  transaction_id: string | null;
  status: string;
  created_at: string;
}

/** Full detail returned by GET /purchase/:id */
export interface PurchaseDetail extends PurchaseRow {
  due_date?: string | null;
  // extended vendor fields
  vendor_email: string | null;
  vendor_address_1: string | null;
  vendor_address_2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  vendor_gst: string | null;
  // nested
  items: PurchaseItemRow[];
  payments: PurchasePaymentRow[];
}

/* =========================================================
   🔹 VENDOR APIs
========================================================= */

export const useVendors = (type?: "Expense" | "Purchase") => {
  const { zoduId, branchId, businessType } = getTenantContext();
  return useQuery({
    queryKey: ["vendors", zoduId, branchId, businessType, type],
    queryFn: async () => {
      const res = await getApi().get("/vendor", {
        params: { zodu_id: zoduId, branch_id: branchId, ...(type ? { type } : {}) },
      });
      return (res.data?.data ?? res.data?.Data ?? res.data ?? []) as Vendor[];
    },
  });
};

export const useVendorById = (vendor_id: string) =>
  useQuery({
    queryKey: ["vendor", vendor_id],
    queryFn: async () => {
      const res = await getApi().get(`/vendor/${vendor_id}`);
      return res.data as Vendor;
    },
    enabled: !!vendor_id,
  });

export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Vendor>) => {
      const res = await getApi().post("/vendor", data);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vendors"] }),
  });
};

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Vendor> }) => {
      const res = await getApi().put(`/vendor/${id}`, data);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vendors"] }),
  });
};

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await getApi().delete(`/vendor/${id}`);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vendors"] }),
  });
};

/* =========================================================
   🔹 PURCHASE APIs
========================================================= */

export const usePurchaseSummary = () => {
  const { zoduId, branchId, businessType } = getTenantContext();
  return useQuery({
    queryKey: ["purchase-summary", zoduId, branchId, businessType],
    queryFn: async () => {
      const res = await getApi().get("/purchase/summary", {
        params: { zodu_id: zoduId, branch_id: branchId },
      });
      return (res.data?.data ?? res.data) as PurchaseStatsData;
    },
  });
};

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: PurchasePayload) => {
      const res = await getApi().post("/purchase", data);
      if (!res.data?.success) {
        throw new Error(res.data?.message ?? "Failed to create purchase");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-summary"] });
    },
  });
};

export const usePurchases = (params: Record<string, string> = {}) => {
  const { zoduId, branchId, businessType } = getTenantContext();
  return useQuery({
    queryKey: ["purchases", zoduId, branchId, businessType, params],
    queryFn: async () => {
      const res = await getApi().get("/purchase", {
        params: { zodu_id: zoduId, branch_id: branchId, ...params },
      });
      return (res.data?.data ?? res.data ?? []) as PurchaseRow[];
    },
  });
};

export const usePurchaseById = (id: string) => {
  const { zoduId, branchId, businessType } = getTenantContext();
  return useQuery({
    queryKey: ["purchase", id, zoduId, branchId, businessType],
    queryFn: async () => {
      const res = await getApi().get(`/purchase/${id}`, {
        params: { zodu_id: zoduId, branch_id: branchId },
      });
      return (res.data?.data ?? res.data) as PurchaseDetail;
    },
    enabled: !!id,
  });
};

export const useUpdatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PurchasePayload }) => {
      const res = await getApi().put(`/purchase/${id}`, data);
      if (!res.data?.success) {
        throw new Error(res.data?.message ?? "Failed to update purchase");
      }
      return res.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["purchase", id] });
      queryClient.invalidateQueries({ queryKey: ["purchase-summary"] });
    },
  });
};

export const useDeletePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await getApi().delete(`/purchase/${id}`);
      if (!res.data?.success) {
        throw new Error(res.data?.message ?? "Failed to delete purchase");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-summary"] });
    },
  });
};

export const useMarkPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      purchase_id,
      data,
    }: {
      purchase_id: string;
      data: MarkPaymentPayload;
    }) => {
      const res = await getApi().post(`/purchase/payment/${purchase_id}`, data);
      if (!res.data?.success) {
        throw new Error(res.data?.message ?? "Failed to mark payment");
      }
      return res.data;
    },
    onSuccess: (_, { purchase_id }) => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["purchase", purchase_id] });
      queryClient.invalidateQueries({ queryKey: ["purchase-summary"] });
    },
  });
};
