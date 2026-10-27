/**
 * PurchaseReturnDetailDialog.tsx
 * Read-only view of one purchase return / debit note, laid out like the Purchase Details dialog:
 * supplier card, items, tax summary, then the refunds received from the vendor.
 * Everything comes from GET /purchase-returns/:uuid, already totalled by the backend.
 */
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider,
  IconButton, Skeleton, Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";
import AssignmentReturnOutlinedIcon from "@mui/icons-material/AssignmentReturnOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { closeFromControlsOnly } from "@utils/dialog";
import type { PurchaseRefundStatus } from "./usePuchaseapi";
import { usePurchaseReturnDetail, type PurchaseReturnDetail } from "./usePurchaseReturnApi";
import type { RefundTarget } from "./PurchaseReturnActionDialogs";

interface Props {
  returnUuid:   string | null;
  canEdit:      boolean;
  onClose:      () => void;
  onMarkRefund: (ret: RefundTarget) => void;
}

const INR = (v: number | string) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(Number(v));

const STATUS: Record<PurchaseRefundStatus, { label: string; color: string; bgcolor: string; border: string }> = {
  PENDING:  { label: "REFUND PENDING",     color: "#92400E", bgcolor: "#FEF3C7", border: "#FDE68A" },
  PARTIAL:  { label: "PARTIALLY REFUNDED", color: "#9A3412", bgcolor: "#FFEDD5", border: "#FED7AA" },
  REFUNDED: { label: "REFUNDED",           color: "#166534", bgcolor: "#DCFCE7", border: "#BBF7D0" },
  NA:       { label: "ADJUSTED",           color: "#075985", bgcolor: "#E0F2FE", border: "#BAE6FD" },
};

const TH: React.CSSProperties = {
  fontSize: 12.5, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.02em",
  backgroundColor: "#F8FAFC", padding: "10px 14px", borderBottom: "1px solid #E5E7EB", whiteSpace: "nowrap",
};
const TD: React.CSSProperties = {
  fontSize: 12.5, color: "#334155", padding: "10px 14px", borderBottom: "1px solid #EEF2F7", verticalAlign: "middle",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em", mb: 1.2 }}>
      {children}
    </Typography>
  );
}

function SumRow({ label, value, color, bold }: { label: string; value: string; color?: string; bold?: boolean }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
      <Typography sx={{ fontSize: bold ? 12 : 13, fontWeight: bold ? 700 : 400, color: color ?? "#64748B" }}>{label}</Typography>
      <Typography sx={{ fontSize: bold ? 12 : 13, fontWeight: bold ? 800 : 600, color: color ?? "#0F172A" }}>{value}</Typography>
    </Box>
  );
}

function Skeletons() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Skeleton variant="rounded" height={86} />
      <Skeleton variant="rounded" height={180} />
      <Skeleton variant="rounded" height={150} />
    </Box>
  );
}

function Content({ data }: { data: PurchaseReturnDetail }) {
  const { vendor, items, summary, refunds } = data;
  const note    = data.return.notes?.trim();
  const address = [vendor?.address_line1, vendor?.address_line2, vendor?.city, vendor?.state, vendor?.pincode].filter(Boolean).join(", ");
  const isNA    = data.return.refund_status === "NA";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Supplier */}
      <Box sx={{ border: "1px solid #E2E8F0", borderRadius: 2, overflow: "hidden", bgcolor: "#fff" }}>
        <Box sx={{ p: 2, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px 24px" }}>
          {[
            { label: "Supplier Name",  value: vendor?.vendor_name ?? vendor?.company_name },
            { label: "Mobile No.",     value: vendor?.phone },
            { label: "GSTIN",          value: vendor?.gst },
            { label: "Address",        value: address },
            { label: "Against Purchase", value: data.return.invoice_bill_no ?? data.return.original_purchase_id },
          ].map(({ label, value }) => (
            <Box key={label}>
              <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em", mb: 0.4 }}>{label}</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{value || "—"}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Items */}
      <Box>
        <SectionLabel>Returned Items</SectionLabel>
        <Box sx={{ border: "1px solid #E2E8F0", borderRadius: 1.5, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...TH, textAlign: "center" }}>Item ID</th>
                <th style={{ ...TH, textAlign: "center" }}>Item Name</th>
                <th style={{ ...TH, textAlign: "center" }}>HSN</th>
                <th style={{ ...TH, textAlign: "right" }}>Rate</th>
                <th style={{ ...TH, textAlign: "center" }}>Qty Returned</th>
                <th style={{ ...TH, textAlign: "center" }}>GST%</th>
                <th style={{ ...TH, textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td style={{ ...TD, fontWeight: 600, color: "#0F172A", textAlign: "center" }}>{it.item_id}</td>
                  <td style={{ ...TD, color: "#64748B", whiteSpace: "nowrap", textAlign: "center" }}>{it.item_name}</td>
                  <td style={{ ...TD, color: "#64748B", whiteSpace: "nowrap", textAlign: "center" }}>{it.hsn_code ?? "—"}</td>
                  <td style={{ ...TD, textAlign: "right", whiteSpace: "nowrap" }}>{INR(it.purchase_price)}</td>
                  <td style={{ ...TD, textAlign: "center", whiteSpace: "nowrap" }}>
                    {it.return_qty} {it.unit ?? ""}
                    <span style={{ color: "#94A3B8" }}> / {it.original_qty}</span>
                  </td>
                  <td style={{ ...TD, textAlign: "center", whiteSpace: "nowrap" }}>{it.gst_percentage}%</td>
                  <td style={{ ...TD, textAlign: "right", fontWeight: 700, whiteSpace: "nowrap" }}>{INR(it.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>

      {/* Summary */}
      <Box sx={{ border: "1px solid #E2E8F0", borderRadius: 1.5, p: 2.5, bgcolor: "#fff" }}>
        <Box sx={{ maxWidth: 460, ml: "auto", display: "flex", flexDirection: "column", gap: 1.2 }}>
          <SumRow label="Subtotal" value={INR(summary.subtotal)} />
          <SumRow label="CGST Total" value={INR(summary.cgst)} />
          <SumRow label="SGST Total" value={INR(summary.sgst)} />
          <Divider sx={{ borderStyle: "dashed", borderColor: "#CBD5E1", my: 0.6 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#0F172A" }}>Return Total</Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>{INR(summary.return_total)}</Typography>
          </Box>
          {summary.adjusted_amount > 0 && <SumRow label="Adjusted against payable" value={INR(summary.adjusted_amount)} color="#0369A1" bold />}
          {!isNA && summary.refund_due > 0 && (
            <>
              <SumRow label="Refund Received" value={INR(summary.refunded_amount)} color="#16A34A" bold />
              {summary.pending_refund > 0 && <SumRow label="Pending from Supplier" value={INR(summary.pending_refund)} color="#D97706" bold />}
            </>
          )}
        </Box>
      </Box>

      {summary.excess_refund > 0 && (
        <Box sx={{ display: "flex", gap: 1.25, alignItems: "flex-start", p: 1.75, borderRadius: "12px", bgcolor: "#FFFBEB", border: "1px solid #FDE68A" }}>
          <WarningAmberRoundedIcon sx={{ fontSize: 20, color: "#D97706", mt: "1px" }} />
          <Typography sx={{ fontSize: 13, color: "#92400E", lineHeight: 1.5 }}>
            <b>{INR(summary.excess_refund)}</b> refunded in excess — this return was edited below the amount the supplier already refunded.
          </Typography>
        </Box>
      )}

      {/* Refunds received */}
      {!isNA && (
        <Box>
          <SectionLabel>Payment History</SectionLabel>
          {refunds.length === 0 ? (
            <Typography sx={{ fontSize: 13, color: "#94A3B8", border: "1px dashed #CBD5E1", borderRadius: 1.5, p: 2, textAlign: "center" }}>
              No refund received from the supplier yet.
            </Typography>
          ) : (
            <Box sx={{ border: "1px solid #E2E8F0", borderRadius: 1.5, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={TH}>Date</th>
                    <th style={TH}>Transaction Type</th>
                    <th style={TH}>Reference No.</th>
                    <th style={{ ...TH, textAlign: "right" }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {refunds.map((r) => (
                    <tr key={r.id}>
                      <td style={{ ...TD, textAlign: "center", fontWeight: 500, whiteSpace: "nowrap" }}>{r.refund_date_fmt ?? "—"}</td>
                      <td style={{ ...TD, textAlign: "center" }}>{r.payment_mode}</td>
                      <td style={{ ...TD, textAlign: "center", color: "#000", fontWeight: 600 }}>{r.reference_no ?? "—"}</td>
                      <td style={{ ...TD, textAlign: "right", fontWeight: 700, whiteSpace: "nowrap" }}>{INR(r.refund_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </Box>
      )}

      {note && (
        <Box>
          <SectionLabel>Notes</SectionLabel>
          <Box sx={{ border: "1px solid #E2E8F0", borderRadius: 1.5, p: 2, bgcolor: "#F8FAFC" }}>
            <Typography sx={{ fontSize: 13, color: "#334155", whiteSpace: "pre-line" }}>{note}</Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default function PurchaseReturnDetailDialog({ returnUuid, canEdit, onClose, onMarkRefund }: Props) {
  const { data, isLoading, isError } = usePurchaseReturnDetail(returnUuid);
  const st = data ? STATUS[data.return.refund_status] : null;
  const isDebit = data?.return.return_type === "DEBIT_NOTE";
  const canPay  = !!data && canEdit && data.summary.pending_refund > 0 &&
    (data.return.refund_status === "PENDING" || data.return.refund_status === "PARTIAL");

  const markRefund = () => {
    if (!data) return;
    const { return: r, summary } = data;
    onMarkRefund({
      return_uuid: r.return_uuid, return_id: r.return_id, return_type: r.return_type,
      refund_due: summary.refund_due, refunded_amount: summary.refunded_amount, pending_refund: summary.pending_refund,
      vendorName: data.vendor?.vendor_name ?? data.vendor?.company_name,
    });
  };

  return (
    <Dialog
      open={!!returnUuid} onClose={closeFromControlsOnly(onClose)} maxWidth="lg" fullWidth
      PaperProps={{ sx: { borderRadius: 2.5, maxHeight: "92vh", fontFamily: '"Inter", sans-serif' } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3.5, py: 2, borderBottom: "1px solid #F1F5F9" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Box sx={{ p: 0.8, bgcolor: "rgba(210,31,60,0.08)", borderRadius: 2, display: "flex" }}>
            <AssignmentReturnOutlinedIcon sx={{ color: "#D21F3C", fontSize: 20 }} />
          </Box>
          <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>
            {isDebit ? "Debit Note Details" : "Purchase Return Details"}
          </Typography>
          {data && (
            <>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#D32F2F" }}>{data.return.return_id}</Typography>
              {st && <Chip label={st.label} size="small" sx={{ fontSize: 10, fontWeight: 700, height: 20, color: st.color, bgcolor: st.bgcolor, border: `1px solid ${st.border}`, borderRadius: "999px" }} />}
              {data.return.return_reason && (
                <Chip label={`Reason: ${data.return.return_reason}`} size="small" sx={{ fontSize: 11, fontWeight: 600, height: 22, color: "#475569", bgcolor: "#F1F5F9", borderRadius: "999px" }} />
              )}
            </>
          )}
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "#9CA3AF", "&:hover": { color: "#374151", bgcolor: "#F3F4F6" } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3.5, py: 3, overflow: "auto" }}>
        <div data-print-content>
          {isLoading && <Skeletons />}
          {isError && <Typography sx={{ color: "#DC2626", textAlign: "center", py: 6, fontSize: 14 }}>Failed to load the return. Please try again.</Typography>}
          {data && <Content data={data} />}
        </div>
      </DialogContent>

      <DialogActions sx={{ px: 3.5, py: 2, borderTop: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          {(data?.return.created_at_fmt ?? data?.return.return_date_fmt) && (
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
              Created: {data?.return.created_at_fmt ?? data?.return.return_date_fmt}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          {canPay && (
            <Button variant="outlined" onClick={markRefund}
              sx={{ fontSize: 13, fontWeight: 700, textTransform: "none", color: "#D32F2F", borderColor: "#D32F2F", borderRadius: 1.5, px: 2.5, py: 1, "&:hover": { bgcolor: "#FEF2F2", borderColor: "#B71C1C" } }}>
              Mark Payment
            </Button>
          )}
          <Button variant="contained" disableElevation disabled={!data} startIcon={<PrintIcon sx={{ fontSize: 16 }} />} onClick={() => window.print()}
            sx={{ fontSize: 13, fontWeight: 700, textTransform: "none", bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" }, borderRadius: 1.5, px: 2.5, py: 1 }}>
            Print
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
