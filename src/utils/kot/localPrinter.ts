/**
 * Which printer a bill goes to — preferring the receipt printer plugged into the
 * PC this browser runs on.
 *
 * The print bridge runs on the same PC as the browser, so the printers it lists
 * are the ones connected to this device. Two billing counters in one restaurant
 * each print on their own printer, whatever the branch's shared settings name.
 */

import type { CutMode } from "./escpos";
import { resolveBillPrinter, type KotConfig, type KotPrinter } from "./kotDispatch";
import type { PaperSize } from "./kotTicket";
import { bridgeSystemPrinters, type BridgePrinter } from "./printBridge";

export interface BillPrinter extends BridgePrinter {
  printer_name: string;
  paper_size: PaperSize;
  cut_mode: CutMode;
}

// Windows installs these on every PC; none of them is paper on the counter.
const NOT_RECEIPT = /pdf|xps|onenote|fax|send to|anydesk|snagit|adobe|document writer/i;
const RECEIPT = /pos|thermal|receipt|xprinter|tvs|rugtek|posiflex|bixolon|epson tm|\btm-|\brp\d|\bxp-|\b(58|80)\s*mm|\b58\b|\b80\b|-58|-80|star|citizen|sewoo|hoin|gprinter|generic \/ text/i;

/** The roll a printer takes, read from its name — "POS-58-Series" is a 58 mm (2") printer. */
export function paperFromPrinterName(name: string): PaperSize {
  if (/58|\b2\s*("|inch|in\b)/i.test(name)) return "2";
  if (/112|120|\b(4|5)\s*("|inch|in\b)/i.test(name)) return "5";
  return "3";
}

/** Installed printers on this PC that look like receipt printers, most likely first. */
export function receiptPrintersIn(names: string[]): string[] {
  return names.filter((n) => n && !NOT_RECEIPT.test(n) && RECEIPT.test(n));
}

// Get-Printer takes a second or so; a bill printed moments ago needn't ask again.
const LOCAL_TTL_MS = 60 * 1000;
let localCache: { at: number; names: string[] } | null = null;

/** Receipt printers connected to this PC, through the bridge — [] when the bridge isn't running. */
export async function localReceiptPrinters(): Promise<string[]> {
  if (localCache && Date.now() - localCache.at < LOCAL_TTL_MS) return localCache.names;
  try {
    const names = receiptPrintersIn(await bridgeSystemPrinters());
    localCache = { at: Date.now(), names };
    return names;
  } catch {
    return [];
  }
}

const sameName = (a: string | null, b: string) => !!a && a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * The printer for a bill, in order:
 *   1. the branch's billing printer, when it is connected to this PC
 *   2. any printer set up in Printer Settings that is connected to this PC (billing roles first)
 *   3. a receipt printer connected to this PC that isn't in Printer Settings
 *   4. the branch's billing printer elsewhere (a LAN printer)
 * Null when none of these exist.
 */
export function pickBillPrinter(config: KotConfig | null, local: string[]): BillPrinter | null {
  const onThisPc = (p: KotPrinter) => p.connection_type !== "LAN" && local.some((n) => sameName(p.device_name, n));
  const configured = config ? resolveBillPrinter(config) : null;
  if (configured && onThisPc(configured)) return configured;

  const rank = (p: KotPrinter) => (p.role === "billing" ? 0 : p.role === "both" ? 1 : 2);
  const localConfigured = (config?.printers ?? []).filter((p) => p.active && onThisPc(p)).sort((a, b) => rank(a) - rank(b))[0];
  if (localConfigured) return localConfigured;

  if (local.length > 0) {
    return {
      printer_name: local[0],
      connection_type: "USB",
      ip_address: null,
      port: null,
      device_name: local[0],
      paper_size: paperFromPrinterName(local[0]),
      cut_mode: "partial",
    };
  }
  return configured;
}
