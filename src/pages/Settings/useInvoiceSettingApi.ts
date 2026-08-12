import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTenantContext, getAccessToken } from "@store/tenantContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5001";

function getApi() {
  const token = getAccessToken();
  return axios.create({
    baseURL: `${API_BASE}/auth/api`,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

// ─── Types ────────────────────────────────────────────────────

export interface InvoiceSettingsResponse {
  id: number;
  zodu_id: string;
  branch_id: string;
  invoice_prefix: string;
  invoice_digit_count: number;
  invoice_start_number: number;
  default_tax_label: string;
  invoice_due_days: number;
  default_payment_method: string;
  printer_inch: string;
  show_company_logo: boolean;
  print_thank_you_message: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type UpdateInvoiceSettingsPayload = Partial<
  Pick<
    InvoiceSettingsResponse,
    | "invoice_prefix"
    | "invoice_digit_count"
    | "invoice_start_number"
    | "default_tax_label"
    | "invoice_due_days"
    | "default_payment_method"
    | "printer_inch"
    | "show_company_logo"
    | "print_thank_you_message"
  >
>;

// ─── Query keys ───────────────────────────────────────────────

export const invoiceSettingsQueryKeys = {
  detail: (zoduId: string, branchId: string) =>
    ["invoice-settings", zoduId, branchId] as const,
};

// ─── Fetch invoice settings ───────────────────────────────────

async function fetchInvoiceSettings(
  zoduId: string,
  branchId: string
): Promise<InvoiceSettingsResponse> {
  const { data } = await getApi().get(`/invoice-settings/${zoduId}/${branchId}`);
  return data.settings ?? data.data?.settings;
}

export function useInvoiceSettings(enabled = true) {
  const { zoduId, branchId } = getTenantContext();
  return useQuery({
    queryKey: invoiceSettingsQueryKeys.detail(zoduId ?? "", branchId ?? ""),
    queryFn: () => fetchInvoiceSettings(zoduId!, branchId!),
    enabled: enabled && !!zoduId && !!branchId,
    staleTime: 30_000,
  });
}

// ─── Update invoice settings ──────────────────────────────────

async function updateInvoiceSettings(
  payload: UpdateInvoiceSettingsPayload
): Promise<InvoiceSettingsResponse> {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await getApi().put(
    `/invoice-settings/${zoduId}/${branchId}`,
    payload
  );
  return data.settings ?? data.data?.settings;
}

export function useUpdateInvoiceSettings(options?: {
  onSuccess?: (settings: InvoiceSettingsResponse) => void;
  onError?: (msg: string) => void;
}) {
  const queryClient = useQueryClient();
  const { zoduId, branchId } = getTenantContext();

  return useMutation({
    mutationFn: updateInvoiceSettings,
    onSuccess: (settings) => {
      queryClient.setQueryData(
        invoiceSettingsQueryKeys.detail(zoduId ?? "", branchId ?? ""),
        settings
      );
      options?.onSuccess?.(settings);
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.errors?.[0]?.message ??
           err.response?.data?.error ??
           err.response?.data?.message ??
           err.message)
        : "Failed to update invoice settings";
      options?.onError?.(msg);
    },
  });
}
