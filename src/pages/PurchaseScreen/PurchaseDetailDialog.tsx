import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
  IconButton,
  Button,
  Divider,
  Skeleton,
} from "@mui/material";
import CloseIcon    from "@mui/icons-material/Close";
import PrintIcon    from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import { usePurchaseById, type PurchaseDetail } from "./usePuchaseapi";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useState } from "react";
import AddNewPurchaseDialog from "./Addnewpuechasedialog";
/* ─── helpers ─────────────────────────────────────────────────── */
const INR = (v: number | string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(v));

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

type PayStatus = "paid" | "partial" | "pending";
const STATUS_STYLES: Record<PayStatus, { label: string; color: string; bgcolor: string; border: string }> = {
  paid:    { label: "PAID",    color: "#166534", bgcolor: "#DCFCE7", border: "#BBF7D0" },
  partial: { label: "PARTIAL", color: "#92400E", bgcolor: "#FEF3C7", border: "#FDE68A" },
  pending: { label: "PENDING", color: "#991B1B", bgcolor: "#FEE2E2", border: "#FECACA" },
};

/* ─── shared raw-table styles (no MUI Table overhead) ─────────── */
const TH: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "#9CA3AF",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  backgroundColor: "#F9FAFB",
  padding: "10px 16px",
  borderBottom: "1px solid #E5E7EB",
  whiteSpace: "nowrap",
};
const TD: React.CSSProperties = {
  fontSize: 13,
  color: "#374151",
  padding: "11px 16px",
  borderBottom: "1px solid #F3F4F6",
  verticalAlign: "middle",
};
/* ─── section label ───────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{
      fontSize: 11, fontWeight: 700, color: "#9CA3AF",
      textTransform: "uppercase", letterSpacing: "0.1em", mb: 1.5,
    }}>
      {children}
    </Typography>
  );
}

/* ─── skeleton ────────────────────────────────────────────────── */
function DetailSkeleton() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Skeleton variant="rounded" height={80} />
      <Skeleton variant="rounded" height={200} />
      <Skeleton variant="rounded" height={130} />
      <Skeleton variant="rounded" height={130} />
    </Box>
  );
}

/* ─── main content ────────────────────────────────────────────── */
function PurchaseDetailContent({ data }: { data: PurchaseDetail }) {
  
  const totalTax      = data.items.reduce((s, i) => s + Number(i.tax_amount ?? 0), 0);
  const totalSubtotal = data.items.reduce((s, i) => s + Number(i.subtotal), 0);

  const vendorAddress = [
    data.vendor_address_1, data.vendor_address_2,
    data.city, data.state, data.pincode,
  ].filter(Boolean).join(", ");

  /* gst summary grouped by rate */
  const taxSummary = data.items.reduce<
    Record<string, { subtotal: number; cgst: number; sgst: number; total: number; pct: string }>
  >((acc, item) => {
    const pct = item.gst_percentage ?? "0";
    if (!acc[pct]) acc[pct] = { subtotal: 0, cgst: 0, sgst: 0, total: 0, pct };
    acc[pct].subtotal += Number(item.subtotal);
    acc[pct].cgst     += Number(item.cgst ?? 0);
    acc[pct].sgst     += Number(item.sgst ?? 0);
    acc[pct].total    += Number(item.tax_amount ?? 0);
    return acc;
  }, {});

  const lastPayment = data.payments.length > 0
    ? data.payments[data.payments.length - 1]
    : null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
   

      {/* ── 1. Vendor info ─────────────────────────────────────── */}
      <Box sx={{
        border: "1px solid #E5E7EB",
        borderRadius: 2,
        p: 2.5,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "20px 32px",
      }}>
        {[
          { label: "Supplier Name",  value: data.vendor_name },
          { label: "GSTIN Number",   value: data.vendor_gst },
          { label: "Mobile Contact", value: data.vendor_phone },
          { label: "Email",          value: data.vendor_email },
          ...(vendorAddress ? [{ label: "Office Address", value: vendorAddress }] : []),
        ].map(({ label, value }) => (
          <Box key={label}>
            <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.5 }}>
              {label}
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#111827", lineHeight: 1.4 }}>
              {value || "—"}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* ── 2. Purchased Items table ────────────────────────────── */}
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 1.5 }}>
          <SectionLabel>Purchased Items</SectionLabel>
          <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>
            {data.items.length} item{data.items.length !== 1 ? "s" : ""} total
          </Typography>
        </Box>
        <Box sx={{ border: "1px solid #E5E7EB", borderRadius: 1.5, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={TH}>Item ID</th>
                <th style={TH}>Item Name</th>
                <th style={{ ...TH, textAlign: "right" }}>Qty</th>
                <th style={{ ...TH, textAlign: "right" }}>Unit Price (₹)</th>
                <th style={{ ...TH, textAlign: "right" }}>Tax%</th>
                <th style={{ ...TH, textAlign: "right" }}>Tax (₹)</th>
                <th style={{ ...TH, textAlign: "right" }}>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.purchase_item_id}>
                  <td style={{ ...TD, color: "#6B7280", fontWeight: 600 }}>{item.item_id ?? "—"}</td>
                  <td style={{ ...TD, fontWeight: 600, color: "#111827" }}>{item.item_name}</td>
                  <td style={{ ...TD, textAlign: "right" }}>
                    {parseFloat(item.qty).toFixed(0)}{" "}
                    <span style={{ fontSize: 11, color: "#9CA3AF" }}>{item.unit}</span>
                  </td>
                  <td style={{ ...TD, textAlign: "right" }}>{INR(item.purchase_price)}</td>
                  <td style={{ ...TD, textAlign: "right" }}>{item.gst_percentage ?? 0}%</td>
                  <td style={{ ...TD, textAlign: "right", color: "#D97706" }}>{INR(item.tax_amount ?? 0)}</td>
                  <td style={{ ...TD, textAlign: "right", fontWeight: 700, color: "#111827" }}>
                    {INR(item.total_price ?? item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>

      {/* ── 3. Summary: 3-column flat layout ──────────────────── */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 40px" }}>

        {/* Col 1 — Financial Breakdown */}
        <Box>
          <SectionLabel>Financial Breakdown</SectionLabel>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: 13, color: "#6B7280" }}>Subtotal</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{INR(totalSubtotal)}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: 13, color: "#6B7280" }}>Total Taxes</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{INR(totalTax)}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: 13, color: "#6B7280" }}>Grand Total</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{INR(data.total_amount)}</Typography>
            </Box>
          </Box>
        </Box>

        {/* Col 2 — Latest Payment */}
        <Box>
          <SectionLabel>Latest Payment</SectionLabel>
          {lastPayment ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: 13, color: "#6B7280" }}>Payment Method</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{lastPayment.transaction_type ?? "—"}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: 13, color: "#6B7280" }}>Reference No.</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#B91C1C" }}>{lastPayment.transaction_id ?? "—"}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: 13, color: "#6B7280" }}>Payment Date</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{fmtDate(lastPayment.payment_date)}</Typography>
              </Box>
            </Box>
          ) : (
            <Typography sx={{ fontSize: 13, color: "#9CA3AF" }}>No payments recorded</Typography>
          )}
        </Box>

        {/* Col 3 — Totals */}
        <Box>
          <SectionLabel>&nbsp;</SectionLabel>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: 13, color: "#6B7280" }}>Grand Total</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{INR(data.total_amount)}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: 13, color: "#6B7280" }}>Amount Paid</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#B91C1C" }}>{INR(data.paid_amount)}</Typography>
            </Box>
            <Divider sx={{ my: 0.5, borderColor: "#E5E7EB" }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Balance Due</Typography>
              <Typography sx={{
                fontSize: 18, fontWeight: 900,
                color: Number(data.balance_amount) > 0 ? "#D32F2F" : "#111827",
              }}>
                {INR(data.balance_amount)}
              </Typography>
             
            </Box>
             {
                (Number(data.balance_amount) > 0)
                &&(
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>Due Date</Typography>
              <Typography sx={{
                fontSize: 13, fontWeight: 500,
                color: "#D32F2F",
              }}>
                {data.due_date_formatted}
              </Typography>
             
            </Box>
                )
              }
          </Box>
        </Box>
      </Box>

      {/* ── 4. Payment History ─────────────────────────────────── */}
      <Box>
        <SectionLabel>Payment History</SectionLabel>
        {data.payments.length === 0 ? (
          <Typography sx={{ fontSize: 13, color: "#9CA3AF" }}>No payment records found.</Typography>
        ) : (
          <Box sx={{ border: "1px solid #E5E7EB", borderRadius: 1.5, overflow: "hidden" }}>
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
  {data.payments.map((pay) => (
    <tr key={pay.payment_id}>
      
      {/* DATE */}
      <td style={{ ...TD, textAlign: "center", fontWeight: 500 }}>
        {pay.payment_date}
      </td>

      {/* TYPE */}
    <td style={{ ...TD, textAlign: "center" }}>
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    }}
  >
    <span
      style={{
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: "#D32F2F",
        flexShrink: 0,
      }}
    />
    {pay.transaction_type ?? "—"}
  </span>
</td>

      {/* REF */}
      <td style={{ ...TD, textAlign: "center", color: "#B91C1C", fontWeight: 600 }}>
        {pay.transaction_id ?? "—"}
      </td>

      {/* AMOUNT */}
      <td style={{ ...TD, textAlign: "right", fontWeight: 700 }}>
        {INR(pay.paid_amount)}
      </td>

    </tr>
  ))}
</tbody>
            </table>
          </Box>
        )}
      </Box>

      {/* ── 5. GST-wise Tax Summary ────────────────────────────── */}
      {Object.keys(taxSummary).length > 0 && (
        <Box>
          <SectionLabel>GST-wise Tax Summary</SectionLabel>
          <Box sx={{ border: "1px solid #E5E7EB", borderRadius: 1.5, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={TH}>GST Rate</th>
                  <th style={{ ...TH, textAlign: "right" }}>Taxable Value (₹)</th>
                  <th style={{ ...TH, textAlign: "right" }}>CGST (₹)</th>
                  <th style={{ ...TH, textAlign: "right" }}>SGST (₹)</th>
                  <th style={{ ...TH, textAlign: "right" }}>Total Tax (₹)</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(taxSummary).map((row) => (
                  <tr key={row.pct}>
                    <td style={{ ...TD, fontWeight: 600,textAlign:"center" }}>{row.pct}%</td>
                    <td style={{ ...TD, textAlign: "right" }}>{INR(row.subtotal)}</td>
                    <td style={{ ...TD, textAlign: "right" }}>{INR(row.cgst)}</td>
                    <td style={{ ...TD, textAlign: "right" }}>{INR(row.sgst)}</td>
                    <td style={{ ...TD, textAlign: "right", fontWeight: 700 }}>{INR(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Box>
      )}
    </Box>
  );
}

/* ─── dialog wrapper ─────────────────────────────────────────── */
interface Props {
  purchaseId: string | null;
  onClose: () => void;
}

export default function PurchaseDetailDialog({ purchaseId, onClose }: Props) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
const [editPurchaseId, setEditPurchaseId] = useState<string | null>(null);

  const { data, isLoading, isError } = usePurchaseById(purchaseId ?? "");
  const st = data
    ? (STATUS_STYLES[data.payment_status as PayStatus] ?? STATUS_STYLES.pending)
    : null;

    
const handleEdit = (id: string) => {
  setEditPurchaseId(id);
  setAddDialogOpen(true);
};

const handleDialogClose = () => {
  setAddDialogOpen(false);
  setEditPurchaseId(null);
};

  return (
    <Dialog
      open={!!purchaseId}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2.5,
          maxHeight: "92vh",
          fontFamily: '"Inter", "Poppins", sans-serif',
        },
      }}
    >
      {/* ── Header ── */}
      <DialogTitle
        sx={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          px: 3.5, py: 2.5,
          borderBottom: "1px solid #F3F4F6",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Typography sx={{
            fontSize: 20, fontWeight: 800, color: "#111827",
            fontFamily: "Manrope, sans-serif", letterSpacing: "-0.02em",
          }}>
            Purchase Details
          </Typography>
          {data && (
            <Typography sx={{ fontSize: 17, fontWeight: 600, color: "#6B7280" }}>
              #{data.purchase_id}
            </Typography>
          )}
          {st && (
            <Chip
              label={st.label}
              size="small"
              sx={{
                fontSize: 10, fontWeight: 700, height: 22,
                color: st.color, bgcolor: st.bgcolor,
                border: `1px solid ${st.border}`,
                borderRadius: "999px",
              }}
            />
          )}
        </Box>
  <Box>
  <IconButton
    size="small"
    onClick={() => handleEdit(data.purchase_id)}
    sx={{
      color: "#2563EB",
      bgcolor: "#EFF6FF",
      "&:hover": { bgcolor: "#DBEAFE" },
      borderRadius: "50%",
    }}
  >
    <EditOutlinedIcon sx={{ fontSize: 18 }} />
  </IconButton>



        <IconButton
          onClick={onClose} size="small"
          sx={{ color: "#9CA3AF", "&:hover": { color: "#374151", bgcolor: "#F3F4F6" } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        </Box>
      </DialogTitle>

      {/* ── Body ── */}
      <DialogContent sx={{ px: 3.5, py: 3, overflow: "auto" }}>
        {isLoading && <DetailSkeleton />}
        {isError && (
          <Typography sx={{ color: "#DC2626", textAlign: "center", py: 6, fontSize: 14 }}>
            Failed to load purchase details. Please try again.
          </Typography>
        )}
        {data && <PurchaseDetailContent data={data} />}
      </DialogContent>

      {/* ── Footer ── */}
      <DialogActions
        sx={{
          px: 3.5, py: 2,
          borderTop: "1px solid #F3F4F6",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="contained" disableElevation
            startIcon={<PrintIcon sx={{ fontSize: 16 }} />}
            onClick={() => window.print()}
            sx={{
              fontSize: 13, fontWeight: 700, textTransform: "none",
              bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" },
              borderRadius: 1.5, px: 2.5, py: 1,
            }}
          >
            Print Purchase Invoice
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
            sx={{
              fontSize: 13, fontWeight: 700, textTransform: "none",
              color: "#D32F2F", borderColor: "#D32F2F",
              "&:hover": { bgcolor: "#FEF2F2", borderColor: "#B71C1C" },
              borderRadius: 1.5, px: 2.5, py: 1,
            }}
          >
            Download PDF
          </Button>
        </Box>
        <Button
          onClick={onClose}
          sx={{
            fontSize: 13, fontWeight: 600, textTransform: "none",
            color: "#6B7280", "&:hover": { bgcolor: "#F3F4F6" },
            borderRadius: 1.5,
          }}
        >
          Close
        </Button>
      </DialogActions>

      <AddNewPurchaseDialog
  open={addDialogOpen}
  onClose={handleDialogClose}
  onSuccess={() => { handleDialogClose(); }}
  editPurchaseId={editPurchaseId}
/>
    </Dialog>
  );
}