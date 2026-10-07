import { useAppSelector } from "@store/store";
import { DocumentSettingsData, InvoiceSettingsData } from "@store/slices/userSlice";
import { pickInvoiceSettingsForSale } from "@utils/invoiceSettingsForSale";
import type { InvoiceSettings } from "@pages/auth/Authapi";

/**
 * The invoice settings for one document, chosen by its `sale_type`: an invoice
 * reads the invoice row, a quotation or proforma its own. Returns the stored
 * object itself (never a copy), so it is a stable dependency for memo hooks.
 */
export function useInvoiceSettingsForSale(saleType: unknown): InvoiceSettings | null {
  const invoice = useAppSelector(InvoiceSettingsData);
  const documents = useAppSelector(DocumentSettingsData);
  return pickInvoiceSettingsForSale(invoice, documents, saleType);
}
