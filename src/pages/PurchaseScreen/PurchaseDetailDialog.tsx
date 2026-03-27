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
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useState } from "react";
import { usePurchaseById, type PurchaseDetail } from "./usePuchaseapi";
import AddNewPurchaseDialog from "./Addnewpuechasedialog";

const INR = (v: number | string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(v));

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

type PayStatus = "paid" | "partial" | "pending";

const STATUS_STYLES: Record<
  PayStatus,
  { label: string; color: string; bgcolor: string; border: string }
> = {
  paid: { label: "PAID", color: "#166534", bgcolor: "#DCFCE7", border: "#BBF7D0" },
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

function PurchaseDetailContent({ data }: { data: PurchaseDetail }) {
  const totalSubtotal = data.items.reduce((sum, item) => sum + Number(item.subtotal ?? 0), 0);
  const totalCgst = data.items.reduce((sum, item) => sum + Number(item.cgst ?? 0), 0);
  const totalSgst = data.items.reduce((sum, item) => sum + Number(item.sgst ?? 0), 0);
  const totalTax = data.items.reduce((sum, item) => sum + Number(item.tax_amount ?? 0), 0);
  const dueDate = data.due_date_formatted ?? data.due_date_formated;

  const vendorAddress = [
    data.vendor_address_1,
    data.vendor_address_2,
    data.city,
    data.state,
    data.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const hsnSummary = data.items.reduce<
    Record<
      string,
      {
        hsnCode: string;
        taxableValue: number;
        cgstPct: number;
        cgstAmount: number;
        sgstPct: number;
        sgstAmount: number;
        totalTax: number;
      }
    >
  >((acc, item) => {
    const hsnCode = item.hsn_code ?? item.hsn ?? "—";
    const gstPct = Number(item.gst_percentage ?? 0);
    const cgstPct = gstPct / 2;
    const sgstPct = gstPct / 2;

    if (!acc[hsnCode]) {
      acc[hsnCode] = {
        hsnCode,
        taxableValue: 0,
        cgstPct,
        cgstAmount: 0,
        sgstPct,
        sgstAmount: 0,
        totalTax: 0,
      };
    }

    acc[hsnCode].taxableValue += Number(item.subtotal ?? 0);
    acc[hsnCode].cgstAmount += Number(item.cgst ?? 0);
    acc[hsnCode].sgstAmount += Number(item.sgst ?? 0);
    acc[hsnCode].totalTax += Number(item.tax_amount ?? 0);
    return acc;
  }, {});

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box
        sx={{
          border: "1px solid #E2E8F0",
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "#FFFFFF",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2,
            py: 1.5,
            borderBottom: "1px solid #EEF2F7",
            bgcolor: "#FCFCFD",
            flexWrap: "wrap",
          }}
        >
          <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#0F172A" }}>
            Invoice Details
          </Typography>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#D32F2F" }}>
            {data.purchase_id}
          </Typography>
          <Typography sx={{ fontSize: 11, color: "#94A3B8" }}>
            {fmtDateTime(data.created_at)}
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "16px 24px",
          }}
        >
          {[
            { label: "Supplier Name", value: data.vendor_name || "Walk-in Supplier" },
            { label: "Mobile No.", value: data.vendor_phone },
            { label: "GSTIN", value: data.vendor_gst },
            { label: "Address", value: vendorAddress },
          ].map(({ label, value }) => (
            <Box key={label}>
              <Typography
                sx={{
                  fontSize: 9.5,
                  fontWeight: 700,
                  color: "#94A3B8",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  mb: 0.4,
                }}
              >
                {label}
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>
                {value || "—"}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box>
        <SectionLabel>Items List</SectionLabel>
        <Box sx={{ border: "1px solid #E2E8F0", borderRadius: 1.5, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={TH}>Item Name</th>
                <th style={TH}>HSN</th>
                <th style={{ ...TH, textAlign: "right" }}>MRP</th>
                <th style={{ ...TH, textAlign: "center" }}>Qty</th>
                <th style={{ ...TH, textAlign: "center" }}>GST%</th>
                <th style={{ ...TH, textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => {
                const hsnCode = item.hsn_code ?? item.hsn ?? "—";
                return (
                  <tr key={item.purchase_item_id}>
                    <td style={{ ...TD, fontWeight: 600, color: "#0F172A" }}>{item.item_name}</td>
                    <td style={{ ...TD, color: "#64748B", whiteSpace: "nowrap" }}>{hsnCode}</td>
                    <td style={{ ...TD, textAlign: "right", whiteSpace: "nowrap" }}>
                      {INR(item.purchase_price)}
                    </td>
                    <td style={{ ...TD, textAlign: "center", whiteSpace: "nowrap" }}>
                      {Number(item.qty).toFixed(0)} {item.unit ?? ""}
                    </td>
                    <td style={{ ...TD, textAlign: "center", whiteSpace: "nowrap" }}>
                      {item.gst_percentage ?? 0}%
                    </td>
                    <td style={{ ...TD, textAlign: "right", fontWeight: 700, whiteSpace: "nowrap" }}>
                      {INR(item.total_price ?? item.subtotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>
      </Box>

      <Box
        sx={{
          border: "1px solid #E2E8F0",
          borderRadius: 1.5,
          p: 2.5,
          bgcolor: "#FFFFFF",
        }}
      >
        <Box sx={{ maxWidth: 460, ml: "auto", display: "flex", flexDirection: "column", gap: 1.2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: 13, color: "#64748B" }}>Subtotal</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{INR(totalSubtotal)}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: 13, color: "#64748B" }}>CGST Total</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{INR(totalCgst)}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: 13, color: "#64748B" }}>SGST Total</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{INR(totalSgst)}</Typography>
          </Box>
          <Divider sx={{ borderStyle: "dashed", borderColor: "#CBD5E1", my: 0.6 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#0F172A" }}>Grand Total</Typography>
            <Typography sx={{ fontSize: 28, fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>
              {INR(data.total_amount)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#D97706" }}>Balance Due</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#D97706" }}>
              {INR(data.balance_amount)}
            </Typography>
          </Box>
          {dueDate && Number(data.balance_amount) > 0 && (
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: 12, color: "#64748B" }}>Due Date</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#D32F2F" }}>{dueDate}</Typography>
            </Box>
          )}
        </Box>
      </Box>

          <Box>
        <SectionLabel>Payment History</SectionLabel>
        {data.payments.length === 0 ? (
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
                {data.payments.map((pay) => (
                  <tr key={pay.payment_id}>
                    <td style={{ ...TD, textAlign: "center", fontWeight: 500, whiteSpace: "nowrap" }}>
                      {fmtDate(pay.payment_date)}
                    </td>
                    <td style={{ ...TD, textAlign: "center" }}>{pay.transaction_type ?? "—"}</td>
                    <td style={{ ...TD, textAlign: "center", color: "#B91C1C", fontWeight: 600 }}>
                      {pay.transaction_id ?? "—"}
                    </td>
                    <td style={{ ...TD, textAlign: "right", fontWeight: 700, whiteSpace: "nowrap" }}>
                      {INR(pay.paid_amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
      </Box>

      {Object.keys(hsnSummary).length > 0 && (
        <Box>
          <SectionLabel>HSN-wise Tax Breakdown</SectionLabel>
          <Box sx={{ border: "1px solid #E2E8F0", borderRadius: 1.5, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={TH}>HSN Code</th>
                  <th style={{ ...TH, textAlign: "right" }}>Taxable Val</th>
                  <th style={{ ...TH, textAlign: "center" }}>CGST %</th>
                  <th style={{ ...TH, textAlign: "right" }}>CGST Amt</th>
                  <th style={{ ...TH, textAlign: "center" }}>SGST %</th>
                  <th style={{ ...TH, textAlign: "right" }}>SGST Amt</th>
                  <th style={{ ...TH, textAlign: "right" }}>Total Tax</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(hsnSummary).map((row) => (
                  <tr key={row.hsnCode}>
                    <td style={{ ...TD, fontWeight: 700, whiteSpace: "nowrap" }}>{row.hsnCode}</td>
                    <td style={{ ...TD, textAlign: "right", whiteSpace: "nowrap" }}>{INR(row.taxableValue)}</td>
                    <td style={{ ...TD, textAlign: "center", whiteSpace: "nowrap" }}>{row.cgstPct}%</td>
                    <td style={{ ...TD, textAlign: "right", whiteSpace: "nowrap" }}>{INR(row.cgstAmount)}</td>
                    <td style={{ ...TD, textAlign: "center", whiteSpace: "nowrap" }}>{row.sgstPct}%</td>
                    <td style={{ ...TD, textAlign: "right", whiteSpace: "nowrap" }}>{INR(row.sgstAmount)}</td>
                    <td style={{ ...TD, textAlign: "right", fontWeight: 700, whiteSpace: "nowrap" }}>{INR(row.totalTax)}</td>
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

interface Props {
  purchaseId: string | null;
  onClose: () => void;
}

export default function PurchaseDetailDialog({ purchaseId, onClose }: Props) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editPurchaseId, setEditPurchaseId] = useState<string | null>(null);

  const { data, isLoading, isError } = usePurchaseById(purchaseId ?? "");
  const st = data
    ? STATUS_STYLES[data.payment_status as PayStatus] ?? STATUS_STYLES.pending
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
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3.5,
          py: 2,
          borderBottom: "1px solid #F1F5F9",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>
            Purchase Details
          </Typography>
          {data && (
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#64748B" }}>
              #{data.purchase_id}
            </Typography>
          )}
          {st && (
            <Chip
              label={st.label}
              size="small"
              sx={{
                fontSize: 10,
                fontWeight: 700,
                height: 22,
                color: st.color,
                bgcolor: st.bgcolor,
                border: `1px solid ${st.border}`,
                borderRadius: "999px",
              }}
            />
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {data && (
            <IconButton
              size="small"
              onClick={() => handleEdit(data.purchase_id)}
              sx={{
                color: "#2563EB",
                bgcolor: "#EFF6FF",
                "&:hover": { bgcolor: "#DBEAFE" },
              }}
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
        {isLoading && <DetailSkeleton />}
        {isError && (
          <Typography sx={{ color: "#DC2626", textAlign: "center", py: 6, fontSize: 14 }}>
            Failed to load purchase details. Please try again.
          </Typography>
        )}
        {data && <PurchaseDetailContent data={data} />}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3.5,
          py: 2,
          borderTop: "1px solid #F1F5F9",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            fontSize: 13,
            fontWeight: 600,
            textTransform: "none",
            color: "#64748B",
            "&:hover": { bgcolor: "#F8FAFC" },
          }}
        >
          Cancel
        </Button>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
            sx={{
              fontSize: 13,
              fontWeight: 700,
              textTransform: "none",
              color: "#0F172A",
              borderColor: "#CBD5E1",
              "&:hover": { bgcolor: "#F8FAFC", borderColor: "#94A3B8" },
              borderRadius: 1.5,
              px: 2.5,
              py: 1,
            }}
          >
            Download
          </Button>
          <Button
            variant="contained"
            disableElevation
            startIcon={<PrintIcon sx={{ fontSize: 16 }} />}
            onClick={() => window.print()}
            sx={{
              fontSize: 13,
              fontWeight: 700,
              textTransform: "none",
              bgcolor: "#D32F2F",
              "&:hover": { bgcolor: "#B71C1C" },
              borderRadius: 1.5,
              px: 2.5,
              py: 1,
            }}
          >
            Print Invoice
          </Button>
        </Box>
      </DialogActions>

      <AddNewPurchaseDialog
        open={addDialogOpen}
        onClose={handleDialogClose}
        onSuccess={() => {
          handleDialogClose();
        }}
        editPurchaseId={editPurchaseId}
      />
    </Dialog>
  );
}
