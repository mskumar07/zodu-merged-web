import React from "react";
import type { ThermalPaperSize } from "@pages/SalesHistory/ThermalInvoiceTemplate";

/**
 * The kitchen order ticket (KOT) printed with the bill — POS setting "Print KOT
 * with Bill". Drawn like the bill's thermal template (same font, weights and
 * roll widths) so both print in one job through the browser's print dialog.
 */

export interface KotPrintData {
  kotNo: string | number | null;
  orderNo: string | null;
  /** "Dine-In" | "Takeaway" | "Delivery". */
  orderType: string;
  tableNo: string | null;
  customerName: string | null;
  customerPhone: string | null;
  items: Array<{ name: string; variant: string | null; qty: number; note: string | null }>;
  printedAt: Date;
}

// Widths match the bill's template (96 px per inch), so both share the roll.
const PAPER: Record<ThermalPaperSize, { widthPx: number; fs: number; padding: string }> = {
  "2": { widthPx: 176, fs: 13, padding: "8px 3px 20px 3px" },
  "3": { widthPx: 268, fs: 14, padding: "10px 4px 24px 4px" },
  "4": { widthPx: 362, fs: 16.5, padding: "14px 8px 32px 8px" },
  "5": { widthPx: 453, fs: 17.5, padding: "16px 10px 36px 10px" },
};

const FONT = "Roboto, 'Courier New', Consolas, 'Liberation Mono', monospace";

const fmtQty = (n: number) => String(Number(n.toFixed(3)));

function kotLabel(kotNo: string | number | null): string {
  const n = parseInt(String(kotNo ?? "").replace(/\D+/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? `KOT #${n}` : "KOT";
}

function Rule({ solid }: { solid?: boolean }) {
  return <div style={{ borderBottom: `1px ${solid ? "solid" : "dashed"} #000`, margin: "5px 0" }} />;
}

function Row({ label, value, fontSize, strong }: { label: string; value: string; fontSize: number; strong?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, fontSize, lineHeight: 1.4, marginBottom: 2 }}>
      <span style={{ fontWeight: strong ? 600 : 400, overflowWrap: "normal" }}>{label}</span>
      <span style={{ fontWeight: 500, textAlign: "right", whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}

export const ThermalKotTemplate = React.forwardRef<HTMLDivElement, { data: KotPrintData; paperSize?: ThermalPaperSize }>(
  ({ data, paperSize = "3" }, ref) => {
    const cfg = PAPER[paperSize] ?? PAPER["3"];
    const fs = cfg.fs;
    const small = Math.max(fs - 2, 11);
    const totalQty = data.items.reduce((s, it) => s + (Number(it.qty) || 0), 0);
    const customer = data.customerName?.trim() && !/^walk-?in$/i.test(data.customerName.trim()) ? data.customerName.trim() : null;
    const date = data.printedAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const time = data.printedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    return (
      <div
        ref={ref}
        style={{
          width: `${cfg.widthPx}px`,
          padding: cfg.padding,
          background: "#fff",
          color: "#000",
          fontFamily: FONT,
          fontSize: fs,
          fontWeight: 400,
          lineHeight: 1.3,
          boxSizing: "border-box",
          overflowWrap: "break-word",
        }}
      >
        {/* ── HEADER ── the kitchen needs the ticket, not the shop's name */}
        <div style={{ textAlign: "center", fontSize: fs + 6, fontWeight: 700, letterSpacing: 1, margin: "2px 0" }}>
          KITCHEN ORDER
        </div>
        <Rule />

        {/* ── ORDER ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: fs + 3, fontWeight: 700, marginBottom: 2 }}>
          <span>{kotLabel(data.kotNo)}</span>
          <span>{data.orderType.toUpperCase()}</span>
        </div>
        {data.tableNo && <div style={{ fontSize: fs + 3, fontWeight: 700, marginBottom: 2 }}>TABLE: {data.tableNo}</div>}
        {data.orderNo && <Row label="Order No" value={data.orderNo} fontSize={fs} />}
        <Row label="Date" value={`${date} ${time}`} fontSize={fs} />
        {customer && <Row label="Customer" value={customer} fontSize={fs} />}
        {data.customerPhone?.trim() && data.orderType !== "Dine-In" && <Row label="Phone" value={data.customerPhone.trim()} fontSize={fs} />}

        {/* ── ITEMS ── */}
        <Rule />
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: fs }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", fontWeight: 500, fontSize: small, paddingBottom: 3, borderBottom: "1.5px solid #000" }}>Item</th>
              <th style={{ textAlign: "right", fontWeight: 500, fontSize: small, paddingBottom: 3, paddingLeft: 8, borderBottom: "1.5px solid #000", whiteSpace: "nowrap" }}>Qty</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((it, i) => (
              <tr key={i}>
                <td style={{ verticalAlign: "top", padding: "3px 0", wordBreak: "break-word" }}>
                  <div style={{ fontWeight: 500, lineHeight: 1.3 }}>{it.name}</div>
                  {it.variant && it.variant.trim().toLowerCase() !== it.name.trim().toLowerCase() && (
                    <div style={{ fontSize: small, lineHeight: 1.25 }}>{it.variant}</div>
                  )}
                  {it.note && <div style={{ fontSize: small, fontStyle: "italic", lineHeight: 1.25 }}>Note: {it.note}</div>}
                </td>
                <td style={{ verticalAlign: "top", padding: "3px 0 3px 8px", textAlign: "right", fontWeight: 700, fontSize: fs + 1, whiteSpace: "nowrap" }}>
                  {fmtQty(Number(it.qty) || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Rule solid />
        <Row label={`Items: ${data.items.length}`} value={`Total Qty: ${fmtQty(totalQty)}`} fontSize={fs} strong />
      </div>
    );
  },
);

ThermalKotTemplate.displayName = "ThermalKotTemplate";
