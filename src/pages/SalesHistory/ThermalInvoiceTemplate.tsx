//  import React from "react";
// import { useAppSelector } from "@store/store";
// import { useTenantContext } from "@store/tenantContext";
// import { AllCompanies } from "@store/slices/userSlice";

// // ── Paper-size config ──────────────────────────────────────────────────────

// export type ThermalPaperSize = "3" | "4" | "5";

// interface PaperConfig {
//   widthPx: number;
//   /** @page size in mm for the print window */
//   widthMm: number;
//   baseFontSize: number;
//   itemFontSize: number;
//   headerFontSize: number;
//   grandFontSize: number;
//   /** padding: top right bottom left  — extra bottom so last line isn't cut */
//   padding: string;
//   /** grid columns for items table */
//   gridCols: string;
//   /** show GST% as a dedicated column (only for wider paper) */
//   showGstCol: boolean;
// }

// const PAPER: Record<ThermalPaperSize, PaperConfig> = {
//   // 3" = 80 mm roll; most printers have ~4 mm hardware margin on each side → 72 mm printable
//   "3": {
//     widthPx: 272,          // 72 mm × (96 px/in ÷ 25.4 mm/in) ≈ 272 px
//     widthMm: 72,           // actual printable width (was 80 — caused right-side clipping)
//     baseFontSize: 13,
//     itemFontSize: 13,
//     headerFontSize: 16,
//     grandFontSize: 15,
//     padding: "10px 4px 24px 4px",    // narrow side padding to maximize usable width
//     gridCols: "1fr 24px 62px 66px",  // wider RATE+TOTAL cols so amounts aren't clipped
//     showGstCol: false,
//   },
//   // 4" = 104 mm roll; ~8 mm total margins → 96 mm printable
//   "4": {
//     widthPx: 362,          // 96 mm ≈ 362 px
//     widthMm: 96,           // printable width (was 104)
//     baseFontSize: 15,
//     itemFontSize: 15,
//     headerFontSize: 19,
//     grandFontSize: 17,
//     padding: "14px 8px 32px 8px",
//     gridCols: "1fr 28px 68px 72px",
//     showGstCol: false,
//   },
//   // 5" = 130 mm roll; ~10 mm total margins → 120 mm printable
//   "5": {
//     widthPx: 453,          // 120 mm ≈ 453 px
//     widthMm: 120,          // printable width (was 130)
//     baseFontSize: 16,
//     itemFontSize: 16,
//     headerFontSize: 22,
//     grandFontSize: 19,
//     padding: "16px 10px 36px 10px",
//     gridCols: "1fr 32px 72px 36px 84px",
//     showGstCol: true,
//   },
// };

// // ── Helpers ────────────────────────────────────────────────────────────────

// /** Consolas / Lucida Console are bitmap-hinted monospace fonts — crisp on thermal dot-matrix heads */
// const THERMAL_FONT = "'Courier New','Consolas', 'Lucida Console',  monospace";

// function fmt(v: number | string) {
//   return `₹${Number(v).toLocaleString("en-IN", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   })}`;
// }

// function Dashes() {
//   return (
//     <div
//       style={{
//         borderBottom: "1px dashed #000",
//         margin: "5px 0",
//       }}
//     />
//   );
// }

// function SolidLine() {
//   return (
//     <div style={{ borderBottom: "1.5px solid #000", margin: "3px 0 4px" }} />
//   );
// }

// function ReceiptRow({
//   label,
//   value,
//   bold,
//   large,
//   fontSize,
// }: {
//   label: string;
//   value: string;
//   bold?: boolean;
//   large?: boolean;
//   fontSize: number;
// }) {
//   return (
//     <div
//       style={{
//         display: "flex",
//         justifyContent: "space-between",
//         alignItems: "baseline",
//         fontSize: large ? fontSize + 2 : fontSize,
//         fontWeight: bold || large ? 700 : 600,
//         marginBottom: 3,
//         lineHeight: 1.45,
//       }}
//     >
//       <span>{label}</span>
//       <span style={{ textAlign: "right", marginLeft: 8 }}>{value}</span>
//     </div>
//   );
// }

// // ── Main component ─────────────────────────────────────────────────────────

// export const ThermalInvoiceTemplate = React.forwardRef(
//   (
//     { data, paperSize = "3" }: { data: any; paperSize?: ThermalPaperSize },
//     ref: any
//   ) => {
//     const { profile, company, zoduId } = useTenantContext();
//     const companies = useAppSelector(AllCompanies);
//     const selectedCompany = companies.find(c => c.zodu_id === zoduId);
//     const cfg = PAPER[paperSize];

//     const {
//       sale_id,
//       date,
//       customer_name,
//       customer_mobile,
//       customer_gstin,
//       items = [],
//       subtotal,
//       discount,
//       discount_label,
//       round_off,
//       total,
//       gst_breakdown = [],
//     } = data;

//     // ── Company info ──
//     const addressParts = [
//       selectedCompany?.area_street_name || company?.address_line_1,
//       selectedCompany?.building_no || company?.address_line_2,
//       company?.city || selectedCompany?.city,
//       company?.district || selectedCompany?.district,
//       company?.state || selectedCompany?.state,
//       company?.pincode || selectedCompany?.pincode,
//     ].filter(Boolean);
//     const addressLine1 = addressParts.slice(0, 3).join(", ");
//     const addressLine2 = addressParts.slice(3).join(", ");
//     const companyName  = selectedCompany?.restaurant_name || selectedCompany?.business_name || selectedCompany?.store_name || selectedCompany?.company_name || profile?.restaurant_name || "Your Company";
//     const companyGstin = company?.gst_no || selectedCompany?.gst_no || "";
//     const companyPhone = profile?.phone_number || selectedCompany?.phone_number || selectedCompany?.mobile_no || "";

//     // ── GST summary grouped by rate slab ──
//     interface GstSlab {
//       cgstRate: number;
//       sgstRate: number;
//       cgstAmount: number;
//       sgstAmount: number;
//     }
//     const gstSlabMap: Record<number, GstSlab> = {};
//     for (const row of gst_breakdown as any[]) {
//       const rate = Number(row.cgstRate ?? 0);
//       if (!gstSlabMap[rate]) {
//         gstSlabMap[rate] = {
//           cgstRate: rate,
//           sgstRate: Number(row.sgstRate ?? 0),
//           cgstAmount: 0,
//           sgstAmount: 0,
//         };
//       }
//       gstSlabMap[rate].cgstAmount += Number(row.cgstAmount ?? 0);
//       gstSlabMap[rate].sgstAmount += Number(row.sgstAmount ?? 0);
//     }

//     const gstSlabList: GstSlab[] = Object.values(gstSlabMap);
//     const multipleSlabs = gstSlabList.length > 1;
//     const totalCgst     = gstSlabList.reduce((s, r) => s + r.cgstAmount, 0);
//     const totalSgst     = gstSlabList.reduce((s, r) => s + r.sgstAmount, 0);

//     const showDiscount = discount && Number(discount) > 0;
//     const showRoundOff =
//       round_off !== undefined && round_off !== null && Number(round_off) !== 0;
//     const showCustomer =
//       customer_name &&
//       customer_name !== "Walk-In" &&
//       customer_name !== "Walk-in";

//     const fs  = cfg.baseFontSize;
//     const ifs = cfg.itemFontSize;

//     return (
//       <div
//         ref={ref}
//         style={{
//           width: `${cfg.widthPx}px`,
//           padding: cfg.padding,
//           background: "#fff",
//           fontFamily: THERMAL_FONT,
//           color: "#000",
//           fontSize: `${fs}px`,
//           fontWeight: 600,
//           boxSizing: "border-box",
//           WebkitFontSmoothing: "antialiased" as any,
//         }}
//       >
//         {/* ── HEADER ── */}
//         <div style={{ textAlign: "center", marginBottom: 6 }}>
//           <div
//             style={{
//               fontSize: cfg.headerFontSize,
//               fontWeight: 700,
//               letterSpacing: 0.5,
//               marginBottom: 3,
//             }}
//           >
//             {companyName.toUpperCase()}
//           </div>
//           {addressLine1 && (
//             <div style={{ fontSize: fs - 1, lineHeight: 1.5 }}>{addressLine1}</div>
//           )}
//           {addressLine2 && (
//             <div style={{ fontSize: fs - 1, lineHeight: 1.5 }}>{addressLine2}</div>
//           )}
//           {companyPhone && (
//             <div style={{ fontSize: fs - 1, marginTop: 1 }}>Ph: {companyPhone}</div>
//           )}
//           {companyGstin && (
//             <div style={{ fontSize: fs - 1, marginTop: 1 }}>GSTIN: {companyGstin}</div>
//           )}
//         </div>

//         <Dashes tight={compact} />

//         {/* ── INVOICE META (no Payment type) ── */}
//         <div style={{ marginBottom: 4 }}>
//           <ReceiptRow label="Receipt #" value={String(sale_id ?? "")} fontSize={fs} />
//           <ReceiptRow label="Date"      value={String(date ?? "")}    fontSize={fs} />
//         </div>

//         {/* ── CUSTOMER ── */}
//         {showCustomer && (
//           <>
//             <Dashes tight={compact} />
//             <div style={{ fontSize: fs, marginBottom: 4 }}>
//               <div style={{ fontWeight: 600, marginBottom: 1 }}>Customer</div>
//               <div>{customer_name}</div>
//               {customer_mobile && customer_mobile !== "-" && (
//                 <div>Mob: {customer_mobile}</div>
//               )}
//               {customer_gstin && customer_gstin !== "-" && (
//                 <div>GSTIN: {customer_gstin}</div>
//               )}
//             </div>
//           </>
//         )}

//         <Dashes tight={compact} />

//         {/* ── ITEMS TABLE HEADER ── */}
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: cfg.gridCols,
//             fontSize: fs - 1,
//             fontWeight: 600,
//             marginBottom: 4,
//             gap: "0 4px",
//           }}
//         >
//           <span>ITEM</span>
//           <span style={{ textAlign: "center" }}>QTY</span>
//           <span style={{ textAlign: "right" }}>RATE</span>
//           {cfg.showGstCol && <span style={{ textAlign: "center" }}>GST</span>}
//           <span style={{ textAlign: "right" }}>TOTAL</span>
//         </div>

//         <SolidLine tight={compact} />

//         {/* ── ITEMS ── */}
//         {items.map((item: any, i: number) => (
//           <div key={i} style={{ marginBottom: 6 }}>
//             {/* main row */}
//             <div
//               style={{
//                 display: "grid",
//                 gridTemplateColumns: cfg.gridCols,
//                 fontSize: ifs,
//                 gap: "0 4px",
//                 alignItems: "start",
//               }}
//             >
//               <span
//                 style={{
//                   fontWeight: 600,
//                   wordBreak: "break-word",
//                   lineHeight: 1.4,
//                 }}
//               >
//                 {item.name}
//               </span>
//               <span style={{ textAlign: "center", fontWeight: 600, paddingTop: 1 }}>
//                 {item.qty}
//               </span>
//               <span style={{ textAlign: "right", fontWeight: 600, paddingTop: 1 }}>
//                 {fmt(item.rate)}
//               </span>
//               {cfg.showGstCol && (
//                 <span style={{ textAlign: "center", fontWeight: 600, paddingTop: 1 }}>
//                   {item.tax ? `${Number(item.tax).toFixed(0)}%` : "-"}
//                 </span>
//               )}
//               <span style={{ textAlign: "right", fontWeight: 600, paddingTop: 1 }}>
//                 {fmt(item.total)}
//               </span>
//             </div>

//             {/* Item ID sub-row only (no HSN) */}
//             {item.item_id && (
//               <div
//                 style={{
//                   fontSize: fs - 1,
//                   fontWeight: 600,
//                   color: "#000",
//                   paddingLeft: 1,
//                   marginTop: 1,
//                   lineHeight: 1.3,
//                 }}
//               >
//                 ID: {item.item_id}
//               </div>
//             )}
//           </div>
//         ))}

//         <SolidLine tight={compact} />

//         {/* ── SUBTOTAL & DISCOUNT ── */}
//         <ReceiptRow label="Subtotal" value={fmt(subtotal)} fontSize={fs} />
//         {showDiscount && (
//           <ReceiptRow
//             label={discount_label ?? "Discount"}
//             value={`-${fmt(discount)}`}
//             fontSize={fs}
//           />
//         )}

//         <Dashes tight={compact} />

//         {/* ── GST BREAKDOWN per slab (before Grand Total) ── */}
//         {gstSlabList.length > 0 && (
//           <>
//             {gstSlabList.map((slab, i) => (
//               <React.Fragment key={i}>
//                 <ReceiptRow
//                   label={`CGST @${slab.cgstRate}%`}
//                   value={fmt(slab.cgstAmount)}
//                   fontSize={fs}
//                 />
//                 <ReceiptRow
//                   label={`SGST @${slab.sgstRate}%`}
//                   value={fmt(slab.sgstAmount)}
//                   fontSize={fs}
//                 />
//                 {multipleSlabs && i < gstSlabList.length - 1 && (
//                   <div style={{ marginBottom: 4 }} />
//                 )}
//               </React.Fragment>
//             ))}

//             {multipleSlabs && (
//               <>
//                 <Dashes tight={compact} />
//                 <ReceiptRow label="Total CGST" value={fmt(totalCgst)} bold fontSize={fs} />
//                 <ReceiptRow label="Total SGST" value={fmt(totalSgst)} bold fontSize={fs} />
//               </>
//             )}

//             {showRoundOff && (
//               <ReceiptRow
//                 label="Round Off"
//                 value={Number(round_off) > 0 ? `+${fmt(round_off)}` : fmt(round_off)}
//                 fontSize={fs}
//               />
//             )}

//             <Dashes tight={compact} />
//           </>
//         )}

//         {/* ── GRAND TOTAL ── */}
//         <ReceiptRow
//           label="GRAND TOTAL"
//           value={fmt(total)}
//           large
//           bold
//           fontSize={cfg.grandFontSize}
//         />

//         <Dashes tight={compact} />

//         {/* ── FOOTER ── */}
//         <div
//           style={{
//             textAlign: "center",
//             marginTop: 10,
//             paddingBottom: 4,
//             fontSize: ifs,
//           }}
//         >
//           <div style={{ fontWeight: 600, letterSpacing: 0.3 }}>
//             THANK YOU FOR SHOPPING!
//           </div>
//           <div style={{ marginTop: 3, fontSize: fs - 1 }}>Please visit again</div>
//         </div>
//       </div>
//     );
//   }
// );

// ThermalInvoiceTemplate.displayName = "ThermalInvoiceTemplate";
import React from "react";
import { useAppSelector } from "@store/store";
import { useTenantContext } from "@store/tenantContext";
import { AllCompanies, InvoiceSettingsData } from "@store/slices/userSlice";
import type { InvoiceSettings as ThermalInvoiceSettings } from "@pages/auth/Authapi";
import { saleDocumentLabel } from "@utils/saleType";
import { normalizeInvoiceCopyTypes } from "@utils/invoiceCopyTypes";
import { toThermalTemplate, type ThermalTemplate } from "@utils/thermalTemplate";

// ── Paper sizes ────────────────────────────────────────────────────────────
// Two layouts (Classic / Modern — see @utils/thermalTemplate), each drawn for every width.

export type ThermalPaperSize = "2" | "3" | "4" | "5";

interface PaperConfig {
  /** The head's printable band at 96 px/in, so every px size below is a physical size on the roll. */
  widthPx: number;
  widthMm: number;
  baseFontSize: number;
  headerFontSize: number;
  grandFontSize: number;
  /** Nothing prints smaller — under ~3 mm a thermal head's dots stop reading as letters. */
  minFontSize: number;
  padding: string;
  /** Room for full column headings ("Particulars", "Amount"); the 3" roll uses short ones. */
  wide: boolean;
}

// 14 px on the 72 mm band is ≈3.7 mm — a touch above a thermal printer's own Font A,
// which reads better on the head than matching it exactly.
// The 2" roll is drawn at its own width rather than shrunk from the 3" layout,
// which printed everything a third smaller than the printer's own type.
const PAPER: Record<ThermalPaperSize, PaperConfig> = {
  "2": { widthPx: 181, widthMm: 48, baseFontSize: 13, headerFontSize: 15, grandFontSize: 15, minFontSize: 11, padding: "8px 2px 20px 2px", wide: false },
  "3": { widthPx: 272, widthMm: 72, baseFontSize: 14, headerFontSize: 17, grandFontSize: 17, minFontSize: 12, padding: "10px 4px 24px 4px", wide: false },
  "4": { widthPx: 362, widthMm: 96, baseFontSize: 16.5, headerFontSize: 20.5, grandFontSize: 19.5, minFontSize: 13.5, padding: "14px 8px 32px 8px", wide: true },
  "5": { widthPx: 453, widthMm: 120, baseFontSize: 17.5, headerFontSize: 23.5, grandFontSize: 21.5, minFontSize: 14.5, padding: "16px 10px 36px 10px", wide: true },
};

// ── Helpers ────────────────────────────────────────────────────────────────

// Black on white only, in both templates: a head can't print grey, so a grey
// comes out dithered on one printer and missing on the next.
const THERMAL_FONT = "Roboto, 'Courier New', Consolas, 'Liberation Mono', monospace";
const CLASSIC_FONT = THERMAL_FONT;
const MODERN_FONT = THERMAL_FONT;

/** Whole rupees with no thousands separators — the receipt prints no paise. `|| 0` also
 * folds the -0 that Math.round gives for small negatives (e.g. a -0.40 round-off) into 0. */
function fmt(v: number | string | undefined) {
  const rupees = Math.round(Number(v)) || 0;
  return `₹${rupees}`;
}

/** 2 from "2.000", 1.5 from "1.500" — quantities arrive as fixed-scale
 * decimals, and the trailing zeros are just noise on the roll. */
function fmtQty(v: number | string | undefined) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? String(Number(n.toFixed(3))) : String(v ?? "");
}

/** The item fields the receipt prints — sales, quotations and restaurant bills all carry these. */
type ReceiptItem = {
  name?: string;
  qty?: number | string;
  rate?: number | string;
  total?: number | string;
  item_id?: string;
  description?: string;
  variant_name?: string;
};

function Rule({ solid, weight = 1, tight }: { solid?: boolean; weight?: number; tight?: boolean }) {
  return (
    <div
      style={{
        borderBottom: `${weight}px ${solid ? "solid" : "dashed"} #000`,
        margin: tight ? "2px 0" : "5px 0",
      }}
    />
  );
}

/** Label left, amount right. The label wraps; the amount never does, so it can't be pushed off the roll. */
function ReceiptRow({
  label,
  value,
  fontSize,
  tight,
  labelWeight,
  valueWeight,
}: {
  label: string;
  value: string;
  fontSize: number;
  tight?: boolean;
  labelWeight: number;
  valueWeight: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 8,
        fontSize,
        marginBottom: tight ? 1 : 3,
        lineHeight: tight ? 1.15 : 1.4,
      }}
    >
      <span style={{ minWidth: 0, fontWeight: labelWeight }}>{label}</span>
      <span style={{ textAlign: "right", whiteSpace: "nowrap", fontWeight: valueWeight }}>{value}</span>
    </div>
  );
}

const LOGO_SCAN_MAX_PX = 800;   // the blank-margin scan runs on a copy no larger than this

/**
 * The logo with its blank margin trimmed off (transparent or near-white edge
 * rows/columns), plus the trimmed artwork's width:height ratio. Uploaded logos
 * often carry a wide empty border, which printed as a gap under the logo and
 * made the artwork itself come out small. Null until the file has loaded; the
 * untrimmed file is kept when it can't be read back (served without CORS
 * headers) or has no margin to trim.
 */
function useTrimmedLogo(src: string): { src: string; ratio: number } | null {
  const [logo, setLogo] = React.useState<{ src: string; ratio: number } | null>(null);

  React.useEffect(() => {
    setLogo(null);
    if (!src) return;
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      const { naturalWidth: w, naturalHeight: h } = img;
      if (!w || !h) return;
      let result = { src, ratio: w / h };
      try {
        // Find the artwork's bounds on a scaled-down copy, then crop the full-size file.
        const s = Math.min(1, LOGO_SCAN_MAX_PX / Math.max(w, h));
        const sw = Math.max(1, Math.round(w * s));
        const sh = Math.max(1, Math.round(h * s));
        const scan = document.createElement("canvas");
        scan.width = sw;
        scan.height = sh;
        const scanCtx = scan.getContext("2d");
        if (!scanCtx) throw new Error("no 2d context");
        scanCtx.drawImage(img, 0, 0, sw, sh);
        const px = scanCtx.getImageData(0, 0, sw, sh).data; // throws on a tainted canvas
        let left = sw, top = sh, right = -1, bottom = -1;
        for (let y = 0; y < sh; y++) {
          for (let x = 0; x < sw; x++) {
            const i = (y * sw + x) * 4;
            if (px[i + 3] > 16 && (px[i] < 240 || px[i + 1] < 240 || px[i + 2] < 240)) {
              if (x < left) left = x;
              if (x > right) right = x;
              if (y < top) top = y;
              if (y > bottom) bottom = y;
            }
          }
        }
        if (right >= left && bottom >= top) {
          // Back to full-size pixels, one scan pixel of slack so antialiased edges survive.
          const x0 = Math.max(0, Math.floor((left - 1) / s));
          const y0 = Math.max(0, Math.floor((top - 1) / s));
          const x1 = Math.min(w, Math.ceil((right + 2) / s));
          const y1 = Math.min(h, Math.ceil((bottom + 2) / s));
          const cw = x1 - x0;
          const ch = y1 - y0;
          if (cw < w || ch < h) {
            const out = document.createElement("canvas");
            out.width = cw;
            out.height = ch;
            out.getContext("2d")?.drawImage(img, x0, y0, cw, ch, 0, 0, cw, ch);
            result = { src: out.toDataURL("image/png"), ratio: cw / ch };
          }
        }
      } catch {
        // Unreadable pixels — print the file as it is.
      }
      setLogo(result);
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return logo;
}

// ── Main component ─────────────────────────────────────────────────────────

export const ThermalInvoiceTemplate = React.forwardRef(
  (
    {
      data,
      paperSize = "3",
      settingsOverride,
      template,
      theme = "classic",
      logoUrl,
      signatureUrl,
      copyType,
    }: {
      data: any;
      paperSize?: ThermalPaperSize;
      /** Preview-only: draft settings that haven't been saved yet — takes
       * priority over the persisted Redux settings so the Invoice Settings
       * page can show a live preview of unsaved toggle changes. */
      settingsOverride?: Partial<ThermalInvoiceSettings> | null;
      /** Layout to draw — defaults to the one named by `invoice_template` in the settings. */
      template?: ThermalTemplate;
      /** Visual density of the layout — "compact" tightens spacing throughout. */
      theme?: "compact" | "classic";
      /** Uploaded company logo — falls back to the company record's logo;
       * nothing is printed in its place when neither is set. */
      logoUrl?: string;
      /** Preview-only in-progress signature upload — real printing falls back
       * to the persisted value on invoiceSettings (see resolvedSignatureUrl). */
      signatureUrl?: string;
      /** Copy marking to print ("Original" | "Duplicate" | "Transport").
       * Omitted when no specific copy was asked for. */
      copyType?: string | null;
    },
    ref: any
  ) => {
    const { profile, company, zoduId, branchId } = useTenantContext();
    const companies = useAppSelector(AllCompanies);
    const selectedCompany = companies.find(c => c.zodu_id === zoduId);
    const selectedBranch = selectedCompany?.branches?.find(b => b.branch_id === branchId);
    const reduxInvoiceSettings = useAppSelector(InvoiceSettingsData);
    const invoiceSettings = settingsOverride ?? reduxInvoiceSettings;
    const compact = theme === "compact";
    const modern = (template ?? toThermalTemplate(invoiceSettings?.invoice_template)) === "modern";
    const showCompanyLogo = invoiceSettings?.show_company_logo ?? false;
    const showTaxDetails = invoiceSettings?.show_tax_details ?? false;
    const showCustomerDetails = invoiceSettings?.show_customer_details ?? true;
    const showPaymentDetails = invoiceSettings?.show_payment_details ?? false;
    const showTermsConditions = invoiceSettings?.show_terms_conditions ?? false;
    const termsConditionsText = invoiceSettings?.terms_conditions ?? "";
    const showNotes = invoiceSettings?.show_notes ?? false;
    const notesText = invoiceSettings?.notes ?? "";
    const showSignature = invoiceSettings?.show_signature ?? false;
    // Item-line and bank toggles the A4 templates already honour — the receipt
    // read none of them, so switching them in Invoice Settings did nothing here.
    const showSerialNo = invoiceSettings?.show_serial_no ?? true;
    const showItemId = invoiceSettings?.show_item_id ?? false;
    const showItemDescription = invoiceSettings?.show_description ?? false;
    const showBankDetails = invoiceSettings?.show_bank_details ?? false;
    // `signatureUrl` is an explicit prop (used by the Settings-page live preview
    // for an in-progress upload not yet saved) — real invoice rendering has no
    // such prop and falls back to the persisted value on invoiceSettings.
    const resolvedSignatureUrl = signatureUrl || invoiceSettings?.signature_url || "";
    // Same prop-first-then-company-record fallback: the logo lives on the
    // company (Company Details), not on invoice settings — real invoice
    // rendering never passes `logoUrl` at all, it just reads the company row.
    const resolvedLogoUrl = logoUrl || selectedCompany?.company_logo_url || "";
    const cfg = PAPER[paperSize] ?? PAPER["3"];
    // Logo: its artwork (blank margin trimmed) up to 5× the header font tall and 90%
    // of the roll wide. Sized from the artwork's own ratio rather than max-width/height
    // alone — those never enlarge a small file — and without object-fit, which
    // html2canvas (the print capture) ignores, so a letterboxed logo would print stretched.
    // Until the trim is ready the untrimmed file shows at the height cap.
    const logo = useTrimmedLogo(showCompanyLogo ? resolvedLogoUrl : "");
    // Tall enough that the lettering inside a logo survives the head's dot pitch —
    // a smaller logo printed its wordmark as a smudge.
    const logoMaxH = cfg.headerFontSize * 7;
    const logoMaxW = cfg.widthPx * 0.96;
    const logoH = logo ? Math.min(logoMaxH, logoMaxW / logo.ratio) : logoMaxH;
    const logoBox = logo ? { width: logoH * logo.ratio, height: logoH } : { height: logoH, maxWidth: "90%" };
    // The 3" roll takes short column headings and keeps the totals in one column.
    const narrow = !cfg.wide;
    // On 48 mm there is no room for a name beside the figures, so it takes its own line.
    const tiny = paperSize === "2";

    const {
      sale_id,
      date,
      time,
      sale_time,
      saleTime,
      created_at,
      createdAt,
      billing_time,
      customer_name,
      customer_mobile,
      customer_gstin,
      payment_mode,
      items = [],
      subtotal,
      discount,
      discount_label,
      round_off,
      total,
      grand_total,
      final_amount,
      gst_breakdown = [],
      sale_type,
      vehicle_no,
      po_number,
      po_date,
    } = data;
    const documentLabel = saleDocumentLabel(sale_type);
    // A transport copy travels with the goods, so it carries the vehicle number.
    // Shown whenever "Transport" is a configured copy type — a blank rule to
    // fill in by hand when the sale carries no number.
    const showVehicleNo = normalizeInvoiceCopyTypes(invoiceSettings?.invoice_copy_types).includes("Transport");

    // Time fallback logic
    const rawTime = time || sale_time || saleTime || billing_time || created_at || createdAt;
    let displayTime = "";

    if (rawTime) {
      if (typeof rawTime === "string" && rawTime.includes("T")) {
        displayTime = new Date(rawTime).toLocaleTimeString();
      } else {
        displayTime = String(rawTime);
      }
    } else {
      displayTime = new Date().toLocaleTimeString();
    }

    // ── Company info ──
    // The branch's own address takes priority — invoices are issued per branch
    // and a branch's address can differ from the company's registered address.
    // tbl_address only ever stores address_line_1/2, city, district, state and
    // pincode (returned unprefixed on the branch record — there's no separate
    // street-name/building-number column), so those are the only branch fields
    // to read. Falls back to the company address for a branch missing its own.
    const addressLine1Parts = [
      selectedBranch?.address_line_1 || company?.address_line_1 || selectedCompany?.address_line_1,
      selectedBranch?.address_line_2 || company?.address_line_2 || selectedCompany?.address_line_2,
    ].filter(Boolean);
    const addressLine2Parts = [
      selectedBranch?.city || company?.city || selectedCompany?.city,
      selectedBranch?.district || company?.district || selectedCompany?.district,
      selectedBranch?.state || company?.state || selectedCompany?.state,
      selectedBranch?.pincode || company?.pincode || selectedCompany?.pincode,
    ].filter(Boolean);

    const addressLine1 = addressLine1Parts.join(", ");
    const addressLine2 = addressLine2Parts.join(", ");
    const companyName  = selectedCompany?.restaurant_name || selectedCompany?.business_name || selectedCompany?.store_name || selectedCompany?.company_name || profile?.restaurant_name || "Your Company";
    const companyGstin = company?.gst_no || selectedCompany?.gst_no || "";
    const companyPhone = profile?.phone_number || selectedCompany?.phone_number || selectedCompany?.mobile_no || "";

    // Only fields that carry a value get a row — a blank "IFSC" line reads as a
    // rendering fault rather than missing data.
    const bankRows: Array<[string, string]> = ([
      ["Bank", selectedBranch?.bank_name || company?.bank_name || selectedCompany?.bank_name || ""],
      ["Holder", selectedBranch?.holder_name || company?.holder_name || selectedCompany?.holder_name || ""],
      ["A/c No.", selectedBranch?.account_number || company?.account_number || selectedCompany?.account_number || ""],
      ["Branch", selectedBranch?.bank_branch || company?.bank_branch || selectedCompany?.bank_branch || ""],
      ["IFSC", selectedBranch?.ifsc_code || company?.ifsc_code || selectedCompany?.ifsc_code || ""],
    ] as Array<[string, string]>).filter(([, value]) => String(value ?? "").trim() !== "");

    const discountVal = discount !== undefined && discount !== null ? Number(discount) : 0;
    const showDiscount = discountVal > 0;

    let discountText = "Discount";
    if (discount_label && discount_label.toLowerCase() !== "discount") {
      discountText = `${discount_label}`;
    }

    const finalBillTotal = grand_total ?? total ?? final_amount ?? subtotal;
    const receiptItems: ReceiptItem[] = items;
    const totalQty = receiptItems.reduce((s, item) => s + Number(item.qty ?? 0), 0);
    const showCustomer = showCustomerDetails && customer_name && customer_name !== "Walk-In" && customer_name !== "Walk-in";

    // ── GST summary grouped by rate slab (only computed/shown when Tax
    // Details is enabled in Invoice Settings) ──
    interface GstSlab { cgstRate: number; sgstRate: number; cgstAmount: number; sgstAmount: number; taxable: number; }
    const gstSlabMap: Record<number, GstSlab> = {};
    for (const row of gst_breakdown as any[]) {
      const rate = Number(row.cgstRate ?? 0);
      if (!gstSlabMap[rate]) {
        gstSlabMap[rate] = { cgstRate: rate, sgstRate: Number(row.sgstRate ?? 0), cgstAmount: 0, sgstAmount: 0, taxable: 0 };
      }
      gstSlabMap[rate].cgstAmount += Number(row.cgstAmount ?? 0);
      gstSlabMap[rate].sgstAmount += Number(row.sgstAmount ?? 0);
      gstSlabMap[rate].taxable += Number(row.taxable ?? 0);
    }
    const gstSlabList: GstSlab[] = Object.values(gstSlabMap);
    const taxableAmount = gstSlabList.length > 0
      ? gstSlabList.reduce((s, r) => s + r.taxable, 0)
      : Math.max(0, Number(subtotal ?? 0) - discountVal);
    // Amounts print in whole rupees, so a sub-rupee round-off would read "+₹0" — only show one that rounds to ₹1+.
    const showRoundOff = round_off !== undefined && round_off !== null && Math.round(Number(round_off)) !== 0;
    const roundOffText = Number(round_off) > 0 ? `+${fmt(round_off)}` : fmt(round_off);

    // ── Type scale & weights ──
    const fs = cfg.baseFontSize;
    const size = (n: number) => Math.max(n, cfg.minFontSize);
    const labelFs = size(fs - 1);
    const smallFs = size(fs - 2);
    // Classic body text is medium, Modern regular; emphasis is one step up (600).
    // Heavier strokes than this ran together on the head — the ink threshold in
    // @utils/thermalPrint already thickens every stroke by about a dot.
    const bodyWeight = modern ? 400 : 500;
    const rule = <Rule solid={modern} tight={compact} />;
    const row = (label: string, value: string, opts: { strong?: boolean; fontSize?: number } = {}) => (
      <ReceiptRow
        label={label}
        value={value}
        fontSize={opts.fontSize ?? fs}
        tight={compact}
        labelWeight={opts.strong ? 600 : bodyWeight}
        valueWeight={opts.strong || modern ? 600 : 500}
      />
    );
    const sectionTitle = (text: string) => (
      <div style={modern
        ? { fontSize: smallFs, fontWeight: 600, letterSpacing: 1, marginBottom: 2 }
        : { fontSize: labelFs, fontWeight: 600, marginBottom: 2 }}
      >
        {modern ? text.toUpperCase() : text}
      </div>
    );

    // Item ID, description and variant, under the item name in both templates.
    const subLineStyle: React.CSSProperties = { fontSize: smallFs, fontWeight: bodyWeight, lineHeight: 1.25, marginTop: 1 };
    const itemSubLines = (item: ReceiptItem) => (
      <>
        {showItemId && item.item_id && <div style={subLineStyle}>{item.item_id}</div>}
        {showItemDescription && item.description && (
          <div style={{ ...subLineStyle, whiteSpace: "pre-line" }}>{item.description}</div>
        )}
        {item.variant_name && <div style={subLineStyle}>{item.variant_name}</div>}
      </>
    );

    // Classic item table: the number columns size to their widest figure and never
    // wrap; the name column takes the rest of the roll and wraps — so a long name
    // or a large amount can't push a column past the printable edge on any width.
    const itemCell = (align: "left" | "center" | "right", first = false): React.CSSProperties => ({
      textAlign: align,
      verticalAlign: "top",
      whiteSpace: "nowrap",
      padding: compact ? "1px 0" : "2px 0",
      paddingLeft: first ? 0 : tiny ? 5 : narrow ? 10 : 12,
    });
    const itemHead = (align: "left" | "center" | "right", first = false): React.CSSProperties => ({
      ...itemCell(align, first),
      fontSize: labelFs,
      fontWeight: 600,
      paddingBottom: 3,
      borderBottom: "1.5px solid #000",
    });

    const gstCell = (align: "center" | "right", head = false, first = false): React.CSSProperties => modern
      ? {
          textAlign: first ? "left" : align,
          padding: narrow ? "1px 0 1px 3px" : "2px 0 2px 4px",
          paddingLeft: first ? 0 : undefined,
          fontWeight: head ? 600 : bodyWeight,
          borderBottom: head ? "1px solid #000" : undefined,
        }
      : {
          textAlign: align,
          border: "1px solid #000",
          // Enough side room that figures don't touch the cell borders.
          padding: narrow ? "2px 3px" : "2px 4px",
          fontWeight: head ? 600 : bodyWeight,
        };

    return (
      <div
        ref={ref}
        style={{
          width: `${cfg.widthPx}px`,
          padding: cfg.padding,
          background: "#fff",
          fontFamily: modern ? MODERN_FONT : CLASSIC_FONT,
          color: "#000",
          fontSize: `${fs}px`,
          fontWeight: bodyWeight,
          lineHeight: 1.3,
          boxSizing: "border-box",
          // Long unbroken text (an email, a GSTIN run into an address) wraps instead of leaving the roll.
          overflowWrap: "break-word",
          WebkitFontSmoothing: "antialiased" as any,
        }}
      >
        {/* ── HEADER ── */}
        <div style={{ textAlign: "center", marginBottom: compact ? 2 : 6 }}>
          {showCompanyLogo && resolvedLogoUrl && (
            <img
              src={logo?.src ?? resolvedLogoUrl}
              alt=""
              style={{ ...logoBox, display: "block", margin: "0 auto 2px" }}
            />
          )}
          <div
            style={{
              fontSize: modern ? cfg.headerFontSize + 2 : cfg.headerFontSize,
              fontWeight: 700,
              letterSpacing: modern ? 0 : 0.5,
              lineHeight: 1.2,
              marginBottom: 3,
              wordBreak: "break-word",
            }}
          >
            {modern ? companyName : companyName.toUpperCase()}
          </div>
          {addressLine1 && (
            <div style={{ fontSize: labelFs, lineHeight: 1.4 }}>{addressLine1}</div>
          )}
          {addressLine2 && (
            <div style={{ fontSize: labelFs, lineHeight: 1.4 }}>{addressLine2}</div>
          )}
          {companyPhone && (
            <div style={{ fontSize: labelFs, marginTop: 1 }}>Ph: {companyPhone}</div>
          )}
          {companyGstin && (
            <div style={{ fontSize: labelFs, marginTop: 1, fontWeight: modern ? 600 : undefined }}>GSTIN: {companyGstin}</div>
          )}
        </div>

        {/* ── DOCUMENT / COPY ── */}
        {modern ? (
          <div
            style={{
              background: "#000",
              color: "#fff",
              textAlign: "center",
              fontWeight: 600,
              fontSize: labelFs,
              letterSpacing: 1.5,
              lineHeight: 1.3,
              padding: compact ? "2px 4px" : "4px 6px",
              margin: compact ? "2px 0 4px" : "4px 0 8px",
            }}
          >
            {documentLabel.toUpperCase()}
            {copyType ? ` · ${String(copyType).toUpperCase()}` : ""}
          </div>
        ) : (
          <>
            {rule}
            {copyType && (
              <div style={{ textAlign: "center", fontWeight: 700, fontSize: labelFs, letterSpacing: 1, marginBottom: 3 }}>
                {String(copyType).toUpperCase()}
              </div>
            )}
          </>
        )}

        {/* ── INVOICE META ── */}
        <div style={{ marginBottom: 4 }}>
          {row(documentLabel === "Invoice" ? "Receipt #" : `${documentLabel} #`, String(sale_id ?? ""))}
          {row(tiny ? "Date" : "Date & Time", `${date ?? ""}  ${displayTime}`)}
          {/* Only a B2B sale carries a purchase order, so the rows stay off
              the roll unless one was entered. */}
          {po_number && row("PO No", String(po_number))}
          {po_date && row("PO Date", String(po_date))}
          {showPaymentDetails && payment_mode && row("Payment Mode", String(payment_mode))}
          {showVehicleNo && row("Vehicle No", vehicle_no ? String(vehicle_no) : "________")}
        </div>

        {/* ── CUSTOMER ── */}
        {showCustomer && (
          <>
            {rule}
            <div style={{ marginBottom: 4 }}>
              <div style={modern
                ? { fontSize: smallFs, fontWeight: 600, letterSpacing: 1, marginBottom: 2 }
                : { fontWeight: 600, marginBottom: 1 }}
              >
                {modern ? "BILLED TO" : "Customer"}
              </div>
              <div style={{ fontWeight: modern ? 600 : undefined }}>{customer_name}</div>
              {customer_mobile && customer_mobile !== "-" && (
                <div>Mob: {customer_mobile}</div>
              )}
              {customer_gstin && customer_gstin !== "-" && (
                <div>GSTIN: {customer_gstin}</div>
              )}
            </div>
          </>
        )}

        {rule}

        {/* ── ITEMS ── */}
        {modern ? (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: smallFs,
                fontWeight: 600,
                letterSpacing: 1,
                paddingBottom: 3,
                borderBottom: "1.5px solid #000",
                marginBottom: compact ? 2 : 4,
              }}
            >
              <span>ITEM</span>
              <span>AMOUNT</span>
            </div>
            {receiptItems.map((item, i) => (
              <div key={i} style={{ padding: compact ? "1px 0" : "3px 0" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  {showSerialNo && (
                    <span style={{ minWidth: Math.round(fs * 1.6), fontWeight: 600 }}>{i + 1}.</span>
                  )}
                  <span style={{ flex: 1, minWidth: 0, fontWeight: 600, lineHeight: 1.25, wordBreak: "break-word" }}>
                    {item.name}
                  </span>
                  <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{fmt(item.total)}</span>
                </div>
                <div style={{ paddingLeft: showSerialNo ? Math.round(fs * 1.6) + 6 : 0 }}>
                  <div style={{ fontSize: smallFs, lineHeight: 1.3 }}>
                    {fmtQty(item.qty)} × {fmt(item.rate)}
                  </div>
                  {itemSubLines(item)}
                </div>
              </div>
            ))}
            <Rule solid tight={compact} />
          </>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: fs }}>
              <thead>
                <tr>
                  {showSerialNo && <th style={itemHead("left", true)}>{narrow ? "#" : "S.No"}</th>}
                  <th style={{ ...itemHead("left", !showSerialNo), width: "100%" }}>{narrow ? "Item" : "Particulars"}</th>
                  <th style={itemHead("right")}>Qty</th>
                  <th style={itemHead("right")}>Rate</th>
                  <th style={itemHead("right")}>{narrow ? "Amt" : "Amount"}</th>
                </tr>
              </thead>
              <tbody>
                {receiptItems.map((item, i) => {
                  const nameStyle: React.CSSProperties = {
                    ...itemCell("left", !showSerialNo),
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    fontWeight: 600,
                    lineHeight: compact ? 1.15 : 1.3,
                  };
                  const figures = (
                    <>
                      <td style={itemCell("right")}>{fmtQty(item.qty)}</td>
                      <td style={itemCell("right")}>{fmt(item.rate)}</td>
                      <td style={{ ...itemCell("right"), fontWeight: 600 }}>{fmt(item.total)}</td>
                    </>
                  );
                  // The figures sit on the name's first line on every roll, so each item
                  // reads as one row; a long name wraps inside its own column. On 48 mm a
                  // separate figures line left them floating under the name instead.
                  return (
                    <tr key={i}>
                      {showSerialNo && <td style={itemCell("left", true)}>{i + 1}</td>}
                      <td style={nameStyle}>
                        {item.name}
                        {itemSubLines(item)}
                      </td>
                      {figures}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Rule solid weight={1.5} tight={compact} />
          </>
        )}

        {/* ── T.QTY / TOTAL, DISCOUNT & BILL TOTAL ── */}
        {modern ? (
          <div style={{ marginBottom: 4 }}>
            {row("Total Qty", fmtQty(totalQty))}
            {row("Subtotal", fmt(subtotal))}
            {showDiscount && row(discountText, `-${fmt(discountVal)}`)}
            {showTaxDetails && row("Taxable Amount", fmt(taxableAmount))}
          </div>
        ) : narrow ? (
          <div style={{ marginBottom: 4 }}>
            {row("T.Qty", fmtQty(totalQty))}
            {row("Total", fmt(subtotal))}
            {showDiscount && row(discountText, fmt(discountVal))}
            {showTaxDetails ? row("Taxable Amount", fmt(taxableAmount)) : row("Bill Total", fmt(finalBillTotal))}
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, fontSize: fs, lineHeight: 1.6, marginBottom: 4 }}>
            <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>T.Qty: {fmtQty(totalQty)}</span>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span>Total :</span>
                <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{fmt(subtotal)}</span>
              </div>

              {showDiscount && (
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span>{discountText} :</span>
                  <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{fmt(discountVal)}</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span>{showTaxDetails ? "Taxable Amount :" : "Bill Total :"}</span>
                <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{fmt(showTaxDetails ? taxableAmount : finalBillTotal)}</span>
              </div>
            </div>
          </div>
        )}

        {showTaxDetails && (
          <>
            {/* ── GST SUMMARY ── */}
            {modern ? (
              <div style={{ margin: compact ? "2px 0" : "6px 0 3px" }}>{sectionTitle("GST Summary")}</div>
            ) : (
              // The title's own dashes are the section rule — a rule above it printed two dashed lines.
              <div style={{ display: "flex", alignItems: "center", margin: compact ? "3px 0" : "6px 0 5px" }}>
                <div style={{ flex: 1, borderBottom: "1px dashed #000" }} />
                <span style={{ padding: "0 6px", fontWeight: 600, fontSize: labelFs, letterSpacing: 0.5, whiteSpace: "nowrap" }}>
                  GST SUMMARY
                </span>
                <div style={{ flex: 1, borderBottom: "1px dashed #000" }} />
              </div>
            )}

            <table
              style={{
                // Auto layout: each column gets its figures' full width while they fit,
                // and only wraps when the roll truly runs out.
                width: "100%",
                borderCollapse: "collapse",
                border: modern ? undefined : "1px solid #000",
                fontSize: size(fs - 3),
              }}
            >
              <thead>
                <tr>
                  <th style={gstCell("center", true, modern)}>{narrow ? "Rate" : "GST Rate"}</th>
                  <th style={gstCell("right", true)}>{narrow ? "Taxable" : "Taxable Amt"}</th>
                  <th style={gstCell("right", true)}>
                    {narrow || gstSlabList.length > 1 ? "CGST" : `CGST (${gstSlabList[0]?.cgstRate ?? 0}%)`}
                  </th>
                  <th style={gstCell("right", true)}>
                    {narrow || gstSlabList.length > 1 ? "SGST" : `SGST (${gstSlabList[0]?.sgstRate ?? 0}%)`}
                  </th>
                  <th style={gstCell("right", true)}>{narrow ? "Total" : "Total GST"}</th>
                </tr>
              </thead>
              <tbody>
                {gstSlabList.map((slab, i) => (
                  <tr key={i}>
                    <td style={gstCell("center", false, modern)}>
                      {(slab.cgstRate + slab.sgstRate).toFixed(1).replace(/\.0$/, "")}%
                    </td>
                    <td style={gstCell("right")}>{fmt(slab.taxable)}</td>
                    <td style={gstCell("right")}>{fmt(slab.cgstAmount)}</td>
                    <td style={gstCell("right")}>{fmt(slab.sgstAmount)}</td>
                    <td style={{ ...gstCell("right"), fontWeight: 600 }}>{fmt(slab.cgstAmount + slab.sgstAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginBottom: compact ? 2 : 4 }} />

            {modern ? (
              showRoundOff && row("Round Off", roundOffText)
            ) : (
              <>
                {rule}
                {row(narrow ? "Bill Total :" : "Bill Total (Tax Inclusive) :", fmt(finalBillTotal), { strong: true })}
                {showRoundOff && row("Round Off :", roundOffText)}
              </>
            )}
          </>
        )}

        {/* ── BILL AMOUNT ── */}
        {modern ? (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
              background: "#000",
              color: "#fff",
              fontSize: cfg.grandFontSize,
              fontWeight: 600,
              lineHeight: 1.2,
              padding: compact ? "4px 6px" : "7px 8px",
              margin: compact ? "4px 0" : "8px 0",
            }}
          >
            <span>TOTAL</span>
            <span style={{ whiteSpace: "nowrap" }}>{fmt(finalBillTotal)}</span>
          </div>
        ) : (
          <>
            {rule}
            <div
              style={{
                textAlign: "center",
                fontSize: cfg.grandFontSize + 1,
                fontWeight: 700,
                margin: "6px 0",
                letterSpacing: 0.5,
              }}
            >
              BILL AMOUNT : <span style={{ whiteSpace: "nowrap" }}>{fmt(finalBillTotal)}</span>
            </div>
            {rule}
          </>
        )}

        {showBankDetails && bankRows.length > 0 && (
          <>
            {sectionTitle("Bank Details")}
            {bankRows.map(([label, value]) => (
              <React.Fragment key={label}>{row(label, value, { fontSize: labelFs })}</React.Fragment>
            ))}
            <div style={{ marginBottom: 4 }} />
            {rule}
          </>
        )}

        {showTermsConditions && termsConditionsText && (
          <>
            {sectionTitle("Terms & Conditions")}
            <div style={{ fontSize: labelFs, whiteSpace: "pre-line", lineHeight: 1.4, marginBottom: 4 }}>
              {termsConditionsText}
            </div>
            {rule}
          </>
        )}

        {/* ── FOOTER: the notes from Invoice Settings, centred where the thank-you line used to be ── */}
        {showNotes && notesText.trim() && (
          <div
            style={{
              textAlign: "center",
              marginTop: compact ? 4 : 10,
              paddingBottom: 4,
              fontSize: fs,
              fontWeight: 600,
              whiteSpace: "pre-line",
              lineHeight: 1.4,
            }}
          >
            {notesText.trim()}
          </div>
        )}

        {/* ── Signature, when Invoice Settings asks for one ── */}
        {showSignature && (
          <div style={{ textAlign: "center", marginTop: compact ? 26 : 36, paddingBottom: 4, fontSize: fs }}>
            {resolvedSignatureUrl && (
              <img
                src={resolvedSignatureUrl}
                alt="Authorized signature"
                style={{ maxHeight: 40, maxWidth: "60%", objectFit: "contain", margin: "0 auto 4px", display: "block" }}
              />
            )}
            <div style={{ borderTop: "1px solid #000", width: "70%", margin: "0 auto 4px" }} />
            <div style={{ fontSize: labelFs, fontWeight: 600 }}>Authorized Signatory</div>
          </div>
        )}
      </div>
    );
  }
);

ThermalInvoiceTemplate.displayName = "ThermalInvoiceTemplate";
