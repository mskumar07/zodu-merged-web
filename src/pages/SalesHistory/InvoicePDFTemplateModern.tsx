import { useAppSelector } from "@store/store";
import { useTenantContext } from "@store/tenantContext";
import { AllCompanies, InvoiceSettingsData } from "@store/slices/userSlice";
import React from "react";
import { saleDocumentLabel } from "@utils/saleType";
import { gstSummaryRows } from "@utils/gstSummary";

// ── Inline style constants ────────────────────────────────────
// A cleaner, minimal alternative to InvoicePDFTemplate — same data shape and
// the same invoice-settings toggles, just a different visual layout (no
// colored table header, thin-rule sections instead of boxed cards).
const styles = {
  page: {
    width: "794px",
    padding: "12px 38px 34px 38px",
    background: "#fff",
    fontFamily: "'Inter', 'Arial', sans-serif",
    color: "#1F2937",
    fontSize: "13px",
    boxSizing: "border-box" as const,
    position: "relative" as const,
  },

  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  // Logo and company details sit side by side rather than stacked, so a larger
  // logo does not push the address block down the page.
  brandRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "32px", width: "100%" },
  brandName: {
    fontSize: "18px",
    fontWeight: 800,
    letterSpacing: "0.5px",
    textTransform: "uppercase" as const,
    margin: "0 0 8px 0",
    lineHeight: 1.25,
  },
  headerMeta: { margin: "2px 0", fontSize: "11px", color: "#6B7280" },

  // Document meta — invoice no./date sit at the right margin of the Billed To
  // row rather than beside the company block, so they print once at the top of
  // the document instead of repeating in the header band on every page.
  // `marginLeft: auto` pins the column right even when Billed To is switched
  // off and it is the only column in the row.
  metaCol: { textAlign: "right" as const, flexShrink: 0, marginLeft: "auto" },
  // Copy marking — the document's heading: centred under the company block and
  // sized to be read at a glance, not tucked into the right corner.
  copyTypeMark: { fontSize: "17px", fontWeight: 800, letterSpacing: "0.18em", color: "#374151", textTransform: "uppercase" as const, textAlign: "center" as const, margin: "0 0 18px 0" },
  // Blank rule for a vehicle number the sale does not carry — the transport
  // copy is filled in by hand at dispatch.
  vehicleNoBlank: { display: "inline-block", minWidth: "88px", borderBottom: "1px solid #9CA3AF" },
  invoiceMetaRow: { display: "flex", justifyContent: "flex-end", gap: "10px", marginBottom: "3px" },
  invoiceMetaLabel: { fontSize: "11px", color: "#6B7280", minWidth: "64px", textAlign: "right" as const },
  invoiceMetaValue: { fontSize: "11px", color: "#111827", fontWeight: 600, minWidth: "90px", textAlign: "right" as const },

  divider: { borderTop: "1px solid #E5E7EB", margin: "20px 0" },

  infoGrid: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "24px" },
  infoLabel: { fontSize: "10px", fontWeight: 700, color: "#6B7280", letterSpacing: "0.6px", textTransform: "uppercase" as const, margin: "0 0 6px 0" },
  billName: { fontSize: "13px", fontWeight: 700, color: "#111827", margin: "0 0 3px 0" },
  billMeta: { fontSize: "11px", color: "#4B5563", margin: "2px 0" },
  billCol: { flex: "1 1 0%", minWidth: 0 },
  dueBox: { flexShrink: 0, textAlign: "right" as const },
  dueValue: { fontSize: "17px", fontWeight: 800, color: "#111827", margin: "0 0 4px 0" },
  statusBadge: {
    display: "inline-block",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.4px",
    textTransform: "uppercase" as const,
    padding: "2px 10px",
    borderRadius: "20px",
    background: "#DCFCE7",
    color: "#16A34A",
    marginBottom: "4px",
  },

  // Items table
  table: { width: "100%", tableLayout: "fixed" as const, borderCollapse: "collapse" as const },
  theadTh: {
    padding: "0 8px 8px 0",
    fontSize: "10px",
    fontWeight: 700,
    color: "#6B7280",
    textAlign: "left" as const,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    borderBottom: "1.5px solid #111827",
  },
  theadThRight: {
    padding: "0 0 8px 8px",
    fontSize: "10px",
    fontWeight: 700,
    color: "#6B7280",
    textAlign: "right" as const,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    borderBottom: "1.5px solid #111827",
  },
  theadThCenter: {
    padding: "0 8px 8px 8px",
    fontSize: "10px",
    fontWeight: 700,
    color: "#6B7280",
    textAlign: "center" as const,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    borderBottom: "1.5px solid #111827",
  },
  td: { padding: "10px 8px 10px 0", fontSize: "11px", color: "#111827", verticalAlign: "top" as const, borderBottom: "1px solid #F1F3F5", overflowWrap: "anywhere" as const },
  // Currency values must never wrap mid-number — force a single line.
  tdRight: { padding: "10px 0 10px 8px", fontSize: "11px", color: "#111827", textAlign: "right" as const, verticalAlign: "top" as const, borderBottom: "1px solid #F1F3F5", whiteSpace: "nowrap" as const },
  // HSN/Tax/Qty must stay on one line — truncate with an ellipsis rather
  // than wrap or overflow into the next cell.
  tdCenter: { padding: "10px 8px", fontSize: "11px", color: "#111827", textAlign: "center" as const, verticalAlign: "top" as const, borderBottom: "1px solid #F1F3F5", whiteSpace: "nowrap" as const, overflow: "hidden" as const, textOverflow: "ellipsis" as const },
  // Break only at word boundaries so the item title reads naturally — except
  // for a single unbroken token wider than the column, which falls back to
  // a mid-word break instead of overflowing into the HSN column next to it.
  itemName: { fontWeight: 600, fontSize: "11px", color: "#111827", overflowWrap: "break-word" as const, wordBreak: "normal" as const },
  itemSub: { fontSize: "10px", color: "#9CA3AF", marginTop: "2px", whiteSpace: "pre-line" as const },
  // Item IDs/SKUs must stay on one line — truncate with an ellipsis rather
  // than wrap or overflow into the Item Name text next to it.
  tdItemId: { whiteSpace: "nowrap" as const, overflow: "hidden" as const, textOverflow: "ellipsis" as const, fontSize: "9px" },

  // Summary
  summaryWrap: { display: "flex", justifyContent: "flex-end" },
  summaryBox: { width: "260px" },
  summaryRow: { display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: "12px" },
  summaryLabel: { color: "#6B7280" },
  summaryValue: { color: "#111827", fontWeight: 500 },
  summaryValueRed: { color: "#111827", fontWeight: 600 },
  grandRow: { display: "flex", justifyContent: "space-between", padding: "10px 0 0 0", marginTop: "6px", borderTop: "1.5px solid #111827" },
  grandLabel: { fontSize: "13px", fontWeight: 800, color: "#111827", letterSpacing: "0.04em", textTransform: "uppercase" as const },
  grandValue: { fontSize: "15px", fontWeight: 800, color: "#111827" },
  amountWords: { fontSize: "14px", fontWeight: 700, color: "#6B7280", marginTop: "8px", textAlign: "left" as const, fontStyle: "italic", width: "100%" },

  // GST breakdown
  gstSection: { marginTop: "20px" },
  gstLabel: { fontSize: "10px", fontWeight: 700, color: "#6B7280", letterSpacing: "0.6px", textTransform: "uppercase" as const, marginBottom: "8px" },
  gstTh: { padding: "0 8px 6px 0", fontSize: "10px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase" as const, borderBottom: "1px solid #E5E7EB" },
  gstThRight: { padding: "0 0 6px 8px", fontSize: "10px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase" as const, borderBottom: "1px solid #E5E7EB", textAlign: "right" as const },
  gstTd: { padding: "6px 8px 6px 0", fontSize: "11px", color: "#111827", borderBottom: "1px solid #F1F3F5" },
  gstTdRight: { padding: "6px 0 6px 8px", fontSize: "11px", color: "#111827", borderBottom: "1px solid #F1F3F5", textAlign: "right" as const, whiteSpace: "nowrap" as const },
  gstTotalTd: { padding: "6px 8px 6px 0", fontSize: "11px", fontWeight: 700, color: "#111827", borderTop: "1.5px solid #111827", borderBottom: "1px solid #111827" },
  gstTotalTdRight: { padding: "6px 0 6px 8px", fontSize: "11px", fontWeight: 700, color: "#111827", borderTop: "1.5px solid #111827", borderBottom: "1px solid #111827", textAlign: "right" as const, whiteSpace: "nowrap" as const },

  // Notes (left) and the signature (right) share one borderless table row so the
  // signature sits beside the notes on the right margin instead of below them.
  closingTable: { width: "100%", tableLayout: "fixed" as const, borderCollapse: "collapse" as const, marginTop: "42px" },
  closingNotesTd: { width: "62%", padding: "0 12px 0 0", verticalAlign: "top" as const },
  closingSignTd: { width: "38%", padding: 0, verticalAlign: "bottom" as const },

  noteLabel: { fontSize: "10px", fontWeight: 700, color: "#6B7280", letterSpacing: "0.6px", textTransform: "uppercase" as const, margin: "0 0 6px 0" },
  noteText: { fontSize: "11px", color: "#374151", lineHeight: 1.6, margin: "1px 0" },
  signBox: { textAlign: "right" as const, paddingTop: "40px" },
  signLabel: { fontSize: "12px", fontWeight: 700, color: "#111827", margin: "0" },
  signRole: { fontSize: "10px", color: "#6B7280", margin: "1px 0 0 0" },

  // Terms (left) + bank details (right) share one bordered table so the two blocks
  // line up and read as a single footer panel rather than two stacked paragraphs.
  footerTable: {
    width: "100%",
    tableLayout: "fixed" as const,
    borderCollapse: "collapse" as const,
    marginTop: "18px",
    border: "1px solid #D1D5DB",
  },
  footerTh: {
    padding: "7px 10px",
    fontSize: "10px",
    fontWeight: 700,
    color: "#374151",
    letterSpacing: "0.6px",
    textTransform: "uppercase" as const,
    textAlign: "left" as const,
    background: "#F3F4F6",
    border: "1px solid #D1D5DB",
  },
  footerTd: { padding: "10px", verticalAlign: "top" as const, border: "1px solid #D1D5DB" },

  // Label/value pairs inside the bank cell — a nested table keeps the values in a
  // straight column instead of the ragged "Account No.: 622214178" run-on lines.
  bankTable: { width: "100%", borderCollapse: "collapse" as const },
  bankLabelTd: { padding: "3px 10px 3px 0", fontSize: "11px", color: "#6B7280", whiteSpace: "nowrap" as const, verticalAlign: "top" as const, width: "38%" },
  bankValueTd: { padding: "3px 0", fontSize: "11px", color: "#111827", fontWeight: 600, verticalAlign: "top" as const, overflowWrap: "anywhere" as const },
};

function SummaryRow({ label, value, bold, red }: { label: string; value: string; bold?: boolean; red?: boolean }) {
  return (
    <div style={styles.summaryRow}>
      <span style={bold ? { ...styles.summaryLabel, fontWeight: 700, color: "#111827" } : styles.summaryLabel}>{label}</span>
      <span style={red ? styles.summaryValueRed : bold ? { ...styles.summaryValue, fontWeight: 700 } : styles.summaryValue}>{value}</span>
    </div>
  );
}

function fmt(v: number | string) {
  return `₹${Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function hasValue(v: unknown): v is string {
  return typeof v === "string" && v.trim() !== "" && v.trim() !== "-" && v.trim() !== "—";
}


// ── Modern template ─────────────────────────────────────────────
export const InvoicePDFTemplateModern = React.forwardRef(({ data, settingsOverride, theme = "classic", accentColor, logoUrl, headerImageUrl, signatureUrl, copyType }: any, ref: any) => {
  const isCompact = theme === "compact";
  const {
    sale_id, date, due_date,
    po_number, po_date,
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
    sale_type,
    vehicle_no,
  } = data;
  const documentLabel = saleDocumentLabel(sale_type);
  // One CGST/SGST pair per GST slab, so a bill mixing 5% and 18% items states
  // each rate beside its own amount instead of lumping them into one figure.
  const taxSummaryRows = gstSummaryRows(gst_breakdown, cgst, sgst);
  const { profile, company, zoduId, branchId } = useTenantContext();
  const companies = useAppSelector(AllCompanies);
  const selectedCompany = companies.find(c => c.zodu_id === zoduId);
  const selectedBranch = selectedCompany?.branches?.find(b => b.branch_id === branchId);
  const reduxInvoiceSettings = useAppSelector(InvoiceSettingsData);
  const invoiceSettings = settingsOverride ?? reduxInvoiceSettings;
  const showCompanyLogo = invoiceSettings?.show_company_logo ?? false;
  const showItemDescription = invoiceSettings?.show_description ?? false;
  const showItemId = invoiceSettings?.show_item_id ?? false;
  const showSerialNo = invoiceSettings?.show_serial_no ?? true;
  const showCustomerDetails = invoiceSettings?.show_customer_details ?? true;
  // Ship To is gated by its own setting on top of the customer-details one it
  // lives inside. Absent on rows predating the toggle — default on, matching
  // the previous always-print-when-present behavior.
  const showShippingAddress = invoiceSettings?.show_shipping_address ?? true;
  const showShipToDetails = showCustomerDetails && showShippingAddress && hasValue(customer_shipping_address);
  const showTaxDetails = invoiceSettings?.show_tax_details ?? true;
  const showPaymentDetails = invoiceSettings?.show_payment_details ?? false;
  const showTermsConditions = invoiceSettings?.show_terms_conditions ?? false;
  const termsConditionsText = invoiceSettings?.terms_conditions ?? "";
  const showNotes = invoiceSettings?.show_notes ?? false;
  const notesText = invoiceSettings?.notes ?? "";
  const showSignature = invoiceSettings?.show_signature ?? false;
  const resolvedSignatureUrl = signatureUrl || invoiceSettings?.signature_url || "";
  // Same prop-first-then-company-record fallback: the logo lives on the
  // company (Company Details), not on invoice settings — real invoice
  // rendering never passes `logoUrl` at all, it just reads the company row.
  const resolvedLogoUrl = logoUrl || selectedCompany?.company_logo_url || "";
  const showBankDetails = invoiceSettings?.show_bank_details ?? true;
  // Only terms share the panel with the bank details — notes sit below the table.
  const showTermsPanel = Boolean(showTermsConditions && termsConditionsText);
  const resolvedAccentColor = accentColor || invoiceSettings?.invoice_theme_color || "#111827";
  // A transport copy travels with the goods, so it is the only copy that
  // carries the vehicle number — the recipient's and supplier's copies leave
  // the row out entirely. Falls back to a blank rule to fill in by hand when
  // the sale carries no vehicle number.
  const showVehicleNo = String(copyType ?? "").trim().toLowerCase() === "transport";

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
    email:         profile?.email || selectedCompany?.email || "",
    bankName:      selectedBranch?.bank_name || company?.bank_name || selectedCompany?.bank_name || "",
    bankBranch:    selectedBranch?.bank_branch || company?.bank_branch || selectedCompany?.bank_branch || "",
    accountHolder: selectedBranch?.holder_name || company?.holder_name || selectedCompany?.holder_name || "",
    accountNumber: selectedBranch?.account_number || company?.account_number || selectedCompany?.account_number || "",
    branchIfsc:    selectedBranch?.ifsc_code || company?.ifsc_code || selectedCompany?.ifsc_code || "",
  };

  // Only the fields that actually have a value get a row — an invoice with a blank
  // "Branch & IFSC:" line looks like a rendering bug rather than missing data.
  const bankRows: Array<[string, string]> = ([
    ["Bank", co.bankName],
    ["Branch", co.bankBranch],
    ["Account Name", co.accountHolder],
    ["Account No.", co.accountNumber],
    ["IFSC", co.branchIfsc],
  ] as Array<[string, string]>).filter(([, value]) => hasValue(value));

  const statusLabel = payment_status === "fully_paid" || !payment_status ? "PAID" : String(payment_status).toUpperCase();
  const statusColors = payment_status === "unpaid" || payment_status === "pending"
    ? { background: "#FEF3C7", color: "#D97706" }
    : payment_status === "partial"
    ? { background: "#FEF9C3", color: "#CA8A04" }
    : { background: "#DCFCE7", color: "#16A34A" };

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
      <div data-pdf-header>
        <div style={styles.header}>
          <div style={styles.brandRow}>
            <div>
              <h1 style={{ ...styles.brandName, color: resolvedAccentColor }}>{co.name}</h1>
              {co.gstin && <p style={styles.headerMeta}>GSTIN: {co.gstin}</p>}
              {co.line1 && <p style={styles.headerMeta}>{co.line1}</p>}
              {co.line2 && <p style={styles.headerMeta}>{co.line2}</p>}
              {co.phone && <p style={styles.headerMeta}>Phone: {co.phone}</p>}
            </div>
            {showCompanyLogo && resolvedLogoUrl && (
              <img src={resolvedLogoUrl} alt="" style={{ maxHeight: isCompact ? 122 : 155, maxWidth: isCompact ? 275 : 330, objectFit: "contain", flexShrink: 0, margin: 0, padding: 0, display: "block" }} />
            )}
          </div>
        </div>
      </div>

      {/* Divider, then the copy marking ("ORIGINAL" / "DUPLICATE" /
          "TRANSPORT") centred beneath it. Both live in the element the
          paginator measures the repeating header band against, so the marking
          is carried onto continuation pages rather than printing once. */}
      <div data-pdf-header-divider>
        <div style={styles.divider} />
        {/* <div style={{ ...styles.copyTypeMark, fontSize: "12px", letterSpacing: "0.12em", margin: "0 0 4px 0" }}>{documentLabel.toUpperCase()}</div> */}
        {copyType && <div style={styles.copyTypeMark}>{String(copyType).toUpperCase()}</div>}
      </div>

      {/* ── BILLED TO + DOCUMENT META ────────────────────────────
          One row: customer on the left, the invoice no./date column parked at
          the right margin beside it rather than in the header above. The row
          always renders — the document number and date print even with both
          customer and payment details switched off. */}
      <div style={styles.infoGrid}>
        {showCustomerDetails && (
          <div style={styles.billCol}>
            <p style={styles.infoLabel}>Billed To</p>
            <h3 style={styles.billName}>{customer_name}</h3>
            {hasValue(customer_gstin) && <p style={styles.billMeta}>GSTIN: {customer_gstin}</p>}
            {hasValue(customer_address) && <p style={styles.billMeta}>{customer_address}</p>}
            {hasValue(customer_mobile) && <p style={styles.billMeta}>Mobile: {customer_mobile}</p>}
          </div>
        )}

        {showShipToDetails && (
          <div style={styles.billCol}>
            <p style={styles.infoLabel}>Ship To</p>
            <h3 style={styles.billName}>{customer_name}</h3>
            {hasValue(customer_gstin) && <p style={styles.billMeta}>GSTIN: {customer_gstin}</p>}
            <p style={styles.billMeta}>{customer_shipping_address}</p>
            {hasValue(customer_mobile) && <p style={styles.billMeta}>Mobile: {customer_mobile}</p>}
          </div>
        )}

        <div style={styles.metaCol}>
          <div style={styles.invoiceMetaRow}>
            <span style={styles.invoiceMetaLabel}>{`${documentLabel} #`}</span>
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
          {/* The buyer's own purchase-order reference — printed only when
              they gave one, since most counter sales have none. */}
          {hasValue(po_number) && (
            <div style={styles.invoiceMetaRow}>
              <span style={styles.invoiceMetaLabel}>PO No:</span>
              <span style={styles.invoiceMetaValue}>{po_number}</span>
            </div>
          )}
          {hasValue(po_date) && (
            <div style={styles.invoiceMetaRow}>
              <span style={styles.invoiceMetaLabel}>PO Date:</span>
              <span style={styles.invoiceMetaValue}>{po_date}</span>
            </div>
          )}
          {showVehicleNo && (
            <div style={styles.invoiceMetaRow}>
              <span style={styles.invoiceMetaLabel}>Vehicle No:</span>
              <span style={styles.invoiceMetaValue}>
                {hasValue(vehicle_no) ? vehicle_no : <span style={styles.vehicleNoBlank}>&nbsp;</span>}
              </span>
            </div>
          )}

          {/* Total Due sits under the meta rows in the same right-hand
              column — it shares their right margin. */}
          {showPaymentDetails && (
            <div style={{ ...styles.dueBox, marginTop: "12px" }}>
              <p style={styles.infoLabel}>Total Due</p>
              <p style={styles.dueValue}>{fmt(total)}</p>
              <span style={{ ...styles.statusBadge, ...statusColors }}>{statusLabel}</span>
              <p style={{ ...styles.billMeta, textAlign: "right" as const }}>Payment Mode: {payment_mode}</p>
            </div>
          )}
        </div>
      </div>
      <div style={styles.divider} />

      {/* ── ITEMS TABLE ──────────────────────────────────────── */}
      <table style={styles.table}>
        <colgroup>
          {showSerialNo && <col style={{ width: "34px" }} />}
          {showItemId && <col style={{ width: "108px" }} />}
          <col />
          {/* HSN codes run up to 8 digits under GST — must fit without truncation.
              HSN identifies the item, so it stays regardless of the Tax Details
              setting; only the Tax rate column follows that toggle. */}
          <col style={{ width: "64px" }} />
          {showTaxDetails && <col style={{ width: "38px" }} />}
          <col style={{ width: "40px" }} />
          {/* Amount columns are sized to fit large totals (up to 8-digit
              rupee values) on one line — narrower widths let the nowrap
              text overflow its cell and visually overlap the next column. */}
          <col style={{ width: "112px" }} />
          <col style={{ width: "126px" }} />
        </colgroup>
        <thead data-pdf-repeat-thead>
          <tr>
            {showSerialNo && <th style={styles.theadTh}>SL</th>}
            {showItemId && <th style={styles.theadTh}>Item ID</th>}
            <th style={styles.theadTh}>Item</th>
            <th style={styles.theadThCenter}>HSN</th>
            {showTaxDetails && <th style={styles.theadThCenter}>Tax</th>}
            <th style={styles.theadThCenter}>Qty</th>
            <th style={styles.theadThRight}>Unit Price</th>
            <th style={styles.theadThRight}>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any, i: number) => (
            <tr key={i} data-pdf-keep-together>
              {showSerialNo && <td style={styles.td}>{String(i + 1).padStart(2, "0")}</td>}
              {showItemId && <td style={{ ...styles.td, ...styles.tdItemId }}>{item.item_id || "—"}</td>}
              <td style={styles.td}>
                <div style={styles.itemName}>{item.name}</div>
                {showItemDescription && item.description && <div style={styles.itemSub}>{item.description}</div>}
              </td>
              <td style={styles.tdCenter}>{item.hsn || "—"}</td>
              {showTaxDetails && <td style={styles.tdCenter}>{Number(item.tax).toFixed(0)}%</td>}
              <td style={styles.tdCenter}>{item.qty}</td>
              <td style={styles.tdRight}>{fmt(item.rate)}</td>
              <td style={{ ...styles.tdRight, fontWeight: 700 }}>{fmt(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── SUMMARY (kept together across pages) ─────────────── */}
      <div data-pdf-keep-together style={{ ...styles.summaryWrap, marginTop: isCompact ? 10 : 14 }}>
        <div style={styles.summaryBox}>
          <SummaryRow label="Subtotal" value={fmt(subtotal)} />

          {showDiscount && (
            <SummaryRow label={discount_label ?? "Discount"} value={`-${fmt(discount)}`} red />
          )}

          {/* Tax totals are part of the bill amount, not the "Tax Details"
              breakdown — the setting only controls the per-item HSN/Tax
              columns and the HSN-wise table below. */}
          {taxSummaryRows.map((row) => (
            <SummaryRow key={row.label} label={row.label} value={fmt(row.amount)} />
          ))}

          {showRoundOff && (
            <SummaryRow label="Round Off" value={Number(round_off) > 0 ? `+${fmt(round_off)}` : fmt(round_off)} />
          )}

          <div style={styles.grandRow}>
            <span style={styles.grandLabel}>Total</span>
            <span style={styles.grandValue}>{fmt(total)}</span>
          </div>
        </div>
      </div>

      {/* Full page width, not the 260px summary box — a phrase this long
          wraps unnecessarily inside that narrow box even though the rest of
          the page is empty. Left-aligned so it runs the whole width. */}
      {amount_in_words && <p style={{ ...styles.amountWords, marginTop: isCompact ? 4 : 6 }}>Amount in words: {amount_in_words}</p>}

      {/* ── HSN-WISE TAX BREAKDOWN (kept together across pages) ── */}
      {showTaxDetails && gst_breakdown.length > 0 && (
        <div data-pdf-keep-together style={{ ...styles.gstSection, marginTop: isCompact ? 16 : styles.gstSection.marginTop }}>
          <p style={styles.gstLabel}>HSN-wise Tax Breakdown</p>
          <table style={styles.table}>
            <colgroup>
              <col style={{ width: "80px" }} />
              {/* Amount columns get the bulk of the width so large totals
                  never overflow their cell and overlap the next column. */}
              <col />
              <col />
              <col />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th style={styles.gstTh}>HSN Code</th>
                <th style={styles.gstThRight}>Taxable Value</th>
                <th style={styles.gstThRight}>CGST</th>
                <th style={styles.gstThRight}>SGST</th>
                <th style={styles.gstThRight}>Total Tax</th>
              </tr>
            </thead>
            <tbody>
              {gst_breakdown.map((row: any, i: number) => (
                <tr key={i} data-pdf-keep-together>
                  <td style={{ ...styles.gstTd, fontWeight: 600 }}>{row.hsn || "—"}</td>
                  <td style={styles.gstTdRight}>{fmt(row.taxable)}</td>
                  <td style={styles.gstTdRight}>{fmt(row.cgstAmount)}</td>
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
                  <tr>
                    <td style={styles.gstTotalTd}>Total</td>
                    <td style={styles.gstTotalTdRight}>{fmt(totalTaxable)}</td>
                    <td style={styles.gstTotalTdRight}>{fmt(totalCgst)}</td>
                    <td style={styles.gstTotalTdRight}>{fmt(totalSgst)}</td>
                    <td style={styles.gstTotalTdRight}>{fmt(totalTax)}</td>
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TERMS + PAYMENT INFO panel, then SIGNATURE (kept together) ── */}
      <div data-pdf-keep-together style={{ marginTop: isCompact ? 18 : 26 }}>
        {(showTermsPanel || showBankDetails) && (
          <table style={styles.footerTable}>
            <thead>
              <tr>
                {showTermsPanel && (
                  <th style={{ ...styles.footerTh, width: showBankDetails ? "58%" : "100%" }}>
                    Terms and Conditions
                  </th>
                )}
                {showBankDetails && (
                  <th style={{ ...styles.footerTh, width: showTermsPanel ? "42%" : "100%" }}>
                    Payment Information
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              <tr>
                {showTermsPanel && (
                  <td style={styles.footerTd}>
                    <p style={{ ...styles.noteText, whiteSpace: "pre-line" as const, margin: 0 }}>
                      {termsConditionsText}
                    </p>
                  </td>
                )}
                {showBankDetails && (
                  <td style={styles.footerTd}>
                    {bankRows.length > 0 ? (
                      <table style={styles.bankTable}>
                        <tbody>
                          {bankRows.map(([label, value]) => (
                            <tr key={label}>
                              <td style={styles.bankLabelTd}>{label}</td>
                              <td style={styles.bankValueTd}>{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p style={{ ...styles.noteText, margin: 0 }}>Bank Details N/A</p>
                    )}
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        )}

        {((showNotes && notesText) || showSignature) && (
          <table style={styles.closingTable}>
            <tbody>
              <tr>
                <td style={styles.closingNotesTd}>
                  {showNotes && notesText && (
                    <>
                      <p style={styles.noteLabel}>Notes</p>
                      <p style={{ ...styles.noteText, whiteSpace: "pre-line" as const, margin: 0 }}>{notesText}</p>
                    </>
                  )}
                </td>
                <td style={styles.closingSignTd}>
                  {showSignature && (
                    <div style={styles.signBox}>
                      {resolvedSignatureUrl && (
                        <img
                          src={resolvedSignatureUrl}
                          alt="Authorized signature"
                          style={{ maxHeight: 46, maxWidth: 180, objectFit: "contain", marginLeft: "auto", marginBottom: 4, display: "block" }}
                        />
                      )}
                      <p style={styles.signLabel}>{co.name}</p>
                      <p style={styles.signRole}>Authorized Signatory</p>
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
});

InvoicePDFTemplateModern.displayName = "InvoicePDFTemplateModern";
