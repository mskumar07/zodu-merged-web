/**
 * useSaleshistory.ts
 * All types, API config, and fetch/mutate functions for Sales History.
 *
 * FIXED vs original:
 *  - Sale type updated to match real API response (no invoice_no, customer_name,
 *    customer_phone — uses sale_id, cust_name, sale_date_fmt, created_at_fmt)
 *  - SaleItem updated: item_id/item_name instead of product_id/product_name
 *  - PaymentHistoryRow updated to match tbl_sale_payment columns
 *  - postMarkPayment now calls POST /api/sales/:sale_uuid/payment (correct endpoint)
 *  - The retail detail, delete and payment endpoints address a sale by its
 *    `sale_uuid`, never its `sale_id`: an id such as "MA/228" carries a "/"
 *    that splits the URL path and 404s. `sale_id` stays the display value.
 *  - MarkPaymentPayload updated: transaction_type instead of payment_mode,
 *    no paid_date / notes (not in tbl_sale_payment schema)
 *  - fetchHistory uses customer_search instead of invoice_no
 *  - salesQueryKeys.history key includes filters for proper cache invalidation
 */

import axios from "axios";
import { toast } from "react-toastify";
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
  discount_gst_mode?: "before" | "after" | null;
  total_amount:    string;
  paid_amount:     string;
  balance_amount:  string;
  payment_status:  "fully_paid" | "partially_paid" | "unpaid" | boolean;
  notes:           string | null;
  round_off?:      string | number | null;
  due_date?:       string | null;
  // Printed on the transport copy of the invoice; null when the sale was
  // saved without one.
  vehicle_no?:     string | null;
  // The buyer's own purchase-order reference, captured at POS. Both null on a
  // counter sale, which quotes no PO.
  purchase_order_no?:   string | null;
  purchase_order_date?: string | null;

  // formatted dates from TO_CHAR
  sale_date_fmt:   string;
  sale_time_fmt:   string;
  created_at_fmt:  string;
  due_date_fmt?:            string | null;
  purchase_order_date_fmt?: string | null;

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

  // return aggregates (joined from return history)
  total_returned?:     string | null;
  return_count?:       number | null;
  last_return_date?:   string | null;
  /** Returns / credit notes against this invoice (list endpoint). */
  returns?:            SaleListReturn[];

  // restaurant-specific fields
  api_order_id?:       string | null;
  public_order_no?:    string | null;
  cancelled_order?:    boolean | null;
  order_type?:         string | null;
  table_no?:           string | null;
  no_of_items?:        number | null;
  total_amt?:          string | null;
  payment_type?:       string | null;
  items?:              Array<{ item_id: string; qty: number }> | null;

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
  description?:   string;        // absent entirely when the line has no description — never null/""
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
  description?: string;          // absent entirely when the line has no description
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

/** A return as embedded in each row of the sales-history list. */
export interface SaleListReturn {
  return_uuid:      string;
  return_id:        string;
  return_type?:     ReturnType;
  return_amount:    string | number;
  total_items?:     number;
  refund_type?:     string | null;
  refund_status?:   RefundStatus | null;
  adjusted_amount?: string | number | null;
  refund_due?:      string | number | null;
  refunded_amount?: string | number | null;
  pending_refund?:  string | number | null;
  return_reason?:   string | null;
  return_date_fmt?: string | null;
}

export type ReturnType = "SALES_RETURN" | "CREDIT_NOTE";

/** NA = the invoice was unpaid, so the return was adjusted against the balance. */
export type RefundStatus = "PENDING" | "PARTIAL" | "REFUNDED" | "NA";

/** One refund payment recorded against a return. */
export interface ReturnRefundRow {
  id:               number;
  refund_amount:    string;
  payment_mode:     string;
  reference_no:     string | null;
  refund_date_fmt:  string | null;
}

export interface SaleReturnHistoryRow {
  return_uuid:       string;
  return_id:         string;
  return_type?:      ReturnType;
  adjusted_amount?:  string | number | null;
  refund_due?:       string | number | null;
  refunded_amount?:  string | number | null;
  pending_refund?:   string | number | null;
  refund_status?:    RefundStatus | null;
  refunds?:          ReturnRefundRow[];
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
  shipping_address?:       string | null;
  same_as_billing_address?: boolean | string | null;
}

export interface HsnWiseTax {
  hsn_code:      string;
  taxable_value: string;
  cgst_percent:  string;
  cgst_amount:   string;
  sgst_percent:  string;
  sgst_amount:   string;
  item_wise_discount_amount?: string;
  total_tax:     string;
}

export interface SaleDetail {
  sale:            Sale;
  customer:        SaleCustomer | null;
  items:           SaleItem[];
  payment_history: PaymentHistoryRow[];
  return_history:  SaleReturnHistoryRow[];
  hsn_wise_tax?:   HsnWiseTax[];
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
  search:           string;   // searches customer name / mobile
  payment_status:   string;
  from_date:        string;
  to_date:          string;
  order_type?:      string;   // restaurant only: Dine-In | Delivery | Takeaway
  cancelled_order?: boolean;  // true = cancelled tab, false = orders/invoice tab
}

/** Payload for POST /api/sales/:sale_uuid/payment */
export interface MarkPaymentPayload {
  zodu_id:          string;
  branch_id:        string;
  // Goes in the URL path only — never in the body.
  sale_uuid:        string;
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

/** Item in a sales return. Description is NOT sent — the backend inherits it
 *  from the original sale line automatically; an extra key here would 400. */
export interface ReturnItem {
  original_item_id: number;
  item_id:          string;
  item_uuid:        string;
  return_qty:       number;
}

export const REFUND_MODES = ["Cash", "UPI", "Bank Transfer", "Others"] as const;

/** Optional: pay the refund at the same time the return is created. */
export interface RefundPaymentInput {
  payment_mode:  string;           // "Cash" | "UPI" | "Bank Transfer" | "Others"
  reference_no?: string;
  refund_date?:  string;           // YYYY-MM-DD, defaults to today server-side
  amount?:       number;           // defaults to the full refund_due
}

/** Payload for POST /api/retail/sale-returns */
export interface CreateSaleReturnPayload {
  original_sale_uuid: string;
  zodu_id:            string;
  branch_id:          string;
  return_type:        ReturnType;
  return_reason:      string | null;
  refund_type:        string | null;
  notes:              string | null;
  created_by?:        string | null;
  items:              ReturnItem[];
  /** Omit to leave the refund pending and pay it later (Mark Refund). */
  refund_payment?:    RefundPaymentInput;
}

/** Payload for PUT /api/retail/sale-returns/:return_uuid — replaces the return's items and details. */
export interface UpdateSaleReturnPayload {
  zodu_id:       string;
  branch_id:     string;
  return_type:   ReturnType;
  return_reason: string | null;
  notes:         string | null;
  items:         ReturnItem[];
}

/** Response from creating a sales return / credit note (HTTP 201) */
export interface CreateSaleReturnResponse {
  success: boolean;
  message: string;
  data: {
    return_uuid:     string;
    return_id:       string;
    return_type:     ReturnType;
    return_amount:   string;
    adjusted_amount: number;
    refund_due:      number;
    refunded_amount: number;
    refund_status:   RefundStatus;
    refund_type:     string;
    return_date:     string;
    items_returned:  number;
    created_at:      string;
    refund:          { id: number; refund_amount: string; payment_mode: string; reference_no: string | null } | null;
  };
}

/** Payload for POST /api/retail/sale-returns/:return_uuid/refund */
export interface MarkRefundPayload {
  // Goes in the URL path only — never in the body.
  return_uuid:   string;
  zodu_id:       string;
  branch_id:     string;
  refund_amount: number;
  payment_mode:  string;
  reference_no?: string;
  refund_date?:  string;           // YYYY-MM-DD, defaults to today server-side
}

export interface MarkRefundResponse {
  success: boolean;
  message: string;
  data: {
    return_uuid:     string;
    return_id:       string;
    refund_due:      number;
    refunded_amount: number;
    pending_refund:  number;
    refund_status:   RefundStatus;
    payment: { id: number; refund_amount: string; payment_mode: string; reference_no: string | null; refund_date: string };
  };
}

// ─── API functions ────────────────────────────────────────────

/**
 * GET /api/sales/history — paginated + filtered sales list.
 */
export async function fetchHistory(page: number, filters: Filters): Promise<HistoryPage> {
  const { zoduId, branchId } = getTenantContext();
  const params: Record<string, string> = {
    zodu_id:   zoduId!,
    branch_id: branchId!,
    page:      String(page),
    limit:     "20",
  };
  if (filters.payment_status) params.payment_status   = filters.payment_status;
  if (filters.from_date)      params.from_date         = filters.from_date;
  if (filters.to_date)        params.to_date           = filters.to_date;
  // ✅ search — backend searches sale_id, cust_name, cpy_name, mobile_no
  if (filters.search)         params.search   = filters.search;
  if (filters.cancelled_order !== undefined) params.cancelled_order = String(filters.cancelled_order);

  const { data } = await axios.get<HistoryPage>(
    `${API_BASE}/retail/api/sales/history`,
    { params }
  );
  return data;
}

/**
 * GET /retail/api/sales/:sale_uuid — full sale detail (retail).
 *
 * Addressed by `sale_uuid`, which every sale object the API returns carries.
 * A UUID is unique across sale types, so no `sale_type` is sent.
 */
export async function fetchSaleDetail(sale_uuid: string): Promise<SaleDetail> {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await axios.get<{ success: boolean; data: SaleDetail }>(
    `${API_BASE}/retail/api/sales/${sale_uuid}`,
    { params: { zodu_id: zoduId, branch_id: branchId } }
  );
  return data.data;
}

/**
 * GET /restaurant/api/sales/:sale_id — full sale detail (restaurant).
 */
export async function fetchRestaurantSaleDetail(sale_id: string): Promise<SaleDetail> {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await axios.get<{ success: boolean; data: SaleDetail }>(
    `${API_BASE}/restaurant/api/sales/data/get/${sale_id}`,
    { params: { zodu_id: zoduId, branch_id: branchId } }
  );
  return data.data;
}

/**
 * POST /api/sales/:sale_uuid/payment — record a new payment.
 * ✅ Correct endpoint — was /api/payments/add (wrong)
 */
export async function postMarkPayment(
  payload: MarkPaymentPayload
): Promise<MarkPaymentResponse> {
  const { sale_uuid, ...body } = payload;
  const { data } = await axios.post<MarkPaymentResponse>(
    `${API_BASE}/retail/api/sales/${sale_uuid}/payment`,
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

/**
 * PUT /api/retail/sale-returns/:return_uuid — edit an existing return / credit note
 * (change its items and quantities, reason, notes).
 */
export async function updateSaleReturn(
  return_uuid: string,
  payload: UpdateSaleReturnPayload
): Promise<{ success: boolean; message?: string }> {
  const { data } = await axios.put<{ success: boolean; message?: string }>(
    `${API_BASE}/retail/api/sale-returns/${return_uuid}`,
    payload
  );
  return data;
}

/**
 * POST /api/retail/sale-returns/:return_uuid/refund — record a (partial) refund payment
 */
export async function postMarkReturnRefund(
  { return_uuid, ...body }: MarkRefundPayload
): Promise<MarkRefundResponse> {
  const { data } = await axios.post<MarkRefundResponse>(
    `${API_BASE}/retail/api/sale-returns/${return_uuid}/refund`,
    body
  );
  return data;
}

export interface DeleteSaleReturnResponse {
  success: boolean;
  message: string;
  data: {
    return_uuid:      string;
    return_id:        string;
    original_sale_id: string;
    return_amount:    number;
    /** Cash refund that was wiped along with the return. */
    refund_reversed:  number;
  };
}

/**
 * DELETE /api/retail/sale-returns/:return_uuid — permanently removes a return / credit note:
 * restores stock, deletes its refund payments and reopens the invoice balance.
 */
export async function deleteSaleReturn(return_uuid: string): Promise<DeleteSaleReturnResponse> {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await axios.delete<DeleteSaleReturnResponse>(
    `${API_BASE}/retail/api/sale-returns/${return_uuid}`,
    { params: { zodu_id: zoduId, branch_id: branchId } }
  );
  return data;
}

/** Lets the screen that owns the dialog show the result in its SuccessToast (a dialog that closes can't). */
export type Notify = (message: string, severity?: "success" | "error") => void;

/** Falls back to react-toastify for callers that don't supply a notifier. */
export const resolveNotify = (notify?: Notify): Notify =>
  notify ?? ((message, severity = "success") => (severity === "error" ? toast.error(message) : toast.success(message)));

/** The API sends `{ errors: [...] }` for validation failures and `{ message }` otherwise. */
export function apiErrorMessage(err: any, fallback: string): string {
  const d = err?.response?.data;
  return d?.errors?.join?.(", ") ?? d?.message ?? err?.message ?? fallback;
}

export interface SalesSummary {
  success:            boolean;
  total_transactions: number;
  net_revenue:        number;
  total_quotations:   number;
}

export interface RestaurantSalesSummary {
  success:         boolean;
  total_orders: number;
  subtotal:       number;
  total_revenue:   number;
  total_tax:       number;
  total_discount:  number;
}

/**
 * GET /api/sales/history/summary — card totals, respects the same filters.
 */
export async function fetchSummary(filters: Filters): Promise<SalesSummary> {
  const { zoduId, branchId } = getTenantContext();
  const params: Record<string, string> = {
    zodu_id:   zoduId!,
    branch_id: branchId!,
  };
  if (filters.payment_status) params.payment_status = filters.payment_status;
  if (filters.from_date)      params.from_date       = filters.from_date;
  if (filters.to_date)        params.to_date         = filters.to_date;
  if (filters.search)         params.search          = filters.search;
  if (filters.cancelled_order !== undefined) params.cancelled_order = String(filters.cancelled_order);

  const { data } = await axios.get<SalesSummary>(
    `${API_BASE}/retail/api/sales/history/summary`,
    { params }
  );
  return data;
}

/**
 * GET /restaurant/api/sales/history — paginated + filtered sales list for Restaurant.
 */
export async function fetchRestaurantHistory(page: number, filters: Filters): Promise<HistoryPage> {
  const { zoduId, branchId } = getTenantContext();
  const params: Record<string, string> = {
    zodu_id:   zoduId!,
    branch_id: branchId!,
    page:      String(page),
    limit:     "20",
  };
  if (filters.payment_status)              params.payment_status  = filters.payment_status;
  if (filters.from_date)                   params.from_date        = filters.from_date;
  if (filters.to_date)                     params.to_date          = filters.to_date;
  if (filters.search)                      params.search           = filters.search;
  if (filters.order_type)                  params.order_type       = filters.order_type;
  if (filters.cancelled_order !== undefined) params.cancelled_order = String(filters.cancelled_order);

  const { data } = await axios.get<HistoryPage>(
    `${API_BASE}/restaurant/api/sales/history`,
    { params }
  );
  return data;
}

/**
 * GET /restaurant/api/sales/history/summary — card totals for Restaurant.
 */
export async function fetchRestaurantSummary(filters: Filters): Promise<RestaurantSalesSummary> {
  const { zoduId, branchId } = getTenantContext();
  const params: Record<string, string> = {
    zodu_id:   zoduId!,
    branch_id: branchId!,
  };
  if (filters.payment_status) params.payment_status = filters.payment_status;
  if (filters.from_date)      params.from_date       = filters.from_date;
  if (filters.to_date)        params.to_date         = filters.to_date;
  if (filters.search)                        params.search           = filters.search;
  if (filters.order_type)                    params.order_type       = filters.order_type;
  if (filters.cancelled_order !== undefined) params.cancelled_order  = String(filters.cancelled_order);

  const { data } = await axios.get<RestaurantSalesSummary>(
    `${API_BASE}/restaurant/api/sales/history/summary`,
    { params }
  );
  return data;
}

// ─── TanStack Query keys ──────────────────────────────────────
export const salesQueryKeys = {
  history: (branchId: string, filters: Filters) => ["sales-history", branchId, filters] as const,
  summary: (branchId: string, filters: Filters) => ["sales-summary", branchId, filters] as const,
  // Retail: sale_uuid. Restaurant: the order id its detail endpoint takes.
  detail:  (id: string)       => ["sale", id]               as const,
  returns: () => ["sales-returns"] as const,
};




/**
 * DELETE /{retail|restaurant}/api/sales/:id
 *
 * `id` is the `sale_uuid` for retail; `sale_type` is sent along as a query param.
 * Restaurant still addresses an order by its own order id; that endpoint is unchanged.
 */
export async function deleteSale(
  id: string,
  isRestaurant = false,
  items?: Array<{ item_id: string; qty: number }> | null,
  saleType?: string | null,
): Promise<{ success: boolean; message: string }> {
  const { zoduId, branchId } = getTenantContext();
  const base = isRestaurant ? "restaurant" : "retail";
  const params: Record<string, string> = { zodu_id: zoduId, branch_id: branchId };
  if (!isRestaurant && saleType) params.sale_type = saleType;

  const body = isRestaurant && items && items.length > 0 ? { items } : undefined;

  const { data } = await axios.delete(
    `${API_BASE}/${base}/api/sales/${id}`,
    { params, data: body },
  );

  return data;
}