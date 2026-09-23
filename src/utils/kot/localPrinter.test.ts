import { describe, expect, it } from "vitest";
import type { KotConfig, KotPrinter } from "./kotDispatch";
import { paperFromPrinterName, pickBillPrinter, receiptPrintersIn } from "./localPrinter";

const printer = (id: number, name: string, extra: Partial<KotPrinter> = {}): KotPrinter => ({
  id, printer_name: name, connection_type: "USB", ip_address: null, port: null,
  device_name: name, paper_size: "3", cut_mode: "partial", role: "kot_counter", active: true, ...extra,
});
const config = (printers: KotPrinter[], billing_printer_id: number | null = null): KotConfig => ({
  printers, counters: [],
  settings: {
    kot_printing_enabled: true, default_counter_id: null, billing_printer_id,
    print_all_at_billing: false, billing_copy_mode: "consolidated", max_retries: 0,
  },
});

describe("receiptPrintersIn", () => {
  it("keeps receipt printers and drops Windows' virtual ones", () => {
    expect(receiptPrintersIn(["Microsoft Print to PDF", "OneNote (Desktop)", "Fax", "POS-58-Series", "HP LaserJet"]))
      .toEqual(["POS-58-Series"]);
  });
});

describe("paperFromPrinterName", () => {
  it("reads the roll from the name", () => {
    expect(paperFromPrinterName("POS-58-Series")).toBe("2");
    expect(paperFromPrinterName("XP-80C")).toBe("3");
    expect(paperFromPrinterName("EPSON TM-T82")).toBe("3");
  });
});

describe("pickBillPrinter", () => {
  it("uses the printer connected to this PC over a billing printer elsewhere", () => {
    const lan = printer(9, "Counter LAN", { connection_type: "LAN", ip_address: "10.0.0.9", port: 9100, device_name: null, role: "billing" });
    const picked = pickBillPrinter(config([lan], 9), ["POS-58-Series"]);
    expect(picked).toMatchObject({ device_name: "POS-58-Series", connection_type: "USB", paper_size: "2" });
  });
  it("keeps the saved settings of a configured printer on this PC", () => {
    const kitchen = printer(1, "Kitchen", { device_name: "Kitchen XP" });
    const counter = printer(2, "Counter", { device_name: "pos-58-series", paper_size: "2", cut_mode: "none" });
    expect(pickBillPrinter(config([kitchen, counter], 1), ["POS-58-Series"])?.printer_name).toBe("Counter");
  });
  it("falls back to the billing printer when nothing is connected to this PC", () => {
    const lan = printer(9, "Counter LAN", { connection_type: "LAN", ip_address: "10.0.0.9", port: 9100, device_name: null, role: "billing" });
    expect(pickBillPrinter(config([lan], 9), [])?.printer_name).toBe("Counter LAN");
    expect(pickBillPrinter(null, [])).toBeNull();
  });
});
