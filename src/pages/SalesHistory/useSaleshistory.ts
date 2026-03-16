/**
 * salesHistory.api.ts
 * All types, API config, and fetch functions for the Sales History feature.
 */

import axios from "axios";

// ─── Config ───────────────────────────────────────────────────────────────────
export const API_BASE  = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";
export const ZODU_ID   = "ZODU035";
export const BRANCH_ID = "ZODU035B1";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Sale {
  sale_id: string;
  invoice_no: string;
  sale_date: string;
  sale_time: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_id: string | null;
  total_items: number;
  subtotal: string;
  total_tax: string;
  discount_type: string | null;
  discount_value: string;
  discount_amount: string;
  total_amount: string;
  paid_amount: string;
  balance_amount: string;
  payment_status: "fully_paid" | "partially_paid" | "unpaid";
  sale_type: string | null;
  payment_id: string | null;
  payment_transaction_id: string | null;
}

export interface SaleItem {
  id: number;
  product_id: string;
  product_name: string;
  variant_name: string | null;
  unit: string;
  quantity: string;
  price: string;
  gst_percentage: string;
  tax_amount: string;
  cgst: string;
  sgst: string;
  hsn_code?: string;
}

export interface PaymentHistoryRow {
  payment_history_id: number;
  paid_amount: string;
  paid_date: string;
  payment_mode: string;
  transaction_id: string;
}

export interface SaleDetail {
  sale: Sale;
  items: SaleItem[];
  payment_history: PaymentHistoryRow[];
}

export interface HistoryPage {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  data: Sale[];
}

export interface Filters {
  search: string;
  payment_status: string;
  from_date: string;
  to_date: string;
}

export interface MarkPaymentPayload {
  zodu_id: string;
  branch_id: string;
  sale_id: string;
  total_amount: number;
  paid_amount: number;
  payment_mode: string;
  paid_date: string;
  transaction_id: string;
  notes?: string;
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * GET /api/sales/history
 * Paginated + filtered sales list.
 */
export async function fetchHistory(page: number, filters: Filters): Promise<HistoryPage> {
  const params: Record<string, string> = {
    zodu_id:   ZODU_ID,
    branch_id: BRANCH_ID,
    page:      String(page),
    limit:     "20",
  };
  if (filters.payment_status) params.payment_status = filters.payment_status;
  if (filters.from_date)      params.from_date       = filters.from_date;
  if (filters.to_date)        params.to_date         = filters.to_date;
  if (filters.search)         params.invoice_no      = filters.search;

  const { data } = await axios.get<HistoryPage>(`${API_BASE}/restaurant/api/sales/history`, { params });
  return data;
}

/**
 * GET /api/sales/:sale_id
 * Full sale detail — header + items + payment history.
 */
export async function fetchSaleDetail(sale_id: string): Promise<SaleDetail> {
  const { data } = await axios.get<{ success: boolean; data: SaleDetail }>(
    `${API_BASE}/restaurant/api/sales/${sale_id}`,
    { params: { zodu_id: ZODU_ID, branch_id: BRANCH_ID } }
  );
  return data.data;
}

/**
 * POST /api/payments/add
 * Record a new payment against an existing payment record.
 */
export async function postMarkPayment(payload: MarkPaymentPayload): Promise<unknown> {
  const { data } = await axios.post(`${API_BASE}/restaurant/api/payments/add`, payload);
  return data;
}

// ─── TanStack Query keys ──────────────────────────────────────────────────────
export const salesQueryKeys = {
  history: (filters: Filters) => ["sales-history", filters] as const,
  detail:  (sale_id: string)  => ["sale", sale_id]          as const,
};