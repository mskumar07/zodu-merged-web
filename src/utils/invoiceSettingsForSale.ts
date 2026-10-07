import type { InvoiceSettings } from "@pages/auth/Authapi";
import { isProformaSaleType, isQuotationSaleType } from "./saleType";

/**
 * Quotation and proforma each keep their own settings row beside the invoice
 * one. `null` means that row isn't loaded (or this is a company that has none).
 */
export interface DocumentSettings {
  quotation: InvoiceSettings | null;
  proforma: InvoiceSettings | null;
}

export const EMPTY_DOCUMENT_SETTINGS: DocumentSettings = { quotation: null, proforma: null };

/**
 * The settings a document of this `sale_type` prints with: its own row when it
 * has one, otherwise the invoice row — so a branch whose quotation or proforma
 * row isn't available prints exactly as it did before they were split.
 */
export function pickInvoiceSettingsForSale(
  invoice: InvoiceSettings | null,
  documents: DocumentSettings,
  saleType: unknown,
): InvoiceSettings | null {
  if (isQuotationSaleType(saleType)) return documents.quotation ?? invoice;
  if (isProformaSaleType(saleType)) return documents.proforma ?? invoice;
  return invoice;
}
