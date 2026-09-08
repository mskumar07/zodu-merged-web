import { INVOICE_COPY_TYPE_LABELS, type InvoiceCopyTypeLabel } from "@pages/Settings/useInvoiceSettingApi";

/**
 * The copy markings to offer for download/print, read from the persisted
 * `invoice_copy_types` setting.
 *
 * Unknown labels are dropped, and the result is always ordered Original →
 * Duplicate → Transport regardless of the stored order. An absent or empty
 * value (rows predating the setting) falls back to ["Original"] — the direct
 * Download/Print click always needs a first copy to print.
 */
export function normalizeInvoiceCopyTypes(raw: unknown): InvoiceCopyTypeLabel[] {
  const list = Array.isArray(raw) ? raw : [];
  const picked = INVOICE_COPY_TYPE_LABELS.filter((label) => list.includes(label));
  return picked.length > 0 ? [...picked] : ["Original"];
}
