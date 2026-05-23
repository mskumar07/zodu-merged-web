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
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import { useState, useRef } from "react";
import { useExpenseDetail, type ExpenseDetail } from "./useExpenseApi";
import AddNewExpenseDialog from "./AddNewExpenseDialog";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const INR = (v: number | string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(v));

const fmtDate = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const fmtDateTime = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

type PayStatus = "paid" | "partial" | "pending";

const STATUS_STYLES: Record<
  PayStatus,
  { label: string; color: string; bgcolor: string; border: string }
> = {
  paid:    { label: "PAID",    color: "#166534", bgcolor: "#DCFCE7", border: "#BBF7D0" },
  partial: { label: "PARTIAL", color: "#92400E", bgcolor: "#FEF3C7", border: "#FDE68A" },
  pending: { label: "PENDING", color: "#991B1B", bgcolor: "#FEE2E2", border: "#FECACA" },
};

const TH: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "#94A3B8",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  backgroundColor: "#F8FAFC",
  padding: "10px 14px",
  borderBottom: "1px solid #E5E7EB",
  whiteSpace: "nowrap",
};

const TD: React.CSSProperties = {
  fontSize: 12.5,
  color: "#334155",
  padding: "10px 14px",
  borderBottom: "1px solid #EEF2F7",
  verticalAlign: "middle",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontSize: 10,
        fontWeight: 800,
        color: "#94A3B8",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        mb: 1.2,
      }}
    >
      {children}
    </Typography>
  );
}

function DetailSkeleton() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Skeleton variant="rounded" height={86} />
      <Skeleton variant="rounded" height={220} />
      <Skeleton variant="rounded" height={150} />
      <Skeleton variant="rounded" height={180} />
    </Box>
  );
}

function ExpenseDetailContent({ data }: { data: ExpenseDetail }) {
  const totalSubtotal = data.items.reduce((sum, item) => sum + Number(item.subtotal ?? 0), 0);

  const vendorAddress = [
    data.vendor_address_1,
    data.vendor_address_2,
    data.vendor_city,
    data.vendor_state,
    data.vendor_pincode,
  ].filter(Boolean).join(", ");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Invoice / Expense Header */}
      <Box sx={{ border: "1px solid #E2E8F0", borderRadius: 2, overflow: "hidden", bgcolor: "#FFFFFF" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.5, borderBottom: "1px solid #EEF2F7", bgcolor: "#FCFCFD", flexWrap: "wrap" }}>
          <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#0F172A" }}>Expense Details</Typography>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#D32F2F" }}>{data.expense_id}</Typography>
          {data.created_at && (
            <Typography sx={{ fontSize: 11, color: "#94A3B8" }}>{fmtDateTime(data.created_at)}</Typography>
          )}
        </Box>

        <Box sx={{ p: 2, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px 24px" }}>
          {[
            { label: "Supplier Name",  value: data.vendor_name || "—" },
            { label: "Mobile No.",     value: data.vendor_phone },
            { label: "GSTIN",          value: data.gst },
            { label: "Address",        value: vendorAddress },
            { label: "Expense Date",   value: data.expense_date_formatted || fmtDate(data.expense_date) },
            { label: "Category",       value: data.category_name },
          ].map(({ label, value }) => (
            <Box key={label}>
              <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.4 }}>
                {label}
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>
                {value || "—"}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Items List */}
      <Box>
        <SectionLabel>Items List</SectionLabel>
        <Box sx={{ border: "1px solid #E2E8F0", borderRadius: 1.5, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...TH, textAlign: "left" }}>Item Name</th>
                <th style={{ ...TH, textAlign: "center" }}>Category</th>
                <th style={{ ...TH, textAlign: "center" }}>Qty</th>
                <th style={{ ...TH, textAlign: "right" }}>Price</th>
                <th style={{ ...TH, textAlign: "right" }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, idx) => (
                <tr key={item.expense_item_id ?? item.item_id ?? idx}>
                  <td style={{ ...TD, fontWeight: 600, color: "#0F172A" }}>{item.item_name}</td>
                  <td style={{ ...TD, textAlign: "center", color: "#64748B" }}>{item.category_name || "—"}</td>
                  <td style={{ ...TD, textAlign: "center" }}>
                    {Number(item.qty).toFixed(0)} {item.unit ?? ""}
                  </td>
                  <td style={{ ...TD, textAlign: "right", whiteSpace: "nowrap" }}>{INR(item.price)}</td>
                  <td style={{ ...TD, textAlign: "right", fontWeight: 700, whiteSpace: "nowrap" }}>
                    {INR(item.subtotal ?? (Number(item.qty) * Number(item.price)))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>

      {/* Totals */}
      <Box sx={{ border: "1px solid #E2E8F0", borderRadius: 1.5, p: 2.5, bgcolor: "#FFFFFF" }}>
        <Box sx={{ maxWidth: 460, ml: "auto", display: "flex", flexDirection: "column", gap: 1.2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: 13, color: "#64748B" }}>Subtotal</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{INR(totalSubtotal)}</Typography>
          </Box>
          <Divider sx={{ borderStyle: "dashed", borderColor: "#CBD5E1", my: 0.6 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#0F172A" }}>Grand Total</Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>
              {INR(data.total_amount)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: 13, color: "#16A34A", fontWeight: 600 }}>Amount Paid</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#16A34A" }}>{INR(data.paid_amount)}</Typography>
          </Box>
          {Number(data.balance_amount) > 0 && (
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#D97706" }}>Balance Due</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#D97706" }}>{INR(data.balance_amount)}</Typography>
            </Box>
          )}
          {data.due_date && Number(data.balance_amount) > 0 && (
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: 12, color: "#64748B" }}>Due Date</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#D32F2F" }}>
                {data.due_date_formatted || fmtDate(data.due_date)}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Payment History */}
      <Box>
        <SectionLabel>Payment History</SectionLabel>
        {!data.payments || data.payments.length === 0 ? (
          <Typography sx={{ fontSize: 13, color: "#9CA3AF" }}>No payment records found.</Typography>
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
                {data.payments.map((pay, idx) => (
                  <tr key={pay.payment_id ?? idx}>
                    <td style={{ ...TD, textAlign: "center", fontWeight: 500, whiteSpace: "nowrap" }}>
                      {pay.payment_date_formatted || (pay.payment_date ? fmtDate(pay.payment_date) : "—")}
                    </td>
                    <td style={{ ...TD, textAlign: "center" }}>{pay.transaction_type ?? "—"}</td>
                    <td style={{ ...TD, textAlign: "center", color: "#000", fontWeight: 600 }}>
                      {pay.transaction_id ?? "—"}
                    </td>
                    <td style={{ ...TD, textAlign: "right", fontWeight: 700, whiteSpace: "nowrap" }}>
                      {INR(pay.paid_amount ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
      </Box>

      {/* Notes */}
      {data.notes && (
        <Box>
          <SectionLabel>Notes</SectionLabel>
          <Box sx={{ p: 2, bgcolor: "#F8FAFC", borderRadius: 1.5, border: "1px solid #E2E8F0" }}>
            <Typography sx={{ fontSize: 13, color: "#334155" }}>{data.notes}</Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}

interface Props {
  expenseId: string | null;
  onClose: () => void;
  onEditSuccess?: () => void;
}

export default function ExpenseDetailDialog({ expenseId, onClose, onEditSuccess }: Props) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useExpenseDetail(expenseId);
  const st = data
    ? STATUS_STYLES[data.payment_status as PayStatus] ?? STATUS_STYLES.pending
    : null;

  const handleDownload = async () => {
    if (!contentRef.current || !data) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW - 20;
      const imgH = (canvas.height * imgW) / canvas.width;
      let y = 10;
      let remainingH = imgH;
      while (remainingH > 0) {
        pdf.addImage(imgData, "PNG", 10, y, imgW, imgH);
        remainingH -= pageH - 20;
        if (remainingH > 0) { pdf.addPage(); y = 10 - (imgH - remainingH); }
      }
      pdf.save(`${data.expense_id}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog
      open={!!expenseId}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2.5, maxHeight: "92vh", fontFamily: '"Inter", sans-serif' } }}
    >
      <DialogTitle
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3.5, py: 2, borderBottom: "1px solid #F1F5F9" }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>
            Expense Details
          </Typography>
          {data && (
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#64748B" }}>
              #{data.expense_id}
            </Typography>
          )}
          {st && (
            <Chip
              label={st.label}
              size="small"
              sx={{ fontSize: 10, fontWeight: 700, height: 22, color: st.color, bgcolor: st.bgcolor, border: `1px solid ${st.border}`, borderRadius: "999px" }}
            />
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {data && (
            <IconButton
              size="small"
              onClick={() => setEditDialogOpen(true)}
              sx={{ color: "#2563EB", bgcolor: "#EFF6FF", "&:hover": { bgcolor: "#DBEAFE" } }}
            >
              <EditOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: "#9CA3AF", "&:hover": { color: "#374151", bgcolor: "#F3F4F6" } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3.5, py: 3, overflow: "auto" }}>
        <div ref={contentRef} data-print-content>
          {isLoading && <DetailSkeleton />}
          {isError && (
            <Typography sx={{ color: "#DC2626", textAlign: "center", py: 6, fontSize: 14 }}>
              Failed to load expense details. Please try again.
            </Typography>
          )}
          {data && <ExpenseDetailContent data={data} />}
        </div>
      </DialogContent>

      <DialogActions sx={{ px: 3.5, py: 2, borderTop: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button
          onClick={onClose}
          sx={{ fontSize: 13, fontWeight: 600, textTransform: "none", color: "#64748B", "&:hover": { bgcolor: "#F8FAFC" } }}
        >
          Cancel
        </Button>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="outlined"
            disabled={!data || downloading}
            onClick={handleDownload}
            startIcon={downloading ? <CircularProgress size={14} color="inherit" /> : <DownloadIcon sx={{ fontSize: 16 }} />}
            sx={{ fontSize: 13, fontWeight: 700, textTransform: "none", color: "#0F172A", borderColor: "#CBD5E1", "&:hover": { bgcolor: "#F8FAFC", borderColor: "#94A3B8" }, borderRadius: 1.5, px: 2.5, py: 1 }}
          >
            {downloading ? "Downloading…" : "Download"}
          </Button>
          <Button
            variant="contained"
            disableElevation
            startIcon={<PrintIcon sx={{ fontSize: 16 }} />}
            onClick={() => window.print()}
            sx={{ fontSize: 13, fontWeight: 700, textTransform: "none", bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" }, borderRadius: 1.5, px: 2.5, py: 1 }}
          >
            Print Invoice
          </Button>
        </Box>
      </DialogActions>

      <AddNewExpenseDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={() => {
          setEditDialogOpen(false);
          onEditSuccess?.();
        }}
        editExpenseId={expenseId}
      />
    </Dialog>
  );
}
