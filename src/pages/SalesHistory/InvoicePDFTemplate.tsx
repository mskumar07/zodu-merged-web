import { useAppSelector } from "@store/store";
import { useTenantContext } from "@store/tenantContext";
import { AllCompanies } from "@store/slices/userSlice";
import React from "react";

// ── Inline style constants ────────────────────────────────────
const styles = {
  page: {
    width: "794px",
    padding: "24px 20px",
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
    marginBottom: "24px",
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
  table: { width: "100%", borderCollapse: "collapse" as const, marginBottom: "20px" },
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
    padding: "5px 8px",
    fontSize: "10px",
    color: "#0F172A",
    borderBottom: "1px solid #E5E7EB",
    verticalAlign: "middle" as const,
  },
  tdRight: {
    padding: "5px 8px",
    fontSize: "10px",
    color: "#0F172A",
    borderBottom: "1px solid #E5E7EB",
    textAlign: "right" as const,
    verticalAlign: "middle" as const,
  },
  tdCenter: {
    padding: "5px 8px",
    fontSize: "10px",
    color: "#0F172A",
    borderBottom: "1px solid #E5E7EB",
    textAlign: "center" as const,
    verticalAlign: "middle" as const,
  },
  itemName: { fontWeight: 600, fontSize: "10px", color: "#0F172A" },
  itemSub: { fontSize: "10px", color: "#6B7280", marginTop: "2px" },

  // Summary
  summaryWrap: { display: "flex", justifyContent: "flex-end", marginTop: "4px" },
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
  gstSection: { marginTop: "28px" },
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
    marginTop: "28px",
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
  footer: { marginTop: "32px" },
  footerThanks: { fontSize: "13px", fontWeight: 700, color: "#0F172A", marginBottom: "4px" },
  footerTerms: { fontSize: "11px", color: "#64748B" },
  footerCopy: { fontSize: "10px", color: "#94A3B8", marginTop: "4px" },
  signBox: { textAlign: "right" },
  signLine: { borderTop: "1px solid #0F172A", width: "180px", marginLeft: "auto", marginBottom: "6px" },
  signLabel: { fontSize: "10px", fontWeight: 700, color: "#475569", letterSpacing: "1px", textTransform: "uppercase" as const },
};

// ── Helper components ─────────────────────────────────────────
function SummaryRow({
  label, value, bold, red, green, large,
}: {
  label: string; value: string;
  bold?: boolean; red?: boolean; green?: boolean; large?: boolean;
}) {
  return (
    <div style={styles.summaryRow}>
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

// ── Main template ─────────────────────────────────────────────
export const InvoicePDFTemplate = React.forwardRef(({ data }: any, ref: any) => {
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
    accountNumber: company?.account_number || selectedCompany?.account_number || "",
    branchIfsc:    company?.ifsc_code || selectedCompany?.ifsc_code || "",
    declaration:   "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
  };

  return (
    <div ref={ref} style={styles.page}>

      {/* ── HEADER ───────────────────────────────────────────── */}
      <div data-pdf-header style={styles.header}>
        <div>
          <h1 style={styles.brandName}>{co.name}</h1>
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
          {due_date && due_date !== "-" && (
            <div style={styles.invoiceMetaRow}>
              <span style={styles.invoiceMetaLabel}>Due Date:</span>
              <span style={styles.invoiceMetaValue}>{due_date}</span>
            </div>
          )}
        </div>
      </div>

      {/* Red divider */}
      <div data-pdf-header-divider style={styles.redDivider} />

      {/* ── BILL TO ───────────────────────────────────────────── */}
      <div style={styles.billBox}>
        <div>
          <p style={styles.billLabel}>BILL TO</p>
          <h3 style={styles.billName}>{customer_name}</h3>
          {customer_gstin && customer_gstin !== "—" && (
            <p style={styles.billMeta}>GSTIN: {customer_gstin}</p>
          )}
          {customer_address && customer_address !== "—" && (
            <p style={styles.billMeta}>{customer_address}</p>
          )}
          {customer_mobile && customer_mobile !== "—" && (
            <p style={styles.billMeta}>Mobile: {customer_mobile}</p>
          )}
        </div>

        {/* <div style={{ textAlign: "right" }}>
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
        </div> */}
      </div>

      {/* ── ITEMS TABLE ──────────────────────────────────────── */}
      <table style={styles.table}>
        <thead style={styles.thead}>
          <tr>
            <th style={{ ...styles.theadTh, width: "18px" }}>SL</th>
            <th style={styles.theadTh}>Item ID</th>
            <th style={styles.theadTh}>Item Name </th>
            <th style={{ ...styles.theadThCenter, width: "60px" }}>HSN</th>
            <th style={{ ...styles.theadThCenter, width: "30px" }}>Tax</th>
            <th style={{ ...styles.theadThCenter, width: "48px" }}>QTY</th>
            <th style={{ ...styles.theadThRight, width: "80px" }}>MRP</th>
            <th style={{ ...styles.theadThRight, width: "80px" }}>Rate</th>
            <th style={{ ...styles.theadThRight, width: "90px" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any, i: number) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#FAFBFC" }}>
              <td style={styles.tdBase}>{String(i + 1).padStart(2, "0")}</td>
              <td style={styles.tdBase}>{item.item_id}</td>
              <td style={styles.tdBase}>
                
                <div style={styles.itemName}>{item.name}</div>
                {/* {item.category && (
                  <div style={styles.itemSub}>{item.category}</div>
                )} */}
              </td>
              <td style={styles.tdCenter}>{item.hsn || "—"}</td>
                            <td style={styles.tdCenter}>{Number(item.tax).toFixed(0)}%</td>

              <td style={styles.tdCenter}>{item.qty}</td>
              <td style={styles.tdRight}>{fmt(item.mrp ?? item.rate)}</td>
              <td style={styles.tdRight}>{fmt(item.rate)}</td>
              <td style={{ ...styles.tdRight, fontWeight: 700 }}>{fmt(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── SUMMARY ──────────────────────────────────────────── */}
      <div style={styles.summaryWrap}>
        <div style={styles.summaryBox}>
          <SummaryRow label="Subtotal:" value={fmt(subtotal)} />

          {showDiscount && (
            <SummaryRow
              label={discount_label ?? "Discount:"}
              value={`-${fmt(discount)}`}
              red
            />
          )}

          <SummaryRow label="CGST:" value={fmt(cgst)} />
          <SummaryRow label="SGST:" value={fmt(sgst)} />

          {showRoundOff && (
            <SummaryRow
              label="Round Off:"
              value={Number(round_off) > 0 ? `+${fmt(round_off)}` : fmt(round_off)}
            />
          )}

          <div style={{ borderTop: "2px solid #E5E7EB", margin: "10px 0" }} />

          <SummaryRow label="Grand Total:" value={fmt(total)} large />

          {amount_in_words && (
            <p style={styles.amountWords}>Amount in words: {amount_in_words}</p>
          )}
        </div>
      </div>

      {/* ── HSN-WISE TAX BREAKDOWN ───────────────────────────── */}
      {gst_breakdown.length > 0 && (
        <div style={styles.gstSection}>
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
                <tr key={i}>
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
        <div style={styles.noteGrid}>
          <div>
            <p style={styles.noteLabel}>Declaration</p>
            <p style={styles.noteText}>{co.declaration}</p>
          </div>

          <div style={styles.bankBox}>
            <p style={styles.noteLabel}>Company&apos;s Bank Details</p>
            <div style={styles.bankRow}>
              <span style={styles.bankKey}>Bank Name</span>
              <span style={styles.bankValue}>{co.bankName}</span>
            </div>
            <div style={styles.bankRow}>
              <span style={styles.bankKey}>A/c No.</span>
              <span style={styles.bankValue}>{co.accountNumber}</span>
            </div>
            <div style={{ ...styles.bankRow, marginBottom: 0 }}>
              <span style={styles.bankKey}>Branch &amp; IFSC</span>
              <span style={styles.bankValue}>{co.branchIfsc}</span>
            </div>
          </div>
        </div>

        {/* ── FOOTER ─────────────────────────────────────────── */}
        <div style={styles.footer}>
          <p style={styles.footerThanks}>Thank you for your business!</p>
          <p style={styles.footerTerms}>
            Terms: Goods once sold will not be taken back.
          </p>
          <p style={styles.footerCopy}>
            © 2024 {co.name}. Authorised Signatory Required.
          </p>

          <div style={styles.signBox}>
            <div style={styles.signLine} />
            <p style={styles.signLabel}>Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
});

InvoicePDFTemplate.displayName = "InvoicePDFTemplate";
