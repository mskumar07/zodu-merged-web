import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { encodeSlip } from "@utils/kot/escpos";
import { bridgePrint } from "@utils/kot/printBridge";
import { describeFailures, dispatchKotBatch, resolveBillingPrinter, type DispatchOptions, type KotConfig } from "@utils/kot/kotDispatch";
import type { KotBatch, PaperSize, Slip } from "@utils/kot/kotTicket";
import { kotConfigQuery, postKotPrintLog, useKotConfig } from "@pages/MenuItemScreen/kotApi";

export interface KotPrintResult {
  /** A toast-ready problem, or null when everything printed (or nothing was configured). */
  error: string | null;
  /** The order the tickets belong to, so the caller can offer a reprint. */
  apiOrderId: string | null;
}

/** The `kot` / `kot_error` fields the add/update order endpoints return. */
export function kotFromOrderResponse(res: unknown): { kot: KotBatch | null; kotError: string | null } {
  const body = (res ?? {}) as { kot?: KotBatch | null; kot_error?: string | null };
  return { kot: body.kot ?? null, kotError: body.kot_error ?? null };
}

/**
 * Prints kitchen tickets through the local print bridge. The branch's KOT
 * config is kept warm by the query, and fetched on demand if a send beats it.
 */
export function useKotPrinting(zoduId: string, branchId: string, restaurantName: string) {
  const qc = useQueryClient();
  const { data: warmConfig } = useKotConfig(zoduId, branchId);

  const loadConfig = useCallback(async (): Promise<KotConfig | null> => {
    if (warmConfig) return warmConfig;
    try {
      return await qc.fetchQuery(kotConfigQuery(zoduId, branchId));
    } catch {
      return null;
    }
  }, [warmConfig, qc, zoduId, branchId]);

  const printBatch = useCallback(
    async (batch: KotBatch, opts: Omit<DispatchOptions, "restaurantName"> = {}): Promise<KotPrintResult> => {
      const config = await loadConfig();
      if (!config) return { error: null, apiOrderId: batch.api_order_id };
      try {
        const report = await dispatchKotBatch(batch, config, { restaurantName, ...opts }, {
          print: (printer, slip) => bridgePrint(printer, encodeSlip(slip, printer.cut_mode)),
          log: (entries) => postKotPrintLog(zoduId, branchId, entries),
        });
        return { error: describeFailures(report), apiOrderId: batch.api_order_id };
      } catch (err) {
        return { error: `KOT not printed — ${err instanceof Error ? err.message : "unknown error"}`, apiOrderId: batch.api_order_id };
      }
    },
    [loadConfig, restaurantName, zoduId, branchId],
  );

  /** Prints whatever tickets an add/update order response carries. */
  const printFromOrderResponse = useCallback(
    async (res: unknown): Promise<KotPrintResult> => {
      const { kot, kotError } = kotFromOrderResponse(res);
      if (kotError) return { error: `Kitchen tickets not created — ${kotError}`, apiOrderId: null };
      if (!kot || kot.tickets.length === 0) return { error: null, apiOrderId: null };
      return printBatch(kot);
    },
    [printBatch],
  );

  /**
   * Prints the bill on the branch's billing printer through the bridge, laid out
   * by `build` for that printer's roll. Resolves false when no billing printer is
   * set up, so the caller can fall back to the browser's print dialog; throws when
   * the printer is set up but printing failed.
   */
  const printBill = useCallback(
    async (build: (paper: PaperSize) => Slip): Promise<boolean> => {
      const config = await loadConfig();
      const printer = config ? resolveBillingPrinter(config) : null;
      if (!printer) return false;
      await bridgePrint(printer, encodeSlip(build(printer.paper_size), printer.cut_mode));
      return true;
    },
    [loadConfig],
  );

  return { config: warmConfig ?? null, printBatch, printFromOrderResponse, printBill };
}
