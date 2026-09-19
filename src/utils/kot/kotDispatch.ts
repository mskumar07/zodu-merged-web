import type { CutMode } from "./escpos";
import {
  buildKotSlip,
  type KotBatch,
  type KotTicket,
  type PaperSize,
  type PrinterConnection,
  type PrinterRole,
  type Slip,
} from "./kotTicket";

/**
 * Sends one kitchen send's tickets to their printers:
 *
 *   1. each counter's ticket to that counter's printer (the billing printer when
 *      the counter has none), retried `max_retries` times;
 *   2. if that fails, its items to their fallback counters' printers (or the
 *      billing printer), marked as rerouted;
 *   3. billing-counter copies — per counter, or all tickets when the branch's
 *      master switch is on (one consolidated slip, or a copy of each);
 *   4. every attempt reported to the print log.
 *
 * Printing and logging are injected, so the routing is testable without a
 * printer or the network.
 */

// ─── Config (restaurant-service /get/kot-config) ────────────────────────────

export interface KotPrinter {
  id: number;
  printer_name: string;
  connection_type: PrinterConnection;
  ip_address: string | null;
  port: number | null;
  device_name: string | null;
  paper_size: PaperSize;
  /** Auto cutter after each slip; absent on rows saved before the column existed. */
  cut_mode: CutMode;
  role: PrinterRole;
  active: boolean;
}

export interface KotCounterConfig {
  id: number;
  counter_name: string;
  counter_code: string;
  active: boolean;
  printer_id: number | null;
  print_billing_copy: boolean;
  is_default: boolean;
  item_count: number;
}

export type BillingCopyMode = "consolidated" | "per_counter";

export interface KotSettings {
  kot_printing_enabled: boolean;
  default_counter_id: number | null;
  billing_printer_id: number | null;
  print_all_at_billing: boolean;
  billing_copy_mode: BillingCopyMode;
  max_retries: number;
}

export interface KotConfig {
  counters: KotCounterConfig[];
  printers: KotPrinter[];
  settings: KotSettings;
}

// ─── Dispatch ───────────────────────────────────────────────────────────────

export type PrintTarget = "counter" | "fallback" | "billing";

export interface PrintLogEntry {
  ticket_id: number;
  printer_id: number | null;
  printer_name: string | null;
  target: PrintTarget;
  status: "success" | "failed" | "reprinted";
  attempts: number;
  error: string | null;
}

export interface DispatchDeps {
  print: (printer: KotPrinter, slip: Slip) => Promise<void>;
  log: (entries: PrintLogEntry[]) => Promise<unknown> | void;
  now?: () => Date;
}

export interface DispatchOptions {
  restaurantName: string;
  /** Manual reprint: marks the slip, logs "reprinted", skips billing copies. */
  reprint?: boolean;
  /** Limit to these tickets (reprinting one counter). Default: all. */
  ticketIds?: number[];
}

export interface TicketOutcome {
  ticket_id: number;
  counter_name: string;
  /** The kitchen received every item, on its own printer or a fallback. */
  ok: boolean;
  printedOn: string[];
  error: string | null;
}

export interface DispatchReport {
  skipped: "disabled" | "no_printers" | null;
  outcomes: TicketOutcome[];
  billingError: string | null;
  /** The ticket outcomes that did not reach the kitchen. */
  failed: TicketOutcome[];
}

/** The chosen billing printer, else any active printer set up for billing. */
export function resolveBillingPrinter(config: KotConfig): KotPrinter | null {
  const active = config.printers.filter((p) => p.active);
  const chosen = config.settings.billing_printer_id;
  return (chosen != null ? active.find((p) => p.id === chosen) : undefined)
    ?? active.find((p) => p.role === "billing" || p.role === "both")
    ?? null;
}

/**
 * The printer a bill goes to: the billing printer, else — in a branch with a single
 * active printer — that printer, which serves as both kitchen and billing printer.
 * Kept apart from resolveBillingPrinter so KOT billing copies never land on the
 * kitchen printer that just printed the ticket.
 */
export function resolveBillPrinter(config: KotConfig): KotPrinter | null {
  const active = config.printers.filter((p) => p.active);
  return resolveBillingPrinter(config) ?? (active.length === 1 ? active[0] : null);
}

const errorText = (err: unknown) => (err instanceof Error ? err.message : String(err));

export async function dispatchKotBatch(
  batch: KotBatch,
  config: KotConfig,
  opts: DispatchOptions,
  deps: DispatchDeps,
): Promise<DispatchReport> {
  const { settings } = config;
  const now = deps.now ?? (() => new Date());
  const printers = new Map(config.printers.filter((p) => p.active).map((p) => [p.id, p]));
  const counters = new Map(config.counters.map((c) => [c.id, c]));
  const tickets = opts.ticketIds ? batch.tickets.filter((t) => opts.ticketIds!.includes(t.ticket_id)) : batch.tickets;

  const report: DispatchReport = { skipped: null, outcomes: [], billingError: null, failed: [] };
  if (!settings.kot_printing_enabled && !opts.reprint) return { ...report, skipped: "disabled" };
  if (printers.size === 0) return { ...report, skipped: "no_printers" };

  const logs: PrintLogEntry[] = [];
  const attemptsAllowed = 1 + Math.max(0, settings.max_retries ?? 0);
  const billingPrinter = resolveBillingPrinter(config);
  const successStatus = opts.reprint ? "reprinted" : "success";

  const counterPrinter = (counterId: number | null) => {
    if (counterId == null) return null;
    const counter = counters.get(counterId);
    return counter?.active && counter.printer_id != null ? printers.get(counter.printer_id) ?? null : null;
  };
  const counterLabel = (t: KotTicket) => t.counter_name || counters.get(t.kot_counter_id ?? -1)?.counter_name || "Kitchen";

  const slipFor = (printer: KotPrinter, slipTickets: KotTicket[], banner: string | null, consolidated = false) =>
    buildKotSlip(batch, slipTickets, {
      restaurantName: opts.restaurantName,
      paper: printer.paper_size,
      printedAt: now(),
      banner: [opts.reprint ? "REPRINT" : null, banner].filter(Boolean).join(" - ") || null,
      consolidated,
    });

  async function printWithRetry(printer: KotPrinter, slip: Slip) {
    let lastError: string | null = null;
    for (let attempt = 1; attempt <= attemptsAllowed; attempt++) {
      try {
        await deps.print(printer, slip);
        return { ok: true, attempts: attempt, error: null };
      } catch (err) {
        lastError = errorText(err);
      }
    }
    return { ok: false, attempts: attemptsAllowed, error: lastError };
  }

  // Tickets whose kitchen slip already came out of the billing printer need no copy there.
  const printedAtBilling = new Set<number>();

  for (const ticket of tickets) {
    const label = counterLabel(ticket);
    const outcome: TicketOutcome = { ticket_id: ticket.ticket_id, counter_name: label, ok: false, printedOn: [], error: null };
    // No counter, or a counter without a printer of its own: the billing printer is its home.
    const ownPrinter = counterPrinter(ticket.kot_counter_id);
    const primary = ownPrinter ?? billingPrinter;

    if (primary) {
      const result = await printWithRetry(primary, slipFor(primary, [ticket], null));
      logs.push({
        ticket_id: ticket.ticket_id, printer_id: primary.id, printer_name: primary.printer_name,
        target: ownPrinter ? "counter" : "billing",
        status: result.ok ? successStatus : "failed", attempts: result.attempts, error: result.error,
      });
      if (result.ok) {
        outcome.ok = true;
        outcome.printedOn.push(primary.printer_name);
        if (primary.id === billingPrinter?.id) printedAtBilling.add(ticket.ticket_id);
      } else {
        outcome.error = `${primary.printer_name}: ${result.error}`;
      }
    } else {
      outcome.error = `No printer assigned to ${label} and no billing printer set`;
    }

    if (!outcome.ok) {
      // Reroute item by item: each to its fallback counter's printer, else the billing printer.
      const groups = new Map<number, { printer: KotPrinter; items: KotTicket["items"] }>();
      const stranded: string[] = [];
      for (const item of ticket.items) {
        const candidates = [counterPrinter(item.fallback_counter_id), billingPrinter];
        const target = candidates.find((p) => p && p.id !== primary?.id) ?? null;
        if (!target) { stranded.push(item.item_name); continue; }
        if (!groups.has(target.id)) groups.set(target.id, { printer: target, items: [] });
        groups.get(target.id)!.items.push(item);
      }

      let allRerouted = stranded.length === 0 && groups.size > 0;
      for (const { printer, items } of groups.values()) {
        const partial: KotTicket = { ...ticket, items };
        const result = await printWithRetry(printer, slipFor(printer, [partial], `Rerouted from ${label} - printer offline`));
        logs.push({
          ticket_id: ticket.ticket_id, printer_id: printer.id, printer_name: printer.printer_name,
          target: "fallback", status: result.ok ? successStatus : "failed", attempts: result.attempts, error: result.error,
        });
        if (result.ok) {
          outcome.printedOn.push(printer.printer_name);
          if (printer.id === billingPrinter?.id) printedAtBilling.add(ticket.ticket_id);
        } else {
          allRerouted = false;
        }
      }
      outcome.ok = allRerouted;
      if (!outcome.ok && stranded.length) outcome.error = `${outcome.error}; no fallback printer for ${stranded.join(", ")}`;
      if (outcome.ok) outcome.error = null;
    }

    report.outcomes.push(outcome);
  }

  // Billing-counter copies. Reprints are for the kitchen only.
  if (!opts.reprint && billingPrinter) {
    const wanted = settings.print_all_at_billing
      ? tickets
      : tickets.filter((t) => t.kot_counter_id != null && counters.get(t.kot_counter_id)?.print_billing_copy);
    const copies = wanted.filter((t) => !printedAtBilling.has(t.ticket_id));
    const errors: string[] = [];

    const printCopy = async (slipTickets: KotTicket[], consolidated: boolean) => {
      const result = await printWithRetry(billingPrinter, slipFor(billingPrinter, slipTickets, "Billing copy", consolidated));
      for (const t of slipTickets) {
        logs.push({
          ticket_id: t.ticket_id, printer_id: billingPrinter.id, printer_name: billingPrinter.printer_name,
          target: "billing", status: result.ok ? "success" : "failed", attempts: result.attempts, error: result.error,
        });
      }
      if (!result.ok) errors.push(result.error ?? "failed");
    };

    if (copies.length > 0) {
      if (settings.print_all_at_billing && settings.billing_copy_mode === "consolidated") {
        await printCopy(copies, true);
      } else {
        for (const t of copies) await printCopy([t], false);
      }
    }
    if (errors.length) report.billingError = `${billingPrinter.printer_name}: ${errors[0]}`;
  }

  report.failed = report.outcomes.filter((o) => !o.ok);
  if (logs.length) {
    try {
      await deps.log(logs);
    } catch {
      /* the print already happened; a lost log line must not read as a failed print */
    }
  }
  return report;
}

/** One line for a toast: which counters' tickets did not print. */
export function describeFailures(report: DispatchReport): string | null {
  if (report.failed.length === 0) return report.billingError ? `Billing copy not printed — ${report.billingError}` : null;
  const names = report.failed.map((f) => f.counter_name).join(", ");
  return `KOT not confirmed printed for ${names} — ${report.failed[0].error ?? "printer error"}`;
}
