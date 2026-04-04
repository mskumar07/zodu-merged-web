/**
 * useCustomerApi.ts
 * TanStack Query hooks for the Customer API.
 */

import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTenantContext, getAccessToken } from "@store/tenantContext";

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
    `${API_BASE}/restaurant/api/customers`,
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
    `${API_BASE}/restaurant/api/customers/${cust_uuid}`,
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
    `${API_BASE}/restaurant/api/customers`,
    {
      params: {
        zodu_id: zoduId,
        branch_id: branchId,
      },
    }
  );

  console.log("CUSTOMER API RESPONSE:", data);

  // ✅ FIX: YOUR BACKEND RETURNS customers FIELD
  if (data?.success) {
    return data.customers || [];
  }

  return [];
}

export function useCustomers() {
  const { zoduId, branchId } = getTenantContext();
  return useQuery({
    queryKey: customerQueryKeys.list(zoduId, branchId),
    queryFn: getCustomers,
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
}): AddCustomerPayload {
  const { zoduId, branchId } = getTenantContext();
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
    `${API_BASE}/restaurant/api/customers/${custUuid}/ledger`,
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
