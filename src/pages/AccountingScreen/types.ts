/**
 * Accounting ledger types. Kept separate from the UI so the API layer can map its
 * response onto `AccountingEntry` / `AccountingSummary` without touching components.
 */
export type TransactionType =
  | "Sales"
  | "Payment"
  | "Purchase"
  | "Expense"
  | "Receipt"
  | "Sales Return"
  | "Purchase Return"
  | "Credit Note"
  | "Debit Note";

export interface AccountingEntry {
  id:          string;
  /** ISO timestamp — formatted for display and used for sorting. */
  date_time:   string;
  type:        TransactionType;
  reference:   string;
  party:       string;
  payment_type: string;
  debit:       number | null;
  credit:      number | null;
  /** Absolute running balance; `balance_side` says whether it is owed to us (Dr) or by us (Cr). */
  balance:     number;
  balance_side: "Dr" | "Cr";
}

export interface SummaryBucket {
  amount: number;
  count:  number;
}

export interface AccountingSummary {
  sales:    SummaryBucket;
  purchases: SummaryBucket;
  payments: SummaryBucket;
  receipts: SummaryBucket;
  expenses: SummaryBucket;
}
