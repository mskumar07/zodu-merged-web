/**
 * ReturnPDFTemplate.tsx
 * A4 printable Credit Note / Sales Return. Rendered off-screen by ReturnDetailDialog and
 * captured to PDF for Share / Download / Print. Company details are read the same way the
 * invoice templates read them, so the header matches the invoices.
 */
import React from "react";
import { useAppSelector } from "@store/store";
import { useTenantContext } from "@store/tenantContext";
import { AllCompanies } from "@store/slices/userSlice";

export interface ReturnPdfData {
  title:        string;            // "CREDIT NOTE" | "SALES RETURN"
  returnId:     string;
  invoiceId:    string;
  date:         string;
  reason:       string;
  customerName: string;
  customerMobile:  string;
  customerAddress: string;
  items: Array<{ name: string; variant: string | null; hsn: string; price: number; qty: string; gst: string; total: number }>;
  subtotal:     number | null;
  taxRows:      Array<{ label: string; amount: number }>;
  total:        number;
  statusLabel:  string;
  adjusted:     number | null;   // set when the return was adjusted against an unpaid balance
  refunded:     number;
  pending:      number;
  refunds:      Array<{ date: string; mode: string; reference: string; amount: number }>;
  amountInWords: string;
}

const INR = (v: number) => `₹${v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const th = { padding: "9px 8px", fontSize: 10, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.06em", background: "#111827" } as const;
const td = { padding: "8px", fontSize: 11, color: "#0F172A", borderBottom: "1px solid #E5E7EB", verticalAlign: "top" } as const;
const label = { fontSize: 9, fontWeight: 700, color: "#94A3B8", letterSpacing: "1px", marginBottom: 3 } as const;

export const ReturnPDFTemplate = React.forwardRef<HTMLDivElement, { data: ReturnPdfData }>(({ data }, ref) => {
  const { profile, company, zoduId, branchId } = useTenantContext();
  const companies = useAppSelector(AllCompanies);
  const selectedCompany = companies.find((c) => c.zodu_id === zoduId);
  const branch = selectedCompany?.branches?.find((b) => b.branch_id === branchId);

  const pick = <K extends string>(key: K) =>
    (branch as any)?.[key] || (company as any)?.[key] || (selectedCompany as any)?.[key];
  const address1 = [pick("address_line_1"), pick("address_line_2")].filter(Boolean).join(", ");
  const address2 = [pick("city"), pick("district"), pick("state"), pick("pincode")].filter(Boolean).join(", ");
  const name  = selectedCompany?.restaurant_name || selectedCompany?.business_name || selectedCompany?.store_name || selectedCompany?.company_name || profile?.restaurant_name || "Your Company Name";
  const gstin = company?.gst_no || selectedCompany?.gst_no || "";
  const phone = profile?.phone_number || selectedCompany?.phone_number || selectedCompany?.mobile_no || "";

  return (
    <div ref={ref} style={{ width: 794, padding: "24px 38px 34px", background: "#fff", fontFamily: "'Inter','Arial',sans-serif", color: "#0F172A", fontSize: 13, boxSizing: "border-box" }}>
      <div data-pdf-keep-together style={{ textAlign: "center" }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#D0021B", letterSpacing: "-0.5px" }}>{name}</div>
        {address1 && <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{address1}</div>}
        {address2 && <div style={{ fontSize: 11, color: "#475569" }}>{address2}</div>}
        <div style={{ fontSize: 11, color: "#475569" }}>
          {[gstin && `GSTIN: ${gstin}`, phone && `Phone: ${phone}`].filter(Boolean).join("   |   ")}
        </div>
      </div>

      <div style={{ borderTop: "2px solid #D0021B", margin: "14px 0" }} />
      <div style={{ textAlign: "center", fontSize: 17, fontWeight: 800, letterSpacing: "0.18em", color: "#374151", marginBottom: 16 }}>{data.title}</div>

      <div data-pdf-keep-together style={{ display: "flex", justifyContent: "space-between", gap: 16, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "14px 18px", marginBottom: 22 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={label}>CUSTOMER</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{data.customerName}</div>
          <div style={{ fontSize: 11, color: "#475569" }}>{data.customerMobile}</div>
          <div style={{ fontSize: 11, color: "#475569" }}>{data.customerAddress}</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 11, color: "#475569", lineHeight: 1.7 }}>
          <div>{data.title === "CREDIT NOTE" ? "Credit Note No" : "Return No"}: <b style={{ color: "#0F172A" }}>{data.returnId}</b></div>
          <div>Against Invoice: <b style={{ color: "#0F172A" }}>{data.invoiceId}</b></div>
          <div>Date: <b style={{ color: "#0F172A" }}>{data.date}</b></div>
          <div>Reason: <b style={{ color: "#0F172A" }}>{data.reason}</b></div>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", marginBottom: 20 }}>
        <thead data-pdf-repeat-thead>
          <tr>
            <th style={{ ...th, width: 34, textAlign: "left" }}>#</th>
            <th style={{ ...th, textAlign: "left" }}>Item</th>
            <th style={{ ...th, width: 70, textAlign: "center" }}>HSN</th>
            <th style={{ ...th, width: 84, textAlign: "right" }}>Price</th>
            <th style={{ ...th, width: 64, textAlign: "center" }}>Qty</th>
            <th style={{ ...th, width: 50, textAlign: "center" }}>GST</th>
            <th style={{ ...th, width: 96, textAlign: "right" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((it, i) => (
            <tr key={i} data-pdf-keep-together>
              <td style={td}>{i + 1}</td>
              <td style={td}>
                <div style={{ fontWeight: 600 }}>{it.name}</div>
                {it.variant && <div style={{ fontSize: 9, color: "#94A3B8" }}>{it.variant}</div>}
              </td>
              <td style={{ ...td, textAlign: "center" }}>{it.hsn}</td>
              <td style={{ ...td, textAlign: "right" }}>{INR(it.price)}</td>
              <td style={{ ...td, textAlign: "center" }}>{it.qty}</td>
              <td style={{ ...td, textAlign: "center" }}>{it.gst}</td>
              <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>{INR(it.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div data-pdf-keep-together style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
        <div style={{ flex: 1, fontSize: 11, color: "#475569" }}>
          <div style={label}>AMOUNT IN WORDS</div>
          <div style={{ fontWeight: 600, color: "#0F172A" }}>{data.amountInWords}</div>
        </div>
        <div style={{ width: 280, fontSize: 12 }}>
          {data.subtotal != null && <Row k="Subtotal" v={INR(data.subtotal)} />}
          {data.taxRows.map((r) => <Row key={r.label} k={r.label} v={INR(r.amount)} />)}
          <div style={{ borderTop: "1.5px solid #E5E7EB", marginTop: 6, paddingTop: 6 }}>
            <Row k={`${data.title === "CREDIT NOTE" ? "Credit Note" : "Return"} Total`} v={INR(data.total)} big />
          </div>
          {data.adjusted != null
            ? <Row k="Adjusted to Invoice Balance" v={INR(data.adjusted)} color="#0369A1" />
            : <>
                <Row k="Refunded" v={INR(data.refunded)} color="#16A34A" />
                {data.pending > 0 && <Row k="Refund Pending" v={INR(data.pending)} color="#D97706" />}
              </>}
        </div>
      </div>

      {data.adjusted == null && data.refunds.length > 0 && (
        <div data-pdf-keep-together style={{ marginTop: 24 }}>
          <div style={label}>REFUND PAYMENTS</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...th, textAlign: "left" }}>Date</th>
                <th style={{ ...th, textAlign: "left" }}>Payment Type</th>
                <th style={{ ...th, textAlign: "left" }}>Reference No</th>
                <th style={{ ...th, textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.refunds.map((r, i) => (
                <tr key={i}>
                  <td style={td}>{r.date}</td>
                  <td style={td}>{r.mode}</td>
                  <td style={td}>{r.reference}</td>
                  <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>{INR(r.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});
ReturnPDFTemplate.displayName = "ReturnPDFTemplate";

function Row({ k, v, big, color }: { k: string; v: string; big?: boolean; color?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: big ? 15 : 12, fontWeight: big ? 800 : 600, color: color ?? "#0F172A" }}>
      <span>{k}</span><span>{v}</span>
    </div>
  );
}
