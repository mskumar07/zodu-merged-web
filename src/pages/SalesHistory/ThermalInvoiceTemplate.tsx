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
//               fontWeight: 800,
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
//               <div style={{ fontWeight: 700, marginBottom: 1 }}>Customer</div>
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
//             fontWeight: 700,
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
//                   fontWeight: 700,
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
//               <span style={{ textAlign: "right", fontWeight: 700, paddingTop: 1 }}>
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
//           <div style={{ fontWeight: 700, letterSpacing: 0.3 }}>
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

// ── Paper-size config ──────────────────────────────────────────────────────

export type ThermalPaperSize = "3" | "4" | "5";

interface PaperConfig {
  widthPx: number;
  widthMm: number;
  baseFontSize: number;
  itemFontSize: number;
  headerFontSize: number;
  grandFontSize: number;
  padding: string;
  gridCols: string;
}

const PAPER: Record<ThermalPaperSize, PaperConfig> = {
  "3": {
    widthPx: 272,
    widthMm: 72,
    baseFontSize: 13,
    itemFontSize: 13,
    headerFontSize: 16,
    grandFontSize: 15,
    padding: "10px 4px 24px 4px",
    gridCols: "24px 1fr 20px 75px 75px",
  },
  "4": {
    widthPx: 362,
    widthMm: 96,
    baseFontSize: 15,
    itemFontSize: 15,
    headerFontSize: 19,
    grandFontSize: 17,
    padding: "14px 8px 32px 8px",
    gridCols: "36px 1fr 24px 85px 85px",
  },
  "5": {
    widthPx: 453,
    widthMm: 120,
    baseFontSize: 16,
    itemFontSize: 16,
    headerFontSize: 22,
    grandFontSize: 19,
    padding: "16px 10px 36px 10px",
    gridCols: "40px 1fr 28px 95px 95px",
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────

const THERMAL_FONT = "'Courier New','Consolas', 'Lucida Console',  monospace";

function fmt(v: number | string) {
  return `₹${Number(v).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function Dashes({ tight }: { tight?: boolean }) {
  return (
    <div
      style={{
        borderBottom: "1px dashed #000",
        margin: tight ? "2px 0" : "5px 0",
      }}
    />
  );
}

function SolidLine({ tight }: { tight?: boolean }) {
  return (
    <div style={{ borderBottom: "1.5px solid #000", margin: tight ? "1px 0 2px" : "3px 0 4px" }} />
  );
}

function ReceiptRow({
  label,
  value,
  bold,
  large,
  fontSize,
  tight,
}: {
  label: string;
  value: string;
  bold?: boolean;
  large?: boolean;
  fontSize: number;
  tight?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        fontSize: large ? fontSize + 2 : fontSize,
        fontWeight: bold || large ? 700 : 600,
        marginBottom: tight ? 1 : 3,
        lineHeight: tight ? 1.15 : 1.45,
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
    {
      data,
      paperSize = "3",
      settingsOverride,
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
      /** Visual density of the layout — "compact" tightens spacing throughout. */
      theme?: "compact" | "classic";
      /** Uploaded company logo — falls back to a plain ★ when not set. */
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
    const cfg = PAPER[paperSize];
    // 3" rolls are too narrow for a 5-column item grid — items stack onto
    // two lines and the GST summary/totals switch to compact single-column text.
    const narrow = paperSize === "3";
    // S.No is the leading grid track, so hiding it means dropping that track —
    // otherwise the remaining columns keep its width as a blank gutter.
    const itemGridCols = showSerialNo ? cfg.gridCols : cfg.gridCols.split(" ").slice(1).join(" ");

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
    const totalQty = items.reduce((s: number, item: any) => s + Number(item.qty ?? 0), 0);

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
    const showRoundOff = round_off !== undefined && round_off !== null && Number(round_off) !== 0;

    // Calculate items sum dynamically
    const itemsTotalSum = items.reduce((sum: number, item: any) => sum + Number(item.total || 0), 0);

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
          fontWeight: 600,
          boxSizing: "border-box",
          WebkitFontSmoothing: "antialiased" as any,
        }}
      >
        {/* ── HEADER ── */}
        <div style={{ textAlign: "center", marginBottom: compact ? 2 : 6 }}>
          {showCompanyLogo && (
            resolvedLogoUrl ? (
              <img
                src={resolvedLogoUrl}
                alt=""
                style={{ maxHeight: cfg.headerFontSize * 3.2, maxWidth: "78%", marginBottom: 4, objectFit: "contain" }}
              />
            ) : (
              <div style={{ fontSize: cfg.headerFontSize * 2, lineHeight: 1, marginBottom: 4 }}>
                ★
              </div>
            )
          )}
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
            <div style={{ fontSize: fs - 1, lineHeight: 1.4 }}>{addressLine1}</div>
          )}
          {addressLine2 && (
            <div style={{ fontSize: fs - 1, lineHeight: 1.4 }}>{addressLine2}</div>
          )}
          {companyPhone && (
            <div style={{ fontSize: fs - 1, marginTop: 1 }}>Ph: {companyPhone}</div>
          )}
          {companyGstin && (
            <div style={{ fontSize: fs - 1, marginTop: 1 }}>GSTIN: {companyGstin}</div>
          )}
        </div>

        <Dashes tight={compact} />

        {/* ── INVOICE META ── */}
        {/* <div style={{ textAlign: "center", fontWeight: 700, fontSize: fs - 1, letterSpacing: 1, marginBottom: 3 }}>
          {documentLabel.toUpperCase()}
        </div> */}
        {copyType && (
          <div style={{ textAlign: "center", fontWeight: 800, fontSize: fs - 1, letterSpacing: 1, marginBottom: 3 }}>
            {String(copyType).toUpperCase()}
          </div>
        )}
        <div style={{ marginBottom: 4 }}>
          <ReceiptRow label={documentLabel === "Invoice" ? "Receipt #" : `${documentLabel} #`} value={String(sale_id ?? "")} fontSize={fs} tight={compact} />
          <ReceiptRow label="Date & Time" value={`${date ?? ""}  ${displayTime}`} fontSize={fs} tight={compact} />
          {/* Only a B2B sale carries a purchase order, so the rows stay off
              the roll unless one was entered. */}
          {po_number && (
            <ReceiptRow label="PO No" value={String(po_number)} fontSize={fs} tight={compact} />
          )}
          {po_date && (
            <ReceiptRow label="PO Date" value={String(po_date)} fontSize={fs} tight={compact} />
          )}
          {showPaymentDetails && payment_mode && (
            <ReceiptRow label="Payment Mode" value={String(payment_mode)} fontSize={fs} tight={compact} />
          )}
          {showVehicleNo && (
            <ReceiptRow
              label="Vehicle No"
              value={vehicle_no ? String(vehicle_no) : "________"}
              fontSize={fs}
              tight={compact}
            />
          )}
        </div>

        {/* ── CUSTOMER ── */}
        {showCustomerDetails && customer_name && customer_name !== "Walk-In" && customer_name !== "Walk-in" && (
          <>
            <Dashes tight={compact} />
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

        <Dashes tight={compact} />

        {/* ── ITEMS TABLE HEADER ── */}
        {narrow ? (
          <div style={{ display: "flex", fontSize: fs - 1, fontWeight: 700, marginBottom: 4, gap: 6 }}>
            {showSerialNo && <span style={{ minWidth: 16 }}>#</span>}
            <span>Particular</span>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: itemGridCols,
              fontSize: fs - 1,
              fontWeight: 700,
              marginBottom: 4,
              gap: "0 4px",
            }}
          >
            {showSerialNo && <span>S.No</span>}
            <span>Particular</span>
            <span style={{ textAlign: "center" }}>QTY</span>
            <span style={{ textAlign: "right" }}>RATE</span>
            <span style={{ textAlign: "right" }}>Amount</span>
          </div>
        )}

        <SolidLine tight={compact} />

        {/* ── ITEMS ── */}
        {items.map((item: any, i: number) => (
          <div key={i} style={{ marginBottom: compact ? 2 : 6 }}>
            {narrow ? (
              <>
                <div style={{ display: "flex", gap: 6, fontSize: ifs }}>
                  {showSerialNo && <span style={{ minWidth: 16, fontWeight: 600 }}>{i + 1}</span>}
                  <span style={{ flex: 1, fontWeight: 700, wordBreak: "break-word", lineHeight: compact ? 1.15 : 1.35 }}>
                    {item.name}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingLeft: showSerialNo ? 22 : 0, fontSize: Math.max(ifs - 1, 11) }}>
                  <span>{item.qty} x {fmt(item.rate)}</span>
                  <span style={{ fontWeight: 700 }}>{fmt(item.total)}</span>
                </div>
              </>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: itemGridCols,
                  fontSize: ifs,
                  gap: "0 4px",
                  alignItems: "start",
                }}
              >
                {showSerialNo && <span style={{ fontWeight: 600, paddingTop: 1 }}>{i + 1}</span>}
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      wordBreak: "break-word",
                      lineHeight: compact ? 1.15 : 1.4,
                    }}
                  >
                    {item.name}
                  </div>
                  {showItemId && item.item_id && (
                    <div style={{ fontSize: fs - 2, marginTop: 1, lineHeight: 1.3 }}>{item.item_id}</div>
                  )}
                  {showItemDescription && item.description && (
                    <div style={{ fontSize: fs - 2, marginTop: 1, lineHeight: 1.3, whiteSpace: "pre-line" as const }}>
                      {item.description}
                    </div>
                  )}
                </div>
                <span style={{ textAlign: "center", fontWeight: 600, paddingTop: 1 }}>
                  {item.qty}
                </span>
                <span style={{ textAlign: "right", fontWeight: 600, paddingTop: 1 }}>
                  {fmt(item.rate)}
                </span>
                <span style={{ textAlign: "right", fontWeight: 700, paddingTop: 1 }}>
                  {fmt(item.total)}
                </span>
              </div>
            )}

            {narrow && showItemId && item.item_id && (
              <div style={{ fontSize: fs - 2, paddingLeft: showSerialNo ? 22 : 0, marginTop: 1, lineHeight: 1.3 }}>
                {item.item_id}
              </div>
            )}

            {narrow && showItemDescription && item.description && (
              <div style={{ fontSize: fs - 2, paddingLeft: showSerialNo ? 22 : 0, marginTop: 1, lineHeight: 1.3, whiteSpace: "pre-line" as const }}>
                {item.description}
              </div>
            )}

            {/* Variant / Modifier */}
            {item.variant_name && (
              <div
                style={{
                  fontSize: fs - 1,
                  fontWeight: 600,
                  color: "#000",
                  paddingLeft: 1,
                  marginTop: 1,
                  lineHeight: 1.3,
                }}
              >
                {item.variant_name}
              </div>
            )}
          </div>
        ))}

        <SolidLine tight={compact} />

        {/* ── T.QTY / TOTAL, DISCOUNT & BILL TOTAL ── */}
        {narrow ? (
          <div style={{ marginBottom: 4 }}>
            <ReceiptRow label="T.Qty" value={String(totalQty)} fontSize={fs} tight={compact} />
            <ReceiptRow label="Total" value={fmt(subtotal)} fontSize={fs} tight={compact} />
            {showDiscount && (
              <ReceiptRow label={discountText} value={fmt(discountVal)} fontSize={fs} tight={compact} />
            )}
            {showTaxDetails ? (
              <ReceiptRow label="Taxable Amount" value={fmt(taxableAmount)} fontSize={fs} tight={compact} />
            ) : (
              <ReceiptRow label="Bill Total" value={fmt(finalBillTotal)} fontSize={fs} tight={compact} />
            )}
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", fontSize: fs, lineHeight: 1.6, marginBottom: 4 }}>
            <span style={{ fontWeight: 700 }}>T.Qty: {totalQty}</span>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span>Total :</span>
                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{fmt(subtotal)}</span>
              </div>

              {showDiscount && (
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span>{discountText} :</span>
                  <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{fmt(discountVal)}</span>
                </div>
              )}

              {showTaxDetails ? (
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span>Taxable Amount :</span>
                  <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{fmt(taxableAmount)}</span>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span>Bill Total :</span>
                  <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{fmt(finalBillTotal)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {showTaxDetails && (
          <>
            <Dashes tight={compact} />

            {/* ── GST SUMMARY ── */}
            <div style={{ display: "flex", alignItems: "center", margin: compact ? "1px 0 3px" : "2px 0 4px" }}>
              <div style={{ flex: 1, borderBottom: "1px dashed #000" }} />
              <span style={{ padding: "0 6px", fontWeight: 700, fontSize: fs - 1, letterSpacing: 0.5, whiteSpace: "nowrap" }}>
                GST SUMMARY
              </span>
              <div style={{ flex: 1, borderBottom: "1px dashed #000" }} />
            </div>

            <table
              style={{
                width: "100%",
                tableLayout: "fixed",
                borderCollapse: "collapse",
                border: "1px solid #000",
                fontSize: narrow ? Math.max(fs - 4, 8) : Math.max(fs - 3, 9),
              }}
            >
              <thead>
                <tr>
                  <th style={{ border: "1px solid #000", padding: narrow ? "1px 2px" : "2px 3px", fontWeight: 700, textAlign: "center" }}>
                    {narrow ? "Rate" : "GST Rate"}
                  </th>
                  <th style={{ border: "1px solid #000", padding: narrow ? "1px 2px" : "2px 3px", fontWeight: 700, textAlign: "right" }}>
                    {narrow ? "Taxable" : "Taxable Amt"}
                  </th>
                  <th style={{ border: "1px solid #000", padding: narrow ? "1px 2px" : "2px 3px", fontWeight: 700, textAlign: "right" }}>
                    {narrow || gstSlabList.length > 1 ? "CGST" : `CGST (${gstSlabList[0]?.cgstRate ?? 0}%)`}
                  </th>
                  <th style={{ border: "1px solid #000", padding: narrow ? "1px 2px" : "2px 3px", fontWeight: 700, textAlign: "right" }}>
                    {narrow || gstSlabList.length > 1 ? "SGST" : `SGST (${gstSlabList[0]?.sgstRate ?? 0}%)`}
                  </th>
                  <th style={{ border: "1px solid #000", padding: narrow ? "1px 2px" : "2px 3px", fontWeight: 700, textAlign: "right" }}>
                    {narrow ? "Total" : "Total GST"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {gstSlabList.map((slab, i) => (
                  <tr key={i}>
                    <td style={{ border: "1px solid #000", padding: narrow ? "1px 2px" : "2px 3px", textAlign: "center" }}>
                      {(slab.cgstRate + slab.sgstRate).toFixed(1).replace(/\.0$/, "")}%
                    </td>
                    <td style={{ border: "1px solid #000", padding: narrow ? "1px 2px" : "2px 3px", textAlign: "right" }}>{fmt(slab.taxable)}</td>
                    <td style={{ border: "1px solid #000", padding: narrow ? "1px 2px" : "2px 3px", textAlign: "right" }}>{fmt(slab.cgstAmount)}</td>
                    <td style={{ border: "1px solid #000", padding: narrow ? "1px 2px" : "2px 3px", textAlign: "right" }}>{fmt(slab.sgstAmount)}</td>
                    <td style={{ border: "1px solid #000", padding: narrow ? "1px 2px" : "2px 3px", textAlign: "right", fontWeight: 700 }}>
                      {fmt(slab.cgstAmount + slab.sgstAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginBottom: compact ? 2 : 4 }} />

            <Dashes tight={compact} />

            <ReceiptRow
              label={narrow ? "Bill Total :" : "Bill Total (Tax Inclusive) :"}
              value={fmt(finalBillTotal)}
              bold
              fontSize={fs}
              tight={compact}
            />
            {showRoundOff && (
              <ReceiptRow
                label="Round Off :"
                value={Number(round_off) > 0 ? `+${fmt(round_off)}` : fmt(round_off)}
                fontSize={fs}
                tight={compact}
              />
            )}
          </>
        )}

        <Dashes tight={compact} />

        {/* ── BILL AMOUNT ── */}
        <div
          style={{
            textAlign: "center",
            fontSize: cfg.grandFontSize + 1,
            fontWeight: 800,
            margin: "6px 0",
            letterSpacing: 0.5,
            whiteSpace: "nowrap",
          }}
        >
          BILL AMOUNT : {fmt(finalBillTotal)}
        </div>

        <Dashes tight={compact} />

        {showBankDetails && bankRows.length > 0 && (
          <>
            <div style={{ fontSize: fs - 1, fontWeight: 700, marginBottom: 2 }}>Bank Details</div>
            {bankRows.map(([label, value]) => (
              <ReceiptRow key={label} label={label} value={value} fontSize={fs - 1} tight={compact} />
            ))}
            <div style={{ marginBottom: 4 }} />
            <Dashes tight={compact} />
          </>
        )}

        {showTermsConditions && termsConditionsText && (
          <>
            <div style={{ fontSize: fs - 1, fontWeight: 700, marginBottom: 2 }}>Terms &amp; Conditions</div>
            <div style={{ fontSize: fs - 1, whiteSpace: "pre-line", lineHeight: 1.4, marginBottom: 4 }}>
              {termsConditionsText}
            </div>
            <Dashes tight={compact} />
          </>
        )}

        {showNotes && notesText && (
          <>
            <div style={{ fontSize: fs - 1, fontWeight: 700, marginBottom: 2 }}>Notes</div>
            <div style={{ fontSize: fs - 1, whiteSpace: "pre-line", lineHeight: 1.4, marginBottom: 4 }}>
              {notesText}
            </div>
            <Dashes tight={compact} />
          </>
        )}

        {/* ── FOOTER ── */}
        <div
          style={{
            textAlign: "center",
            marginTop: compact ? 4 : 10,
            paddingBottom: 4,
            fontSize: ifs,
          }}
        >
          <div style={{ fontWeight: 700, letterSpacing: 0.3 }}>
            THANK YOU FOR SHOPPING!
          </div>
          <div style={{ marginTop: 3, fontSize: fs - 1 }}>Please visit again</div>
          {showCompanyLogo && (
            <div style={{ marginTop: 6, fontSize: fs, letterSpacing: 4 }}>─── ★ ───</div>
          )}
          {showSignature && (
            <div style={{ marginTop: compact ? 26 : 36 }}>
              {resolvedSignatureUrl && (
                <img
                  src={resolvedSignatureUrl}
                  alt="Authorized signature"
                  style={{ maxHeight: 40, maxWidth: "60%", objectFit: "contain", margin: "0 auto 4px", display: "block" }}
                />
              )}
              <div style={{ borderTop: "1px solid #000", width: "70%", margin: "0 auto 4px" }} />
              <div style={{ fontSize: fs - 1, fontWeight: 700 }}>Authorized Signatory</div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

ThermalInvoiceTemplate.displayName = "ThermalInvoiceTemplate";