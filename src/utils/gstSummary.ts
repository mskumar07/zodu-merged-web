/**
 * CGST/SGST rows for an invoice's totals box.
 *
 * A bill whose items sit on different GST slabs — say a 5% machine and an 18%
 * filter — cannot state one CGST figure, because the rate belongs on the line
 * that carries the amount. So the HSN-wise breakdown is regrouped by slab: one
 * CGST and one SGST row per rate, each labelled with its own percentage. A
 * single-slab bill collapses back to the familiar two rows, still carrying the
 * rate.
 */
export interface GstSummaryRow {
  label: string;
  amount: number;
}

interface GstSlabTotal {
  cgstRate: number;
  sgstRate: number;
  cgst: number;
  sgst: number;
}

/** "2.5" from 2.50 and "18" from 18.00 — trailing zeros read as noise here. */
function formatRate(rate: number): string {
  return String(Number(rate.toFixed(2)));
}

/**
 * `gstBreakdown` is the HSN-wise list the templates already receive; several
 * HSN codes can share a slab, so they are summed per rate. `cgstTotal` and
 * `sgstTotal` are the sale's own totals, used only when the breakdown is
 * missing or carries no tax at all.
 */
export function gstSummaryRows(
  gstBreakdown: any[] | undefined,
  cgstTotal: unknown,
  sgstTotal: unknown,
): GstSummaryRow[] {
  const slabs = new Map<string, GstSlabTotal>();

  for (const row of gstBreakdown ?? []) {
    const cgstRate = Number(row?.cgstRate ?? 0);
    const sgstRate = Number(row?.sgstRate ?? 0);
    if (!Number.isFinite(cgstRate) || !Number.isFinite(sgstRate)) continue;

    const key = `${cgstRate}|${sgstRate}`;
    const slab = slabs.get(key) ?? { cgstRate, sgstRate, cgst: 0, sgst: 0 };
    slab.cgst += Number(row?.cgstAmount ?? 0) || 0;
    slab.sgst += Number(row?.sgstAmount ?? 0) || 0;
    slabs.set(key, slab);
  }

  // Exempt lines carry a 0% slab with nothing in it; they belong in the
  // HSN-wise table, not as an empty "CGST (0%)" row in the totals.
  const taxed = Array.from(slabs.values()).filter(
    (slab) => slab.cgstRate > 0 || slab.sgstRate > 0 || slab.cgst !== 0 || slab.sgst !== 0,
  );

  // No usable breakdown — an older record, or a bill with no tax at all — so
  // fall back to the single pair of totals the sale carries.
  if (taxed.length === 0) {
    return [
      { label: "CGST", amount: Number(cgstTotal ?? 0) || 0 },
      { label: "SGST", amount: Number(sgstTotal ?? 0) || 0 },
    ];
  }

  return taxed
    .sort((a, b) => a.cgstRate - b.cgstRate || a.sgstRate - b.sgstRate)
    .flatMap((slab) => [
      { label: `CGST (${formatRate(slab.cgstRate)}%)`, amount: slab.cgst },
      { label: `SGST (${formatRate(slab.sgstRate)}%)`, amount: slab.sgst },
    ]);
}
