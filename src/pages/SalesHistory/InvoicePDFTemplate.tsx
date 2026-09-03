import { useAppSelector } from "@store/store";
import { useTenantContext } from "@store/tenantContext";
import { AllCompanies, InvoiceSettingsData } from "@store/slices/userSlice";
import React from "react";

// ── Inline style constants ────────────────────────────────────
const styles = {
  page: {
    width: "794px",
    padding: "34px 38px",
    background: "#fff",
    fontFamily: "'Inter', 'Arial', sans-serif",
    color: "#0F172A",
    fontSize: "13px",
    boxSizing: "border-box" as const,
    position: "relative" as const,
  },

  // Header
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "0px",
  },
  brandName: {
    fontSize: "26px",
    fontWeight: 800,
    color: "#D0021B",
    margin: "0 0 6px 0",
    letterSpacing: "-0.5px",
    lineHeight: 1,
  },
  headerMeta: { margin: "2px 0", fontSize: "11px", color: "#475569" },

  invoiceRight: { textAlign: "right" as const },
  invoiceTitle: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#0F172A",
    margin: "0 0 10px 0",
    letterSpacing: "2px",
  },
  invoiceMetaRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    marginBottom: "3px",
  },
  invoiceMetaLabel: { fontSize: "11px", color: "#64748B", minWidth: "64px", textAlign: "right" as const },
  invoiceMetaValue: { fontSize: "11px", color: "#0F172A", fontWeight: 600, minWidth: "110px", textAlign: "right" as const },

  // Divider
  redDivider: { borderTop: "2px solid #D0021B", margin: "16px 0" },
  grayDivider: { borderTop: "1px solid #E5E7EB", margin: "10px 0" },

  // Bill-to box
  billBox: {
    background: "#F8FAFC",
    padding: "14px 18px",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: "18px",
    marginBottom: "26px",
    border: "1px solid #E2E8F0",
  },
  billLabel: { fontSize: "9px", fontWeight: 700, color: "#94A3B8", letterSpacing: "1px", marginBottom: "4px" },
  billName: { fontSize: "14px", fontWeight: 700, color: "#0F172A", margin: "0 0 4px 0" },
  billMeta: { fontSize: "11px", color: "#475569", margin: "2px 0" },
  paidBadge: {
    background: "#DCFCE7",
    color: "#16A34A",
    padding: "3px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: 700,
    display: "inline-block",
    marginBottom: "6px",
  },
  paymentMode: { fontSize: "11px", color: "#64748B", textAlign: "right" as const },

  // Items table
  table: { width: "100%", tableLayout: "fixed" as const, borderCollapse: "collapse" as const, marginBottom: "20px" },
  thead: { background: "#111827" },
  theadTh: {
    padding: "10px 8px",
    fontSize: "10px",
    fontWeight: 700,
    color: "#fff",
    textAlign: "left" as const,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
  },
  theadThRight: {
    padding: "10px 8px",
    fontSize: "10px",
    fontWeight: 700,
    color: "#fff",
    textAlign: "right" as const,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
  },
  theadThCenter: {
    padding: "10px 8px",
    fontSize: "10px",
    fontWeight: 700,
    color: "#fff",
    textAlign: "center" as const,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
  },
  tdBase: {
    padding: "8px 8px",
    fontSize: "10px",
    color: "#0F172A",
    borderBottom: "1px solid #E5E7EB",
    verticalAlign: "top" as const,
  },
  tdRight: {
    padding: "8px 8px",
    fontSize: "10px",
    color: "#0F172A",
    borderBottom: "1px solid #E5E7EB",
    textAlign: "right" as const,
    verticalAlign: "top" as const,
  },
  tdCenter: {
    padding: "8px 8px",
    fontSize: "10px",
    color: "#0F172A",
    borderBottom: "1px solid #E5E7EB",
    textAlign: "center" as const,
    verticalAlign: "top" as const,
  },
  itemName: { fontWeight: 600, fontSize: "10px", color: "#0F172A" },
  // Item IDs/SKUs are often long, unbroken alphanumeric codes with no spaces —
  // without this they overflow the fixed-width column and visually run into
  // the Item Name text next to them instead of wrapping onto a second line.
  tdItemId: { overflowWrap: "anywhere" as const, wordBreak: "break-all" as const },
  itemSub: { fontSize: "10px", color: "#6B7280", marginTop: "2px", lineHeight: 1.5, whiteSpace: "pre-line" as const },

  // Summary
  summaryWrap: { display: "flex", justifyContent: "flex-end", marginTop: "16px", paddingTop: "12px" },
  summaryBox: { width: "300px" },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "7px",
  },
  summaryLabel: { fontSize: "12px", color: "#475569" },
  summaryValue: { fontSize: "12px", color: "#0F172A", fontWeight: 500 },
  summaryValueRed: { fontSize: "12px", color: "#000000", fontWeight: 600 },
  grandLabel: { fontSize: "14px", fontWeight: 800, color: "#0F172A" },
  grandValue: { fontSize: "18px", fontWeight: 900, color: "#000000" },
  amountWords: { fontSize: "10px", color: "#64748B", marginTop: "8px", textAlign: "right" as const, fontStyle: "italic" },

  // GST breakdown
  gstSection: { marginTop: "20px" },
  gstLabel: {
    fontSize: "9px",
    fontWeight: 700,
    color: "#64748B",
    letterSpacing: "1.2px",
    textTransform: "uppercase" as const,
    marginBottom: "8px",
  },
  gstThead: { background: "#F1F5F9" },
  gstTh: {
    padding: "8px 10px",
    fontSize: "10px",
    fontWeight: 700,
    color: "#475569",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    borderBottom: "1px solid #E5E7EB",
  },
  gstThRight: {
    padding: "8px 10px",
    fontSize: "10px",
    fontWeight: 700,
    color: "#475569",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    borderBottom: "1px solid #E5E7EB",
    textAlign: "right" as const,
  },
  gstTd: {
    padding: "8px 10px",
    fontSize: "11px",
    color: "#0F172A",
    borderBottom: "1px solid #F1F5F9",
  },
  gstTdRight: {
    padding: "8px 10px",
    fontSize: "11px",
    color: "#0F172A",
    borderBottom: "1px solid #F1F5F9",
    textAlign: "right" as const,
  },
  gstTotalRow: { background: "#F8FAFC" },
  gstTotalTd: {
    padding: "8px 10px",
    fontSize: "11px",
    fontWeight: 700,
    color: "#0F172A",
    borderTop: "1.5px solid #E5E7EB",
    borderBottom: "none",
  },
  gstTotalTdRight: {
    padding: "8px 10px",
    fontSize: "11px",
    fontWeight: 700,
    color: "#0F172A",
    borderTop: "1.5px solid #E5E7EB",
    borderBottom: "none",
    textAlign: "right" as const,
  },
  noteGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "24px",
    marginTop: "18px",
    alignItems: "start",
  },
  noteLabel: {
    fontSize: "10px",
    fontWeight: 700,
    color: "#475569",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    marginBottom: "8px",
  },
  noteText: {
    fontSize: "11px",
    color: "#334155",
    lineHeight: 1.6,
  },
  bankBox: {
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    padding: "12px 14px",
    background: "#FAFBFC",
  },
  bankRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "5px",
    fontSize: "11px",
    color: "#334155",
  },
  bankKey: { fontWeight: 700, color: "#475569", minWidth: "110px" },
  bankValue: { fontWeight: 600, color: "#0F172A", textAlign: "right" as const, flex: 1 },

  // Footer
  footer: { marginTop: "18px" },
  footerCopy: { fontSize: "10px", color: "#94A3B8", marginTop: "4px" },
  signBox: { textAlign: "right" as const },
  signLine: { borderTop: "1px solid #0F172A", width: "180px", marginLeft: "auto", marginBottom: "6px" },
  signLabel: { fontSize: "10px", fontWeight: 700, color: "#475569", letterSpacing: "1px", textTransform: "uppercase" as const },
};

// ── Helper components ─────────────────────────────────────────
function SummaryRow({
  label, value, bold, red, green, large, compact,
}: {
  label: string; value: string;
  bold?: boolean; red?: boolean; green?: boolean; large?: boolean; compact?: boolean;
}) {
  return (
    <div style={{ ...styles.summaryRow, marginBottom: compact ? 4 : 7 }}>
      <span style={large ? styles.grandLabel : bold ? { ...styles.summaryLabel, fontWeight: 700 } : styles.summaryLabel}>
        {label}
      </span>
      <span style={
        large ? styles.grandValue :
        red    ? styles.summaryValueRed :
        green  ? { ...styles.summaryValue, color: "#16A34A" } :
        bold   ? { ...styles.summaryValue, fontWeight: 700 } :
        styles.summaryValue
      }>
        {value}
      </span>
    </div>
  );
}

function fmt(v: number | string) {
  return `₹${Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function hasValue(v: unknown): v is string {
  return typeof v === "string" && v.trim() !== "" && v.trim() !== "-" && v.trim() !== "—";
}

// ── Main template ─────────────────────────────────────────────
export const InvoicePDFTemplate = React.forwardRef(({ data, settingsOverride, theme = "classic", accentColor, logoUrl, headerImageUrl, signatureUrl }: any, ref: any) => {
  const isCompact = theme === "compact";
  const {
    sale_id, date, due_date,
    customer_name, customer_address, customer_mobile, customer_gstin,
    payment_mode, payment_status,
    items = [],
    subtotal, discount, discount_label,
    cgst, sgst,
    round_off,
    total,
    amount_in_words,
    gst_breakdown = [],
  } = data;
  const { profile, company, zoduId } = useTenantContext();
  const companies = useAppSelector(AllCompanies);
  const selectedCompany = companies.find(c => c.zodu_id === zoduId);
  const reduxInvoiceSettings = useAppSelector(InvoiceSettingsData);
  const invoiceSettings = settingsOverride ?? reduxInvoiceSettings;
  const showCompanyLogo = invoiceSettings?.show_company_logo ?? false;
  const showItemDescription = invoiceSettings?.show_description ?? false;
  // S.No and Item ID are independent, additive columns — either, both, or
  // neither can be shown.
  const showItemId = invoiceSettings?.show_item_id ?? false;
  const showSerialNo = invoiceSettings?.show_serial_no ?? true;
  const showCustomerDetails = invoiceSettings?.show_customer_details ?? true;
  const showTaxDetails = invoiceSettings?.show_tax_details ?? true;
  const showPaymentDetails = invoiceSettings?.show_payment_details ?? false;
  const showTermsConditions = invoiceSettings?.show_terms_conditions ?? false;
  const termsConditionsText = invoiceSettings?.terms_conditions ?? "";
  const showNotes = invoiceSettings?.show_notes ?? false;
  const notesText = invoiceSettings?.notes ?? "";
  const showSignature = invoiceSettings?.show_signature ?? false;
  // `signatureUrl` is an explicit prop (used by the Settings-page live preview
  // for an in-progress upload not yet saved) — real invoice rendering has no
  // such prop and falls back to the persisted value on invoiceSettings.
  const resolvedSignatureUrl = signatureUrl || invoiceSettings?.signature_url || "";
  const showBankDetails = invoiceSettings?.show_bank_details ?? true;
  // Same prop-first-then-persisted-settings fallback as signature: the Settings
  // page's live preview passes an in-progress (unsaved) color as `accentColor`;
  // real invoice rendering has no such prop and uses the saved theme color.
  const resolvedAccentColor = accentColor || invoiceSettings?.invoice_theme_color || "#D0021B";

  const showDiscount = discount && Number(discount) > 0;
  const showRoundOff = round_off !== undefined && round_off !== null && Number(round_off) !== 0;

  const addressParts = [
    selectedCompany?.area_street_name || company?.address_line_1,
    selectedCompany?.building_no || company?.address_line_2,
    company?.city || selectedCompany?.city,
    company?.district || selectedCompany?.district,
    company?.state || selectedCompany?.state,
    company?.pincode || selectedCompany?.pincode,
  ].filter(Boolean);
  const addressLine1 = addressParts.slice(0, 3).join(", ");
  const addressLine2 = addressParts.slice(3).join(", ");

  const co = {
    name:          selectedCompany?.restaurant_name || selectedCompany?.business_name || selectedCompany?.store_name || selectedCompany?.company_name || profile?.restaurant_name || "Your Company Name",
    gstin:         company?.gst_no || selectedCompany?.gst_no || "",
    line1:         addressLine1,
    line2:         addressLine2,
    phone:         profile?.phone_number || selectedCompany?.phone_number || selectedCompany?.mobile_no || "",
    bankName:      company?.bank_name || selectedCompany?.bank_name || "Bank Details N/A",
    accountHolder: company?.holder_name || selectedCompany?.holder_name || "",
    accountNumber: company?.account_number || selectedCompany?.account_number || "",
    branchIfsc:    company?.ifsc_code || selectedCompany?.ifsc_code || "",
    declaration:   "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
  };

  return (
    <div ref={ref} style={{ ...styles.page, padding: isCompact ? "20px 24px" : styles.page.padding }}>

      {headerImageUrl && (
        <img
          src={headerImageUrl}
          alt=""
          style={{ width: "100%", maxHeight: isCompact ? 90 : 130, objectFit: "cover", marginBottom: isCompact ? 12 : 18, display: "block" }}
        />
      )}

      {/* ── HEADER ───────────────────────────────────────────── */}
      <div data-pdf-header style={styles.header}>
        <div>
          {showCompanyLogo && logoUrl && (
            <img src={logoUrl} alt="" style={{ maxHeight: 44, maxWidth: 140, objectFit: "contain", marginBottom: 8, display: "block" }} />
          )}
          <h1 style={{ ...styles.brandName, color: resolvedAccentColor }}>{co.name}</h1>
          {co.gstin && <p style={styles.headerMeta}>GSTIN: {co.gstin}</p>}
          {co.line1 && <p style={styles.headerMeta}>{co.line1}</p>}
          {co.line2 && <p style={styles.headerMeta}>{co.line2}</p>}
          {co.phone && <p style={styles.headerMeta}>Phone: {co.phone}</p>}
        </div>

        <div style={styles.invoiceRight}>
          <h2 style={styles.invoiceTitle}>INVOICE</h2>
          <div style={styles.invoiceMetaRow}>
            <span style={styles.invoiceMetaLabel}>Invoice #:</span>
            <span style={styles.invoiceMetaValue}>{sale_id}</span>
          </div>
          <div style={styles.invoiceMetaRow}>
            <span style={styles.invoiceMetaLabel}>Date:</span>
            <span style={styles.invoiceMetaValue}>{date}</span>
          </div>
          {hasValue(due_date) && (
            <div style={styles.invoiceMetaRow}>
              <span style={styles.invoiceMetaLabel}>Due Date:</span>
              <span style={styles.invoiceMetaValue}>{due_date}</span>
            </div>
          )}
        </div>
      </div>

      {/* Red divider */}
      <div data-pdf-header-divider style={{ ...styles.redDivider, borderTop: `2px solid ${resolvedAccentColor}` }} />

      {/* ── BILL TO ───────────────────────────────────────────── */}
      {(showCustomerDetails || showPaymentDetails) && (
        <div style={{
          ...styles.billBox,
          padding: isCompact ? "10px 14px" : styles.billBox.padding,
          marginTop: isCompact ? 10 : styles.billBox.marginTop,
          marginBottom: isCompact ? 14 : styles.billBox.marginBottom,
        }}>
          {showCustomerDetails && (
            <div>
              <p style={styles.billLabel}>BILL TO</p>
              <h3 style={styles.billName}>{customer_name}</h3>
              {hasValue(customer_gstin) && (
                <p style={styles.billMeta}>GSTIN: {customer_gstin}</p>
              )}
              {hasValue(customer_address) && (
                <p style={styles.billMeta}>{customer_address}</p>
              )}
              {hasValue(customer_mobile) && (
                <p style={styles.billMeta}>Mobile: {customer_mobile}</p>
              )}
            </div>
          )}

          {showPaymentDetails && (
            <div style={{ textAlign: "right" }}>
              <span style={{
                ...styles.paidBadge,
                ...(payment_status === "unpaid" || payment_status === "pending"
                  ? { background: "#FEF3C7", color: "#D97706" }
                  : payment_status === "partial"
                  ? { background: "#FEF9C3", color: "#CA8A04" }
                  : {}),
              }}>
                {payment_status === "fully_paid" || !payment_status ? "PAID" : payment_status.toUpperCase()}
              </span>
              <p style={styles.paymentMode}>Payment Mode: {payment_mode}</p>
            </div>
          )}
        </div>
      )}

      {/* ── ITEMS TABLE ──────────────────────────────────────── */}
      <table style={{ ...styles.table, marginBottom: isCompact ? 16 : styles.table.marginBottom }}>
        <colgroup>
          {showSerialNo && <col style={{ width: "40px" }} />}
          {showItemId && <col style={{ width: "84px" }} />}
          <col />
          <col style={{ width: "64px" }} />
          <col style={{ width: "42px" }} />
          <col style={{ width: "40px" }} />
          <col style={{ width: "78px" }} />
          <col style={{ width: "78px" }} />
          <col style={{ width: "88px" }} />
        </colgroup>
        <thead data-pdf-repeat-thead style={{ ...styles.thead, background: resolvedAccentColor }}>
          <tr>
            {showSerialNo && (
              <th style={{ ...styles.theadTh, padding: isCompact ? "6px 8px" : styles.theadTh.padding }}>SL</th>
            )}
            {showItemId && (
              <th style={{ ...styles.theadTh, padding: isCompact ? "6px 8px" : styles.theadTh.padding }}>Item ID</th>
            )}
            <th style={{ ...styles.theadTh, padding: isCompact ? "6px 8px" : styles.theadTh.padding }}>Item Name</th>
            <th style={{ ...styles.theadThCenter, padding: isCompact ? "6px 8px" : styles.theadThCenter.padding }}>HSN</th>
            <th style={{ ...styles.theadThCenter, padding: isCompact ? "6px 8px" : styles.theadThCenter.padding }}>Tax</th>
            <th style={{ ...styles.theadThCenter, padding: isCompact ? "6px 8px" : styles.theadThCenter.padding }}>QTY</th>
            <th style={{ ...styles.theadThRight, padding: isCompact ? "6px 8px" : styles.theadThRight.padding }}>MRP</th>
            <th style={{ ...styles.theadThRight, padding: isCompact ? "6px 8px" : styles.theadThRight.padding }}>Rate</th>
            <th style={{ ...styles.theadThRight, padding: isCompact ? "6px 8px" : styles.theadThRight.padding }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any, i: number) => (
            <tr key={i} data-pdf-keep-together style={{ background: i % 2 === 0 ? "#fff" : "#FAFBFC" }}>
              {showSerialNo && (
                <td style={{ ...styles.tdBase, padding: isCompact ? "5px 8px" : styles.tdBase.padding }}>
                  {String(i + 1).padStart(2, "0")}
                </td>
              )}
              {showItemId && (
                <td style={{ ...styles.tdBase, ...styles.tdItemId, padding: isCompact ? "5px 8px" : styles.tdBase.padding }}>
                  {item.item_id || "—"}
                </td>
              )}
              <td style={{ ...styles.tdBase, padding: isCompact ? "5px 8px" : styles.tdBase.padding }}>
                <div style={styles.itemName}>{item.name}</div>
                {showItemDescription && item.description && (
                  <div style={styles.itemSub}>{item.description}</div>
                )}
                {/* {item.category && (
                  <div style={styles.itemSub}>{item.category}</div>
                )} */}
              </td>
              <td style={{ ...styles.tdCenter, padding: isCompact ? "5px 8px" : styles.tdCenter.padding }}>{item.hsn || "—"}</td>
              <td style={{ ...styles.tdCenter, padding: isCompact ? "5px 8px" : styles.tdCenter.padding }}>{Number(item.tax).toFixed(0)}%</td>
              <td style={{ ...styles.tdCenter, padding: isCompact ? "5px 8px" : styles.tdCenter.padding }}>{item.qty}</td>
              <td style={{ ...styles.tdRight, padding: isCompact ? "5px 8px" : styles.tdRight.padding }}>{fmt(item.mrp ?? item.rate)}</td>
              <td style={{ ...styles.tdRight, padding: isCompact ? "5px 8px" : styles.tdRight.padding }}>{fmt(item.rate)}</td>
              <td style={{ ...styles.tdRight, padding: isCompact ? "5px 8px" : styles.tdRight.padding, fontWeight: 700 }}>{fmt(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── SUMMARY (kept together across pages) ─────────────── */}
      <div data-pdf-keep-together style={{ ...styles.summaryWrap, marginTop: isCompact ? 8 : 12, paddingTop: isCompact ? 6 : 8 }}>
        <div style={styles.summaryBox}>
          <SummaryRow label="Subtotal:" value={fmt(subtotal)} compact={isCompact} />

          {showDiscount && (
            <SummaryRow
              label={discount_label ?? "Discount:"}
              value={`-${fmt(discount)}`}
              red
              compact={isCompact}
            />
          )}

          {showTaxDetails && (
            <>
              <SummaryRow label="CGST:" value={fmt(cgst)} compact={isCompact} />
              <SummaryRow label="SGST:" value={fmt(sgst)} compact={isCompact} />
            </>
          )}

          {showRoundOff && (
            <SummaryRow
              label="Round Off:"
              value={Number(round_off) > 0 ? `+${fmt(round_off)}` : fmt(round_off)}
              compact={isCompact}
            />
          )}

          <div style={{ borderTop: "2px solid #E5E7EB", margin: isCompact ? "6px 0" : "10px 0" }} />

          <SummaryRow label="Grand Total:" value={fmt(total)} large compact={isCompact} />

          {amount_in_words && (
            <p style={styles.amountWords}>Amount in words: {amount_in_words}</p>
          )}
        </div>
      </div>

      {/* ── HSN-WISE TAX BREAKDOWN (kept together across pages) ── */}
      {showTaxDetails && gst_breakdown.length > 0 && (
        <div data-pdf-keep-together style={{ ...styles.gstSection, marginTop: isCompact ? 18 : styles.gstSection.marginTop }}>
          <p style={styles.gstLabel}>HSN-wise Tax Breakdown</p>
          <table style={{ ...styles.table, marginBottom: 0 }}>
            <thead style={styles.gstThead}>
              <tr>
                <th style={styles.gstTh}>HSN Code</th>
                <th style={styles.gstThRight}>Taxable Value</th>
                <th style={styles.gstThRight}>CGST Rate</th>
                <th style={styles.gstThRight}>CGST Amount</th>
                <th style={styles.gstThRight}>SGST Rate</th>
                <th style={styles.gstThRight}>SGST Amount</th>
                <th style={styles.gstThRight}>Total Tax</th>
              </tr>
            </thead>
            <tbody>
              {gst_breakdown.map((row: any, i: number) => (
                <tr key={i} data-pdf-keep-together>
                  <td style={{ ...styles.gstTd, fontWeight: 600 }}>{row.hsn || "—"}</td>
                  <td style={styles.gstTdRight}>{fmt(row.taxable)}</td>
                  <td style={styles.gstTdRight}>{row.cgstRate}%</td>
                  <td style={styles.gstTdRight}>{fmt(row.cgstAmount)}</td>
                  <td style={styles.gstTdRight}>{row.sgstRate}%</td>
                  <td style={styles.gstTdRight}>{fmt(row.sgstAmount)}</td>
                  <td style={{ ...styles.gstTdRight, fontWeight: 700 }}>{fmt(row.totalTaxAmount)}</td>
                </tr>
              ))}
              {(() => {
                const totalTaxable = gst_breakdown.reduce((sum: number, row: any) => sum + Number(row.taxable), 0);
                const totalCgst = gst_breakdown.reduce((sum: number, row: any) => sum + Number(row.cgstAmount), 0);
                const totalSgst = gst_breakdown.reduce((sum: number, row: any) => sum + Number(row.sgstAmount), 0);
                const totalTax = gst_breakdown.reduce((sum: number, row: any) => sum + Number(row.totalTaxAmount), 0);

                return (
                  <tr style={styles.gstTotalRow}>
                    <td style={{ ...styles.gstTotalTd }}>Total</td>
                    <td style={styles.gstTotalTdRight}>{fmt(totalTaxable)}</td>
                    <td style={styles.gstTotalTdRight}>—</td>
                    <td style={styles.gstTotalTdRight}>{fmt(totalCgst)}</td>
                    <td style={styles.gstTotalTdRight}>—</td>
                    <td style={styles.gstTotalTdRight}>{fmt(totalSgst)}</td>
                    <td style={styles.gstTotalTdRight}>{fmt(totalTax)}</td>
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>
      )}

      {/* ── DECLARATION + BANK + FOOTER (kept together across pages) ── */}
      <div data-pdf-keep-together>
        <div style={{ ...styles.noteGrid, marginTop: isCompact ? 14 : styles.noteGrid.marginTop, gap: isCompact ? "16px" : styles.noteGrid.gap }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <p style={styles.noteLabel}>Declaration</p>
              <p style={styles.noteText}>{co.declaration}</p>
            </div>

            {showTermsConditions && termsConditionsText && (
              <div>
                <p style={styles.noteLabel}>Terms &amp; Conditions</p>
                <p style={{ ...styles.noteText, whiteSpace: "pre-line" as const }}>{termsConditionsText}</p>
              </div>
            )}

            {showNotes && notesText && (
              <div>
                <p style={styles.noteLabel}>Notes</p>
                <p style={{ ...styles.noteText, whiteSpace: "pre-line" as const }}>{notesText}</p>
              </div>
            )}
          </div>

          {showBankDetails && (
            <div style={styles.bankBox}>
              <p style={styles.noteLabel}>Company&apos;s Bank Details</p>
              <div style={styles.bankRow}>
                <span style={styles.bankKey}>Bank Name</span>
                <span style={styles.bankValue}>{co.bankName}</span>
              </div>
              {hasValue(co.accountHolder) && (
                <div style={styles.bankRow}>
                  <span style={styles.bankKey}>Account Holder</span>
                  <span style={styles.bankValue}>{co.accountHolder}</span>
                </div>
              )}
              <div style={styles.bankRow}>
                <span style={styles.bankKey}>A/c No.</span>
                <span style={styles.bankValue}>{co.accountNumber}</span>
              </div>
              <div style={{ ...styles.bankRow, marginBottom: 0 }}>
                <span style={styles.bankKey}>Branch &amp; IFSC</span>
                <span style={styles.bankValue}>{co.branchIfsc}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER ─────────────────────────────────────────── */}
        <div style={{ ...styles.footer, marginTop: isCompact ? 16 : styles.footer.marginTop }}>
          <p style={styles.footerCopy}>
            © 2024 {co.name}. Authorised Signatory Required.
          </p>

          {showSignature && (
            <div style={styles.signBox}>
              {resolvedSignatureUrl && (
                <img
                  src={resolvedSignatureUrl}
                  alt="Authorized signature"
                  style={{ maxHeight: 46, maxWidth: 180, objectFit: "contain", marginLeft: "auto", marginBottom: 4, display: "block" }}
                />
              )}
              <div style={styles.signLine} />
              <p style={styles.signLabel}>Authorized Signatory</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

InvoicePDFTemplate.displayName = "InvoicePDFTemplate";
