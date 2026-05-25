import { useMemo, useState } from "react";
import {
  Box, Typography, TextField, Button, IconButton,
  InputAdornment, Chip, Tooltip, Fab, CircularProgress, Skeleton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, Select, MenuItem, Stack,
} from "@mui/material";
import { Circle } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AddIcon           from "@mui/icons-material/Add";
import EditOutlinedIcon  from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon        from "@mui/icons-material/Search";

import AddNewPurchaseDialog  from "./Addnewpuechasedialog";
import PurchaseStats         from "./PurchaseStats";
import PurchaseDetailDialog  from "./PurchaseDetailDialog";   // ← NEW
import DataTable, { type ColumnDef } from "@utils/DataTable";
import {
  usePurchases,
  usePurchaseSummary,
  useDeletePurchase,
  type PurchaseRow,
} from "./usePuchaseapi";
import PurchasePaymentDialog from "./purchasePaymentDialog";

const theme = createTheme({
  palette: {
    primary: { main: "#D32F2F" },
    background: { default: "#fdfaf9", paper: "#ffffff" },
    text: { primary: "#0F172A", secondary: "#6B7280" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", borderRadius: 8, fontWeight: 700 },
      },
    },
  },
});

const INR = (v: number | string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR",
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(Number(v));
const TABLE_TEXT_COLOR = "#374151";

type PurchaseStatus = "paid" | "partial" | "pending";

const STATUS_STYLES: Record<PurchaseStatus, {
  label: string; color: string;
}> = {
  paid:    { label: "Paid",    color: "#2E7D32" },
  partial: { label: "Partial", color: "#F57C00" },
  pending: { label: "Pending", color: "#C62828" },
};

// Status Badge Component (like SalesHistory)
function StatusBadge({ status }: { status: PurchaseStatus }) {
  const st = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  return (
        <Typography
          variant="body2"
          sx={{
            display: "inline-flex", alignItems: "center", gap: 0.5,
            color: st.color, fontWeight: 600, fontSize: 13,
      }}
    >
      <Circle sx={{ fontSize: 8 }} />
      {st.label}
    </Typography>
  );
}

function StatsSkeleton() {
  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} variant="rounded" height={90} sx={{ flex: 1, borderRadius: 3 }} />
      ))}
    </Box>
  );
}

export default function PurchaseScreen() {
  const [search, setSearch]               = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PurchaseStatus | "">("");
  const [addDialogOpen, setAddDialog]     = useState(false);
  const [editPurchaseId, setEditPurchaseId] = useState<string | null>(null);
  const [paymentTarget, setPayment]       = useState<PurchaseRow | null>(null);
  const [deleteTarget, setDeleteTarget]   = useState<PurchaseRow | null>(null);
  const [detailId, setDetailId]           = useState<string | null>(null); // ← NEW: UUID for detail dialog

  const {
    data: purchases = [],
    isLoading: listLoading,
    refetch: refetchList,
  } = usePurchases({
    ...(search ? { search } : {}),
    ...(paymentStatusFilter ? { payment_status: paymentStatusFilter } : {}),
  });

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = usePurchaseSummary();

  const { mutateAsync: deletePurchase, isPending: isDeleting } = useDeletePurchase();

  const refetchAll = () => { refetchList(); refetchStats(); };

  const handleEdit = (purchase_id: string) => {
    setEditPurchaseId(purchase_id);
    setAddDialog(true);
  };

  const handleDialogClose = () => {
    setAddDialog(false);
    setEditPurchaseId(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePurchase(deleteTarget.purchase_id);
      setDeleteTarget(null);
      refetchStats();
    } catch (err: any) {
      alert(err.message ?? "Delete failed");
    }
  };


  const columns = useMemo<ColumnDef<PurchaseRow>[]>(
    () => [
      {
        key: "purchase_id",
        label: "Purchase ID",
        width: 160,
        render: (p) => (
          /* ── Clickable ID ── */
          <Typography
            onClick={() => setDetailId(p.purchase_id)}   // ← p.id is the UUID
            sx={{
              fontSize: 13, fontWeight: 700, color: "#1976d2",
              letterSpacing: "0.02em", whiteSpace: "nowrap",
              overflow: "hidden", textOverflow: "ellipsis",
              cursor: "pointer",
              "&:hover": { textDecoration: "underline", color: "#1565C0" },
              transition: "color 0.15s",
            }}
          >
            {p.purchase_id}
          </Typography>
        ),
      },
      {
        key: "purchase_date",
        label: "Date",
        width: 110,
        render: (p) => (
          <Typography sx={{ fontSize: 13, color: TABLE_TEXT_COLOR, whiteSpace: "nowrap" }}>
            {new Date(p.purchase_date).toLocaleDateString("en-IN", {
              day: "2-digit", month: "short", year: "numeric",
            })}
          </Typography>
        ),
      },
      {
        key: "vendor_id",
        label: "Vendor",
        width: 200,
        render: (p) => (
          <Box sx={{ maxWidth: 200 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: TABLE_TEXT_COLOR, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {p.vendor_name ?? "—"}
            </Typography>
            {p.company_name && (
              <Typography sx={{ fontSize: 13, color: TABLE_TEXT_COLOR, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {p.company_name}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        key: "total_amount",
        label: "Total (INR)",
        align: "right",
        width: 120,
        render: (p) => (
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: TABLE_TEXT_COLOR, whiteSpace: "nowrap" }}>
            {INR(p.total_amount)}
          </Typography>
        ),
      },
      {
        key: "paid_amount",
        label: "Paid (INR)",
        align: "right",
        width: 120,
        render: (p) => (
          <Typography sx={{
            fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
            color: Number(p.paid_amount) > 0 ? "#16A34A" : TABLE_TEXT_COLOR,
          }}>
            {INR(p.paid_amount)}
          </Typography>
        ),
      },
      {
  key: "balance_amount",
  label: "Balance (INR)",
  align: "right",
  width: 120,
  render: (p) => {
    const hasBalance = Number(p.balance_amount) > 0;
    const dueDate = p.due_date_formatted;

    return (
      <Box>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
            whiteSpace: "nowrap",
            color: hasBalance ? "#D32F2F" : TABLE_TEXT_COLOR,
          }}
        >
          {INR(p.balance_amount)}
        </Typography>

        {hasBalance && dueDate && (
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 600,
              color: TABLE_TEXT_COLOR,
              mt: 0.3,
              whiteSpace: "nowrap",
            }}
          >
            Due: {dueDate}
          </Typography>
        )}
      </Box>
    );
  },
},
      {
        key: "payment_status",
        label: "Status",
        width: 200,
        align:"left",
        render: (p) => (
          <Stack direction="row" alignItems="center" gap={1}>
            <StatusBadge status={p.payment_status} />
            {Number(p.balance_amount) > 0 && (
              <Button
                size="small" variant="contained" color="primary" disableElevation
                onClick={() => setPayment(p)}
                sx={{ fontSize: "0.65rem", py: 0.4, px: 1.5, height: 24, minWidth: 0, whiteSpace: "nowrap" }}
              >
                Mark as Paid
              </Button>
            )}
          </Stack>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        align: "center",
        width: 90,
        render: (p) => (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
            <Tooltip title="Edit" placement="top">
              <IconButton
                size="small"
                onClick={() => handleEdit(p.purchase_id)}
                sx={{
                  color: "#9CA3AF", p: 0.6, borderRadius: 1,
                  "&:hover": { color: "#2563EB", bgcolor: "#EFF6FF" },
                  transition: "all 0.12s",
                }}
              >
                <EditOutlinedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete" placement="top">
              <IconButton
                size="small"
                onClick={() => setDeleteTarget(p)}
                disabled={isDeleting}
                sx={{
                  color: "#9CA3AF", p: 0.6, borderRadius: 1,
                  "&:hover": { color: "#DC2626", bgcolor: "#FEE2E2" },
                  transition: "all 0.12s",
                }}
              >
                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [isDeleting]
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        <Box sx={{ flex: 1, overflow: "auto", px: 1, py: 1, display: "flex", flexDirection: "column", gap: 2.5 }}>

          {/* Stats */}
          {statsLoading || !stats ? <StatsSkeleton /> : <PurchaseStats data={stats} />}

          {/* Toolbar */}
          <Box sx={{ px: 1, display: "flex", alignItems: "center", justifyContent: "space-between",  flexShrink: 0, gap: 2 }}>
            <TextField
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoices, vendors..." size="small"
              sx={{ flex: "1 1 380px", minWidth: { xs: "100%", sm: 260 }, "& .MuiOutlinedInput-root": { bgcolor: "white", height: 38, fontSize: "0.875rem", borderRadius: 1.5 } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 17, color: "#9CA3AF" }} /></InputAdornment> }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value as PurchaseStatus | "")}
                displayEmpty
                sx={{
                  bgcolor: "white",
                  height: 38,
                  fontSize: "0.875rem",
                  borderRadius: 1.5,
                }}
                renderValue={(value) =>
                  value
                    ? STATUS_STYLES[value as PurchaseStatus]?.label ?? value
                    : "All Status"
                }
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="partial">Partial</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained" size="small"
              startIcon={<AddIcon sx={{ fontSize: 16 }} />}
              onClick={() => { setEditPurchaseId(null); setAddDialog(true); }}
              disableElevation
              sx={{ fontSize: 14, fontWeight: 700, bgcolor: "#D32F2F", color: "#fff", px: 2, py: 0.9, borderRadius: 1.5, boxShadow: "0 4px 14px rgba(211,47,47,0.3)", "&:hover": { bgcolor: "#B71C1C" }, "&:active": { transform: "scale(0.97)" }, transition: "all 0.15s", display: { xs: "none", md: "inline-flex" } }}
            >
              Add New Purchase
            </Button>
          </Box>

          {/* Table */}
          <Box sx={{ flex: 1, minHeight: 0 }}>
            {listLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress size={32} sx={{ color: "#D32F2F" }} />
              </Box>
            ) : (
              <DataTable<PurchaseRow>
                columns={columns}
                rows={purchases}
                rowKey={(p) => p.id}
                maxHeight="100%"
                emptyMessage={search ? `No purchases found for "${search}"` : "No purchases found."}
              />
            )}
          </Box>
        </Box>

        {/* FAB */}
        <Fab color="primary" onClick={() => { setEditPurchaseId(null); setAddDialog(true); }}
          sx={{ position: "fixed", bottom: 24, right: 24, display: { xs: "flex", md: "none" }, bgcolor: "#D32F2F", boxShadow: "0 8px 24px rgba(211,47,47,0.4)", "&:hover": { bgcolor: "#B71C1C" } }}>
          <AddIcon />
        </Fab>

        {/* ── Purchase Detail Dialog (ID click) ── */}
        <PurchaseDetailDialog
          purchaseId={detailId}
          onClose={() => setDetailId(null)}
        />

        {/* ── Add / Edit Dialog ── */}
        <AddNewPurchaseDialog
          open={addDialogOpen}
          onClose={handleDialogClose}
          onSuccess={() => { handleDialogClose(); refetchAll(); }}
          editPurchaseId={editPurchaseId}
        />

        {/* ── Payment Dialog ── */}
        {paymentTarget && (
          <PurchasePaymentDialog
            purchase={paymentTarget}
            onClose={() => setPayment(null)}
            onSuccess={() => { setPayment(null); refetchAll(); }}
          />
        )}

        {/* ── Delete Confirm Dialog ── */}
        <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
          <DialogTitle sx={{ fontWeight: 700 }}>Delete Purchase</DialogTitle>
          <DialogContent>
            <Typography sx={{ fontSize: 14, color: "#475569" }}>
              Are you sure you want to delete purchase {deleteTarget?.purchase_id ? `#${deleteTarget.purchase_id}` : "this purchase"}?
              <br />This will:
              <br />• Reverse stock
              <br />• Delete all payment records
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDeleteTarget(null)} variant="outlined" sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button onClick={handleDelete} variant="contained" color="error" sx={{ borderRadius: 2 }}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
