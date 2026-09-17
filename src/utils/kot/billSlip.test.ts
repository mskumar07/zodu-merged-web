import { describe, expect, it } from "vitest";
import { buildBillSlip, type BillData } from "./billSlip";
import { PAPER_COLUMNS, isPlainAscii } from "./kotTicket";

const bill: BillData = {
  sale_id: "ORD-025",
  date: "17/09/2026",
  time: "03:13 pm",
  customer_name: "Walk-In",
  customer_mobile: "-",
  payment_mode: "Cash",
  items: [
    { item_id: "ZODU035-ZODU035B1-260", name: "Jeera Rice", qty: 1, rate: 185, total: 185 },
    { item_id: "ZODU035-ZODU035B1-261", name: "Kashmiri Pulao", qty: 1, rate: 200, total: 200 },
    { item_id: "ZODU035-ZODU035B1-258", name: "Kebab Da Biryani Special Family Pack", qty: 2, rate: 1310, total: 2620 },
  ],
  subtotal: 3005,
  total: 3546,
  gst_breakdown: [{ cgstRate: 9, sgstRate: 9, taxable: 3005, cgstAmount: 270.45, sgstAmount: 270.45 }],
};
const header = { name: "Shri Vasantha Bhavan", addressLines: ["12, Anna Salai, Chennai"], phone: "8438788507", gstin: null };

describe("buildBillSlip", () => {
  for (const paper of ["2", "3", "5"] as const) {
    it(`fits a ${paper}" roll as plain printer text`, () => {
      const slip = buildBillSlip(bill, header, { paper, showTaxDetails: true, showItemId: true });
      const cols = PAPER_COLUMNS[paper];
      for (const l of slip.lines) expect(l.text.length).toBeLessThanOrEqual(l.size === 2 ? cols / 2 : cols);
      expect(isPlainAscii(slip)).toBe(true);
      const text = slip.lines.map((l) => l.text).join("\n");
      expect(text).toContain("ORD-025");
      expect(text).toContain("Kashmiri");
      expect(text).toContain("Family Pack");
      expect(text).toContain("Rs.3546");
      expect(text).not.toMatch(/\d,\d/);
      expect(text).toContain("GST SUMMARY");
      expect(text).not.toContain("Customer");
      expect(text).not.toMatch(/THANK YOU|visit again/i);
      // Figures on the item's own line, right edge of Amt lined up with the heading.
      const heading = slip.lines.find((l) => l.text.startsWith("#"))!.text;
      const jeera = slip.lines.find((l) => l.text.includes("Jeera Rice"))!.text;
      expect(jeera.endsWith("185")).toBe(true);
      expect(jeera.length).toBe(heading.length);
      if (process.env.SHOW_BILL) console.log(slip.lines.map((l) => (l.size === 2 ? `[2x] ${l.text}` : l.text)).join("\n"));
    });
  }

  it("closes with the Invoice Settings notes, centred, line by line", () => {
    const slip = buildBillSlip(bill, header, { paper: "3", notes: "Thank you! Visit again\nOpen 7am - 11pm" });
    const tail = slip.lines.slice(-2).map((l) => l.text);
    expect(tail.map((t) => t.trim())).toEqual(["Thank you! Visit again", "Open 7am - 11pm"]);
    expect(tail[0].startsWith(" ")).toBe(true);
    expect(slip.lines.some((l) => l.text === "Notes")).toBe(false);
  });

  it("leaves out the GST summary unless tax details are on", () => {
    const text = buildBillSlip(bill, header, { paper: "3" }).lines.map((l) => l.text).join("\n");
    expect(text).not.toContain("GST SUMMARY");
    expect(text).toContain("BILL AMOUNT: Rs.3546");
  });
});
