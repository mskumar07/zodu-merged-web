import { INVOICE_COPY_TYPE_LABELS, type InvoiceCopyTypeLabel } from "@pages/Settings/useInvoiceSettingApi";
import { isQuotationSaleType } from "@utils/saleType";

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

/**
 * The copy markings to offer for one sale. A quotation is a price offer, not a
 * document that travels in copies, so it prints unmarked — an empty list means
 * "no copy marking". A proforma does get the full set: it goes to the buyer
 * and with the goods like an invoice does.
 */
export function invoiceCopyTypesForSale(raw: unknown, saleType: unknown): InvoiceCopyTypeLabel[] {
  return isQuotationSaleType(saleType) ? [] : normalizeInvoiceCopyTypes(raw);
}

/**
 * The marking to print on the copy being rendered. With only "Original"
 * configured there is a single copy and nothing to tell apart, so the invoice
 * prints unmarked; once another type is configured every copy carries its label.
 */
export function invoiceCopyMark(copyType: string | null | undefined, copyTypes: readonly string[]): string | null {
  if (!copyType) return null;
  return copyTypes.length === 1 && copyTypes[0] === "Original" ? null : copyType;
}
