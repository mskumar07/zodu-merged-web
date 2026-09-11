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

// The only values the server accepts for `payment_types`. Matching is
// case-insensitive server-side, but it stores (and returns) these exact labels —
// there are no slug forms, so "upi_cash"/"others"-style codes are rejected.
export const PAYMENT_TYPE_LABELS = [
  "Cash",
  "UPI",
  "UPI + Cash",
  "Cheque",
  "Bank Transfer",
  "Others",
] as const;
export type PaymentTypeLabel = (typeof PAYMENT_TYPE_LABELS)[number];

// The copy markings an invoice can be printed as. A GST invoice is issued in
// multiple copies — the recipient's, the transporter's and the supplier's — and
// each carries the same content under a different heading. These are the exact
// labels stored in and returned by `invoice_copy_types`.
export const INVOICE_COPY_TYPE_LABELS = ["Original", "Duplicate", "Transport"] as const;
export type InvoiceCopyTypeLabel = (typeof INVOICE_COPY_TYPE_LABELS)[number];

export interface InvoiceSettingsResponse {
  id: number;
  zodu_id: string;
  branch_id: string;
  invoice_prefix: string;
  // Whether the prefix is actually applied. Absent on rows that predate the
  // toggle — treat a missing value as "on when the text is non-empty", which
  // is how numbering behaved before it existed. The invoice *suffix* and its
  // toggle are not here: they live on the POS settings row alongside the
  // quotation and proforma affixes.
  invoice_prefix_enabled?: boolean;
  invoice_start_number: number;
  default_tax_label: string;
  invoice_due_days: number;
  default_payment_method: string;
  printer_inch: string;
  // Server normalizes to uppercase (e.g. "#2e7d32" → "#2E7D32") — compare
  // case-insensitively. May be null/absent on rows that predate this field.
  invoice_theme_color?: string | null;
  show_company_logo: boolean;
  print_thank_you_message: boolean;
  show_description: boolean;
  show_item_id: boolean;
  show_serial_no: boolean;
  show_customer_details: boolean;
  // Whether the Ship To block is printed. Absent on rows that predate this
  // field — treat a missing value as true, which is how invoices behaved
  // before the toggle existed.
  show_shipping_address?: boolean;
  show_tax_details: boolean;
  show_payment_details: boolean;
  show_terms_conditions: boolean;
  terms_conditions: string;
  show_notes: boolean;
  notes: string;
  show_signature: boolean;
  show_bank_details: boolean;
  // Payment types offered at POS checkout, as canonical labels — the server validates
  // against exactly these six ("Cash" | "UPI" | "UPI + Cash" | "Cheque" | "Bank Transfer" |
  // "Others") and the column is a TEXT[] with a matching CHECK constraint, so this is an
  // array of labels, never a comma-separated string of codes.
  payment_types: PaymentTypeLabel[];
  // Which copy markings the user can download/print — a subset of
  // INVOICE_COPY_TYPE_LABELS. Absent on rows that predate this field; treat a
  // missing or empty value as ["Original"].
  invoice_copy_types?: InvoiceCopyTypeLabel[];
  // Which A4 invoice layout to render — "classic" (default) or "modern".
  // Irrelevant for thermal receipts, which only ever use the one layout.
  invoice_template: string;
  // POS settings — "Additional Settings". Absent on rows that predate this field.
  stock_check_enabled?: boolean;
  customer_mandatory?: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
  // Normalized client-side (see normalizeSettings) from whatever field/shape
  // the signature endpoints return into a directly-usable <img src> URL.
  signature_url?: string | null;
}

export type UpdateInvoiceSettingsPayload = Partial<
  Pick<
    InvoiceSettingsResponse,
    | "invoice_prefix"
    | "invoice_prefix_enabled"
    | "invoice_start_number"
    | "default_tax_label"
    | "invoice_due_days"
    | "default_payment_method"
    | "printer_inch"
    | "invoice_theme_color"
    | "show_company_logo"
    | "print_thank_you_message"
    | "show_description"
    | "show_item_id"
    | "show_serial_no"
    | "show_customer_details"
    | "show_shipping_address"
    | "show_tax_details"
    | "show_payment_details"
    | "show_terms_conditions"
    | "terms_conditions"
    | "show_notes"
    | "notes"
    | "show_signature"
    | "show_bank_details"
    | "payment_types"
    | "invoice_copy_types"
    | "invoice_template"
    | "stock_check_enabled"
    | "customer_mandatory"
  >
>;

// ─── Query keys ───────────────────────────────────────────────

export const invoiceSettingsQueryKeys = {
  detail: (zoduId: string, branchId: string) =>
    ["invoice-settings", zoduId, branchId] as const,
};

// Signature files are served from GET /auth/file/:name. The signature
// endpoints' exact response shape isn't nailed down, so this checks a few
// likely field names and — if what comes back is a bare filename rather
// than a full URL — resolves it against that file route.
function resolveSignatureUrl(settings: Record<string, unknown> | null | undefined): string | null {
  if (!settings) return null;
  const raw =
    (settings.signature_url as string | undefined) ??
    (settings.signature_image as string | undefined) ??
    (settings.signature as string | undefined) ??
    null;
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  const name = raw.split("/").pop();
  return `${API_BASE}/auth/file/${name}`;
}

// Coerces whatever the server (or a stale cache) hands back into canonical labels.
// Accepts an array or a legacy comma-separated string, matches case-insensitively
// the way the server does, and drops anything that isn't one of the six labels.
export function toPaymentTypeLabels(raw: unknown): PaymentTypeLabel[] {
  const parts = Array.isArray(raw)
    ? raw
    : typeof raw === "string"
      ? raw.split(",")
      : [];
  const seen = new Set<PaymentTypeLabel>();
  parts.forEach((part) => {
    const key = String(part).trim().toLowerCase();
    const label = PAYMENT_TYPE_LABELS.find((l) => l.toLowerCase() === key);
    if (label) seen.add(label);
  });
  // Preserve the canonical display order rather than whatever order came back.
  return PAYMENT_TYPE_LABELS.filter((l) => seen.has(l));
}

function normalizeSettings(raw: Record<string, unknown>): InvoiceSettingsResponse {
  return {
    ...(raw as unknown as InvoiceSettingsResponse),
    payment_types: toPaymentTypeLabels(raw.payment_types),
    signature_url: resolveSignatureUrl(raw),
  };
}

// ─── Fetch invoice settings ───────────────────────────────────

async function fetchInvoiceSettings(
  zoduId: string,
  branchId: string
): Promise<InvoiceSettingsResponse> {
  const { data } = await getApi().get(`/invoice-settings/${zoduId}/${branchId}`);
  return normalizeSettings(data.settings ?? data.data?.settings);
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
  return normalizeSettings(data.settings ?? data.data?.settings);
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
      options?.onError?.(extractErrorMessage(err, "Failed to update invoice settings"));
    },
  });
}

function extractErrorMessage(err: unknown, fallback: string): string {
  return axios.isAxiosError(err)
    ? (typeof err.response?.data?.errors === "string" ? err.response.data.errors : undefined) ??
       err.response?.data?.error ??
       err.response?.data?.message ??
       err.message
    : fallback;
}

// ─── Signature upload / delete ─────────────────────────────────

async function uploadInvoiceSignature(file: File): Promise<InvoiceSettingsResponse> {
  const { zoduId, branchId } = getTenantContext();
  const formData = new FormData();
  formData.append("signature", file);
  const { data } = await getApi().post(
    `/invoice-settings/${zoduId}/${branchId}/signature`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return normalizeSettings(data.settings ?? data.data?.settings ?? data.data ?? data);
}

export function useUploadInvoiceSignature(options?: {
  onSuccess?: (settings: InvoiceSettingsResponse) => void;
  onError?: (msg: string) => void;
}) {
  const queryClient = useQueryClient();
  const { zoduId, branchId } = getTenantContext();

  return useMutation({
    mutationFn: uploadInvoiceSignature,
    onSuccess: (settings) => {
      queryClient.setQueryData(
        invoiceSettingsQueryKeys.detail(zoduId ?? "", branchId ?? ""),
        settings
      );
      options?.onSuccess?.(settings);
    },
    onError: (err: unknown) => {
      options?.onError?.(extractErrorMessage(err, "Failed to upload signature"));
    },
  });
}

async function deleteInvoiceSignature(): Promise<InvoiceSettingsResponse> {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await getApi().delete(
    `/invoice-settings/${zoduId}/${branchId}/signature`
  );
  return normalizeSettings(data.settings ?? data.data?.settings ?? data.data ?? data);
}

export function useDeleteInvoiceSignature(options?: {
  onSuccess?: (settings: InvoiceSettingsResponse) => void;
  onError?: (msg: string) => void;
}) {
  const queryClient = useQueryClient();
  const { zoduId, branchId } = getTenantContext();

  return useMutation({
    mutationFn: deleteInvoiceSignature,
    onSuccess: (settings) => {
      queryClient.setQueryData(
        invoiceSettingsQueryKeys.detail(zoduId ?? "", branchId ?? ""),
        settings
      );
      options?.onSuccess?.(settings);
    },
    onError: (err: unknown) => {
      options?.onError?.(extractErrorMessage(err, "Failed to remove signature"));
    },
  });
}
