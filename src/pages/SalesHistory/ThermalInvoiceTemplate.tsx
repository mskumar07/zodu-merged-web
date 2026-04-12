import React from "react";
import { useAppSelector } from "@store/store";
import { getTenantContext } from "@store/tenantContext";

// ── Paper-size config ──────────────────────────────────────────────────────

export type ThermalPaperSize = "3" | "4" | "5";

interface PaperConfig {
  widthPx: number;
  /** @page size in mm for the print window */
  widthMm: number;
  baseFontSize: number;
  itemFontSize: number;
  headerFontSize: number;
  grandFontSize: number;
  /** padding: top right bottom left  — extra bottom so last line isn't cut */
  padding: string;
  /** grid columns for items table */
  gridCols: string;
  /** show GST% as a dedicated column (only for wider paper) */
  showGstCol: boolean;
}

const PAPER: Record<ThermalPaperSize, PaperConfig> = {
  "3": {
    widthPx: 302,
    widthMm: 80,
    baseFontSize: 11,
    itemFontSize: 11,
    headerFontSize: 15,
    grandFontSize: 13,
    padding: "12px 10px 28px 10px",
    gridCols: "1fr 24px 54px 56px",
    showGstCol: false,
  },
  "4": {
    widthPx: 404,
    widthMm: 104,
    baseFontSize: 12,
    itemFontSize: 12,
    headerFontSize: 17,
    grandFontSize: 14,
    padding: "14px 12px 32px 12px",
    gridCols: "1fr 28px 68px 72px",
    showGstCol: false,
  },
  "5": {
    widthPx: 504,
    widthMm: 130,
    baseFontSize: 13,
    itemFontSize: 13,
    headerFontSize: 19,
    grandFontSize: 15,
    padding: "16px 14px 36px 14px",
    gridCols: "1fr 32px 68px 34px 78px",
    showGstCol: true,
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────

/** Consolas / Lucida Console are bitmap-hinted monospace fonts — crisp on thermal dot-matrix heads */
const THERMAL_FONT = "'Consolas', 'Lucida Console', 'Courier New', monospace";

function fmt(v: number | string) {
  return `₹${Number(v).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function Dashes() {
  return (
    <div
      style={{
        borderBottom: "1px dashed #000",
        margin: "5px 0",
      }}
    />
  );
}

function SolidLine() {
  return (
    <div style={{ borderBottom: "1.5px solid #000", margin: "3px 0 4px" }} />
  );
}

function ReceiptRow({
  label,
  value,
  bold,
  large,
  fontSize,
}: {
  label: string;
  value: string;
  bold?: boolean;
  large?: boolean;
  fontSize: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        fontSize: large ? fontSize + 2 : fontSize,
        fontWeight: bold || large ? 700 : 400,
        marginBottom: 3,
        lineHeight: 1.45,
      }}
    >
      <span>{label}</span>
      <span style={{ textAlign: "right", marginLeft: 8 }}>{value}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export const ThermalInvoiceTemplate = React.forwardRef(
  (
    { data, paperSize = "3" }: { data: any; paperSize?: ThermalPaperSize },
    ref: any
  ) => {
    const { profile, company } = useAppSelector(getTenantContext);
    const cfg = PAPER[paperSize];

    const {
      sale_id,
      date,
      customer_name,
      customer_mobile,
      customer_gstin,
      items = [],
      subtotal,
      discount,
      discount_label,
      round_off,
      total,
      gst_breakdown = [],
    } = data;

    // ── Company info ──
    const addressParts = [
      company?.building_no,
      company?.area_street_name,
      company?.city,
      company?.district,
      company?.state,
      company?.pincode,
    ].filter(Boolean);
    const addressLine1 = addressParts.slice(0, 3).join(", ");
    const addressLine2 = addressParts.slice(3).join(", ");
    const companyName  = profile?.restaurant_name || "Your Company";
    const companyGstin = company?.gst_no  || "";
    const companyPhone = profile?.phone_number || "";

    // ── GST summary grouped by rate slab ──
    interface GstSlab {
      cgstRate: number;
      sgstRate: number;
      cgstAmount: number;
      sgstAmount: number;
    }
    const gstSlabMap: Record<number, GstSlab> = {};
    for (const row of gst_breakdown as any[]) {
      const rate = Number(row.cgstRate ?? 0);
      if (!gstSlabMap[rate]) {
        gstSlabMap[rate] = {
          cgstRate: rate,
          sgstRate: Number(row.sgstRate ?? 0),
          cgstAmount: 0,
          sgstAmount: 0,
        };
      }
      gstSlabMap[rate].cgstAmount += Number(row.cgstAmount ?? 0);
      gstSlabMap[rate].sgstAmount += Number(row.sgstAmount ?? 0);
    }

    const gstSlabList: GstSlab[] = Object.values(gstSlabMap);
    const multipleSlabs = gstSlabList.length > 1;
    const totalCgst     = gstSlabList.reduce((s, r) => s + r.cgstAmount, 0);
    const totalSgst     = gstSlabList.reduce((s, r) => s + r.sgstAmount, 0);

    const showDiscount = discount && Number(discount) > 0;
    const showRoundOff =
      round_off !== undefined && round_off !== null && Number(round_off) !== 0;
    const showCustomer =
      customer_name &&
      customer_name !== "Walk-In" &&
      customer_name !== "Walk-in";

    const fs  = cfg.baseFontSize;
    const ifs = cfg.itemFontSize;

    return (
      <div
        ref={ref}
        style={{
          width: `${cfg.widthPx}px`,
          padding: cfg.padding,
          background: "#fff",
          fontFamily: THERMAL_FONT,
          color: "#000",
          fontSize: `${fs}px`,
          boxSizing: "border-box",
          WebkitFontSmoothing: "antialiased" as any,
        }}
      >
        {/* ── HEADER ── */}
        <div style={{ textAlign: "center", marginBottom: 6 }}>
          <div
            style={{
              fontSize: cfg.headerFontSize,
              fontWeight: 800,
              letterSpacing: 0.5,
              marginBottom: 3,
            }}
          >
            {companyName.toUpperCase()}
          </div>
          {addressLine1 && (
            <div style={{ fontSize: fs - 1, lineHeight: 1.5 }}>{addressLine1}</div>
          )}
          {addressLine2 && (
            <div style={{ fontSize: fs - 1, lineHeight: 1.5 }}>{addressLine2}</div>
          )}
          {companyPhone && (
            <div style={{ fontSize: fs - 1, marginTop: 1 }}>Ph: {companyPhone}</div>
          )}
          {companyGstin && (
            <div style={{ fontSize: fs - 1, marginTop: 1 }}>GSTIN: {companyGstin}</div>
          )}
        </div>

        <Dashes />

        {/* ── INVOICE META (no Payment type) ── */}
        <div style={{ marginBottom: 4 }}>
          <ReceiptRow label="Receipt #" value={String(sale_id ?? "")} fontSize={fs} />
          <ReceiptRow label="Date"      value={String(date ?? "")}    fontSize={fs} />
        </div>

        {/* ── CUSTOMER ── */}
        {showCustomer && (
          <>
            <Dashes />
            <div style={{ fontSize: fs, marginBottom: 4 }}>
              <div style={{ fontWeight: 700, marginBottom: 1 }}>Customer</div>
              <div>{customer_name}</div>
              {customer_mobile && customer_mobile !== "-" && (
                <div>Mob: {customer_mobile}</div>
              )}
              {customer_gstin && customer_gstin !== "-" && (
                <div>GSTIN: {customer_gstin}</div>
              )}
            </div>
          </>
        )}

        <Dashes />

        {/* ── ITEMS TABLE HEADER ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: cfg.gridCols,
            fontSize: fs - 1,
            fontWeight: 700,
            marginBottom: 4,
            gap: "0 4px",
          }}
        >
          <span>ITEM</span>
          <span style={{ textAlign: "center" }}>QTY</span>
          <span style={{ textAlign: "right" }}>RATE</span>
          {cfg.showGstCol && <span style={{ textAlign: "center" }}>GST</span>}
          <span style={{ textAlign: "right" }}>TOTAL</span>
        </div>

        <SolidLine />

        {/* ── ITEMS ── */}
        {items.map((item: any, i: number) => (
          <div key={i} style={{ marginBottom: 6 }}>
            {/* main row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: cfg.gridCols,
                fontSize: ifs,
                gap: "0 4px",
                alignItems: "start",
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  wordBreak: "break-word",
                  lineHeight: 1.4,
                }}
              >
                {item.name}
              </span>
              <span style={{ textAlign: "center", paddingTop: 1 }}>
                {item.qty}
              </span>
              <span style={{ textAlign: "right", paddingTop: 1 }}>
                {fmt(item.rate)}
              </span>
              {cfg.showGstCol && (
                <span style={{ textAlign: "center", paddingTop: 1 }}>
                  {item.tax ? `${Number(item.tax).toFixed(0)}%` : "-"}
                </span>
              )}
              <span style={{ textAlign: "right", fontWeight: 700, paddingTop: 1 }}>
                {fmt(item.total)}
              </span>
            </div>

            {/* Item ID sub-row only (no HSN) */}
            {item.item_id && (
              <div
                style={{
                  fontSize: fs - 2,
                  color: "#444",
                  paddingLeft: 1,
                  marginTop: 1,
                  lineHeight: 1.3,
                }}
              >
                ID: {item.item_id}
              </div>
            )}
          </div>
        ))}

        <SolidLine />

        {/* ── SUBTOTAL & DISCOUNT ── */}
        <ReceiptRow label="Subtotal" value={fmt(subtotal)} fontSize={fs} />
        {showDiscount && (
          <ReceiptRow
            label={discount_label ?? "Discount"}
            value={`-${fmt(discount)}`}
            fontSize={fs}
          />
        )}

        <Dashes />

        {/* ── GST BREAKDOWN per slab (before Grand Total) ── */}
        {gstSlabList.length > 0 && (
          <>
            {gstSlabList.map((slab, i) => (
              <React.Fragment key={i}>
                <ReceiptRow
                  label={`CGST @${slab.cgstRate}%`}
                  value={fmt(slab.cgstAmount)}
                  fontSize={fs}
                />
                <ReceiptRow
                  label={`SGST @${slab.sgstRate}%`}
                  value={fmt(slab.sgstAmount)}
                  fontSize={fs}
                />
                {multipleSlabs && i < gstSlabList.length - 1 && (
                  <div style={{ marginBottom: 4 }} />
                )}
              </React.Fragment>
            ))}

            {multipleSlabs && (
              <>
                <Dashes />
                <ReceiptRow label="Total CGST" value={fmt(totalCgst)} bold fontSize={fs} />
                <ReceiptRow label="Total SGST" value={fmt(totalSgst)} bold fontSize={fs} />
              </>
            )}

            {showRoundOff && (
              <ReceiptRow
                label="Round Off"
                value={Number(round_off) > 0 ? `+${fmt(round_off)}` : fmt(round_off)}
                fontSize={fs}
              />
            )}

            <Dashes />
          </>
        )}

        {/* ── GRAND TOTAL ── */}
        <ReceiptRow
          label="GRAND TOTAL"
          value={fmt(total)}
          large
          bold
          fontSize={cfg.grandFontSize}
        />

        <Dashes />

        {/* ── FOOTER ── */}
        <div
          style={{
            textAlign: "center",
            marginTop: 10,
            paddingBottom: 4,
            fontSize: ifs,
          }}
        >
          <div style={{ fontWeight: 700, letterSpacing: 0.3 }}>
            THANK YOU FOR SHOPPING!
          </div>
          <div style={{ marginTop: 3, fontSize: fs - 1 }}>Please visit again</div>
        </div>
      </div>
    );
  }
);

ThermalInvoiceTemplate.displayName = "ThermalInvoiceTemplate";
