import { describe, expect, it } from "vitest";
import { describeFailures, dispatchKotBatch, type KotConfig, type KotPrinter, type PrintLogEntry } from "./kotDispatch";
import type { KotBatch, KotTicket, Slip } from "./kotTicket";

const printer = (id: number, name: string, extra: Partial<KotPrinter> = {}): KotPrinter => ({
  id, printer_name: name, connection_type: "LAN", ip_address: `10.0.0.${id}`, port: 9100,
  device_name: null, paper_size: "3", cut_mode: "partial", role: "kot_counter", active: true, ...extra,
});

const counter = (id: number, name: string, printer_id: number | null, extra = {}) => ({
  id, counter_name: name, counter_code: `KOT${id}`, active: true, printer_id,
  print_billing_copy: false, is_default: false, item_count: 0, ...extra,
});

const baseConfig = (): KotConfig => ({
  printers: [printer(1, "Tandoor P"), printer(2, "Chinese P"), printer(9, "Billing P", { role: "billing" })],
  counters: [counter(1, "Tandoor", 1), counter(2, "Chinese", 2), counter(3, "Bar", null)],
  settings: {
    kot_printing_enabled: true, default_counter_id: null, billing_printer_id: 9,
    print_all_at_billing: false, billing_copy_mode: "consolidated", max_retries: 1,
  },
});

const item = (id: string, fallback: number | null = null) => ({
  item_id: id, item_name: id, variant_name: null, qty: 1, note: null, fallback_counter_id: fallback,
});

const ticket = (ticket_id: number, kot_counter_id: number | null, counter_name: string | null, items = [item(`I${ticket_id}`)]): KotTicket => ({
  ticket_id, kot_type: "NEW", kot_counter_id, counter_name, created_at: "", print_status: null, items,
});

const batch = (tickets: KotTicket[]): KotBatch => ({
  api_order_id: "o", kot_no: 1, order_no: "001", order_type: "Dine-In", table_no: "4",
  customer_name: null, customer_phone: null, delivery_address: null, waiter_name: null, covers: null, tickets,
});

function harness(offline: string[] = []) {
  const jobs: { printer: string; slip: Slip }[] = [];
  const logs: PrintLogEntry[] = [];
  return {
    jobs,
    logs,
    deps: {
      print: async (p: KotPrinter, slip: Slip) => {
        if (offline.includes(p.printer_name)) throw new Error("unreachable");
        jobs.push({ printer: p.printer_name, slip });
      },
      log: async (entries: PrintLogEntry[]) => { logs.push(...entries); },
      now: () => new Date(2026, 8, 16, 12, 0),
    },
  };
}

const slipText = (slip: Slip) => slip.lines.map((l) => l.text).join("\n");
const opts = { restaurantName: "Test" };

describe("dispatchKotBatch", () => {
  it("prints each counter's ticket on its own printer", async () => {
    const h = harness();
    const r = await dispatchKotBatch(batch([ticket(1, 1, "Tandoor"), ticket(2, 2, "Chinese")]), baseConfig(), opts, h.deps);
    expect(h.jobs.map((j) => j.printer)).toEqual(["Tandoor P", "Chinese P"]);
    expect(r.failed).toEqual([]);
    expect(h.logs.map((l) => [l.ticket_id, l.target, l.status])).toEqual([[1, "counter", "success"], [2, "counter", "success"]]);
  });

  it("retries, then reroutes items to fallback counters or billing", async () => {
    const h = harness(["Tandoor P"]);
    const t = ticket(1, 1, "Tandoor", [item("naan", 2), item("kebab")]);
    const r = await dispatchKotBatch(batch([t]), baseConfig(), opts, h.deps);
    expect(h.jobs.map((j) => j.printer)).toEqual(["Chinese P", "Billing P"]);
    expect(slipText(h.jobs[0].slip)).toContain("REROUTED FROM TANDOOR - PRINTER OFFLINE");
    expect(slipText(h.jobs[0].slip)).toContain("naan");
    expect(slipText(h.jobs[0].slip)).not.toContain("kebab");
    expect(r.outcomes[0]).toMatchObject({ ok: true, printedOn: ["Chinese P", "Billing P"], error: null });
    expect(h.logs[0]).toMatchObject({ target: "counter", status: "failed", attempts: 2, error: "unreachable" });
    expect(h.logs.slice(1).map((l) => l.target)).toEqual(["fallback", "fallback"]);
  });

  it("reports a ticket failed when neither its printer nor any fallback works", async () => {
    const h = harness(["Tandoor P", "Billing P"]);
    const r = await dispatchKotBatch(batch([ticket(1, 1, "Tandoor")]), baseConfig(), opts, h.deps);
    expect(r.failed.map((f) => f.counter_name)).toEqual(["Tandoor"]);
    expect(describeFailures(r)).toMatch(/^KOT not confirmed printed for Tandoor — Tandoor P: unreachable/);
  });

  it("routes a counter without a printer, and a ticket without a counter, to billing", async () => {
    const h = harness();
    const r = await dispatchKotBatch(batch([ticket(1, 3, "Bar"), ticket(2, null, null)]), baseConfig(), opts, h.deps);
    expect(h.jobs.map((j) => j.printer)).toEqual(["Billing P", "Billing P"]);
    expect(r.failed).toEqual([]);
    expect(h.logs.map((l) => l.target)).toEqual(["billing", "billing"]);
    expect(slipText(h.jobs[0].slip)).not.toContain("REROUTED");
  });

  it("uses a billing-role printer when no billing printer is chosen", async () => {
    const config = baseConfig();
    config.settings.billing_printer_id = null;
    const h = harness();
    await dispatchKotBatch(batch([ticket(1, 3, "Bar")]), config, opts, h.deps);
    expect(h.jobs.map((j) => j.printer)).toEqual(["Billing P"]);
  });

  it("adds per-counter billing copies", async () => {
    const config = baseConfig();
    config.counters[0].print_billing_copy = true;
    const h = harness();
    await dispatchKotBatch(batch([ticket(1, 1, "Tandoor"), ticket(2, 2, "Chinese")]), config, opts, h.deps);
    expect(h.jobs.map((j) => j.printer)).toEqual(["Tandoor P", "Chinese P", "Billing P"]);
    expect(slipText(h.jobs[2].slip)).toContain("BILLING COPY");
    expect(slipText(h.jobs[2].slip)).toContain("TANDOOR KOT");
  });

  it("master switch prints one consolidated copy, skipping tickets already printed at billing", async () => {
    const config = baseConfig();
    config.settings.print_all_at_billing = true;
    const h = harness();
    await dispatchKotBatch(batch([ticket(1, 1, "Tandoor"), ticket(2, 2, "Chinese"), ticket(3, null, null)]), config, opts, h.deps);
    expect(h.jobs.map((j) => j.printer)).toEqual(["Tandoor P", "Chinese P", "Billing P", "Billing P"]);
    const copy = slipText(h.jobs[3].slip);
    expect(copy).toContain("KOT - ALL COUNTERS");
    expect(copy).toContain("[TANDOOR]");
    expect(copy).toContain("[CHINESE]");
    expect(copy).not.toContain("[KITCHEN]");
  });

  it("master switch in per_counter mode copies each ticket", async () => {
    const config = baseConfig();
    config.settings.print_all_at_billing = true;
    config.settings.billing_copy_mode = "per_counter";
    const h = harness();
    await dispatchKotBatch(batch([ticket(1, 1, "Tandoor"), ticket(2, 2, "Chinese")]), config, opts, h.deps);
    expect(h.jobs.map((j) => j.printer)).toEqual(["Tandoor P", "Chinese P", "Billing P", "Billing P"]);
  });

  it("reprints only the chosen tickets, marked and logged as reprinted, without billing copies", async () => {
    const config = baseConfig();
    config.settings.print_all_at_billing = true;
    const h = harness();
    await dispatchKotBatch(batch([ticket(1, 1, "Tandoor"), ticket(2, 2, "Chinese")]), config, { ...opts, reprint: true, ticketIds: [2] }, h.deps);
    expect(h.jobs.map((j) => j.printer)).toEqual(["Chinese P"]);
    expect(slipText(h.jobs[0].slip)).toContain("REPRINT");
    expect(h.logs).toEqual([expect.objectContaining({ ticket_id: 2, status: "reprinted" })]);
  });

  it("skips when disabled or nothing is configured, and tolerates a failing log", async () => {
    const disabled = baseConfig();
    disabled.settings.kot_printing_enabled = false;
    const h = harness();
    expect((await dispatchKotBatch(batch([ticket(1, 1, "T")]), disabled, opts, h.deps)).skipped).toBe("disabled");
    expect((await dispatchKotBatch(batch([ticket(1, 1, "T")]), { ...baseConfig(), printers: [] }, opts, h.deps)).skipped).toBe("no_printers");

    const r = await dispatchKotBatch(batch([ticket(1, 1, "Tandoor")]), baseConfig(), opts, {
      ...h.deps,
      log: async () => { throw new Error("network"); },
    });
    expect(r.failed).toEqual([]);
  });
});
