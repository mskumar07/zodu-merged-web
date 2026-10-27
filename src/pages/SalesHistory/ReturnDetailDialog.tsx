/**
 * ReturnDetailDialog.tsx
 * Return / credit-note counterpart of the Invoice Details dialog — same header, customer card,
 * items list, financial summary and payment-history layout, filled with the return's own values.
 * Data comes from GET /sale-returns/:uuid, which returns each line's tax and the summary pre-computed,
 * so nothing here derives money values.
 */
import { memo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog, DialogContent, DialogActions,
  Box, Typography, IconButton, Button, Chip, Divider,
  Paper, CircularProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, styled,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import ShareIcon from "@mui/icons-material/Share";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import type jsPDF from "jspdf";
import InvoiceCopyActions from "@components/Common/InvoiceCopyActions";
import { renderPaginatedInvoicePdf } from "@utils/pdfPagination";
import { numberToWords } from "@utils/numberToWords";
import { ReturnPDFTemplate, type ReturnPdfData } from "./ReturnPDFTemplate";
import { fetchSaleReturnDetail, salesQueryKeys, type RefundStatus, type SaleListReturn } from "./useSaleshistory";

interface Props {
  ret:          SaleListReturn;
  canEdit:      boolean;
  onClose:      () => void;
  onMarkRefund: (ret: SaleListReturn) => void;
}

// ── Styled helpers (same look as Invoice Details) ─────────────
const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": { maxWidth: 1100, width: "100%", maxHeight: "92vh", borderRadius: 16, backgroundColor: "#fff" },
});
const InfoCard = styled(Paper)({ backgroundColor: "#F8FAFC", padding: "16px 20px", borderRadius: 12, border: "1px solid #E2E8F0", boxShadow: "none" });
const SectionTitle = styled(Typography)({ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 });
const TH = styled(TableCell)({ fontSize: 12, fontWeight: 700, color: "#64748B", padding: "10px 14px", borderBottom: "none", backgroundColor: "#F1F5F9", letterSpacing: "0.02em", whiteSpace: "nowrap" });
const TD = styled(TableCell)({ fontSize: 13, padding: "11px 14px", borderBottom: "1px solid #F1F5F9", color: "#0F172A" });

const INR = (v: number | string) =>
  `₹${Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const num = (v: unknown) => Number(v ?? 0) || 0;

const PAYMENT_COLOR: Record<string, string> = { cash: "#22C55E", card: "#3B82F6", upi: "#8B5CF6", credit: "#F59E0B" };
const paymentDot = (mode: string) => PAYMENT_COLOR[mode?.toLowerCase()] ?? "#94A3B8";

const STATUS_CHIP: Record<RefundStatus, { label: string; bg: string; color: string }> = {
  PENDING:  { label: "REFUND PENDING",     bg: "#FEF3C7", color: "#B45309" },
  PARTIAL:  { label: "PARTIALLY REFUNDED", bg: "#FFEDD5", color: "#C2410C" },
  REFUNDED: { label: "REFUNDED",           bg: "#DCFCE7", color: "#15803D" },
  NA:       { label: "ADJUSTED",           bg: "#E0F2FE", color: "#0369A1" },
};

const REASON_LABEL: Record<string, string> = {
  damaged: "Damaged on arrival", wrong: "Wrong item sent", choice: "Customer choice", other: "Other",
};

function SRow({ label, value, color, bold, large, borderTop }: {
  label: string; value: string; color?: string; bold?: boolean; large?: boolean; borderTop?: boolean;
}) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: large ? 0.75 : 0.5, borderTop: borderTop ? "1.5px solid #E5E7EB" : "none", mt: borderTop ? 0.5 : 0 }}>
      <Typography sx={{ fontSize: large ? 15 : 13, fontWeight: large ? 800 : bold ? 700 : 500, color: color ?? (large ? "#0F172A" : "#475569") }}>{label}</Typography>
      <Typography sx={{ fontSize: large ? 18 : 13, fontWeight: large ? 900 : bold ? 700 : 600, color: color ?? (large ? "#D0021B" : "#0F172A"), letterSpacing: large ? "-0.5px" : "normal" }}>{value}</Typography>
    </Box>
  );
}

function ReturnDetailDialog({ ret, canEdit, onClose, onMarkRefund }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: salesQueryKeys.returnDetail(ret.return_uuid),
    queryFn:  () => fetchSaleReturnDetail(ret.return_uuid),
  });

  const header   = data?.return;
  const summary  = data?.summary;
  const items    = data?.items ?? [];
  const refunds  = data?.refunds ?? [];
  const customer = data?.customer ?? null;

  const status    = (header?.refund_status ?? ret.refund_status) as RefundStatus | null | undefined;
  const chip      = status ? STATUS_CHIP[status] : null;
  const total     = num(summary?.return_total ?? ret.return_amount);
  const refunded  = num(summary?.refunded_amount ?? ret.refunded_amount);
  const adjusted  = num(summary?.adjusted_amount ?? ret.adjusted_amount);
  const pending   = num(summary?.pending_refund ?? ret.pending_refund);
  const canPay    = (status === "PENDING" || status === "PARTIAL") && pending > 0;
  const docLabel  = (header?.return_type ?? ret.return_type) === "CREDIT_NOTE" ? "Credit Note" : "Sales Return";
  const invoiceId = header?.original_sale_id;
  const reasonKey = header?.return_reason ?? ret.return_reason;
  const reason    = reasonKey ? REASON_LABEL[reasonKey] ?? reasonKey : "—";
  const createdText = header?.created_at_fmt;
  const dateText  =[header?.return_date_fmt ?? ret.return_date_fmt, header?.return_time_fmt].filter(Boolean).join(" · ");

  const customerName    = customer?.cust_name ?? customer?.cpy_name ?? "—";
  const customerMobile  = customer?.mobile ? `+91 ${customer.mobile}` : "—";
  const customerAddress = [customer?.address_line1, customer?.address_line2, customer?.city, customer?.state, customer?.pincode]
    .filter(Boolean).join(", ") || "—";

  // Tax rows exactly as the backend split them; each half is labelled with its rate when every line shares one.
  const rates    = new Set(items.map((i) => num(i.gst_percentage)));
  const halfRate = rates.size === 1 && !rates.has(0) ? ` (${[...rates][0] / 2}%)` : "";
  const taxRows  = num(summary?.total_tax) > 0
    ? [{ label: `CGST${halfRate}`, amount: num(summary?.cgst) }, { label: `SGST${halfRate}`, amount: num(summary?.sgst) }]
    : [];

  // ── Share / Download / Print — the same hidden-A4 capture the invoice dialog uses ──
  const pdfRef = useRef<HTMLDivElement | null>(null);
  const fileName = `${docLabel.replace(" ", "_")}_${ret.return_id}.pdf`;

  const pdfData: ReturnPdfData = {
    title:        docLabel.toUpperCase(),
    returnId:     ret.return_id,
    invoiceId:    invoiceId ?? "—",
    date:         dateText || "—",
    reason,
    customerName, customerMobile, customerAddress,
    items: items.map((i) => ({
      name: i.item_name, variant: i.variant_name ?? null, hsn: i.hsn_code ?? "—", price: num(i.price),
      qty: `${num(i.return_qty)} ${i.unit ?? ""}`.trim(),
      gst: num(i.gst_percentage) === 0 ? "—" : `${num(i.gst_percentage)}%`,
      total: num(i.total_amount),
    })),
    subtotal: summary ? num(summary.subtotal) : null, taxRows, total,
    statusLabel:  chip?.label ?? "",
    adjusted:     status === "NA" ? adjusted || total : null,
    refunded, pending,
    refunds: refunds.map((p) => ({ date: p.refund_date_fmt ?? "—", mode: p.payment_mode, reference: p.reference_no ?? "—", amount: num(p.refund_amount) })),
    amountInWords: `${numberToWords(Math.round(total))} Rupees Only`,
  };

  const makePdf = async (): Promise<jsPDF | null> =>
    pdfRef.current ? renderPaginatedInvoicePdf(pdfRef.current) : null;

  const handleDownload = async () => { (await makePdf())?.save(fileName); };

  const handleShare = async () => {
    const pdf = await makePdf();
    if (!pdf) return;
    const blob = pdf.output("blob");
    const file = new File([blob], fileName, { type: "application/pdf" });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: `${docLabel} ${ret.return_id}` });
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") return;
      }
    }
    // Fallback: open the PDF so the browser's own save/share menu is available
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  };

  const handlePrint = async () => {
    const pdf = await makePdf();
    if (!pdf) return;
    const url = URL.createObjectURL(pdf.output("blob"));
    // Hidden iframe prints in place; the timer covers Chrome's PDF viewer not firing `load`
    const iframe = document.createElement("iframe");
    Object.assign(iframe.style, { position: "fixed", width: "0", height: "0", border: "0" });
    iframe.src = url;
    let printed = false;
    const trigger = () => {
      if (printed) return;
      printed = true;
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    };
    iframe.onload = trigger;
    document.body.appendChild(iframe);
    setTimeout(trigger, 1000);
    setTimeout(() => { iframe.remove(); URL.revokeObjectURL(url); }, 60_000);
  };

  const actionBtn = { fontWeight: 700, fontSize: 13, px: 2, py: 1, borderRadius: "10px", textTransform: "none" } as const;
  const pdfReady = !isLoading && !!data;

  return (
    <StyledDialog open onClose={onClose} maxWidth="lg" fullWidth>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3.5, py: 1.75, borderBottom: "1px solid #E2E8F0", position: "sticky", top: 0, bgcolor: "#fff", zIndex: 10 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Box sx={{ p: 0.8, bgcolor: "rgba(208,2,27,0.08)", borderRadius: 2, display: "flex" }}>
            <AssignmentReturnIcon sx={{ color: "#D0021B", fontSize: 20 }} />
          </Box>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>{docLabel} Details</Typography>
          <Chip label={ret.return_id} size="small" sx={{ bgcolor: "rgba(208,2,27,0.08)", color: "#D0021B", fontWeight: 700, fontSize: 11, height: 20, borderRadius: "999px" }} />
          {invoiceId && <Chip label={`Invoice ${invoiceId}`} size="small" sx={{ bgcolor: "#F3E8FF", color: "#6B21A8", fontWeight: 700, fontSize: 11, height: 20, borderRadius: "999px" }} />}
          {chip && <Chip label={chip.label} size="small" sx={{ bgcolor: chip.bg, color: chip.color, fontWeight: 700, fontSize: 10, height: 20, borderRadius: "999px" }} />}
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "#64748B", "&:hover": { color: "#0F172A" }, width: 32, height: 32 }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Body */}
      <DialogContent sx={{ p: "20px 24px", bgcolor: "#fff", overflowX: "hidden" }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
            <CircularProgress size={32} sx={{ color: "#D0021B" }} />
          </Box>
        ) : !data ? (
          <Typography sx={{ textAlign: "center", py: 8, color: "#94A3B8", fontSize: 14 }}>Return not found.</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

            {/* 1 ── Customer & return info */}
            <InfoCard elevation={0}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2 }}>
                {[
                  { label: "Customer Name", value: customerName, bold: true },
                  { label: "Mobile No.",    value: customerMobile },
                  { label: "Return Reason", value: reason },
                  { label: "Address",       value: customerAddress, small: true },
                ].map(({ label, value, bold, small }) => (
                  <Box key={label}>
                    <Typography sx={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: "#94A3B8", mb: 0.5 }}>{label}</Typography>
                    <Typography sx={{ fontSize: small ? 12 : 13, fontWeight: bold ? 700 : 600, color: "#0F172A", lineHeight: 1.5, wordBreak: "break-word" }}>{value}</Typography>
                  </Box>
                ))}
              </Box>
            </InfoCard>

            {/* 2 ── Items list */}
            <Box>
              <SectionTitle>Returned Items</SectionTitle>
              <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: "12px", overflow: "hidden" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TH>Item Id</TH>
                      <TH>Item Name</TH>
                      <TH align="center">HSN</TH>
                      <TH align="right">Price</TH>
                      <TH align="center">Qty Ret.</TH>
                      <TH align="center">GST%</TH>
                      <TH align="right">Total</TH>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TD colSpan={7} sx={{ borderBottom: "none", color: "#64748B" }}>Item-level return details are not available for this return.</TD>
                      </TableRow>
                    ) : items.map((it, idx) => {
                      const bb = { borderBottom: idx === items.length - 1 ? "none" : undefined };
                      const gst = num(it.gst_percentage);
                      return (
                        <TableRow key={`${it.item_id}-${idx}`} sx={{ "&:hover": { bgcolor: "#FAFBFC" } }}>
                          <TD sx={{ ...bb, color: "#64748B" }}>{it.item_id}</TD>
                          <TD sx={bb}>
                            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{it.item_name}</Typography>
                            {it.variant_name && <Typography sx={{ fontSize: 11, color: "#94A3B8", mt: 0.2 }}>{it.variant_name}</Typography>}
                          </TD>
                          <TD align="center" sx={{ ...bb, color: "#64748B" }}>{it.hsn_code ?? "—"}</TD>
                          <TD align="right" sx={{ ...bb, fontWeight: 600 }}>{INR(it.price)}</TD>
                          <TD align="center" sx={bb}>{num(it.return_qty)} {it.unit}</TD>
                          <TD align="center" sx={bb}>{gst === 0 ? "—" : `${gst}%`}</TD>
                          <TD align="right" sx={{ ...bb, fontWeight: 700 }}>{INR(it.total_amount)}</TD>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* 3 ── Financial summary */}
            <Box sx={{ border: "1px solid #E2E8F0", borderRadius: 2, p: "16px 20px", bgcolor: "#fff" }}>
              <Box sx={{ maxWidth: 380, ml: "auto" }}>
                <SRow label="Subtotal" value={INR(summary?.subtotal ?? 0)} />
                {taxRows.map((r) => <SRow key={r.label} label={r.label} value={INR(r.amount)} />)}
                <Divider sx={{ my: 1, borderColor: "#E2E8F0" }} />
                <SRow label={`${docLabel} Total`} value={INR(total)} color="#000000" borderTop large />
                {status === "NA" ? (
                  <SRow label="Adjusted to Invoice Balance" value={INR(adjusted || total)} color="#0369A1" bold />
                ) : (
                  <>
                    <SRow label="Refunded Amount" value={INR(refunded)} color="#16A34A" />
                    {pending > 0 && <SRow label="Refund Pending" value={INR(pending)} color="#D97706" bold />}
                  </>
                )}
              </Box>
            </Box>

            {/* 4 ── Payment (refund) history */}
            {status === "NA" ? (
              <Box>
                <SectionTitle>Payment History</SectionTitle>
                <Typography sx={{ fontSize: 13, color: "#0369A1", bgcolor: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: "12px", p: 1.75, lineHeight: 1.5 }}>
                  The invoice was unpaid, so {INR(adjusted || total)} was adjusted against its outstanding balance. No cash refund is due.
                </Typography>
              </Box>
            ) : (
              <Box>
                <SectionTitle>Payment History</SectionTitle>
                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: "12px", overflow: "hidden" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TH>Date</TH>
                        <TH>Payment Type</TH>
                        <TH>Reference No</TH>
                        <TH align="right">Amount</TH>
                        <TH align="center">Status</TH>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {refunds.length === 0 ? (
                        <TableRow>
                          <TD colSpan={5} sx={{ borderBottom: "none", color: "#94A3B8", textAlign: "center" }}>No refund has been paid yet.</TD>
                        </TableRow>
                      ) : refunds.map((p, idx) => {
                        const isLast = idx === refunds.length - 1;
                        const bb = { borderBottom: isLast ? "none" : undefined };
                        return (
                          <TableRow key={p.id} sx={{ "&:hover": { bgcolor: "#FAFBFC" } }}>
                            <TD sx={{ ...bb, color: "#334155" }}>{p.refund_date_fmt ?? "—"}</TD>
                            <TD sx={bb}>
                              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                                <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: paymentDot(p.payment_mode), flexShrink: 0 }} />
                                <Typography sx={{ fontSize: 13 }}>{p.payment_mode}</Typography>
                              </Box>
                            </TD>
                            <TD sx={{ ...bb, fontFamily: "monospace", color: "#64748B", fontSize: 11 }}>{p.reference_no ?? "—"}</TD>
                            <TD align="right" sx={{ ...bb, fontWeight: 700 }}>{INR(p.refund_amount)}</TD>
                            <TD align="center" sx={bb}>
                              <Chip label="REFUNDED" size="small" sx={{ fontSize: 9, fontWeight: 700, borderRadius: "999px", bgcolor: "#DCFCE7", color: "#16A34A", height: 20 }} />
                            </TD>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {data.return.notes?.trim() && (
              <Box>
                <SectionTitle>Notes</SectionTitle>
                <InfoCard elevation={0}><Typography sx={{ fontSize: 13, color: "#334155" }}>{data.return.notes}</Typography></InfoCard>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      {/* Hidden A4 render target for Share / Download / Print */}
      <div style={{ position: "fixed", left: "-9999px", top: "-9999px", overflow: "hidden", pointerEvents: "none" }}>
        <ReturnPDFTemplate ref={pdfRef} data={pdfData} />
      </div>

      {/* Footer */}
      <DialogActions sx={{ px: 3.5, py: 2, bgcolor: "#F8FAFC", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
        <Box>
          {createdText && <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>Created: {createdText}</Typography>}
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
          {canPay && (
            <Button
              variant="outlined" disabled={!canEdit} onClick={() => onMarkRefund(ret)}
              sx={{ ...actionBtn, color: "#D0021B", borderColor: "#D0021B", "&:hover": { borderColor: "#B00218", bgcolor: "rgba(208,2,27,0.04)" } }}
            >
              Mark Payment · {INR(pending)}
            </Button>
          )}
          <InvoiceCopyActions
            label="Share" icon={<ShareIcon sx={{ fontSize: 17 }} />} copyTypes={[]} onRun={handleShare} disabled={!pdfReady}
            buttonSx={{ ...actionBtn, border: "1px solid #E2E8F0", bgcolor: "#fff", color: "#475569", "&:hover": { bgcolor: "#F1F5F9", borderColor: "#CBD5E1" } }}
          />
          <InvoiceCopyActions
            label="Download" icon={<DownloadIcon sx={{ fontSize: 17 }} />} copyTypes={[]} onRun={handleDownload} disabled={!pdfReady}
            buttonSx={{ ...actionBtn, px: 2.5, bgcolor: "#F1F5F9", color: "#0F172A", "&:hover": { bgcolor: "#E2E8F0" } }}
          />
          <InvoiceCopyActions
            label="Print" icon={<PrintIcon sx={{ fontSize: 17 }} />} copyTypes={[]} onRun={handlePrint} disabled={!pdfReady}
            buttonSx={{ ...actionBtn, px: 3, bgcolor: "#D0021B", color: "#fff", boxShadow: "0 8px 20px -4px rgba(208,2,27,0.3)", "&:hover": { bgcolor: "#B00218" } }}
          />
        </Box>
      </DialogActions>
    </StyledDialog>
  );
}

export default memo(ReturnDetailDialog);
