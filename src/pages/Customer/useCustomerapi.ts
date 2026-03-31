/**
 * useCustomerApi.ts
 * TanStack Query hooks for the Customer API.
 */

import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API_BASE  = import.meta.env.VITE_API_BASE_URL ?? "https://api.myzodu.com";
const ZODU_ID   = import.meta.env.VITE_ZODU_ID      ?? "ZODU035";
const BRANCH_ID = import.meta.env.VITE_BRANCH_ID    ?? "ZODU035B1";

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
  const { data } = await axios.get(
    `${API_BASE}/restaurant/api/customers`,
    {
      params: {
        zodu_id: ZODU_ID,
        branch_id: BRANCH_ID,
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
  return useQuery({
    queryKey: customerQueryKeys.list(ZODU_ID, BRANCH_ID),
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
  return {
    zodu_id:   ZODU_ID,
    branch_id: BRANCH_ID,

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