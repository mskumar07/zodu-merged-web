/**
 * The KOT slip, laid out once as monospace lines.
 *
 * Laid out like the KOT template the POS prints with the bill (ThermalKotTemplate).
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
  /** Printed above the items: "BILLING COPY", "REPRINT", rerouting notes. */
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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "28 Oct 26 06:41 PM" — as the KOT template (ThermalKotTemplate) prints it. */
function formatDateTime(d: Date): string {
  let h = d.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const yy = String(d.getFullYear()).slice(-2);
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${yy} ${String(h).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} ${ampm}`;
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
 * One slip, laid out like the KOT template (ThermalKotTemplate):
 *
 *   KOT #2                  TABLE 9
 *   023          28 Oct 26 06:41 PM
 *   --------------------------------
 *   1 x Jeera Rice
 *   2 x Kashmiri Pulao
 *   --------------------------------
 *   Items: 2             Total Qty: 3
 *
 * `tickets` is a single counter's ticket, or, with `consolidated`, every ticket of
 * a send, each counter's items under its name.
 */
export function buildKotSlip(batch: KotBatch, tickets: KotTicket[], opts: SlipOptions): Slip {
  const cols = PAPER_COLUMNS[opts.paper];
  const big = Math.floor(cols / 2);
  const kind = orderKind(batch.order_type);
  const lines: SlipLine[] = [];
  const push = (text: string, style: Omit<SlipLine, "text"> = {}) => lines.push({ text, ...style });
  const rule = () => push("-".repeat(cols));

  // KOT number left; table (dine-in) or order type right — double size when it fits.
  // Not bold, as in the template: emphasized text prints smudged on many rolls.
  const right = kind === "dine_in" && batch.table_no ? `TABLE ${batch.table_no}` : ORDER_LABEL[kind];
  const head = spread(`KOT #${batch.kot_no}`, right, big);
  for (const l of head.length === 1 ? head : spread(`KOT #${batch.kot_no}`, right, cols)) {
    push(l, { size: head.length === 1 ? 2 : 1 });
  }
  for (const l of spread(batch.order_no ?? "", formatDateTime(opts.printedAt), cols)) push(l);

  const customer = batch.customer_name?.trim() && !/^walk-?in$/i.test(batch.customer_name.trim()) ? batch.customer_name.trim() : null;
  const phone = kind !== "dine_in" ? batch.customer_phone?.trim() || null : null;
  const who = [customer, phone].filter(Boolean).join(" - ");
  if (who) for (const l of wrap(who, cols)) push(l);
  if (kind === "delivery" && batch.delivery_address) for (const l of wrap(batch.delivery_address, cols)) push(l);

  // What the kitchen must not miss: added or cancelled items, a reprint, a reroute.
  const mixedKinds = tickets.some((t) => t.kot_type !== tickets[0]?.kot_type);
  const kotType: KotType = tickets[0]?.kot_type ?? "NEW";
  const marks = [opts.banner, !mixedKinds && kotType !== "NEW" ? TYPE_BANNER[kotType] : null].filter(Boolean) as string[];
  for (const mark of marks) for (const l of wrap(mark.toUpperCase(), cols)) push(center(l, cols), { bold: true });

  // Items: "2 x Paneer Tikka (Half)", wrapped lines kept under the name.
  rule();
  let count = 0;
  let totalQty = 0;
  for (const ticket of tickets) {
    // The counter's name heads its items, so slips sharing one printer can be told apart.
    if (opts.consolidated || ticket.counter_name) {
      const counter = (ticket.counter_name || "Kitchen").toUpperCase();
      push(ticket.kot_type === "NEW" || !mixedKinds ? `[${counter}]` : `[${counter}] ${ticket.kot_type}`);
    }
    for (const item of ticket.items) {
      count += 1;
      totalQty += item.qty;
      const qty = `${ticket.kot_type === "CANCEL" ? "-" : ""}${formatQty(item.qty)} x `;
      const indent = width(qty);
      wrap(itemLabel(item), cols - indent).forEach((name, i) => {
        push((i === 0 ? qty : " ".repeat(indent)) + name);
      });
      if (item.note) for (const l of wrap(`Note: ${item.note}`, cols - indent)) push(" ".repeat(indent) + l);
    }
  }
  rule();
  for (const l of spread(`Items: ${count}`, `Total Qty: ${formatQty(totalQty)}`, cols)) push(l);

  return { paper: opts.paper, lines };
}

/** True when every character is printable ASCII — i.e. ESC/POS text mode will print it. */
export function isPlainAscii(slip: Slip): boolean {
  return slip.lines.every((l) => /^[\x20-\x7e]*$/.test(l.text));
}
