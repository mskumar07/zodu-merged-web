import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTenantContext, getAccessToken } from "@store/tenantContext";
import { authApis } from "@pages/auth/Authapi";

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

// ─── Company logo ─────────────────────────────────────────────

/**
 * The current company's logo, for the invoice previews. It lives on the
 * company record (Company Details), not on invoice settings, and only
 * GET /my-companies carries it. Shares the Company Details query key, so a
 * logo saved there shows up here without a reload.
 */
export function useCompanyLogoUrl(): string {
  const { data: companies } = useQuery({
    queryKey: ["settings", "companies"],
    queryFn: authApis.getMyCompanies,
  });
  const { zoduId } = getTenantContext();
  return companies?.find((c) => c.zodu_id === zoduId)?.company_logo_url ?? "";
}

// ─── Types ────────────────────────────────────────────────────

// The only values the server accepts for `payment_types`. Matching is
// case-insensitive server-side, but it stores (and returns) these exact labels —
// there are no slug forms, so "upi_cash"/"others"-style codes are rejected.
export const PAYMENT_TYPE_LABELS = [
  "Cash",
  "UPI",
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

// Invoice, quotation and proforma each keep their own settings row. Quotation
// and proforma exist for Retail companies only. Invoice is the default and is
// sent with no `document_type` at all, so existing callers are unchanged.
export type InvoiceDocumentType = "invoice" | "quotation" | "proforma";

export interface InvoiceSettingsResponse {
  id: number;
  document_type?: InvoiceDocumentType;
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
  // Quotation / proforma terms: with the toggle on, that document type prints
  // its own text instead of the general terms. Absent on older rows.
  show_quotation_terms?: boolean;
  quotation_terms?: string | null;
  show_proforma_terms?: boolean;
  proforma_terms?: string | null;
  show_notes: boolean;
  notes: string;
  show_signature: boolean;
  show_bank_details: boolean;
  // Faded image printed behind the invoice body; falls back to the company
  // logo when no watermark image is uploaded. Absent on rows that predate it.
  show_watermark?: boolean;
  watermark_url?: string | null;
  // Printed on the left, opposite the authorised signature; an empty
  // signing line when no image is uploaded. Absent on rows that predate it.
  show_receiver_signature?: boolean;
  receiver_signature_url?: string | null;
  // Payment types offered at POS checkout, as canonical labels ("Cash" | "UPI" | "Cheque" |
  // "Bank Transfer" | "Others") — the column is a TEXT[] with a matching CHECK constraint,
  // so this is an array of labels, never a comma-separated string of codes.
  payment_types: PaymentTypeLabel[];
  // Which copy markings the user can download/print — a subset of
  // INVOICE_COPY_TYPE_LABELS. Absent on rows that predate this field; treat a
  // missing or empty value as ["Original"].
  invoice_copy_types?: InvoiceCopyTypeLabel[];
  // Which invoice layout to render — "classic" (default), "classic2" (Classic without HSN/tax breakdowns), "modern" or "modern2" on A4.
  // Thermal receipts read it too: "modern"/"modern2" print the Modern receipt, anything else Classic.
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
    | "document_type"
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
    | "show_quotation_terms"
    | "quotation_terms"
    | "show_proforma_terms"
    | "proforma_terms"
    | "show_notes"
    | "notes"
    | "show_signature"
    | "show_bank_details"
    | "show_watermark"
    | "show_receiver_signature"
    | "payment_types"
    | "invoice_copy_types"
    | "invoice_template"
    | "stock_check_enabled"
    | "customer_mandatory"
  >
>;

// ─── Query keys ───────────────────────────────────────────────

export const invoiceSettingsQueryKeys = {
  // The invoice key is unchanged so every existing reader/writer of it keeps
  // working; quotation and proforma get their own cache entries.
  detail: (zoduId: string, branchId: string, documentType: InvoiceDocumentType = "invoice") =>
    documentType === "invoice"
      ? (["invoice-settings", zoduId, branchId] as const)
      : (["invoice-settings", zoduId, branchId, documentType] as const),
};

// Query string selecting the document type on the read and image routes.
function documentTypeParams(documentType: InvoiceDocumentType) {
  return documentType === "invoice" ? undefined : { document_type: documentType };
}

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
  return resolveFileUrl(raw);
}

// A stored image value → a usable <img src>: full URLs pass through, a bare
// filename is resolved against the GET /auth/file/:name route.
function resolveFileUrl(raw: unknown): string | null {
  if (!raw || typeof raw !== "string") return null;
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
    watermark_url: resolveFileUrl(raw.watermark_url),
    receiver_signature_url: resolveFileUrl(raw.receiver_signature_url),
  };
}

// The signature / watermark / receiver-signature endpoints answer
// `{ data: { message, settings } }` — and older deploys answer a failed upload
// with a 200 `{ data: { error } }`. Throw on that (so the mutation's onError
// fires) instead of caching `{ error }` as if it were the settings row, which
// crashed the settings screen on the missing fields.
function settingsFromImageResponse(data: any): InvoiceSettingsResponse {
  const error = data?.error ?? data?.data?.error;
  if (error) throw new Error(String(error));
  const settings = data?.settings ?? data?.data?.settings;
  if (!settings || typeof settings !== "object") {
    throw new Error("Unexpected response from the server");
  }
  return normalizeSettings(settings);
}

// ─── Fetch invoice settings ───────────────────────────────────

export async function fetchInvoiceSettings(
  zoduId: string,
  branchId: string,
  documentType: InvoiceDocumentType = "invoice"
): Promise<InvoiceSettingsResponse> {
  const { data } = await getApi().get(`/invoice-settings/${zoduId}/${branchId}`, {
    params: documentTypeParams(documentType),
  });
  return normalizeSettings(data.settings ?? data.data?.settings);
}

export function useInvoiceSettings(enabled = true, documentType: InvoiceDocumentType = "invoice") {
  const { zoduId, branchId } = getTenantContext();
  return useQuery({
    queryKey: invoiceSettingsQueryKeys.detail(zoduId ?? "", branchId ?? "", documentType),
    queryFn: () => fetchInvoiceSettings(zoduId!, branchId!, documentType),
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
    onSuccess: (settings, payload) => {
      queryClient.setQueryData(
        invoiceSettingsQueryKeys.detail(zoduId ?? "", branchId ?? "", payload.document_type ?? "invoice"),
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
       err.response?.data?.data?.error ??
       err.response?.data?.message ??
       err.message
    : err instanceof Error && err.message ? err.message : fallback;
}

// ─── Signature upload / delete ─────────────────────────────────

async function uploadInvoiceSignature(
  file: File,
  documentType: InvoiceDocumentType
): Promise<InvoiceSettingsResponse> {
  const { zoduId, branchId } = getTenantContext();
  const formData = new FormData();
  formData.append("signature", file);
  const { data } = await getApi().post(
    `/invoice-settings/${zoduId}/${branchId}/signature`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" }, params: documentTypeParams(documentType) }
  );
  return settingsFromImageResponse(data);
}

export function useUploadInvoiceSignature(options?: {
  onSuccess?: (settings: InvoiceSettingsResponse) => void;
  onError?: (msg: string) => void;
  documentType?: InvoiceDocumentType;
}) {
  const documentType = options?.documentType ?? "invoice";
  const queryClient = useQueryClient();
  const { zoduId, branchId } = getTenantContext();

  return useMutation({
    mutationFn: (file: File) => uploadInvoiceSignature(file, documentType),
    onSuccess: (settings) => {
      queryClient.setQueryData(
        invoiceSettingsQueryKeys.detail(zoduId ?? "", branchId ?? "", documentType),
        settings
      );
      options?.onSuccess?.(settings);
    },
    onError: (err: unknown) => {
      options?.onError?.(extractErrorMessage(err, "Failed to upload signature"));
    },
  });
}

async function deleteInvoiceSignature(documentType: InvoiceDocumentType): Promise<InvoiceSettingsResponse> {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await getApi().delete(
    `/invoice-settings/${zoduId}/${branchId}/signature`,
    { params: documentTypeParams(documentType) }
  );
  return settingsFromImageResponse(data);
}

export function useDeleteInvoiceSignature(options?: {
  onSuccess?: (settings: InvoiceSettingsResponse) => void;
  onError?: (msg: string) => void;
  documentType?: InvoiceDocumentType;
}) {
  const documentType = options?.documentType ?? "invoice";
  const queryClient = useQueryClient();
  const { zoduId, branchId } = getTenantContext();

  return useMutation({
    mutationFn: () => deleteInvoiceSignature(documentType),
    onSuccess: (settings) => {
      queryClient.setQueryData(
        invoiceSettingsQueryKeys.detail(zoduId ?? "", branchId ?? "", documentType),
        settings
      );
      options?.onSuccess?.(settings);
    },
    onError: (err: unknown) => {
      options?.onError?.(extractErrorMessage(err, "Failed to remove signature"));
    },
  });
}

// ─── Watermark / receiver signature upload & delete ────────────
// Same contract as the signature endpoints above, one route per image.

export type InvoiceImageKind = "watermark" | "receiver_signature";

const INVOICE_IMAGE_ENDPOINT: Record<InvoiceImageKind, { path: string; field: string; label: string }> = {
  watermark:          { path: "watermark",          field: "watermark",          label: "watermark" },
  receiver_signature: { path: "receiver-signature", field: "receiver_signature", label: "receiver signature" },
};

export function useUploadInvoiceImage(
  kind: InvoiceImageKind,
  options?: { onSuccess?: (settings: InvoiceSettingsResponse) => void; onError?: (msg: string) => void; documentType?: InvoiceDocumentType }
) {
  const queryClient = useQueryClient();
  const { zoduId, branchId } = getTenantContext();
  const documentType = options?.documentType ?? "invoice";
  const { path, field, label } = INVOICE_IMAGE_ENDPOINT[kind];

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append(field, file);
      const { data } = await getApi().post(
        `/invoice-settings/${zoduId}/${branchId}/${path}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" }, params: documentTypeParams(documentType) }
      );
      return settingsFromImageResponse(data);
    },
    onSuccess: (settings) => {
      queryClient.setQueryData(invoiceSettingsQueryKeys.detail(zoduId ?? "", branchId ?? "", documentType), settings);
      options?.onSuccess?.(settings);
    },
    onError: (err: unknown) => {
      options?.onError?.(extractErrorMessage(err, `Failed to upload ${label}`));
    },
  });
}

export function useDeleteInvoiceImage(
  kind: InvoiceImageKind,
  options?: { onSuccess?: (settings: InvoiceSettingsResponse) => void; onError?: (msg: string) => void; documentType?: InvoiceDocumentType }
) {
  const queryClient = useQueryClient();
  const { zoduId, branchId } = getTenantContext();
  const documentType = options?.documentType ?? "invoice";
  const { path, label } = INVOICE_IMAGE_ENDPOINT[kind];

  return useMutation({
    mutationFn: async () => {
      const { data } = await getApi().delete(`/invoice-settings/${zoduId}/${branchId}/${path}`, {
        params: documentTypeParams(documentType),
      });
      return settingsFromImageResponse(data);
    },
    onSuccess: (settings) => {
      queryClient.setQueryData(invoiceSettingsQueryKeys.detail(zoduId ?? "", branchId ?? "", documentType), settings);
      options?.onSuccess?.(settings);
    },
    onError: (err: unknown) => {
      options?.onError?.(extractErrorMessage(err, `Failed to remove ${label}`));
    },
  });
}
