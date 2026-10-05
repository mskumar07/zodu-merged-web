import { isProformaSaleType, isQuotationSaleType } from "./saleType";

interface TermsSettings {
  show_terms_conditions?: boolean | null;
  terms_conditions?: string | null;
  show_quotation_terms?: boolean | null;
  quotation_terms?: string | null;
  show_proforma_terms?: boolean | null;
  proforma_terms?: string | null;
}

/**
 * The terms & conditions to print on a document, or "" for none.
 *
 * Quotations and proformas can carry their own terms: with that type's toggle
 * on, its own text is printed instead of the general terms. With the toggle
 * off (or for an ordinary invoice) the general terms apply, as before.
 */
export function resolveTermsForSaleType(
  settings: TermsSettings | null | undefined,
  saleType: unknown,
): string {
  if (!settings) return "";
  if (isQuotationSaleType(saleType) && settings.show_quotation_terms) {
    return (settings.quotation_terms ?? "").trim();
  }
  if (isProformaSaleType(saleType) && settings.show_proforma_terms) {
    return (settings.proforma_terms ?? "").trim();
  }
  return settings.show_terms_conditions ? (settings.terms_conditions ?? "").trim() : "";
}
