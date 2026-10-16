/**
 * usePurchaseReturnApi.ts
 * Purchase returns / debit notes: create, edit, fetch one, record a vendor refund, delete.
 * Mirrors the sales-return hooks. Every write refreshes the purchase list, detail and summary,
 * because a return changes the purchase's balance as well as its own rows.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTenantContext } from "@store/tenantContext";
import { getApi, type PurchaseRefundStatus, type PurchaseReturnKind } from "./usePuchaseapi";

export const PURCHASE_REFUND_MODES = ["Cash", "UPI", "Bank Transfer", "Others"] as const;

/** One returned line as stored on the return (name / price / tax are copied when it is posted). */
export interface PurchaseReturnDetailItem {
  id:               number;
  original_item_id: number;
  item_id:          string;
  item_name:        string;
  unit:             string | null;
  hsn_code:         string | null;
  gst_percentage:   number;
  purchase_price:   number;
  original_qty:     number;
  return_qty:       number;
  taxable_amount:   number;
  tax_amount:       number;
  cgst:             number;
  sgst:             number;
  total_amount:     number;
}

export interface PurchaseReturnRefund {
  id:              number;
  refund_amount:   number;
  payment_mode:    string;
  reference_no:    string | null;
  refund_date_fmt: string | null;
}

/** GET /purchase-returns/:return_uuid */
export interface PurchaseReturnDetail {
  return: {
    return_uuid:          string;
    return_id:            string;
    return_type:          PurchaseReturnKind;
    original_purchase_id: string;
    invoice_bill_no:      string | null;
    purchase_date_fmt:    string | null;
    return_reason:        string | null;
    notes:                string | null;
    refund_type:          string | null;
    refund_status:        PurchaseRefundStatus;
    return_date_fmt:      string | null;
    created_at_fmt:       string | null;
  };
  /** null when the vendor was removed */
  vendor: {
    vendor_name:   string | null;
    company_name:  string | null;
    phone:         string | null;
    gst:           string | null;
    address_line1: string | null;
    address_line2: string | null;
    city:          string | null;
    state:         string | null;
    pincode:       string | null;
  } | null;
  items: PurchaseReturnDetailItem[];
  summary: {
    subtotal:        number;
    cgst:            number;
    sgst:            number;
    total_tax:       number;
    return_total:    number;
    adjusted_amount: number;
    refund_due:      number;
    refunded_amount: number;
    pending_refund:  number;
    excess_refund:   number;
  };
  refunds: PurchaseReturnRefund[];
}

export interface CreatePurchaseReturnPayload {
  original_purchase_id: string;
  return_type:          PurchaseReturnKind;
  return_reason:        string | null;
  refund_type:          string | null;
  notes:                string | null;
  items:                Array<{ original_item_id: number; return_qty: number }>;
  /** Only when the vendor refunded at this moment; otherwise leave it out and use Mark Refund later. */
  refund_payment?:      { amount?: number; payment_mode: string; reference_no?: string; refund_date?: string };
}

export type UpdatePurchaseReturnPayload = Omit<CreatePurchaseReturnPayload, "original_purchase_id" | "refund_payment">;

export interface MarkPurchaseRefundPayload {
  refund_amount: number;
  payment_mode:  string;
  reference_no?: string;
  refund_date?:  string;
}

/** `{ errors: [...] }` for validation failures, `{ message }` otherwise. */
export function purchaseApiError(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { errors?: string[]; message?: string } }; message?: string };
  const d = e?.response?.data;
  return d?.errors?.join(", ") ?? d?.message ?? e?.message ?? fallback;
}

export const purchaseReturnKeys = {
  all:    ["purchase-returns"] as const,
  detail: (uuid: string) => ["purchase-returns", "detail", uuid] as const,
};

const tenantParams = () => {
  const { zoduId, branchId } = getTenantContext();
  return { zodu_id: zoduId, branch_id: branchId };
};

function useRefreshPurchases() {
  const qc = useQueryClient();
  return () => Promise.all([
    qc.invalidateQueries({ queryKey: ["purchases"] }),
    qc.invalidateQueries({ queryKey: ["purchase"] }),
    qc.invalidateQueries({ queryKey: ["purchase-summary"] }),
    qc.invalidateQueries({ queryKey: purchaseReturnKeys.all }),
  ]);
}

export const usePurchaseReturnDetail = (uuid: string | null | undefined) =>
  useQuery({
    queryKey: purchaseReturnKeys.detail(uuid ?? ""),
    queryFn: async () => {
      const res = await getApi().get(`/purchase-returns/${uuid}`, { params: tenantParams() });
      return res.data.data as PurchaseReturnDetail;
    },
    enabled: !!uuid,
  });

export const useCreatePurchaseReturn = () => {
  const refresh = useRefreshPurchases();
  return useMutation({
    mutationFn: async (payload: CreatePurchaseReturnPayload) => {
      const res = await getApi().post("/purchase-returns", { ...tenantParams(), ...payload });
      return res.data.data as { return_id: string; refund_status: PurchaseRefundStatus; return_amount: number };
    },
    onSuccess: refresh,
  });
};

export const useUpdatePurchaseReturn = (uuid: string) => {
  const refresh = useRefreshPurchases();
  return useMutation({
    mutationFn: async (payload: UpdatePurchaseReturnPayload) => {
      const res = await getApi().put(`/purchase-returns/${uuid}`, { ...tenantParams(), ...payload });
      return res.data.data as { return_id: string; excess_refund: number; refund_status: PurchaseRefundStatus };
    },
    onSuccess: refresh,
  });
};

export const useMarkPurchaseReturnRefund = (uuid: string) => {
  const refresh = useRefreshPurchases();
  return useMutation({
    mutationFn: async (payload: MarkPurchaseRefundPayload) => {
      const res = await getApi().post(`/purchase-returns/${uuid}/refund`, { ...tenantParams(), ...payload });
      return res.data.data as { refund_status: PurchaseRefundStatus; pending_refund: number };
    },
    onSuccess: refresh,
  });
};

export const useDeletePurchaseReturn = () => {
  const refresh = useRefreshPurchases();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const res = await getApi().delete(`/purchase-returns/${uuid}`, { params: tenantParams() });
      return res.data.data as { return_id: string; refund_reversed: number };
    },
    onSuccess: refresh,
  });
};
