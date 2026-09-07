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
  billCol: { flex: "1 1 0%", minWidth: 0, paddingRight: "16px" },
  paymentCol: { flexShrink: 0, textAlign: "right" as const },
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
    overflowWrap: "anywhere" as const,
  },
  tdRight: {
    padding: "8px 8px",
    fontSize: "10px",
    color: "#0F172A",
    borderBottom: "1px solid #E5E7EB",
    textAlign: "right" as const,
    verticalAlign: "top" as const,
    // Currency values must never wrap mid-number — unlike free-text cells,
    // there's no good place to break, so force a single line.
    whiteSpace: "nowrap" as const,
  },
  tdCenter: {
    padding: "8px 8px",
    fontSize: "10px",
    color: "#0F172A",
    borderBottom: "1px solid #E5E7EB",
    textAlign: "center" as const,
    verticalAlign: "top" as const,
    // HSN/Tax/Qty must stay on one line — wrapping (or overflowing) breaks
    // alignment with the row next to it. Truncate with an ellipsis in the
    // rare case a value is wider than the column, instead of letting it
    // bleed into the next cell.
    whiteSpace: "nowrap" as const,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
  },
  // Break only at word boundaries so the item title reads naturally — except
  // for a single unbroken token wider than the column (garbage input, a SKU
  // typed as the name), which falls back to a mid-word break instead of
  // overflowing into the HSN column next to it.
  itemName: { fontWeight: 600, fontSize: "10px", color: "#0F172A", overflowWrap: "break-word" as const, wordBreak: "normal" as const },
  // Item IDs/SKUs must stay on one line, never wrap — truncate with an
  // ellipsis if one is too long for the column rather than overflowing into
  // the Item Name text next to it.
  tdItemId: {
    whiteSpace: "nowrap" as const,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
    fontSize: "9px",
  },
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
    whiteSpace: "nowrap" as const,
  },
  gstTotalRow: { background: "#F8FAFC" },
  gstTotalTd: {
    padding: "8px 10px",
    fontSize: "11px",
    fontWeight: 700,
    color: "#0F172A",
    borderTop: "1.5px solid #E5E7EB",
    borderBottom: "1px solid #E5E7EB",
  },
  gstTotalTdRight: {
    padding: "8px 10px",
    fontSize: "11px",
    fontWeight: 700,
    color: "#0F172A",
    borderTop: "1.5px solid #E5E7EB",
    borderBottom: "1px solid #E5E7EB",
    textAlign: "right" as const,
    whiteSpace: "nowrap" as const,
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

// Rate suffix for the CGST/SGST summary labels — e.g. "CGST (2.5%)". Only
// meaningful when every HSN slab on the bill carries the same rate; a
// mixed-rate bill keeps the plain label and shows each rate in the
// HSN-wise table instead.
function gstRateSuffix(rows: any[], key: "cgstRate" | "sgstRate") {
  const rates = Array.from(new Set(rows.map((row: any) => Number(row[key]))));
  if (rates.length !== 1 || !Number.isFinite(rates[0])) return "";
  return ` (${rates[0]}%)`;
}


// ── Main template ─────────────────────────────────────────────
export const InvoicePDFTemplate = React.forwardRef(({ data, settingsOverride, theme = "classic", accentColor, logoUrl, headerImageUrl, signatureUrl }: any, ref: any) => {
  const isCompact = theme === "compact";
  const {
    sale_id, date, due_date,
    customer_name, customer_address, customer_mobile, customer_gstin,
    customer_shipping_address,
    payment_mode, payment_status,
    items = [],
    subtotal, discount, discount_label,
    cgst, sgst,
    round_off,
    total,
    amount_in_words,
    gst_breakdown = [],
  } = data;
  const { profile, company, zoduId, branchId } = useTenantContext();
  const companies = useAppSelector(AllCompanies);
  const selectedCompany = companies.find(c => c.zodu_id === zoduId);
  const selectedBranch = selectedCompany?.branches?.find(b => b.branch_id === branchId);
  const reduxInvoiceSettings = useAppSelector(InvoiceSettingsData);
  const invoiceSettings = settingsOverride ?? reduxInvoiceSettings;
  const showCompanyLogo = invoiceSettings?.show_company_logo ?? false;
  const showItemDescription = invoiceSettings?.show_description ?? false;
  // S.No and Item ID are independent, additive columns — either, both, or
  // neither can be shown.
  const showItemId = invoiceSettings?.show_item_id ?? false;
  const showSerialNo = invoiceSettings?.show_serial_no ?? true;
  const showCustomerDetails = invoiceSettings?.show_customer_details ?? true;
  const showShipToDetails = showCustomerDetails && hasValue(customer_shipping_address);
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
  // Same prop-first-then-company-record fallback: the logo lives on the
  // company (Company Details), not on invoice settings — real invoice
  // rendering never passes `logoUrl` at all, it just reads the company row.
  const resolvedLogoUrl = logoUrl || selectedCompany?.company_logo_url || "";
  const showBankDetails = invoiceSettings?.show_bank_details ?? true;
  // Same prop-first-then-persisted-settings fallback as signature: the Settings
  // page's live preview passes an in-progress (unsaved) color as `accentColor`;
  // real invoice rendering has no such prop and uses the saved theme color.
  const resolvedAccentColor = accentColor || invoiceSettings?.invoice_theme_color || "#D0021B";

  const showDiscount = discount && Number(discount) > 0;
  const showRoundOff = round_off !== undefined && round_off !== null && Number(round_off) !== 0;

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

  const co = {
    name:          selectedCompany?.restaurant_name || selectedCompany?.business_name || selectedCompany?.store_name || selectedCompany?.company_name || profile?.restaurant_name || "Your Company Name",
    gstin:         company?.gst_no || selectedCompany?.gst_no || "",
    line1:         addressLine1,
    line2:         addressLine2,
    phone:         profile?.phone_number || selectedCompany?.phone_number || selectedCompany?.mobile_no || "",
    bankName:      selectedBranch?.bank_name || company?.bank_name || selectedCompany?.bank_name || "Bank Details N/A",
    bankBranch:    selectedBranch?.bank_branch || company?.bank_branch || selectedCompany?.bank_branch || "",
    accountHolder: selectedBranch?.holder_name || company?.holder_name || selectedCompany?.holder_name || "",
    accountNumber: selectedBranch?.account_number || company?.account_number || selectedCompany?.account_number || "",
    branchIfsc:    selectedBranch?.ifsc_code || company?.ifsc_code || selectedCompany?.ifsc_code || "",
  };

  // Only the fields that actually have a value get a row — a blank "Branch:"
  // or "IFSC:" line looks like a rendering bug rather than missing data.
  const bankRows: Array<[string, string]> = ([
    ["Bank Name", co.bankName],
    ["Account Holder", co.accountHolder],
    ["A/c No.", co.accountNumber],
    ["Branch", co.bankBranch],
    ["IFSC", co.branchIfsc],
  ] as Array<[string, string]>).filter(([, value]) => hasValue(value));

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
          {showCompanyLogo && resolvedLogoUrl && (
            <img src={resolvedLogoUrl} alt="" style={{ maxHeight: 44, maxWidth: 140, objectFit: "contain", marginBottom: 8, display: "block" }} />
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
            <div style={styles.billCol}>
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

          {showShipToDetails && (
            <div style={styles.billCol}>
              <p style={styles.billLabel}>SHIP TO</p>
              <h3 style={styles.billName}>{customer_name}</h3>
              {hasValue(customer_gstin) && (
                <p style={styles.billMeta}>GSTIN: {customer_gstin}</p>
              )}
              <p style={styles.billMeta}>{customer_shipping_address}</p>
              {hasValue(customer_mobile) && (
                <p style={styles.billMeta}>Mobile: {customer_mobile}</p>
              )}
            </div>
          )}

          {showPaymentDetails && (
            <div style={styles.paymentCol}>
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
          {showSerialNo && <col style={{ width: "30px" }} />}
          {/* Wide enough for a typical SKU/item ID on one line without truncating. */}
          {showItemId && <col style={{ width: "96px" }} />}
          <col />
          {/* HSN codes run up to 8 digits under GST — must fit without truncation. */}
          <col style={{ width: "68px" }} />
          {showTaxDetails && <col style={{ width: "36px" }} />}
          <col style={{ width: "40px" }} />
          {/* Amount columns are sized to fit large totals (up to 8-digit
              rupee values) on one line — narrower widths let the nowrap
              text overflow its cell and visually overlap the next column. */}
          <col style={{ width: "106px" }} />
          <col style={{ width: "106px" }} />
          <col style={{ width: "120px" }} />
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
            {showTaxDetails && (
              <th style={{ ...styles.theadThCenter, padding: isCompact ? "6px 8px" : styles.theadThCenter.padding }}>Tax</th>
            )}
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
              {showTaxDetails && (
                <td style={{ ...styles.tdCenter, padding: isCompact ? "5px 8px" : styles.tdCenter.padding }}>{Number(item.tax).toFixed(0)}%</td>
              )}
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

          {/* Tax totals are part of the bill amount, not the "Tax Details"
              breakdown — the setting only controls the per-item Tax column
              and the HSN-wise table below. */}
          <SummaryRow label={`CGST${gstRateSuffix(gst_breakdown, "cgstRate")}:`} value={fmt(cgst)} compact={isCompact} />
          <SummaryRow label={`SGST${gstRateSuffix(gst_breakdown, "sgstRate")}:`} value={fmt(sgst)} compact={isCompact} />

          {showRoundOff && (
            <SummaryRow
              label="Round Off:"
              value={Number(round_off) > 0 ? `+${fmt(round_off)}` : fmt(round_off)}
              compact={isCompact}
            />
          )}

          <div style={{ borderTop: "2px solid #E5E7EB", margin: isCompact ? "6px 0" : "10px 0" }} />

          <SummaryRow label="Grand Total:" value={fmt(total)} large compact={isCompact} />
        </div>
      </div>

      {/* Full page width, not the 300px summary box — a right-aligned phrase
          this long wraps unnecessarily inside that narrow box even though
          the rest of the page is empty. */}
      {amount_in_words && (
        <p style={{ ...styles.amountWords, marginTop: isCompact ? 4 : 6 }}>Amount in words: {amount_in_words}</p>
      )}

      {/* ── HSN-WISE TAX BREAKDOWN (kept together across pages) ── */}
      {showTaxDetails && gst_breakdown.length > 0 && (
        <div data-pdf-keep-together style={{ ...styles.gstSection, marginTop: isCompact ? 18 : styles.gstSection.marginTop }}>
          <p style={styles.gstLabel}>HSN-wise Tax Breakdown</p>
          <table style={{ ...styles.table, marginBottom: 0 }}>
            <colgroup>
              <col style={{ width: "80px" }} />
              {/* Amount columns get the bulk of the width so large totals
                  never overflow their cell and overlap the next column. */}
              <col />
              <col style={{ width: "50px" }} />
              <col />
              <col style={{ width: "50px" }} />
              <col />
              <col />
            </colgroup>
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
              {bankRows.map(([label, value], i) => (
                <div
                  key={label}
                  style={i === bankRows.length - 1 ? { ...styles.bankRow, marginBottom: 0 } : styles.bankRow}
                >
                  <span style={styles.bankKey}>{label}</span>
                  <span style={styles.bankValue}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── FOOTER ─────────────────────────────────────────── */}
        <div style={{ ...styles.footer, marginTop: isCompact ? 16 : styles.footer.marginTop }}>
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
