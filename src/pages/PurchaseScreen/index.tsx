import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tooltip,
  Fab,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AddNewPurchaseDialog from "./Addnewpuechasedialog";

// ─── Theme ────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: { main: "#D32F2F" },
    background: { default: "#fdfaf9", paper: "#ffffff" },
    text: { primary: "#0F172A", secondary: "#6B7280" },
  },
  typography: {
    fontFamily: "'DM Sans', 'Public Sans', 'Segoe UI', sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", borderRadius: 8, fontWeight: 700 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #F3F4F6",
          padding: "12px 16px",
          fontSize: 13,
        },
        head: {
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.07em",
          color: "#6B7280",
          textTransform: "uppercase",
          backgroundColor: "#F9FAFB",
          borderBottom: "2px solid #E5E7EB",
          padding: "12px 16px",
          position: "sticky",
          top: 0,
          zIndex: 10,
        },
      },
    },
  },
});

// ─── Types ────────────────────────────────────────────────────
type PurchaseStatus = "Completed" | "Partial" | "Pending";

interface Purchase {
  id: string;
  purchaseId: string;
  supplierName: string;
  date: string;
  total: number;
  paid: number;
  balance: number;
  status: PurchaseStatus;
}

// ─── Mock Data ────────────────────────────────────────────────
const INITIAL_PURCHASES: Purchase[] = [
  { id: "1",  purchaseId: "#PRC-001", supplierName: "Global Traders Co.",  date: "24 Oct 2023", total: 15000, paid: 15000, balance: 0,     status: "Completed" },
  { id: "2",  purchaseId: "#PRC-002", supplierName: "Sunrise Corp",        date: "25 Oct 2023", total: 8400,  paid: 4000,  balance: 4400,  status: "Partial"   },
  { id: "3",  purchaseId: "#PRC-003", supplierName: "Acme Supplies",       date: "25 Oct 2023", total: 12000, paid: 0,     balance: 12000, status: "Pending"   },
  { id: "4",  purchaseId: "#PRC-004", supplierName: "Metro Wholesale",     date: "26 Oct 2023", total: 2500,  paid: 2500,  balance: 0,     status: "Completed" },
  { id: "5",  purchaseId: "#PRC-005", supplierName: "Pioneer Electronics", date: "27 Oct 2023", total: 45200, paid: 45200, balance: 0,     status: "Completed" },
  { id: "6",  purchaseId: "#PRC-006", supplierName: "Apex Distributions",  date: "27 Oct 2023", total: 18000, paid: 8000,  balance: 10000, status: "Partial"   },
  { id: "7",  purchaseId: "#PRC-007", supplierName: "Blue Star Logistics", date: "28 Oct 2023", total: 7500,  paid: 0,     balance: 7500,  status: "Pending"   },
  { id: "8",  purchaseId: "#PRC-008", supplierName: "Crystal Clear Pvt",   date: "28 Oct 2023", total: 12300, paid: 12300, balance: 0,     status: "Completed" },
  { id: "9",  purchaseId: "#PRC-009", supplierName: "Dynamic Goods",       date: "29 Oct 2023", total: 32100, paid: 32100, balance: 0,     status: "Completed" },
  { id: "10", purchaseId: "#PRC-010", supplierName: "E-Retail Hub",        date: "29 Oct 2023", total: 5000,  paid: 2000,  balance: 3000,  status: "Partial"   },
  { id: "11", purchaseId: "#PRC-011", supplierName: "Focus Suppliers",     date: "30 Oct 2023", total: 14200, paid: 14200, balance: 0,     status: "Completed" },
  { id: "12", purchaseId: "#PRC-012", supplierName: "Green Field Ag",      date: "30 Oct 2023", total: 22000, paid: 10000, balance: 12000, status: "Partial"   },
  { id: "13", purchaseId: "#PRC-013", supplierName: "Home Needs Co.",      date: "31 Oct 2023", total: 6400,  paid: 6400,  balance: 0,     status: "Completed" },
  { id: "14", purchaseId: "#PRC-014", supplierName: "Inland Traders",      date: "31 Oct 2023", total: 3200,  paid: 0,     balance: 3200,  status: "Pending"   },
  { id: "15", purchaseId: "#PRC-015", supplierName: "Joint Ventures",      date: "01 Nov 2023", total: 25600, paid: 25600, balance: 0,     status: "Completed" },
  { id: "16", purchaseId: "#PRC-016", supplierName: "Key Retailers",       date: "01 Nov 2023", total: 1900,  paid: 1900,  balance: 0,     status: "Completed" },
  { id: "17", purchaseId: "#PRC-017", supplierName: "Link Solutions",      date: "02 Nov 2023", total: 9800,  paid: 9800,  balance: 0,     status: "Completed" },
  { id: "18", purchaseId: "#PRC-018", supplierName: "Mega Mart",           date: "02 Nov 2023", total: 11400, paid: 4000,  balance: 7400,  status: "Partial"   },
  { id: "19", purchaseId: "#PRC-019", supplierName: "North Star Co.",      date: "03 Nov 2023", total: 4500,  paid: 4500,  balance: 0,     status: "Completed" },
  { id: "20", purchaseId: "#PRC-020", supplierName: "Orient Traders",      date: "03 Nov 2023", total: 15800, paid: 0,     balance: 15800, status: "Pending"   },
  { id: "21", purchaseId: "#PRC-021", supplierName: "Prime Goods",         date: "04 Nov 2023", total: 8900,  paid: 8900,  balance: 0,     status: "Completed" },
  { id: "22", purchaseId: "#PRC-022", supplierName: "Quality First",       date: "04 Nov 2023", total: 21200, paid: 21200, balance: 0,     status: "Completed" },
  { id: "23", purchaseId: "#PRC-023", supplierName: "Royal Supplies",      date: "05 Nov 2023", total: 13500, paid: 3500,  balance: 10000, status: "Partial"   },
  { id: "24", purchaseId: "#PRC-024", supplierName: "Swift Logistics",     date: "05 Nov 2023", total: 7200,  paid: 7200,  balance: 0,     status: "Completed" },
];

// ─── Helpers ──────────────────────────────────────────────────
const INR = (v: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v);

const STATUS_STYLES: Record<
  PurchaseStatus,
  { label: string; color: string; bgcolor: string; borderColor: string }
> = {
  Completed: { label: "Completed", color: "#166534", bgcolor: "#DCFCE7", borderColor: "#BBF7D0" },
  Partial:   { label: "Partial",   color: "#92400E", bgcolor: "#FEF3C7", borderColor: "#FDE68A" },
  Pending:   { label: "Pending",   color: "#991B1B", bgcolor: "#FEE2E2", borderColor: "#FECACA" },
};

// ─── Stat Card ────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  sub,
  subColor = "#6B7280",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  subColor?: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid #E5E7EB",
        borderRadius: 3,
        p: 1.5,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        bgcolor: "#fff",
        flex: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#9CA3AF" }}>
        {icon}
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#6B7280" }}>{label}</Typography>
      </Box>
      <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#0F172A", lineHeight: 1.1 }}>
        {value}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
        <Typography sx={{ fontSize: 11, color: subColor, fontWeight: 500 }}>{sub}</Typography>
      </Box>
    </Paper>
  );
}

// ─── Props ────────────────────────────────────────────────────
interface PurchaseScreenProps {
  onAddPurchase?: () => void;
  onEditPurchase?: (purchase: Purchase) => void;
  onDeletePurchase?: (id: string) => void;
}

// ─── Component ───────────────────────────────────────────────
export default function PurchaseScreen({
  onAddPurchase,
  onEditPurchase,
  onDeletePurchase,
}: PurchaseScreenProps) {
  const [purchases, setPurchases] = useState<Purchase[]>(INITIAL_PURCHASES);
  const [search, setSearch] = useState("");
  const [addPurchaseDialogOpen, setAddPurchaseDialogOpen] = useState(false);
  
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return purchases;
    return purchases.filter(
      p =>
        p.purchaseId.toLowerCase().includes(q) ||
        p.supplierName.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q)
    );
  }, [purchases, search]);

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this purchase record?")) {
      setPurchases(prev => prev.filter(p => p.id !== id));
      onDeletePurchase?.(id);
    }
  };

  // Stats
  const totalPurchases = purchases.reduce((s, p) => s + p.total, 0);
  const pendingAmount  = purchases.reduce((s, p) => s + p.balance, 0);
  const pendingCount   = purchases.filter(p => p.status !== "Completed").length;
  const completedToday = purchases.filter(p => p.status === "Completed").length;

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#fdfaf9",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* ── Toolbar ── */}
        <Box
          sx={{
            px: 3,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "#fff",
            borderBottom: "1px solid #E5E7EB",
            flexShrink: 0,
            gap: 2,
          }}
        >
          {/* Search */}
          <TextField
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search invoices, suppliers…"
            size="small"
            sx={{
              flex: 1,
              maxWidth: 380,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "#F8FAFC",
                fontSize: 13,
                "& fieldset": { borderColor: "#E5E7EB" },
                "&:hover fieldset": { borderColor: "#D32F2F" },
                "&.Mui-focused fieldset": { borderColor: "#D32F2F", borderWidth: 2 },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 17, color: "#9CA3AF" }} />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            onClick={()=> setAddPurchaseDialogOpen(true)}
            disableElevation
            sx={{
              fontSize: 13,
              fontWeight: 700,
              bgcolor: "#D32F2F",
              color: "#fff",
              px: 2.5,
              py: 0.9,
              borderRadius: 1.5,
              boxShadow: "0 4px 14px rgba(211,47,47,0.3)",
              "&:hover": { bgcolor: "#B71C1C" },
              "&:active": { transform: "scale(0.97)" },
              transition: "all 0.15s",
              display: { xs: "none", md: "inline-flex" },
            }}
          >
            Add New Purchase
          </Button>
        </Box>

        {/* ── Main Scrollable Body ── */}
        <Box sx={{ flex: 1, overflow: "auto", px: 3, py: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}>

          {/* ── Stats Row ── */}
          <Box sx={{ display: "flex", gap: 2, flexShrink: 0 }}>
            <StatCard
              icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} />}
              label="Total Purchases"
              value={INR(totalPurchases)}
              sub="12% from last month"
              subColor="#16A34A"
            />
            <StatCard
              icon={<PendingActionsOutlinedIcon sx={{ fontSize: 20 }} />}
              label="Pending Amount"
              value={INR(pendingAmount)}
              sub={`${pendingCount} invoices outstanding`}
              subColor="#D32F2F"
            />
            <StatCard
              icon={<InventoryOutlinedIcon sx={{ fontSize: 20 }} />}
              label="Completed Today"
              value={String(completedToday)}
              sub="Fully received orders"
              subColor="#16A34A"
            />
          </Box>

          {/* ── Table ── */}
          <Paper
            elevation={0}
            sx={{
              border: "1px solid #E5E7EB",
              borderRadius: 2,
              overflow: "hidden",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <TableContainer
              sx={{
                flex: 1,
                overflowY: "auto",
                "&::-webkit-scrollbar": { width: 6 },
                "&::-webkit-scrollbar-track": { background: "transparent" },
                "&::-webkit-scrollbar-thumb": { background: "rgba(211,47,47,0.25)", borderRadius: 10 },
              }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Purchase ID</TableCell>
                    <TableCell>Supplier Name</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Total (₹)</TableCell>
                    <TableCell align="right">Paid (₹)</TableCell>
                    <TableCell align="right">Balance (₹)</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <Typography sx={{ fontSize: 13, color: "#9CA3AF" }}>
                          No purchases found for "{search}"
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map(purchase => {
                      const st = STATUS_STYLES[purchase.status];
                      return (
                        <TableRow
                          key={purchase.id}
                          sx={{
                            "&:hover": { bgcolor: "#FFF5F5" },
                            transition: "background 0.1s",
                          }}
                        >
                          {/* Purchase ID */}
                          <TableCell>
                            <Typography
                              sx={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#D32F2F",
                                fontFamily: "monospace",
                                letterSpacing: "0.03em",
                              }}
                            >
                              {purchase.purchaseId}
                            </Typography>
                          </TableCell>

                          {/* Supplier */}
                          <TableCell>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A", whiteSpace: "nowrap" }}>
                              {purchase.supplierName}
                            </Typography>
                          </TableCell>

                          {/* Date */}
                          <TableCell>
                            <Typography sx={{ fontSize: 12, color: "#6B7280", whiteSpace: "nowrap" }}>
                              {purchase.date}
                            </Typography>
                          </TableCell>

                          {/* Total */}
                          <TableCell align="right">
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A", fontFamily: "monospace" }}>
                              {INR(purchase.total)}
                            </Typography>
                          </TableCell>

                          {/* Paid */}
                          <TableCell align="right">
                            <Typography
                              sx={{
                                fontSize: 13,
                                fontWeight: 600,
                                fontFamily: "monospace",
                                color: purchase.paid > 0 ? "#16A34A" : "#D1D5DB",
                              }}
                            >
                              {INR(purchase.paid)}
                            </Typography>
                          </TableCell>

                          {/* Balance */}
                          <TableCell align="right">
                            <Typography
                              sx={{
                                fontSize: 13,
                                fontWeight: 700,
                                fontFamily: "monospace",
                                color: purchase.balance > 0 ? "#D32F2F" : "#0F172A",
                              }}
                            >
                              {INR(purchase.balance)}
                            </Typography>
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            <Chip
                              label={st.label}
                              size="small"
                              sx={{
                                fontSize: 10,
                                fontWeight: 700,
                                height: 22,
                                color: st.color,
                                bgcolor: st.bgcolor,
                                border: `1px solid ${st.borderColor}`,
                                borderRadius: "999px",
                              }}
                            />
                          </TableCell>

                          {/* Actions */}
                          <TableCell align="center">
                            <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                              <Tooltip title="Edit" placement="top">
                                <IconButton
                                  size="small"
                                  onClick={() => onEditPurchase?.(purchase)}
                                  sx={{
                                    color: "#9CA3AF",
                                    p: 0.6,
                                    borderRadius: 1,
                                    "&:hover": { color: "#D32F2F", bgcolor: "#FEE2E2" },
                                    transition: "all 0.12s",
                                  }}
                                >
                                  <EditOutlinedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete" placement="top">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(purchase.id)}
                                  sx={{
                                    color: "#9CA3AF",
                                    p: 0.6,
                                    borderRadius: 1,
                                    "&:hover": { color: "#DC2626", bgcolor: "#FEE2E2" },
                                    transition: "all 0.12s",
                                  }}
                                >
                                  <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>

        {/* ── Mobile FAB ── */}
        <Fab
          color="primary"
          onClick={onAddPurchase}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            display: { xs: "flex", md: "none" },
            bgcolor: "#D32F2F",
            boxShadow: "0 8px 24px rgba(211,47,47,0.4)",
            "&:hover": { bgcolor: "#B71C1C" },
          }}
        >
          <AddIcon />
        </Fab>

        <AddNewPurchaseDialog
        open={addPurchaseDialogOpen}
        onClose={() => setAddPurchaseDialogOpen(false)}
        />
      </Box>
    </ThemeProvider>
  );
}