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
  "2": { widthPx: 176, fs: 13, padding: "4px 3px 8px 3px" },
  "3": { widthPx: 268, fs: 14, padding: "6px 4px 10px 4px" },
  "4": { widthPx: 362, fs: 16.5, padding: "8px 8px 12px 8px" },
  "5": { widthPx: 453, fs: 17.5, padding: "8px 10px 14px 10px" },
};

const FONT = "Roboto, 'Courier New', Consolas, 'Liberation Mono', monospace";

const fmtQty = (n: number) => String(Number(n.toFixed(3)));

function kotLabel(kotNo: string | number | null): string {
  const n = parseInt(String(kotNo ?? "").replace(/\D+/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? `KOT #${n}` : "KOT";
}

function Rule() {
  return <div style={{ borderBottom: `1px dashed #000`, margin: "4px 0" }} />;
}

function Row({ label, value, fontSize }: { label: string; value: string; fontSize: number }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, fontSize, lineHeight: 1.3 }}>
      <span style={{ fontWeight: 400, overflowWrap: "normal" }}>{label}</span>
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
    const date = data.printedAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
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
        {/* ── HEADER ── KOT number left; table (dine-in) or order type right */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, fontSize: fs + 4, fontWeight: 700, lineHeight: 1.2 }}>
          <span style={{ whiteSpace: "nowrap" }}>{kotLabel(data.kotNo)}</span>
          <span style={{ textAlign: "right" }}>{data.tableNo ? `TABLE ${data.tableNo}` : data.orderType.toUpperCase()}</span>
        </div>
        <Row label={data.orderNo ?? ""} value={`${date} ${time}`} fontSize={small} />
        {(customer || data.customerPhone?.trim()) && (
          <div style={{ fontSize: small, lineHeight: 1.3 }}>
            {[customer, data.orderType !== "Dine-In" ? data.customerPhone?.trim() : null].filter(Boolean).join(" · ")}
          </div>
        )}

        {/* ── ITEMS ── one line each: "1 x Jeera Rice" */}
        <Rule />
        {data.items.map((it, i) => (
          <div key={i} style={{ display: "flex", gap: "0.6em", lineHeight: 1.3, marginBottom: 1 }}>
            <span style={{ fontWeight: 700, fontSize: fs + 1, whiteSpace: "nowrap" }}>{fmtQty(Number(it.qty) || 0)} x</span>
            {/* Name, variant and note share one column, so wrapped lines stay aligned under the name */}
            <div style={{ flex: 1, minWidth: 0, wordBreak: "break-word" }}>
              <div style={{ fontWeight: 700, fontSize: fs + 1 }}>{it.name}</div>
              {it.variant && it.variant.trim().toLowerCase() !== it.name.trim().toLowerCase() && (
                <div style={{ fontSize: small, lineHeight: 1.2 }}>{it.variant}</div>
              )}
              {it.note && <div style={{ fontSize: small, fontStyle: "italic", lineHeight: 1.2 }}>Note: {it.note}</div>}
            </div>
          </div>
        ))}
        <Rule />
        <Row label={`Items: ${data.items.length}`} value={`Total Qty: ${fmtQty(totalQty)}`} fontSize={fs} />
      </div>
    );
  },
);

ThermalKotTemplate.displayName = "ThermalKotTemplate";
