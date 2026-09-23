/**
 * The KOT slip, laid out once as monospace lines.
 *
 * Every renderer reads the same lines — ESC/POS text for the printer, a raster
 * image when the text has characters a printer's code page lacks (Tamil, Hindi
 * item names), and the on-screen preview — so what Settings previews is what
 * the kitchen gets.
 */

// ─── Wire types (restaurant-service) ────────────────────────────────────────

export type KotType = "NEW" | "ADD" | "CANCEL";
export type PaperSize = "2" | "3" | "5";
export type PrinterConnection = "LAN" | "USB" | "BLUETOOTH";
export type PrinterRole = "kot_counter" | "billing" | "both";

export interface KotTicketItem {
  item_id: string;
  item_name: string;
  variant_name: string | null;
  qty: number;
  note: string | null;
  fallback_counter_id: number | null;
}

export interface KotTicket {
  ticket_id: number;
  kot_type: KotType;
  /** null: the item had no counter and there is no default — prints at billing. */
  kot_counter_id: number | null;
  counter_name: string | null;
  created_at: string;
  /** Latest print-log status, null when the POS never reported one. */
  print_status: "success" | "failed" | "reprinted" | null;
  items: KotTicketItem[];
}

/** Every counter's slip from one send to the kitchen. */
export interface KotBatch {
  api_order_id: string;
  kot_no: number;
  order_no: string | null;
  /** Backend vocabulary: "Dine-In" | "Takeaway" | "Delivery". */
  order_type: string;
  table_no: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  delivery_address: string | null;
  waiter_name: string | null;
  covers: number | null;
  tickets: KotTicket[];
}

// ─── Slip model ─────────────────────────────────────────────────────────────

export interface SlipLine {
  text: string;
  bold?: boolean;
  /** 2 = double width and height; the line then holds half the columns. */
  size?: 1 | 2;
}

export interface Slip {
  paper: PaperSize;
  lines: SlipLine[];
}

/** Font A columns (12 dots each) on a 58 mm (2"), 80 mm (3") and 5" head (120 mm printable). */
export const PAPER_COLUMNS: Record<PaperSize, number> = { "2": 32, "3": 48, "5": 80 };

export type OrderKind = "dine_in" | "pickup" | "delivery";

export function orderKind(orderType: string): OrderKind {
  const t = orderType.toLowerCase().replace(/[^a-z]/g, "");
  if (t === "delivery") return "delivery";
  if (t === "takeaway" || t === "pickup") return "pickup";
  return "dine_in";
}

const ORDER_LABEL: Record<OrderKind, string> = { dine_in: "DINE-IN", pickup: "PICK UP", delivery: "DELIVERY" };

export interface SlipOptions {
  restaurantName: string;
  paper: PaperSize;
  /** When the slip is printed — shown as its date/time. */
  printedAt: Date;
  /** Printed under the title: "BILLING COPY", "REPRINT", rerouting notes. */
  banner?: string | null;
  /** Consolidated billing copy: every ticket's items under its counter's heading. */
  consolidated?: boolean;
}

// ─── Text helpers ───────────────────────────────────────────────────────────

/** Characters, not UTF-16 units, so a Tamil/emoji name measures what it prints. */
const chars = (s: string) => Array.from(s);
const width = (s: string) => chars(s).length;

export function wrap(text: string, cols: number): string[] {
  const out: string[] = [];
  for (const para of text.split(/\r?\n/)) {
    let line = "";
    for (const word of para.split(/\s+/).filter(Boolean)) {
      let w = word;
      while (width(w) > cols) {
        if (line) { out.push(line); line = ""; }
        out.push(chars(w).slice(0, cols).join(""));
        w = chars(w).slice(cols).join("");
      }
      if (!w) continue;
      if (!line) line = w;
      else if (width(line) + 1 + width(w) <= cols) line += ` ${w}`;
      else { out.push(line); line = w; }
    }
    out.push(line);
  }
  // Blank paragraphs drop out, but an entirely empty text still yields one line.
  return out.length > 1 ? out.filter((l) => l !== "") : out;
}

export const padEnd = (s: string, n: number) => s + " ".repeat(Math.max(0, n - width(s)));
export const padStart = (s: string, n: number) => " ".repeat(Math.max(0, n - width(s))) + s;
export const center = (s: string, n: number) => padStart(s, width(s) + Math.floor(Math.max(0, n - width(s)) / 2));

/** Left and right text on one line; drops to two lines when they don't fit. */
export function spread(left: string, right: string, cols: number): string[] {
  if (width(left) + 1 + width(right) <= cols) return [left + " ".repeat(cols - width(left) - width(right)) + right];
  return [...wrap(left, cols), padStart(right, cols)];
}

export const formatQty = (qty: number) => (Number.isInteger(qty) ? String(qty) : qty.toFixed(2).replace(/0+$/, "").replace(/\.$/, ""));

function formatDateTime(d: Date): { date: string; time: string } {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  let h = d.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return {
    date: `${dd}/${mm}/${d.getFullYear()}`,
    time: `${String(h).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} ${ampm}`,
  };
}

const TYPE_BANNER: Record<KotType, string> = {
  NEW: "NEW ORDER",
  ADD: "** ADDITIONAL ITEMS **",
  CANCEL: "** CANCEL ITEMS **",
};

export function itemLabel(item: Pick<KotTicketItem, "item_name" | "variant_name">): string {
  const variant = item.variant_name?.trim();
  return variant && variant.toLowerCase() !== item.item_name.trim().toLowerCase()
    ? `${item.item_name} (${variant})`
    : item.item_name;
}

// ─── Builder ────────────────────────────────────────────────────────────────

/**
 * One slip. `tickets` is a single counter's ticket, or — with `consolidated` —
 * every ticket of a send, printed together at the billing counter.
 */
export function buildKotSlip(batch: KotBatch, tickets: KotTicket[], opts: SlipOptions): Slip {
  const cols = PAPER_COLUMNS[opts.paper];
  const big = Math.floor(cols / 2);
  const kind = orderKind(batch.order_type);
  const lines: SlipLine[] = [];
  const push = (text: string, style: Omit<SlipLine, "text"> = {}) => lines.push({ text, ...style });
  const rule = (ch = "-") => push(ch.repeat(cols));

  // A consolidated slip can mix kinds (an edit that both adds and cancels);
  // then the per-counter headings carry the kind instead of one banner.
  const mixedKinds = tickets.some((t) => t.kot_type !== tickets[0]?.kot_type);
  const kotType: KotType = tickets[0]?.kot_type ?? "NEW";
  const title = opts.consolidated
    ? "KOT - ALL COUNTERS"
    : `${(tickets[0]?.counter_name || "Kitchen").toUpperCase()} KOT`;

  // Header
  for (const l of wrap(opts.restaurantName.toUpperCase(), cols)) push(center(l, cols), { bold: true });
  for (const l of wrap(title, big)) push(center(l, big), { bold: true, size: 2 });
  if (opts.banner) for (const l of wrap(opts.banner.toUpperCase(), cols)) push(center(l, cols), { bold: true });
  rule("=");

  // KOT number and the order type, big — the two things a kitchen scans first.
  for (const l of spread(`KOT #${batch.kot_no}`, ORDER_LABEL[kind], big)) push(l, { bold: true, size: 2 });
  if (!mixedKinds) push(center(TYPE_BANNER[kotType], cols), { bold: kotType !== "NEW" });

  // Order identity: table for Dine-In, order number for Pick Up / Delivery.
  if (kind === "dine_in") {
    if (batch.table_no) push(`TABLE: ${batch.table_no}`, { bold: true, size: 2 });
    if (batch.order_no) push(`Order No: ${batch.order_no}`);
  } else if (batch.order_no) {
    const label = `ORDER: ${batch.order_no}`;
    if (width(label) <= big) {
      push(label, { bold: true, size: 2 });
    } else {
      // Too long to share a big line with its label (an invoice number on 2" paper).
      push("Order No:", { bold: true });
      for (const l of wrap(batch.order_no, big)) push(l, { bold: true, size: 2 });
    }
  }

  const { date, time } = formatDateTime(opts.printedAt);
  push(spread(`Date: ${date}`, `Time: ${time}`, cols)[0]);

  if (batch.customer_name) for (const l of wrap(`Customer: ${batch.customer_name}`, cols)) push(l);
  if (kind !== "dine_in" && batch.customer_phone) push(`Phone: ${batch.customer_phone}`, { bold: kind === "delivery" });
  if (kind === "delivery" && batch.delivery_address) {
    for (const l of wrap(`Address: ${batch.delivery_address}`, cols)) push(l);
  }
  if (kind === "dine_in") {
    const staff = [batch.waiter_name && `Captain: ${batch.waiter_name}`, batch.covers ? `Covers: ${batch.covers}` : null]
      .filter(Boolean)
      .join(" | ");
    if (staff) for (const l of wrap(staff, cols)) push(l);
  }

  // Items
  const SL = 4;
  const QTY = 5;
  const NAME = cols - SL - QTY;
  rule();
  push(padEnd("Sl", SL) + padEnd("Item Name", NAME) + padStart("Qty", QTY), { bold: true });
  rule();

  let sl = 0;
  let totalQty = 0;
  for (const ticket of tickets) {
    if (opts.consolidated) {
      const counter = (ticket.counter_name || "Kitchen").toUpperCase();
      push(ticket.kot_type === "NEW" ? `[${counter}]` : `[${counter}] ${ticket.kot_type}`, { bold: true });
    }
    for (const item of ticket.items) {
      sl += 1;
      totalQty += item.qty;
      const qty = ticket.kot_type === "CANCEL" ? `-${formatQty(item.qty)}` : formatQty(item.qty);
      const nameLines = wrap(itemLabel(item), NAME - 1);
      nameLines.forEach((name, i) => {
        push(
          padEnd(i === 0 ? String(sl) : "", SL) + padEnd(name, NAME) + (i === 0 ? padStart(qty, QTY) : ""),
          { bold: true },
        );
      });
      if (item.note) for (const l of wrap(`>> ${item.note}`, NAME)) push(" ".repeat(SL) + l);
    }
  }

  rule();
  push(spread(`Total Items: ${sl}`, `Total Qty: ${formatQty(totalQty)}`, cols)[0], { bold: true });
  rule();

  return { paper: opts.paper, lines };
}

/** True when every character is printable ASCII — i.e. ESC/POS text mode will print it. */
export function isPlainAscii(slip: Slip): boolean {
  return slip.lines.every((l) => /^[\x20-\x7e]*$/.test(l.text));
}
