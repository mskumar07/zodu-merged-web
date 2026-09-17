import { describe, expect, it } from "vitest";
import { buildKotSlip, isPlainAscii, orderKind, PAPER_COLUMNS, type KotBatch, type KotTicket } from "./kotTicket";

const ticket = (overrides: Partial<KotTicket> = {}): KotTicket => ({
  ticket_id: 1,
  kot_type: "NEW",
  kot_counter_id: 1,
  counter_name: "Tandoor",
  created_at: "2026-09-16T10:00:00Z",
  print_status: null,
  items: [
    { item_id: "M1", item_name: "Paneer Tikka", variant_name: "Half", qty: 2, note: "less spicy", fallback_counter_id: null },
    { item_id: "M2", item_name: "Butter Naan", variant_name: null, qty: 3, note: null, fallback_counter_id: null },
  ],
  ...overrides,
});

const batch = (overrides: Partial<KotBatch> = {}): KotBatch => ({
  api_order_id: "o-1",
  kot_no: 12,
  order_no: "023",
  order_type: "Dine-In",
  table_no: "T5",
  customer_name: "Ravi",
  customer_phone: "9876543210",
  delivery_address: "12, Anna Salai, Chennai",
  waiter_name: "Kumar",
  covers: 4,
  tickets: [ticket()],
  ...overrides,
});

const opts = { restaurantName: "Shri Vasantha Bhavan", paper: "3" as const, printedAt: new Date(2026, 8, 16, 19, 5) };
const text = (b: KotBatch, o = opts) => buildKotSlip(b, b.tickets, o).lines.map((l) => l.text).join("\n");

describe("orderKind", () => {
  it("maps backend and POS vocabularies", () => {
    expect(orderKind("Dine-In")).toBe("dine_in");
    expect(orderKind("Takeaway")).toBe("pickup");
    expect(orderKind("PickUp")).toBe("pickup");
    expect(orderKind("Delivery")).toBe("delivery");
  });
});

describe("buildKotSlip", () => {
  it("dine-in shows table, secondary order no, captain/covers, and hides phone/address", () => {
    const out = text(batch());
    expect(out).toContain("SHRI VASANTHA BHAVAN");
    expect(out).toContain("TANDOOR KOT");
    expect(out).toMatch(/KOT #12\s+DINE-IN/);
    expect(out).toContain("TABLE: T5");
    expect(out).toContain("Order No: 023");
    expect(out).toContain("Captain: Kumar | Covers: 4");
    expect(out).toContain("Customer: Ravi");
    expect(out).not.toContain("Phone:");
    expect(out).not.toContain("Address:");
    expect(out).toContain("Date: 16/09/2026");
    expect(out).toContain("Time: 07:05 PM");
  });

  it("pickup leads with the order number and hides the table", () => {
    const out = text(batch({ order_type: "Takeaway", order_no: "INV-B1-144", table_no: null }));
    expect(out).toMatch(/KOT #12\s+PICK UP/);
    expect(out).toContain("ORDER: INV-B1-144");
    expect(out).not.toContain("TABLE:");
    expect(out).toContain("Phone: 9876543210");
    expect(out).not.toContain("Address:");
    expect(out).not.toContain("Captain:");
  });

  it("delivery shows phone and wrapped address", () => {
    const out = text(batch({ order_type: "Delivery", order_no: "INV-B1-145", table_no: null }));
    expect(out).toMatch(/KOT #12\s+DELIVERY/);
    expect(out).toContain("Address: 12, Anna Salai, Chennai");
  });

  it("lists items with variants, notes and totals", () => {
    const out = text(batch());
    expect(out).toMatch(/1\s+Paneer Tikka \(Half\)\s+2/);
    expect(out).toContain(">> less spicy");
    expect(out).toMatch(/Total Items: 2\s+Total Qty: 5/);
    expect(out).toContain("NEW ORDER");
  });

  it("marks ADD and CANCEL tickets, with cancelled quantities negative", () => {
    expect(text(batch({ tickets: [ticket({ kot_type: "ADD" })] }))).toContain("** ADDITIONAL ITEMS **");
    const cancel = text(batch({ tickets: [ticket({ kot_type: "CANCEL" })] }));
    expect(cancel).toContain("** CANCEL ITEMS **");
    expect(cancel).toMatch(/Butter Naan\s+-3/);
  });

  it("consolidated copy groups items under each counter", () => {
    const b = batch({
      tickets: [
        ticket(),
        ticket({ ticket_id: 2, counter_name: "Chinese", kot_type: "CANCEL", items: [{ item_id: "M9", item_name: "Noodles", variant_name: null, qty: 1, note: null, fallback_counter_id: null }] }),
      ],
    });
    const out = buildKotSlip(b, b.tickets, { ...opts, consolidated: true, banner: "Billing copy" }).lines.map((l) => l.text).join("\n");
    expect(out).toContain("KOT - ALL COUNTERS");
    expect(out).toContain("BILLING COPY");
    expect(out).toContain("[TANDOOR]");
    expect(out).toContain("[CHINESE] CANCEL");
    expect(out).not.toContain("NEW ORDER"); // mixed kinds: no single banner
  });

  it("never exceeds the paper's columns", () => {
    for (const paper of ["2", "3"] as const) {
      const long = batch({
        customer_name: "A very long customer name that keeps going and going",
        tickets: [ticket({ items: [{ item_id: "X", item_name: "Special Hyderabadi Chicken Dum Biryani Family Pack", variant_name: "Extra Large", qty: 1, note: "no onion, no garlic, extra raita on the side please", fallback_counter_id: null }] })],
      });
      const slip = buildKotSlip(long, long.tickets, { ...opts, paper });
      for (const line of slip.lines) {
        const limit = line.size === 2 ? Math.floor(PAPER_COLUMNS[paper] / 2) : PAPER_COLUMNS[paper];
        expect(Array.from(line.text).length, line.text).toBeLessThanOrEqual(limit);
      }
    }
  });

  it("flags non-ASCII slips for raster printing", () => {
    expect(isPlainAscii(buildKotSlip(batch(), batch().tickets, opts))).toBe(true);
    const tamil = batch({ tickets: [ticket({ items: [{ item_id: "T", item_name: "இட்லி", variant_name: null, qty: 2, note: null, fallback_counter_id: null }] })] });
    expect(isPlainAscii(buildKotSlip(tamil, tamil.tickets, opts))).toBe(false);
  });
});
