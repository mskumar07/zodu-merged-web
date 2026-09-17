import { PAPER_COLUMNS, center, formatQty, padEnd, padStart, spread, wrap, type PaperSize, type Slip, type SlipLine } from "./kotTicket";

/**
 * The restaurant bill as printer text, for the billing printer.
 *
 * The on-screen receipt (ThermalInvoiceTemplate) is HTML; sent as a picture it
 * is scaled to the head and its type came out far smaller than a KOT's. Laid
 * out as lines in the printer's own font, the bill prints the same size and
 * sharpness as the kitchen ticket. Amounts are "Rs." — ₹ is not in any printer
 * code page, and one non-ASCII character sends the whole slip as an image.
 */

export interface BillItem {
  item_id?: string | null;
  name: string;
  variant_name?: string | null;
  qty: number;
  rate: number;
  total: number;
}

export interface BillGstRow {
  cgstRate: number;
  sgstRate: number;
  taxable: number;
  cgstAmount: number;
  sgstAmount: number;
}

export interface BillData {
  sale_id?: string | null;
  date: string;
  time: string;
  customer_name?: string | null;
  customer_mobile?: string | null;
  payment_mode?: string | null;
  items: BillItem[];
  subtotal: number;
  discount?: number | null;
  discount_label?: string | null;
  total: number;
  gst_breakdown?: BillGstRow[];
}

export interface BillHeader {
  name: string;
  addressLines: string[];
  phone?: string | null;
  gstin?: string | null;
}

/** The Invoice Settings toggles the bill honours. */
export interface BillOptions {
  paper: PaperSize;
  showTaxDetails?: boolean;
  showCustomerDetails?: boolean;
  showPaymentDetails?: boolean;
  showSerialNo?: boolean;
  showItemId?: boolean;
  notes?: string | null;
  terms?: string | null;
}

/** Whole rupees with no thousands separators, as the on-screen receipt prints them. */
const amount = (v: number) => String(Math.round(Number(v)) || 0);
const money = (v: number) => `Rs.${amount(v)}`;

/**
 * Column widths per roll. Every figure column is right-aligned and at least one
 * wider than its heading and its largest likely value, so neighbours never touch.
 */
const ITEM_COLS = {
  "2": { sl: 3, qty: 4, rate: 6, amt: 7 },   // name gets 12
  "3": { sl: 4, qty: 5, rate: 9, amt: 10 },  // name gets 20
  "5": { sl: 5, qty: 7, rate: 12, amt: 13 }, // name gets 43
} as const;
const GST_COLS = {
  "2": { rate: 5, taxable: 8, cgst: 6, sgst: 6, total: 7 },
  "3": { rate: 8, taxable: 10, cgst: 10, sgst: 10, total: 10 },
  "5": { rate: 12, taxable: 17, cgst: 17, sgst: 17, total: 17 },
} as const;

export function buildBillSlip(bill: BillData, header: BillHeader, opts: BillOptions): Slip {
  const cols = PAPER_COLUMNS[opts.paper];
  const big = Math.floor(cols / 2);
  const lines: SlipLine[] = [];
  const push = (text: string, style: Omit<SlipLine, "text"> = {}) => lines.push({ text, ...style });
  const rule = (ch = "-") => push(ch.repeat(cols));
  const row = (left: string, right: string, style: Omit<SlipLine, "text"> = {}) => {
    for (const l of spread(left, right, cols)) push(l, style);
  };

  // ── Header ──
  const name = header.name.toUpperCase();
  const nameLines = wrap(name, big);
  // Double size while the name fits in two big lines; a longer one prints bold at normal size.
  if (nameLines.length <= 2) for (const l of nameLines) push(center(l, big), { bold: true, size: 2 });
  else for (const l of wrap(name, cols)) push(center(l, cols), { bold: true });
  for (const addr of header.addressLines) for (const l of wrap(addr, cols)) push(center(l, cols));
  if (header.phone) push(center(`Ph: ${header.phone}`, cols));
  if (header.gstin) push(center(`GSTIN: ${header.gstin}`, cols), { bold: true });
  rule();

  // ── Bill identity ──
  row("Receipt #", String(bill.sale_id ?? ""), { bold: true });
  row("Date & Time", `${bill.date} ${bill.time}`);
  if (opts.showPaymentDetails && bill.payment_mode) row("Payment Mode", bill.payment_mode);

  const customer = bill.customer_name?.trim();
  if ((opts.showCustomerDetails ?? true) && customer && !/^walk-?in$/i.test(customer)) {
    rule();
    for (const l of wrap(`Customer: ${customer}`, cols)) push(l, { bold: true });
    if (bill.customer_mobile && bill.customer_mobile !== "-") push(`Mob: ${bill.customer_mobile}`);
  }

  // ── Items ──
  // One row per item: the figures sit in fixed right-aligned columns on the
  // item's first line, and a long name wraps inside its own column beneath.
  const showSl = opts.showSerialNo ?? true;
  const w = ITEM_COLS[opts.paper];
  const SL = showSl ? w.sl : 0;
  const NAME = cols - SL - w.qty - w.rate - w.amt;
  const indent = " ".repeat(SL);
  const figures = (qty: string, rate: string, amt: string) => padStart(qty, w.qty) + padStart(rate, w.rate) + padStart(amt, w.amt);

  rule();
  push((showSl ? padEnd("#", SL) : "") + padEnd("Item", NAME) + figures("Qty", "Rate", "Amt"), { bold: true });
  rule();

  let totalQty = 0;
  bill.items.forEach((it, i) => {
    totalQty += Number(it.qty) || 0;
    const label = (it.variant_name && it.variant_name.trim().toLowerCase() !== it.name.trim().toLowerCase()
      ? `${it.name} (${it.variant_name})`
      : it.name).trim().replace(/\s+/g, " ");
    // The first line shares the row with the figures (one column short of NAME, so a
    // full-length name keeps a space before Qty); the rest has the whole width to itself.
    const first = wrap(label, NAME - 1)[0] ?? "";
    const rest = label.slice(first.length).trim();
    push((showSl ? padEnd(String(i + 1), SL) : "") + padEnd(first, NAME) + figures(formatQty(it.qty), amount(it.rate), amount(it.total)), { bold: true });
    if (rest) for (const l of wrap(rest, cols - SL)) push(indent + l, { bold: true });
    if (opts.showItemId && it.item_id) for (const l of wrap(it.item_id, cols - SL)) push(indent + l);
  });
  rule();

  // ── Totals ──
  row(`T.Qty: ${formatQty(totalQty)}`, `Total: ${money(bill.subtotal)}`, { bold: true });
  if (bill.discount && bill.discount > 0) row(bill.discount_label || "Discount", `-${money(bill.discount)}`);

  const slabs = opts.showTaxDetails ? (bill.gst_breakdown ?? []) : [];
  if (slabs.length > 0) {
    const taxable = slabs.reduce((s, r) => s + r.taxable, 0);
    row("Taxable Amount", money(taxable));
    rule();
    push(center("GST SUMMARY", cols), { bold: true });
    const g = GST_COLS[opts.paper];
    const gstRow = (rate: string, taxableAmt: string, cgst: string, sgst: string, total: string) =>
      padEnd(rate, g.rate) + padStart(taxableAmt, g.taxable) + padStart(cgst, g.cgst) + padStart(sgst, g.sgst) + padStart(total, g.total);
    push(gstRow("Rate", "Taxable", "CGST", "SGST", "Total"), { bold: true });
    for (const s of slabs) {
      const pct = `${(s.cgstRate + s.sgstRate).toFixed(1).replace(/\.0$/, "")}%`;
      push(gstRow(pct, amount(s.taxable), amount(s.cgstAmount), amount(s.sgstAmount), amount(s.cgstAmount + s.sgstAmount)));
    }
  }

  // ── Bill amount, big ──
  rule("=");
  const due = `BILL AMOUNT: ${money(bill.total)}`;
  if (due.length <= big) push(center(due, big), { bold: true, size: 2 });
  else {
    push(center("BILL AMOUNT", big), { bold: true, size: 2 });
    push(center(money(bill.total), big), { bold: true, size: 2 });
  }
  rule("=");

  // ── Footer: terms, then the Invoice Settings notes centred as the closing line ──
  if (opts.terms?.trim()) {
    push("Terms & Conditions", { bold: true });
    for (const l of wrap(opts.terms, cols)) push(l);
    rule();
  }
  if (opts.notes?.trim()) {
    push("");
    for (const l of wrap(opts.notes.trim(), cols)) push(center(l, cols), { bold: true });
  }

  return { paper: opts.paper, lines };
}
