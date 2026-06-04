/**
 * useSaleshistory.ts
 * All types, API config, and fetch/mutate functions for Sales History.
 *
 * FIXED vs original:
 *  - Sale type updated to match real API response (no invoice_no, customer_name,
 *    customer_phone — uses sale_id, cust_name, sale_date_fmt, created_at_fmt)
 *  - SaleItem updated: item_id/item_name instead of product_id/product_name
 *  - PaymentHistoryRow updated to match tbl_sale_payment columns
 *  - postMarkPayment now calls POST /api/sales/:sale_id/payment (correct endpoint)
 *  - MarkPaymentPayload updated: transaction_type instead of payment_mode,
 *    no paid_date / notes (not in tbl_sale_payment schema)
 *  - fetchHistory uses customer_search instead of invoice_no
 *  - salesQueryKeys.history key includes filters for proper cache invalidation
 */

import axios from "axios";
import { getTenantContext } from "@store/tenantContext";

// ─── Config ───────────────────────────────────────────────────
export const API_BASE  = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5001";
export const getZoduId = () => getTenantContext().zoduId;
export const getBranchId = () => getTenantContext().branchId;

// ─── Types — matching real API response ───────────────────────

/** tbl_sales row as returned by getSalesHistory */
export interface Sale {
  // sale fields
  sale_uuid:       string;
  sale_id:         string;
  zodu_id:         string;
  branch_id:       string;
  sale_type:       string | null;
  customer_id:     string | null;
  total_items:     number;
  subtotal:        string;
  total_tax:       string;
  discount_type:   string | null;
  discount_value:  string;
  discount_amount: string;
  total_amount:    string;
  paid_amount:     string;
  balance_amount:  string;
  payment_status:  "fully_paid" | "partially_paid" | "unpaid";
  notes:           string | null;

  // formatted dates from TO_CHAR
  sale_date_fmt:   string;
  sale_time_fmt:   string;
  created_at_fmt:  string;

  // customer fields (joined from tbl_customer, null for walk-in)
  cust_uuid:              string | null;
  cust_id:                number | null;
  cust_name:              string | null;
  cpy_name:               string | null;
  customer_mobile:        string | null;
  customer_all_mobiles:   string[] | null;
  customer_email:         string | null;
  customer_gst:           string | null;
  customer_city:          string | null;
  customer_state:         string | null;

  // latest payment fields (joined from tbl_sale_payment)
  payment_row_id:          number | null;
  payment_uuid:            string | null;
  payment_paid_amount:     string | null;
  transaction_type:        string | null;
  payment_transaction_id:  string | null;
  payment_record_status:   string | null;
  payment_date_fmt:        string | null;
}

/** tbl_sale_items row as returned by getSaleById */
export interface SaleItem {
  id:             number;
  sale_uuid:      string;
  sale_id:        string;
  item_id:        string;        // was product_id
  item_uuid:      string;        // UUID for return API
  item_name:      string;        // was product_name
  variant_id:     string | null;
  variant_name:   string | null;
  unit:           string;
  quantity:       string;
  returned_qty:   string | number | null;  // Track previously returned quantity
  price:          string;
  mrp:            string | null;
  discount:       string;
  hsn:            string | null;
  gst_percentage: string;
  tax_amount:     string;
  cgst:           string;
  sgst:           string;
  tax_inclusive:  boolean;
  total_amount:   string;        // GENERATED column
  created_at_fmt: string;
}

/** tbl_sale_payment row as returned by getSaleById */
export interface PaymentHistoryRow {
  payment_row_id:  number;
  payment_uuid:    string;
  sale_id:         string;
  zodu_id:         string;
  branch_id:       string;
  paid_amount:     string;
  transaction_type: string | null;
  transaction_id:  string | null;
  status:          string;
  payment_date_fmt: string;
  created_at_fmt:  string;
}

export interface SaleReturnHistoryItem {
  return_item_uuid?: string;
  sale_item_id?: number;
  item_id?: string;
  item_uuid?: string;
  item_name?: string;
  variant_name?: string | null;
  unit?: string | null;
  return_qty?: string | number | null;
  qty_returned?: string | number | null;
  returned_qty?: string | number | null;
  price?: string | number | null;
  rate?: string | number | null;
  refund_amount?: string | number | null;
  amount?: string | number | null;
  return_reason?: string | null;
  reason?: string | null;
}

export interface SaleReturnHistoryRow {
  return_uuid:       string;
  return_id:         string;
  return_reason:     string | null;
  refund_type:       string | null;
  return_amount:     string;
  subtotal:          string | null;
  total_tax:         string | null;
  total_items:       number;
  return_date_fmt:   string | null;
  return_time_fmt:   string | null;
  created_at_fmt:    string | null;
  notes:             string | null;
  items?:            SaleReturnHistoryItem[];
  return_items?:     SaleReturnHistoryItem[];
}

/** Customer object nested in getSaleById response */
export interface SaleCustomer {
  cust_uuid:      string;
  cust_id:        number;
  cust_name:      string | null;
  cpy_name:       string | null;
  mobile:         string | null;
  all_mobiles:    string[] | null;
  email:          string | null;
  gst:            string | null;
  address_line1:  string | null;
  address_line2:  string | null;
  city:           string | null;
  state:          string | null;
  pincode:        string | null;
}

export interface SaleDetail {
  sale:            Sale;
  customer:        SaleCustomer | null;   // null = walk-in
  items:           SaleItem[];
  payment_history: PaymentHistoryRow[];
  return_history:  SaleReturnHistoryRow[];
}

export interface HistoryPage {
  success:     boolean;
  total:       number;
  page:        number;
  limit:       number;
  total_pages: number;
  data:        Sale[];
}

export interface Filters {
  search:         string;   // searches customer name / mobile
  payment_status: string;
  from_date:      string;
  to_date:        string;
}

/** Payload for POST /api/sales/:sale_id/payment */
export interface MarkPaymentPayload {
  zodu_id:          string;
  branch_id:        string;
  sale_id:          string;
  paid_amount:      number;
  transaction_type: string;   // "Cash" | "Card" | "UPI" | "Credit"
  transaction_id?:  string | null;
}

export interface MarkPaymentResponse {
  success:             boolean;
  message:             string;
  payment:             PaymentHistoryRow;
  new_paid_amount:     number;
  new_balance_amount:  number;
  new_payment_status:  "fully_paid" | "partially_paid" | "unpaid";
}

/** Item in a sales return */
export interface ReturnItem {
  original_item_id: number;
  item_id:          string;
  item_uuid:        string;
  return_qty:       number;
}

/** Payload for POST /api/restaurant/sale-returns */
export interface CreateSaleReturnPayload {
  original_sale_uuid: string;
  zodu_id:            string;
  branch_id:          string;
  return_reason:      string | null;
  refund_type:        string | null;   // "full" | "partial" — determines if refund_amount is full or prorated
  notes:              string | null;
  created_by?:        string | null;
  items:              ReturnItem[];
}

/** Response from creating a sales return */
export interface CreateSaleReturnResponse {
  success:           boolean;
  message:           string;
  return_id:         string;
  refund_amount:     number;
  refund_type:       string;
  created_at:        string;
}

// ─── API functions ────────────────────────────────────────────

/**
 * GET /api/sales/history — paginated + filtered sales list.
 */
export async function fetchHistory(page: number, filters: Filters): Promise<HistoryPage> {
  const { zoduId, branchId } = getTenantContext();
  const params: Record<string, string> = {
    zodu_id:   zoduId,
    branch_id: branchId,
    page:      String(page),
    limit:     "20",
  };
  if (filters.payment_status) params.payment_status   = filters.payment_status;
  if (filters.from_date)      params.from_date         = filters.from_date;
  if (filters.to_date)        params.to_date           = filters.to_date;
  // ✅ search — backend searches sale_id, cust_name, cpy_name, mobile_no
  if (filters.search)         params.search   = filters.search;

  const { data } = await axios.get<HistoryPage>(
    `${API_BASE}/retail/api/sales/history`,
    { params }
  );
  return data;
}

/**
 * GET /api/sales/:sale_id — full sale detail.
 */
export async function fetchSaleDetail(sale_id: string): Promise<SaleDetail> {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await axios.get<{ success: boolean; data: SaleDetail }>(
    `${API_BASE}/retail/api/sales/${sale_id}`,
    { params: { zodu_id: zoduId, branch_id: branchId } }
  );
  console.log(data)
  return data.data;
}

/**
 * POST /api/sales/:sale_id/payment — record a new payment.
 * ✅ Correct endpoint — was /api/payments/add (wrong)
 */
export async function postMarkPayment(
  payload: MarkPaymentPayload
): Promise<MarkPaymentResponse> {
  const { sale_id, ...body } = payload;
  const { data } = await axios.post<MarkPaymentResponse>(
    `${API_BASE}/retail/api/sales/${sale_id}/payment`,
    body
  );
  return data;
}

/**
 * POST /api/retail/sale-returns — create a sales return
 */
export async function createSaleReturn(
  payload: CreateSaleReturnPayload
): Promise<CreateSaleReturnResponse> {
  const { data } = await axios.post<CreateSaleReturnResponse>(
    `${API_BASE}/retail/api/sale-returns`,
    payload
  );
  return data;
}

export interface SalesSummary {
  success:            boolean;
  total_transactions: number;
  net_revenue:        number;
  total_quotations:   number;
}

/**
 * GET /api/sales/history/summary — card totals, respects the same filters.
 */
export async function fetchSummary(filters: Filters): Promise<SalesSummary> {
  const { zoduId, branchId } = getTenantContext();
  const params: Record<string, string> = {
    zodu_id:   zoduId,
    branch_id: branchId,
  };
  if (filters.payment_status) params.payment_status = filters.payment_status;
  if (filters.from_date)      params.from_date       = filters.from_date;
  if (filters.to_date)        params.to_date         = filters.to_date;
  if (filters.search)         params.search          = filters.search;

  const { data } = await axios.get<SalesSummary>(
    `${API_BASE}/retail/api/sales/history/summary`,
    { params }
  );
  return data;
}

// ─── TanStack Query keys ──────────────────────────────────────
export const salesQueryKeys = {
  history: (branchId: string, filters: Filters) => ["sales-history", branchId, filters] as const,
  summary: (branchId: string, filters: Filters) => ["sales-summary", branchId, filters] as const,
  detail:  (sale_id: string)  => ["sale", sale_id]          as const,
  returns: () => ["sales-returns"] as const,
};




export async function deleteSale(sale_id: string): Promise<{ success: boolean; message: string }> {
  const { zoduId, branchId } = getTenantContext();

  const { data } = await axios.delete(
    `${API_BASE}/retail/api/sales/${sale_id}`,
    {
      params: {
        zodu_id: zoduId,
        branch_id: branchId,
      },
    }
  );

  return data;
}