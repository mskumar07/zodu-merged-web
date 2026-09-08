/**
 * Quotations and sales are the same record with a different `sale_type`, and
 * they print through the same templates — only the document title and number
 * label differ. "quotation" is what the API stores; older records use the
 * short "q" form.
 */
export function isQuotationSaleType(saleType: unknown): boolean {
  return typeof saleType === "string" && ["quotation", "q"].includes(saleType.trim().toLowerCase());
}

/** Proformas are stored as "proforma"; some records use the short "p" form. */
export function isProformaSaleType(saleType: unknown): boolean {
  return typeof saleType === "string" && ["proforma", "p"].includes(saleType.trim().toLowerCase());
}

/**
 * Quotations and proformas are both non-binding documents: neither carries a
 * payment, a balance or a due date, so the screens that show those hide them
 * for either type.
 */
export function isNonBindingSaleType(saleType: unknown): boolean {
  return isQuotationSaleType(saleType) || isProformaSaleType(saleType);
}

/** The three document types a sale can be printed as, keyed off `sale_type`. */
export type SaleDocumentLabel = "Invoice" | "Quotation" | "Proforma";

/**
 * What to call this document on a printed copy. Anything that isn't a
 * quotation or a proforma is an ordinary sale, which prints as an invoice —
 * the orders API stores that as "retail".
 */
export function saleDocumentLabel(saleType: unknown): SaleDocumentLabel {
  if (isQuotationSaleType(saleType)) return "Quotation";
  return isProformaSaleType(saleType) ? "Proforma" : "Invoice";
}
