/**
 * useCustomerApi.ts
 * TanStack Query hooks for the Customer API.
 */

import axios from "axios";
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { getTenantContext, useTenantContext, getAccessToken } from "@store/tenantContext";

const API_BASE  = import.meta.env.VITE_API_BASE_URL ?? "https://api.myzodu.com";

// ─── Payload ──────────────────────────────────────────────────
export interface AddCustomerPayload {
  zodu_id:        string;
  branch_id:      string;
  cust_name?:     string | null;
  cpy_name?:      string | null;
  mobile_no?:     string[];
  email_id?:      string[];
  gst?:           string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?:          string | null;
  state?:         string | null;
  pincode?:       string | null;
  // Shipping address — single comma-joined string built from whichever of
  // line1/line2/city/state/pincode are present. Mirrors the billing address
  // when "Same as Billing Address" is checked.
  shipping_address?: string | null;
  same_as_billing_address: boolean;
}

// ─── Response ─────────────────────────────────────────────────
export interface AddCustomerResponse {
  success:  boolean;
  message:  string;
  customer: {
    cust_uuid:     string;
    cust_id:       number;
    zodu_id:       string;
    branch_id:     string;
    cust_name:     string | null;
    cpy_name:      string | null;
    mobile_no:     string[] | null;
    email_id:      string[] | null;
    gst:           string | null;
    address_line1: string | null;
    address_line2: string | null;
    city:          string | null;
    state:         string | null;
    pincode:       string | null;
    shipping_address?: string | null;
    created_at:    string;
  };
}

export interface LedgerFilters {
  fromDate?: string;        // YYYY-MM-DD
  toDate?:   string;        // YYYY-MM-DD
  method?:   string;        // "cash" | "upi" | "card" | "all"
  page?:     number;
  limit?:    number;
}

// ─── API response shapes ──────────────────────────────────────
export interface LedgerCustomer {
  cust_uuid:       string;
  cust_id:         number;
  cust_name:       string | null;
  cpy_name:        string | null;
  mobile_no:       string[] | null;
  email_id:        string[] | null;
  opening_balance: number | null;
}

/** Unified row — doc_type distinguishes SALE vs RETURN */
export interface SalesReturnRow {
  doc_uuid:        string;
  doc_id:          string;
  doc_type:        "SALE" | "RETURN";
  description:     string;
  doc_date:        string;          // ISO: YYYY-MM-DD
  total_amount:    string;          // numeric from pg → string
  paid_amount:     string;
  balance_amount:  string;
  payment_status?: string;          // SALE only
  refund_type?:    string;          // RETURN only
  original_sale_id?: string;        // RETURN only
  row_category:    "sale" | "return";
}

export interface PaymentRow {
  payment_id:       string;
  payment_date:     string;         // ISO: YYYY-MM-DD
  invoice_id:       string;
  transaction_type: string;         // e.g. "upi" | "cash" | "Payment Received"
  amount:           string;         // numeric from pg → string
  status:           string;
}

export interface LedgerSummary {
  gross_total:     number;
  total_paid:      number;
  total_balance:   number;
  total_returns:   number;
  net_outstanding: number;
}

export interface LedgerPagination {
  page:        number;
  limit:       number;
  total_rows:  number;
  total_pages: number;
}

export interface CustomerLedgerData {
  customer:          LedgerCustomer;
  sales_and_returns: SalesReturnRow[];
  summary:           LedgerSummary;
  payment_history: {
    data:       PaymentRow[];
    pagination: LedgerPagination;
  };
}

export interface CustomerLedgerResponse {
  success: boolean;
  data:    CustomerLedgerData;
}

// ─── Query keys ───────────────────────────────────────────────
export const customerQueryKeys = {
  all:    ["customers"]                         as const,
  list:   (zodu_id: string, branch_id: string) =>
            ["customers", zodu_id, branch_id]  as const,
  detail: (cust_uuid: string)                  =>
            ["customer", cust_uuid]             as const,
};

// ─── API call ─────────────────────────────────────────────────
async function postAddCustomer(payload: AddCustomerPayload): Promise<AddCustomerResponse> {
  const { data } = await axios.post<AddCustomerResponse>(
    `${API_BASE}/retail/api/customers`,
    payload
  );
  return data;
}

// ─── Update Customer API call ─────────────────────────────────
interface UpdateCustomerPayload extends AddCustomerPayload {
  cust_uuid: string;
}

async function putUpdateCustomer(payload: UpdateCustomerPayload): Promise<AddCustomerResponse> {
  const { cust_uuid, ...updatePayload } = payload;
  const { data } = await axios.put<AddCustomerResponse>(
    `${API_BASE}/retail/api/customers/${cust_uuid}`,
    updatePayload
  );
  return data;
}

// ─── Hook ─────────────────────────────────────────────────────
export function useAddCustomer(options?: {
  onSuccess?: (customer: AddCustomerResponse["customer"]) => void;
  onError?:   (message: string) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postAddCustomer,

    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: customerQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["customers-infinite"] });
      options?.onSuccess?.(response.customer);
    },

    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? err.message
        : "Failed to save customer";
      options?.onError?.(msg);
    },
  });
}

// ─── Update Customer Hook ────────────────────────────────────
export function useUpdateCustomer(options?: {
  onSuccess?: (customer: AddCustomerResponse["customer"]) => void;
  onError?:   (message: string) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: putUpdateCustomer,

    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: customerQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["customers-infinite"] });
      if (response.customer?.cust_uuid) {
        queryClient.invalidateQueries({ queryKey: customerQueryKeys.detail(response.customer.cust_uuid) });
      }
      options?.onSuccess?.(response.customer);
    },

    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? err.message
        : "Failed to update customer";
      options?.onError?.(msg);
    },
  });
}


async function getCustomers(): Promise<Record<string, unknown>[]> {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await axios.get(
    `${API_BASE}/retail/api/customers`,
    {
      params: {
        zodu_id: zoduId,
        branch_id: branchId,
      },
    }
  );

  console.log("CUSTOMER API RESPONSE:", data);

  if (data?.success) {
    return data.customers || [];
  }

  return [];
}

export function useCustomers() {
  const { zoduId, branchId } = useTenantContext();
  return useQuery({
    queryKey: customerQueryKeys.list(zoduId, branchId),
    queryFn: getCustomers,
  });
}

export interface CustomerPage {
  customers: Record<string, unknown>[];
  page:        number;
  total_pages: number;
  total:       number;
}

async function getCustomersPage(page: number, search: string): Promise<CustomerPage> {
  const { zoduId, branchId } = getTenantContext();
  const params: Record<string, string> = {
    zodu_id:   zoduId,
    branch_id: branchId,
    page:      String(page),
    limit:     "50",
  };
  if (search) params.search = search;

  const { data } = await axios.get(`${API_BASE}/retail/api/customers`, { params });

  if (data?.success) {
    return {
      customers:   data.customers   ?? [],
      page:        data.page        ?? page,
      total_pages: data.total_pages ?? 1,
      total:       data.total       ?? (data.customers?.length ?? 0),
    };
  }
  return { customers: [], page, total_pages: 1, total: 0 };
}

export function useInfiniteCustomers(search: string) {
  return useInfiniteQuery({
    queryKey:         ["customers-infinite", search],
    queryFn:          ({ pageParam = 1 }) => getCustomersPage(pageParam as number, search),
    initialPageParam: 1,
    getNextPageParam: (last) => last.page < last.total_pages ? last.page + 1 : undefined,
  });
}

// ─── Payload builder — now accepts separate custName + cpyName ─
export function buildCustomerPayload(form: {
  custName:     string;   // ✅ person name  → cust_name
  cpyName:      string;   // ✅ company name → cpy_name
  mobile:       string;
  email:        string;
  gstin:        string;
  addressLine1: string;
  addressLine2: string;
  city:         string;
  pincode:      string;
  state:        string;
  shipSameAsBilling?: boolean;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingCity?:         string;
  shippingPincode?:      string;
  shippingState?:        string;
}): AddCustomerPayload {
  const { zoduId, branchId } = getTenantContext();
  const sameAsBilling = form.shipSameAsBilling ?? true;

  // Shipping address — when "same as billing" is on, mirror the billing address;
  // otherwise use the independently entered shipping fields. Whichever parts
  // are present get joined into a single comma-separated string.
  const shipParts = sameAsBilling
    ? [form.addressLine1, form.addressLine2, form.city, form.state, form.pincode]
    : [form.shippingAddressLine1, form.shippingAddressLine2, form.shippingCity, form.shippingState, form.shippingPincode];
  const shippingAddress = shipParts.map(p => p?.trim()).filter(Boolean).join(", ") || null;

  return {
    zodu_id:   zoduId,
    branch_id: branchId,

    cust_name:  form.custName.trim() || null,
    cpy_name:   form.cpyName.trim()  || null,

    mobile_no:  form.mobile.trim() ? [form.mobile.trim()] : [],
    email_id:   form.email.trim()  ? [form.email.trim()]  : [],

    gst:           form.gstin.trim()        || null,
    address_line1: form.addressLine1.trim() || null,
    address_line2: form.addressLine2.trim() || null,
    city:          form.city.trim()         || null,
    state:         form.state               || null,
    pincode:       form.pincode.trim()      || null,

    shipping_address: shippingAddress,
    same_as_billing_address: sameAsBilling,
  };
}

// ─── Build update customer payload with cust_uuid ─
export function buildUpdateCustomerPayload(
  form: {
    custName:     string;
    cpyName:      string;
    mobile:       string;
    email:        string;
    gstin:        string;
    addressLine1: string;
    addressLine2: string;
    city:         string;
    pincode:      string;
    state:        string;
    shipSameAsBilling?: boolean;
    shippingAddressLine1?: string;
    shippingAddressLine2?: string;
    shippingCity?:         string;
    shippingPincode?:      string;
    shippingState?:        string;
  },
  cust_uuid: string
): UpdateCustomerPayload {
  return {
    ...buildCustomerPayload(form),
    cust_uuid,
  };
}




// ─── Query key factory ────────────────────────────────────────
export const ledgerQueryKeys = {
  all: ["customer-ledger"] as const,
  detail: (custUuid: string, filters: LedgerFilters) =>
    ["customer-ledger", custUuid, filters] as const,
};

// ─── API call ─────────────────────────────────────────────────
async function fetchCustomerLedger(
  custUuid: string,
  filters:  LedgerFilters
): Promise<CustomerLedgerData> {
  const token = getAccessToken();
  const { zoduId, branchId } = getTenantContext();
console.log(custUuid,filters)
  const { data } = await axios.get<CustomerLedgerResponse>(
    `${API_BASE}/retail/api/customers/${custUuid}/ledger`,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      params: {
        zodu_id:   zoduId,
        branch_id: branchId,
        fromDate:  filters.fromDate  || undefined,
        toDate:    filters.toDate    || undefined,
        method:    filters.method && filters.method !== "all"
                     ? filters.method
                     : undefined,
        page:      filters.page  ?? 1,
        limit:     filters.limit ?? 50,
      },
    }
  );

  if (!data.success) throw new Error("Ledger fetch returned success: false");
  return data.data;
}

// ─── Hook ─────────────────────────────────────────────────────
export function useCustomerLedger(
  custUuid: string | null | undefined,
  filters:  LedgerFilters = {}
) {
  return useQuery({
    queryKey: ledgerQueryKeys.detail(custUuid ?? "", filters),
    queryFn:  () => fetchCustomerLedger(custUuid!, filters),
    enabled:  !!custUuid,
    staleTime: 30_000,          // 30 s — ledger data is semi-static in a session
    gcTime:    5 * 60 * 1000,   // 5 min cache
    retry: (failureCount, error) => {
      // Don't retry on 404 / 400
      if (axios.isAxiosError(error) && (error.response?.status ?? 0) < 500) return false;
      return failureCount < 2;
    },
  });
}

// ─── Data-mapping helpers (API → component types) ─────────────

/** Format an ISO date (YYYY-MM-DD) → "MM/DD/YYYY" for display */
export function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  return `${m}/${d}/${y}`;
}

/** Parse a pg numeric string to JS number safely */
export function toNum(value: string | number | null | undefined): number {
  return parseFloat(String(value ?? "0")) || 0;
}

/** Format currency the same way the original component does */
export function formatCurrency(amount: number): string {
  const abs = Math.abs(amount);
  return amount < 0 ? `(${abs.toFixed(2)})` : abs.toFixed(2);
}

// ─── Outstanding Bills ─────────────────────────────────────────
export interface OutstandingBill {
  sale_id:        string;
  sale_uuid:      string;
  invoice_date:   string;
  due_date:       string | null;
  total_amount:   number | string;
  paid_amount:    number | string;
  balance_amount: number | string;
  payment_status: string;
}

export interface OutstandingBillsData {
  bills:            OutstandingBill[];
  total_outstanding: number;
}

async function getOutstandingBills(custUuid: string): Promise<OutstandingBillsData> {
  const token = getAccessToken();
  const { zoduId, branchId } = getTenantContext();

  const { data } = await axios.get(
    `${API_BASE}/retail/api/customers/${custUuid}/outstanding-bills`,
    {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      params: { zodu_id: zoduId, branch_id: branchId },
    }
  );

  if (!data?.success) throw new Error("Failed to fetch outstanding bills");
  return data.data;
}

export function useOutstandingBills(custUuid: string | null | undefined) {
  return useQuery({
    queryKey: ["outstanding-bills", custUuid],
    queryFn:  () => getOutstandingBills(custUuid!),
    enabled:  !!custUuid,
  });
}

// ─── Mark Payment ──────────────────────────────────────────────
export interface MarkPaymentPayload {
  custUuid:     string;
  paymentDate:  string;
  paymentMode:  string;
  referenceNo?: string;
  totalPayment: number;
  bills:        { sale_id: string }[];
  attachments?: File[];
}

export interface MarkPaymentResponse {
  success: boolean;
  message: string;
  data: {
    group_id:           string;
    unallocated_amount: number;
    bills:   Array<Record<string, unknown>>;
    payments: Array<Record<string, unknown>>;
  };
}

async function postMarkPayment(payload: MarkPaymentPayload): Promise<MarkPaymentResponse> {
  const token = getAccessToken();
  const { zoduId, branchId } = getTenantContext();

  const formData = new FormData();
  formData.append("payment_date", payload.paymentDate);
  formData.append("payment_mode", payload.paymentMode);
  if (payload.referenceNo) formData.append("reference_no", payload.referenceNo);
  formData.append("total_payment", String(payload.totalPayment));
  formData.append("bills", JSON.stringify(payload.bills));
  formData.append("zodu_id", zoduId);
  formData.append("branch_id", branchId);
  (payload.attachments ?? []).forEach((file) => formData.append("attachments", file));

  const { data } = await axios.post<MarkPaymentResponse>(
    `${API_BASE}/retail/api/customers/${payload.custUuid}/mark-payment`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  return data;
}

export function useMarkPayment(options?: {
  onSuccess?: (response: MarkPaymentResponse) => void;
  onError?:   (message: string) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postMarkPayment,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: customerQueryKeys.all });
      // Invalidate outstanding bills and the customers-infinite list so
      // the UI (customer list) shows updated outstanding amounts.
      queryClient.invalidateQueries({ queryKey: ["outstanding-bills"] });
      queryClient.invalidateQueries({ queryKey: ["customers-infinite"] });
      options?.onSuccess?.(response);
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string; errors?: string[] } | undefined)?.message
          ?? (err.response?.data as { errors?: string[] } | undefined)?.errors?.join(", ")
          ?? err.message
        : "Failed to record payment";
      options?.onError?.(msg);
    },
  });
}
