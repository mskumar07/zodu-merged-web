import { useEffect, useRef, useCallback, useState } from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import { Circle } from "@mui/icons-material";

import PaymentsIcon              from "@mui/icons-material/Payments";
import DescriptionIcon           from "@mui/icons-material/Description";
import Inventory2Icon            from "@mui/icons-material/Inventory2";
import InsightsIcon              from "@mui/icons-material/Insights";
import NotificationsActiveIcon   from "@mui/icons-material/NotificationsActive";
import ShoppingCartCheckoutIcon  from "@mui/icons-material/ShoppingCartCheckout";
import TrendingUpIcon            from "@mui/icons-material/TrendingUp";
import WarningAmberIcon          from "@mui/icons-material/WarningAmber";
import AccountBalanceWalletIcon  from "@mui/icons-material/AccountBalanceWallet";
import MoneyOffIcon              from "@mui/icons-material/MoneyOff";

import {
  useStats,
  useSales,
  useTopItems,
  useReminders,
  useInventoryAlerts,
} from "./useDashboard";
import { useTenantContext } from "@store/tenantContext";
import InvoiceDetailsModal from "@pages/SalesHistory/Invoicedetaildialog";

// ── Config — swap these out per session ───────────────────────

// ── Theme ─────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary:    { main: "#D32F2F" },
    background: { default: "#F8FAFC", paper: "#FFFFFF" },
    text:       { primary: "#0F172A", secondary: "#64748B" },
  },
  typography: { fontFamily: "'Inter', sans-serif" },
  components: {
    MuiButton:   { styleOverrides: { root: { textTransform: "none" } } },
    MuiSkeleton: { defaultProps: { animation: "wave" } },
  },
});

const RED = "#D32F2F";

// ── Shared card style ─────────────────────────────────────────
const card = {
  bgcolor:     "#fff",
  border:      "1px solid #F1F5F9",
  borderRadius: "8px",
  boxShadow:   "0 1px 4px rgba(0,0,0,0.05)",
};

// ── Table primitives ──────────────────────────────────────────
const ROW_H  = 38;
const CELL_P = "0px 12px";

const headCellSx = {
  height:          ROW_H,
  padding:         CELL_P,
  lineHeight:      `${ROW_H}px`,
  whiteSpace:      "nowrap" as const,
  fontSize:        "11px",
  fontWeight:      600,
  color:           "#6B7280",
  backgroundColor: "#F5F5F5",
  borderBottom:    "1px solid #E5E7EB",
  letterSpacing:   "0.06em",
  textTransform:   "uppercase" as const,
  position:        "sticky" as const,
  top:             0,
  zIndex:          2,
};

const bodyCellSx = {
  height:          ROW_H,
  padding:         CELL_P,
  fontSize:        "13px",
  color:           "#374151",
  verticalAlign:   "middle",
  backgroundColor: "#ffffff",
  borderBottom:    "1px solid #F3F4F6",
};

interface ColDef<T> {
  key:       string;
  label:     string;
  align?:    "left" | "center" | "right";
  width?:    number | string;
  minWidth?: number | string;
  render:    (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
}

// ── MiniTable with sentinel for infinite scroll ───────────────
function MiniTable<T>({
  columns,
  rows,
  rowKey,
  onLoadMore,
  onRowClick,
  isFetchingNextPage,
  hasNextPage,
}: {
  columns:             ColDef<T>[];
  rows:                T[];
  rowKey:              (r: T) => string | number;
  onLoadMore?:         () => void;
  onRowClick?:         (row: T) => void;
  isFetchingNextPage?: boolean;
  hasNextPage?:        boolean;
}) {
  const sentinelRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (!onLoadMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) onLoadMore(); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [onLoadMore, hasNextPage, isFetchingNextPage]);

  return (
    <Box component="table" sx={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
      <Box component="thead">
        <Box component="tr">
          {columns.map(col => (
            <Box
              component="th" key={col.key}
              sx={{ ...headCellSx, textAlign: col.align ?? "left", width: col.width, minWidth: col.minWidth }}
            >
              {col.label}
            </Box>
          ))}
        </Box>
      </Box>

      <Box component="tbody">
        {rows.map(row => (
          <Box
            component="tr" key={rowKey(row)}
            sx={{ "&:hover td": { bgcolor: "#FAFAFA" }, "&:last-child td": { borderBottom: "none" } }}
          >
            {columns.map(col => (
              <Box component="td" key={col.key} sx={{ ...bodyCellSx, textAlign: col.align ?? "left" }}>
                {col.render(row)}
              </Box>
            ))}
          </Box>
        ))}

        {/* Skeleton rows while fetching next page */}
        {isFetchingNextPage &&
          Array.from({ length: 3 }).map((_, i) => (
            <Box component="tr" key={`skel-${i}`}>
              {columns.map(col => (
                <Box component="td" key={col.key} sx={{ ...bodyCellSx }}>
                  <Skeleton height={16} sx={{ borderRadius: 1 }} />
                </Box>
              ))}
            </Box>
          ))
        }

        {/* Invisible sentinel row — triggers next page fetch */}
        {hasNextPage && (
          <Box component="tr" ref={sentinelRef}>
            <Box component="td" colSpan={columns.length} sx={{ p: 0, height: 1, border: "none" }} />
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ── Skeleton table (initial load) ─────────────────────────────
function SkeletonTable({ cols, rows = 4 }: { cols: number; rows?: number }) {
  return (
    <Box component="table" sx={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
      <Box component="thead">
        <Box component="tr">
          {Array.from({ length: cols }).map((_, i) => (
            <Box component="th" key={i} sx={headCellSx}>
              <Skeleton width={60} height={12} />
            </Box>
          ))}
        </Box>
      </Box>
      <Box component="tbody">
        {Array.from({ length: rows }).map((_, r) => (
          <Box component="tr" key={r}>
            {Array.from({ length: cols }).map((_, c) => (
              <Box component="td" key={c} sx={bodyCellSx}>
                <Skeleton height={16} sx={{ borderRadius: 1 }} />
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ── SectionCard ───────────────────────────────────────────────
function SectionCard({
  title, action, children, sx = {},
}: {
  title: React.ReactNode; action?: React.ReactNode;
  children: React.ReactNode; sx?: object;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0, ...sx }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#0F172A" }}>{title}</Typography>
        {action}
      </Box>
      <Box sx={{ ...card, flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <Box sx={{
          flex: 1, minHeight: 0, overflowY: "auto", overflowX: "auto",
          "&::-webkit-scrollbar":       { width: 5, height: 4 },
          "&::-webkit-scrollbar-track": { bgcolor: "#F3F4F6" },
          "&::-webkit-scrollbar-thumb": { bgcolor: "#D1D5DB", borderRadius: 10 },
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

// ── StatusBadge ───────────────────────────────────────────────
function StatusBadge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", gap: 0.5,
      px: 1, py: 0.3, borderRadius: "5px", fontSize: "11px", fontWeight: 700,
      color,
    }}>
      <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: color, flexShrink: 0 }} />
      {label}
    </Box>
  );
}

// ── SummaryCard ───────────────────────────────────────────────
function SummaryCard({ label, value, icon, loading, iconBg, iconColor }: {
  label: string; value?: string; icon: React.ReactNode; loading: boolean;
  iconBg?: string; iconColor?: string;
}) {
  // Estimate char-based min width: icon(36) + gap(12) + padding(32) + ~8px/char for value
  const valueLen  = value?.length ?? 6;
  const labelLen  = label.length;
  // value chars × ~9px, label chars × ~7px — pick the wider, clamp between 150 and 260
  const computed  = Math.max(valueLen * 9, labelLen * 7) + 80;
  const minW      = Math.min(Math.max(computed, 150), 260);

  return (
    <Box sx={{
      ...card, px: 2, py: 1.5,
      display: "flex", alignItems: "center", gap: 1.5,
      minWidth: minW,
      flex: `1 1 ${minW}px`,
      width: "fit-content",
    }}>
      <Box sx={{
        width: 36, height: 36, borderRadius: "8px",
        bgcolor: iconBg ?? "rgba(211,47,47,0.07)",
        color:   iconColor ?? RED,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontSize: "11px", fontWeight: 500, color: "#64748B", whiteSpace: "nowrap" }}>
          {label}
        </Typography>
        {loading
          ? <Skeleton width={80} height={24} sx={{ borderRadius: 1, mt: 0.5 }} />
          : value != null && value !== ""
            ? <Typography sx={{ fontSize: "1.05rem", fontWeight: 800, color: "#0F172A", lineHeight: 1.3, whiteSpace: "nowrap" }}>
                {value}
              </Typography>
            : <Typography sx={{ fontSize: "1.2rem", fontWeight: 700, color: "#CBD5E1", lineHeight: 1.3, letterSpacing: "0.05em" }}>
                —
              </Typography>
        }
      </Box>
    </Box>
  );
}

// ── helpers ───────────────────────────────────────────────────
const fmt = (n: number) =>
  "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function flatPages(query: { data?: { pages: Array<{ data: any[] }> } }) {
  return query.data?.pages.flatMap(p => p.data) ?? [];
}

type PurchaseLikePaymentStatus = "paid" | "partial" | "pending";

const PURCHASE_PAYMENT_STATUS_STYLES: Record<
  PurchaseLikePaymentStatus,
  { label: string; color: string }
> = {
  paid: { label: "Paid", color: "#2E7D32" },
  partial: { label: "Partial", color: "#F57C00" },
  pending: { label: "Pending", color: "#C62828" },
};

function normalizePaymentStatus(status: string): PurchaseLikePaymentStatus {
  switch (status?.toLowerCase()) {
    case "fully_paid":
    case "paid":
      return "paid";
    case "partially_paid":
    case "partial":
      return "partial";
    case "unpaid":
    case "not_paid":
    case "pending":
    default:
      return "pending";
  }
}

function paymentStatusBadge(status: string) {
  const normalizedStatus = normalizePaymentStatus(status);
  const cfg = PURCHASE_PAYMENT_STATUS_STYLES[normalizedStatus];

  return (
    <Typography
      variant="body2"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        color: cfg.color,
        fontWeight: 600,
        fontSize: 13,
      }}
    >
      <Circle sx={{ fontSize: 8 }} />
      {cfg.label}
    </Typography>
  );
}

function stockStatusBadge(status: string) {
  const map: Record<string, { label: string; color: string; dot: string }> = {
    in_stock: { label: "In Stock", color: "#16A34A", dot: "#22C55E" },
    low_stock: { label: "Low Stock", color: "#D97706", dot: "#F59E0B" },
    out_of_stock: { label: "Out Stock", color: "#DC2626", dot: "#EF4444" },
    low: { label: "Low Stock", color: "#D97706", dot: "#F59E0B" },
    critical: { label: "Out Stock", color: "#DC2626", dot: "#EF4444" },
    out: { label: "Out Stock", color: "#DC2626", dot: "#EF4444" },
  };
  const cfg = map[status?.toLowerCase()] ?? map.in_stock;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, justifyContent: "center" }}>
      <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: cfg.dot }} />
      <Typography variant="body2" fontWeight={600} sx={{ color: cfg.color }}>
        {cfg.label}
      </Typography>
    </Box>
  );
}

// ── Column definitions ────────────────────────────────────────

// Sales
type SaleRow = {
  sale_uuid: string; sale_id: string; sale_date: string; sale_time: string;
  total_amount: string; payment_status: string; customer_name: string;
};


// Reminders
type ReminderRow = {
  ref_id: string; ref_type: string; txn_date: string; due_date: string;
  total_amount: string; paid_amount: string; balance_amount: string;
  payment_status: string; party_name?: string; vendor_name?: string;
};
const reminderCols: ColDef<ReminderRow>[] = [
  { key: "due",  label: "Due Date", minWidth: 70,
    render: r => <Typography sx={{ fontSize: 12, color: "#64748B" }}>{r.due_date ? new Date(r.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"}</Typography> },
  { key: "inv",  label: "Invoice / PO", minWidth: 100,
    render: r => (
      <Box>
        <Typography sx={{ fontSize: 12, fontFamily: "monospace", fontWeight: 600, color: "#475569" }}>{r.ref_id}</Typography>
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: r.ref_type === "SALE" ? "#2563EB" : "#7C3AED", mt: 0.2 }}>{r.ref_type}</Typography>
      </Box>
    ) },
  { key: "name", label: "Name",
    render: r => <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{r.party_name ?? r.vendor_name ?? "—"}</Typography> },
  { key: "total", label: "Total", align: "right",
    render: r => <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1976d2" }}>{fmt(+r.total_amount)}</Typography> },
  { key: "due_amt", label: "Due Amt", align: "right",
    render: r => (
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: RED }}>{fmt(+r.balance_amount)}</Typography>
    ) },
  { key: "status", label: "Status", align: "center",
    render: r => paymentStatusBadge(r.payment_status) },
];

// Top Items
type TopItem = {
  item_id: string; item_name: string; category_name?: string;
  total_sold: string; total_revenue: string;
};
const topItemCols: ColDef<TopItem>[] = [
  { key: "name", label: "Item",
    render: r => (
      <Box>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{r.item_name}</Typography>
        {r.category_name && <Typography sx={{ fontSize: 11, color: "#94A3B8" }}>{r.category_name}</Typography>}
      </Box>
    ) },
  { key: "sold", label: "Sold", align: "center",
    render: r => <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{Math.round(+r.total_sold)}</Typography> },
  { key: "rev",  label: "Revenue", align: "right",
    render: r => <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1976d2" }}>{fmt(+r.total_revenue)}</Typography> },
];

// Inventory Alerts
type AlertItem = {
  item_uuid: string; item_id: string; item_name: string;
  available_qty: string; reorder_level: string; stock_status: string;
};
const alertCols: ColDef<AlertItem>[] = [
  { key: "name",   label: "Item",
    render: r => <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{r.item_name}</Typography> },
  { key: "stock",  label: "Stock", align: "center",
    render: r => <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{r.available_qty}</Typography> },
  { key: "status", label: "Status", align: "center",
    render: r => stockStatusBadge(r.stock_status) },
  { key: "action", label: "", align: "center", width: 40,
    render: _r => (
      <IconButton size="small" sx={{ color: RED, p: 0.5, borderRadius: "6px", "&:hover": { bgcolor: "rgba(211,47,47,0.08)" } }}>
        <ShoppingCartCheckoutIcon sx={{ fontSize: 16 }} />
      </IconButton>
    ) },
];

// ── Main Dashboard ────────────────────────────────────────────
export default function DashboardLayout() {
  const { branchId, zoduId, businessType } = useTenantContext();
  const statsQuery   = useStats(zoduId, branchId);
  const salesQuery   = useSales(zoduId, branchId);
  const topQuery     = useTopItems(zoduId, branchId);
  const remindQuery  = useReminders(zoduId, branchId);
  const alertQuery   = useInventoryAlerts(zoduId, branchId);
    const [invoiceDialog, setInvoiceDialog] = useState<string | null>(null);


  const stats  = statsQuery.data;
  const sales  = flatPages(salesQuery)   as SaleRow[];
  const tops   = flatPages(topQuery)     as TopItem[];
  const remind = flatPages(remindQuery)  as ReminderRow[];
  const alerts = flatPages(alertQuery)   as AlertItem[];

  // Stable callbacks so MiniTable doesn't re-subscribe observers on every render
  const loadMoreSales   = useCallback(() => salesQuery.fetchNextPage(),  [salesQuery]);
  const loadMoreTops    = useCallback(() => topQuery.fetchNextPage(),    [topQuery]);
  const loadMoreRemind  = useCallback(() => remindQuery.fetchNextPage(), [remindQuery]);
  const loadMoreAlerts  = useCallback(() => alertQuery.fetchNextPage(),  [alertQuery]);


  const handleInvoice = (saleId: string) => setInvoiceDialog(saleId);

const salesCols: ColDef<SaleRow>[] = [
  { key: "date",     label: "Date",       minWidth: 110,
    render: r => <Typography sx={{ fontSize: 12, color: "#64748B" }}>{r.sale_date} {r.sale_time}</Typography> },
  { key: "inv",      label: "Invoice ID", minWidth: 100,
    render: r => <Typography onClick={() => handleInvoice(r.sale_id)} sx={{ fontSize: 12, fontWeight: 600, color: "#1976d2",cursor:"pointer" }}>{r.sale_id}</Typography> },
  { key: "customer", label: "Customer",
    render: r => <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{r.customer_name}</Typography> },
  { key: "amount",   label: "Amount", align: "right",
    render: r => <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1976d2" }}>{fmt(+r.total_amount)}</Typography> },
  { key: "status",   label: "Status", align: "center",
    render: r => paymentStatusBadge(r.payment_status) },
];

console.log("Business Type in Dashboard:", businessType);

  const summaryCards = [
    {
      label: "Total Sales",
      value: stats ? fmt(stats.total_sales) : undefined,
      icon: <PaymentsIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "Total Invoices",
      value: stats ? String(stats.total_invoices) : undefined,
      icon: <DescriptionIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "Low Stock Items",
      value: stats ? String(stats.total_alerts) : undefined,
      icon: <Inventory2Icon sx={{ fontSize: 18 }} />,
    },
    {
      label: "Today's Revenue",
      value: stats ? fmt(stats.todays_revenue) : undefined,
      icon: <InsightsIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "Due Receivable",
      value: stats?.total_due_to_receivable_amount != null
        ? fmt(stats.total_due_to_receivable_amount)
        : undefined,
      icon:     <AccountBalanceWalletIcon sx={{ fontSize: 18 }} />,
      iconBg:   "rgba(22,163,74,0.08)",
      iconColor: "#16A34A",
    },
    {
      label: "Due Payable",
      value: stats?.total_due_to_payable_amount != null
        ? fmt(stats.total_due_to_payable_amount)
        : undefined,
      icon:     <MoneyOffIcon sx={{ fontSize: 18 }} />,
      iconBg:   "rgba(220,38,38,0.08)",
      iconColor: "#DC2626",
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'); *, *::before, *::after { font-family: 'Inter', sans-serif !important; box-sizing: border-box; }`}</style>

      <Box sx={{ bgcolor: "#F8FAFC", height: "100%", minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Box component="main" sx={{
          flex: 1, minHeight: 0, px: { xs: 1.5, md: 2 }, py: { xs: 1.5, md: 2 },
          width: "100%", overflow: "hidden", display: "flex", flexDirection: "column", gap: 2,
        }}>

          {/* ── Summary Cards ── */}
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "stretch" }}>
            {summaryCards.map(c => (
              <SummaryCard key={c.label} loading={statsQuery.isLoading} {...c} />
            ))}
          </Box>

          {/* ── Two-column layout ── */}
          <Box sx={{ flex: 1, minHeight: 0, display: "flex", gap: 2, alignItems: "stretch" }}>

            {/* LEFT — 60% */}
            <Box sx={{ flex: "0 0 60%", minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column", gap: 2 }}>

              <SectionCard title="Recent Sales Activity" sx={{ flex: 1, minHeight: 0 }}>
                {salesQuery.isLoading
                  ? <SkeletonTable cols={5} />
                  : <MiniTable
                      columns={salesCols}
                      rows={sales}
                      rowKey={r => r.sale_uuid}
                      onLoadMore={loadMoreSales}
                      isFetchingNextPage={salesQuery.isFetchingNextPage}
                      hasNextPage={salesQuery.hasNextPage}
                    />
                }
              </SectionCard>

              <SectionCard
                title="Payment Reminders"
                sx={{ flex: 1, minHeight: 0 }}
              >
                {remindQuery.isLoading
                  ? <SkeletonTable cols={5} />
                  : <MiniTable
                      columns={reminderCols}
                      rows={remind}
                      rowKey={r => `${r.ref_type}-${r.ref_id}`}
                      onLoadMore={loadMoreRemind}
                      isFetchingNextPage={remindQuery.isFetchingNextPage}
                      hasNextPage={remindQuery.hasNextPage}
                    />
                }
              </SectionCard>

            </Box>

            {/* RIGHT — 40% */}
            <Box sx={{ flex: "0 0 39%", minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column", gap: 2 }}>

              <SectionCard
                title={<Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}><TrendingUpIcon sx={{ fontSize: 16, color: RED }} />Top Selling Items</Box>}
                sx={{ flex: 1, minHeight: 0 }}
              >
                {topQuery.isLoading
                  ? <SkeletonTable cols={3} />
                  : <MiniTable
                      columns={topItemCols}
                      rows={tops}
                      rowKey={r => r.item_id}
                      onLoadMore={loadMoreTops}
                      isFetchingNextPage={topQuery.isFetchingNextPage}
                      hasNextPage={topQuery.hasNextPage}
                    />
                }
              </SectionCard>

              <SectionCard
                title={<Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}><WarningAmberIcon sx={{ fontSize: 16, color: "#D97706" }} />Inventory Alerts</Box>}
                action={
                  <Box sx={{ px: 1.25, py: 0.3, borderRadius: "5px", bgcolor: "rgba(211,47,47,0.08)", color: RED, fontSize: "11px", fontWeight: 700 }}>
                    {alertQuery.isLoading ? <Skeleton width={40} /> : `${alerts.length} LOW`}
                  </Box>
                }
                sx={{ flex: 1, minHeight: 0 }}
              >
                {alertQuery.isLoading
                  ? <SkeletonTable cols={4} />
                  : <MiniTable
                      columns={alertCols}
                      rows={alerts}
                      rowKey={r => r.item_uuid}
                      onLoadMore={loadMoreAlerts}
                      isFetchingNextPage={alertQuery.isFetchingNextPage}
                      hasNextPage={alertQuery.hasNextPage}
                    />
                }
              </SectionCard>

            </Box>
          </Box>
        </Box>
      </Box>
          {invoiceDialog && (
        <InvoiceDetailsModal saleId={invoiceDialog} onClose={() => setInvoiceDialog(null)} />
      )}
    </ThemeProvider>
  );
}
