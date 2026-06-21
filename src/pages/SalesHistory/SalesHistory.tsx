/**
 * SalesHistoryPage.tsx
 */
import React, { useRef, useCallback, useEffect, useState } from "react";
import Lottie from "lottie-react";
import loadingAnimation from "@assets/loading.json";
import { useInfiniteQuery, useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Box, Typography, Button, Stack,
  Avatar, TextField, InputAdornment, Select, MenuItem,
  FormControl, IconButton, Tooltip, alpha, Chip, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
  Grid,
} from "@mui/material";
import {
  Search as SearchIcon, Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon, Circle,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  fetchHistory, fetchSummary, fetchRestaurantHistory, fetchRestaurantSummary,
  salesQueryKeys, deleteSale,
  type Sale, type Filters,
} from "./useSaleshistory";
import { useTenantContext } from "@store/tenantContext";

import InvoiceDetailDialog from "./Invoicedetaildialog";
import MarkPaymentDialog   from "./MarkPaymentDialog";
import SalesReturnDialog   from "./Salesreturndialog";
import DataTable           from "@utils/DataTable";
import StatCard            from "@components/StatCard";
import { useNavigate }     from "react-router-dom";

// ─── Formatter ────────────────────────────────────────────────
const INR = (v: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(Math.round(Number(v)));

// ─── Theme ────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    mode: "light",
    primary:    { main: "#E53935" },
    success:    { main: "#2E7D32" },
    warning:    { main: "#F57C00" },
    error:      { main: "#C62828" },
    background: { default: "#F5F6FA", paper: "#FFFFFF" },
    text:       { primary: "#1A1A2E", secondary: "#6B7280" },
  },
  typography: {
    h5:         { fontWeight: 700, letterSpacing: "-0.5px" },
    h6:         { fontWeight: 600 },
    subtitle2:  { fontWeight: 600, fontSize: "0.78rem", letterSpacing: "0.04em", textTransform: "uppercase" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard:      { styleOverrides: { root: { boxShadow: "0 1px 3px rgba(0,0,0,0.06)", borderRadius: 14 } } },
    MuiButton:    { styleOverrides: { root: { textTransform: "none", fontWeight: 700, borderRadius: 8 } } },
    MuiTextField: { styleOverrides: { root: { "& .MuiOutlinedInput-root": { borderRadius: 8 } } } },
  },
});

// ─── Status helpers ───────────────────────────────────────────
const BODY_FONT_SIZE = "13px";
const TABLE_TEXT_COLOR = "#374151";

/**
 * Map every possible backend payment_status to a UI label.
 * ✅ "returned" and "partial_return" were unhandled → fell through to "Unpaid"
 */
type UIStatus = "Paid" | "Partial" | "Unpaid" | "Returned" | "Partial Return" | "Quotation";

const STATUS_CONFIG: Record<
  UIStatus,
  { color: string; bg: string; dot: string }
> = {
  "Paid":           { color: "#2E7D32", bg: "#E8F5E9", dot: "#2E7D32" },
  "Partial":        { color: "#F57C00", bg: "#FFF3E0", dot: "#F57C00" },
  "Unpaid":         { color: "#C62828", bg: "#FFEBEE", dot: "#C62828" },
  "Returned":       { color: "#6B21A8", bg: "#F3E8FF", dot: "#7C3AED" },
  "Partial Return": { color: "#0369A1", bg: "#E0F2FE", dot: "#0284C7" },
  "Quotation":      { color: "#475569", bg: "#F1F5F9", dot: "#64748B" },
};

function mapStatus(s: PaymentStatus): UIStatus {
  switch (s) {
    case "fully_paid":     return "Paid";
    case "partially_paid": return "Partial";
    case "returned":       return "Returned";        // ✅ was falling through to "Unpaid"
    case "partial_return": return "Partial Return";  // ✅ was falling through to "Unpaid"
    default:               return "Unpaid";
  }
}

function isFullyReturnedSale(sale: Sale): boolean {
  const totalAmount = Number(sale.total_amount);
  const totalReturned = Number(sale.total_returned ?? 0);

  return totalAmount > 0 && totalReturned >= totalAmount - 0.01;
}

function getPosEditUrl(sale: Sale): string {
  const params = new URLSearchParams({ saleId: sale.sale_id });
  if (sale.sale_type) params.set("saleType", sale.sale_type);
  return `/pos?${params.toString()}`;
}

function isQuotationSale(sale: Sale): boolean {
  return sale.sale_type?.toLowerCase() === "q";
}

function StatusBadge({ status }: { status: UIStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <Typography
      variant="body2"
      sx={{
        display: "inline-flex", alignItems: "center", gap: 0.5,
        color: cfg.color, fontWeight: 600, fontSize: BODY_FONT_SIZE,
      }}
    >
      <Circle sx={{ fontSize: 8 }} />
      {status}
    </Typography>
  );
}

/** Small chip shown in the row when a return exists */
function ReturnChip({ count, amount }: { count: number; amount: string }) {
  return (
    <Chip
      label={`${count} return${count > 1 ? "s" : ""} · ₹${Number(amount).toLocaleString("en-IN")}`}
      size="small"
      sx={{
        mt: 0.4, height: 18, fontSize: "0.65rem", fontWeight: 600,
        bgcolor: "#F3E8FF", color: "#6B21A8", borderRadius: "4px",
      }}
    />
  );
}

// ─── Infinite scroll sentinel ─────────────────────────────────
function useInfiniteScroll(
  hasNextPage:        boolean | undefined,
  fetchNextPage:      () => void,
  isFetchingNextPage: boolean,
  scrollContainerRef: React.RefObject<HTMLElement | null>,
): React.RefObject<HTMLTableRowElement> {
  const sentinelRef  = useRef<HTMLTableRowElement | null>(null);
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const root     = scrollContainerRef.current ?? null;
    const observer = new IntersectionObserver(handleObserver, { root, threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver, scrollContainerRef]);
  return sentinelRef as React.RefObject<HTMLTableRowElement>;
}

// ─── Root export ──────────────────────────────────────────────
const queryClient = new QueryClient();

// export default function SalesHistoryPage() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <ThemeProvider theme={theme}>
//         <SalesHistoryScreen />
//       </ThemeProvider>
//     </QueryClientProvider>
//   );
// }

// ─── Main screen ──────────────────────────────────────────────
export default function SalesHistoryPage() {
  const navigate = useNavigate();

  const { branchId, businessType } = useTenantContext();
  const isRestaurant = businessType?.toLowerCase() === "restaurant";
  const [activeTab, setActiveTab] = useState<"orders" | "cancelled">("orders");

  const [draftFilters,   setDraftFilters]   = useState<Filters>({ search: "", payment_status: "", from_date: "", to_date: "", order_type: "", cancelled_order: false });
  const [appliedFilters, setAppliedFilters] = useState<Filters>({ search: "", payment_status: "", from_date: "", to_date: "", order_type: "", cancelled_order: false });

  const [invoiceDialog, setInvoiceDialog] = useState<string | null>(null);
  const [paymentDialog, setPaymentDialog] = useState<Sale   | null>(null);
  const [returnDialog,  setReturnDialog]  = useState<Sale   | null>(null);
  const [deleteDialog,  setDeleteDialog]  = useState<Sale   | null>(null);
  const [isDeleting,    setIsDeleting]    = useState(false);

  const {
    data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch,
  } = useInfiniteQuery({
    queryKey:         salesQueryKeys.history(branchId ?? '', appliedFilters),
    queryFn:          ({ pageParam = 1 }) => isRestaurant
      ? fetchRestaurantHistory(pageParam as number, appliedFilters)
      : fetchHistory(pageParam as number, appliedFilters),
    initialPageParam: 1,
    getNextPageParam: (last) => last.page < last.total_pages ? last.page + 1 : undefined,
  });

  const { data: retailSummary } = useQuery({
    queryKey: [...salesQueryKeys.summary(branchId ?? '', appliedFilters), "retail"],
    queryFn:  () => fetchSummary(appliedFilters),
    enabled:  !isRestaurant,
  });

  const { data: restaurantSummary } = useQuery({
    queryKey: [...salesQueryKeys.summary(branchId ?? '', appliedFilters), "restaurant"],
    queryFn:  () => fetchRestaurantSummary(appliedFilters),
    enabled:  isRestaurant,
  });

  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef       = useInfiniteScroll(hasNextPage, fetchNextPage, isFetchingNextPage, tableContainerRef);
  const allItems       = data?.pages.flatMap(p => p.data) ?? [];
  const isCancelledTab = isRestaurant && activeTab === "cancelled";

  // ── Column definitions ────────────────────────────────────────
  const columns = [
    {
      key: "sale_id",
      label: isRestaurant ? "Order ID" : "Invoice ID",
      width: 130,
      render: (sale: Sale) => (
        <Typography
          fontWeight={600} color="#1976d2"
          sx={{ cursor: "pointer", fontSize: BODY_FONT_SIZE }}
          onClick={() => setInvoiceDialog(isRestaurant ? sale.api_order_id! : sale.sale_id)}
        >
          {isRestaurant ? (sale.public_order_no ?? sale.sale_id) : sale.sale_id}
        </Typography>
      ),
    },
    ...(!isRestaurant ? [{
      key: "customer",
      label: "Customer",
      minWidth: 220,
      render: (sale: Sale) => {
        const name = sale.cust_name || sale.cpy_name || "Walk-In";
        return (
          <Stack direction="row" alignItems="center" gap={1}>
            <Avatar sx={{
              width: 24, height: 24, fontSize: "0.65rem",
              bgcolor: alpha("#10B981", 0.15), color: "#10B981", fontWeight: 700,
            }}>
              {name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography fontWeight={600} sx={{ fontSize: BODY_FONT_SIZE, color: TABLE_TEXT_COLOR }}>{name}</Typography>
              {sale.customer_mobile && (
                <Typography sx={{ fontSize: BODY_FONT_SIZE, color: TABLE_TEXT_COLOR }}>
                  {sale.customer_mobile}
                </Typography>
              )}
            </Box>
          </Stack>
        );
      },
    }] : []),
    {
      key: "created at",
      label: "Date",
      width: 170,
      render: (sale: Sale) => (
        <Typography variant="body2" sx={{ fontSize: "12px", color: TABLE_TEXT_COLOR }}>
          {sale.created_at_fmt}
        </Typography>
      ),
    },
    {
      key: "total",
      label: "Total",
      align: "right" as const,
      width: 170,
      render: (sale: Sale) => {
        if (isRestaurant) {
          return (
            <Box textAlign="right">
              <Typography variant="body2" fontWeight={700} sx={{ fontSize: BODY_FONT_SIZE, color: "#1976d2" }}>
                {INR(Number(sale.total_amt ?? 0))}
              </Typography>
            </Box>
          );
        }
        const fullyReturned = isFullyReturnedSale(sale);
        const isQuotation = isQuotationSale(sale);
        const balance       = Number(sale.balance_amount);
        const totalReturned = Number(sale.total_returned ?? 0);
        const totalAmount   = Number(sale.total_amount);
        const adjustedTotal = totalAmount - totalReturned;
        return (
          <Box textAlign="right">
            <Typography variant="body2" fontWeight={700} sx={{ fontSize: BODY_FONT_SIZE, color: "#1976d2" }}>
              {INR(adjustedTotal)}
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 0.5 }}>
              {balance > 0 && !fullyReturned && !isQuotation && (
                <Typography variant="caption" color="error.main" sx={{ fontSize: "11px" }}>
                  Balance: {INR(balance)}
                </Typography>
              )}
              {totalReturned > 0 && (
                <Typography variant="caption" sx={{ fontSize: "11px", color: "#7C3AED" }}>
                  Returned: {INR(totalReturned)}
                </Typography>
              )}
            </Box>
          </Box>
        );
      },
    },
    {
      key: "payment",
      label: "Payment",
      minWidth: 210,
      render: (sale: Sale) => {
        if (isRestaurant) {
          return (
            <Typography variant="body2" sx={{ fontSize: BODY_FONT_SIZE, color: TABLE_TEXT_COLOR, fontWeight: 600 }}>
              {sale.payment_type ?? "—"}
            </Typography>
          );
        }
        const fullyReturned = isFullyReturnedSale(sale);
        const isQuotation = isQuotationSale(sale);
        const status = fullyReturned ? "Returned" : isQuotation ? "Quotation" : mapStatus(sale.payment_status);
        const isReturned = status === "Returned" || status === "Partial Return";
        const returnCount = Number(sale.return_count ?? 0);
        return (
          <Stack direction="column" alignItems="flex-start" gap={0.3}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 200 }}>
              <Box sx={{ minWidth: 70 }}>
                <StatusBadge status={status} />
              </Box>
              <Box sx={{ width: 110 }}>
                {status !== "Paid" && !isReturned && !isQuotation && (
                  <Button
                    size="small" variant="contained" color="primary" disableElevation
                    onClick={() => setPaymentDialog(sale)}
                    sx={{ fontSize: "0.65rem", py: 0.4, px: 1.5, height: 24, width: "100%", whiteSpace: "nowrap" }}
                  >
                    Mark as Paid
                  </Button>
                )}
              </Box>
            </Stack>
            {returnCount > 0 && sale.total_returned && (
              <ReturnChip count={returnCount} amount={sale.total_returned} />
            )}
          </Stack>
        );
      },
    },
    ...(isRestaurant ? [{
      key: "order_type",
      label: "Order Type",
      width: 130,
      render: (sale: Sale) => {
        const type = sale.order_type ?? "";
        const styleMap: Record<string, { color: string; bg: string }> = {
          "Dine-In":  { color: "#166534", bg: "#DCFCE7" },
          "Takeaway": { color: "#155E75", bg: "#CFFAFE" },
          "Delivery": { color: "#92400E", bg: "#FEF3C7" },
        };
        const style = styleMap[type];
        if (!type || !style) {
          return (
            <Typography variant="body2" sx={{ fontSize: BODY_FONT_SIZE, color: TABLE_TEXT_COLOR }}>—</Typography>
          );
        }
        return (
          <Box
            sx={{
              display: "inline-block",
              px: 1.2, py: 0.3,
              borderRadius: "6px",
              bgcolor: style.bg,
              color: style.color,
              fontWeight: 600,
              fontSize: "12px",
            }}
          >
            {type}
          </Box>
        );
      },
    }] : []),
    {
      key: "actions",
      label: "Actions",
      align: "right" as const,
      width: 110,
      render: (sale: Sale) => {
        const fullyReturned = isFullyReturnedSale(sale);
        const isQuotation = isQuotationSale(sale);
        const status = fullyReturned ? "Returned" : mapStatus(sale.payment_status);
        const isReturned = status === "Returned";
        return (
          <Stack direction="row" justifyContent="flex-end" gap={0.3}>
            {!isQuotation && !isRestaurant && (
              <Tooltip title={isReturned ? "Fully returned" : "Sales Return"}>
                <span>
                  <IconButton
                    size="small"
                    disabled={isReturned}
                    onClick={() => setReturnDialog(sale)}
                    sx={{
                      color: isReturned ? "text.disabled" : "text.secondary",
                      borderRadius: 1.5,
                      "&:hover": { color: "primary.main", bgcolor: alpha("#E53935", 0.06) },
                    }}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4 2 4-2 4 2z" />
                    </svg>
                  </IconButton>
                </span>
              </Tooltip>
            )}
            {!isRestaurant && (
            <Tooltip title="Edit Invoice">
              <IconButton
                size="small"
                onClick={() => navigate(getPosEditUrl(sale))}
                sx={{ color: "text.secondary", borderRadius: 1.5, "&:hover": { color: "primary.main", bgcolor: alpha("#E53935", 0.06) } }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </IconButton>
            </Tooltip>
            )}
            <Tooltip title="Delete Invoice">
              <IconButton
                size="small"
                onClick={() => setDeleteDialog(sale)}
                sx={{ color: "text.secondary", borderRadius: 1.5, "&:hover": { color: "#C62828", bgcolor: alpha("#C62828", 0.06) } }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </IconButton>
            </Tooltip>
          </Stack>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Lottie animationData={loadingAnimation} loop style={{ width: 120, height: 120 }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        p: { xs: 2, sm: 1 },
        gap: 1,
      }}
    >

      {/* Summary cards */}
      <Grid container spacing={2}>
        {isRestaurant ? (
          <>
            <Grid size="auto">
              <StatCard
                label="Total Orders"
                value={restaurantSummary?.total_orders ?? 0}
                valuePrefix=""
                icon={<ReceiptIcon color="primary" />}
                iconBgColor="#FFEBEE"
              />
            </Grid>
            <Grid size="auto">
              <StatCard
                label="Total Amount"
                value={INR(restaurantSummary?.subtotal ?? 0)}
                valuePrefix=""
                icon={<TrendingUpIcon sx={{ color: "#F57C00" }} />}
                iconBgColor="#FFF3E0"
              />
            </Grid>
            <Grid size="auto">
              <StatCard
                label="Total Tax"
                value={INR(restaurantSummary?.total_tax ?? 0)}
                valuePrefix=""
                icon={<ReceiptIcon sx={{ color: "#475569" }} />}
                iconBgColor="#F1F5F9"
              />
            </Grid>
            <Grid size="auto">
              <StatCard
                label="Total Discount"
                value={INR(restaurantSummary?.total_discount ?? 0)}
                valuePrefix=""
                icon={<TrendingUpIcon sx={{ color: "#F57C00" }} />}
                iconBgColor="#FFF3E0"
              />
            </Grid>
            <Grid size="auto">
              <StatCard
                label="Net Revenue"
                value={INR(restaurantSummary?.total_revenue ?? 0)}
                valuePrefix=""
                icon={<TrendingUpIcon color="success" />}
                iconBgColor="#E8F5E9"
              />
            </Grid>
          </>
        ) : (
          <>
            <Grid size="auto">
              <StatCard
                label="Total Transactions"
                value={retailSummary?.total_transactions ?? 0}
                valuePrefix=""
                icon={<ReceiptIcon color="primary" />}
                iconBgColor="#FFEBEE"
              />
            </Grid>
            <Grid size="auto">
              <StatCard
                label="Net Revenue"
                value={INR(retailSummary?.net_revenue ?? 0)}
                valuePrefix=""
                icon={<TrendingUpIcon color="success" />}
                iconBgColor="#E8F5E9"
              />
            </Grid>
            <Grid size="auto">
              <StatCard
                label="Total Quotations"
                value={retailSummary?.total_quotations ?? 0}
                valuePrefix=""
                icon={<ReceiptIcon sx={{ color: "#475569" }} />}
                iconBgColor="#F1F5F9"
              />
            </Grid>
          </>
        )}
      </Grid>

      {/* Tabs — restaurant only */}
      {isRestaurant && (
        <Tabs
          value={activeTab}
          onChange={(_, v) => {
            setActiveTab(v);
            const isCancelled = v === "cancelled";
            const reset: Filters = { search: "", payment_status: "", from_date: "", to_date: "", order_type: "", cancelled_order: isCancelled };
            setDraftFilters(reset);
            setAppliedFilters(reset);
          }}
          sx={{
            minHeight: 36,
            "& .MuiTabs-indicator": { backgroundColor: "#E53935" },
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: 13, minHeight: 36, py: 0.5 },
            "& .Mui-selected": { color: "#E53935" },
          }}
        >
          <Tab value="orders" label="Orders" />
          <Tab value="cancelled" label="Cancelled Orders" />
        </Tabs>
      )}

      {/* Filter bar */}
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap", mb: 1 }}>
        <TextField
          placeholder={isRestaurant ? "Order ID" : "Invoice ID or Customer name or mobile"}
          size="small"
          value={draftFilters.search}
          onChange={e => setDraftFilters(f => ({ ...f, search: e.target.value }))}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: "text.disabled" }} />
              </InputAdornment>
            ),
            sx: { borderRadius: 0.5, fontSize: 13 },
          }}
          sx={{ flex: 1, minWidth: 240, backgroundColor: "#fff" }}
        />

        <TextField
          type="date"
          size="small"
          value={draftFilters.from_date}
          onChange={e => setDraftFilters(f => ({ ...f, from_date: e.target.value }))}
          inputProps={{ placeholder: "From Date" }}
          InputProps={{ sx: { borderRadius: 0.5, fontSize: 13 } }}
          sx={{ minWidth: 160, backgroundColor: "#fff" }}
        />

        <TextField
          type="date"
          size="small"
          value={draftFilters.to_date}
          onChange={e => setDraftFilters(f => ({ ...f, to_date: e.target.value }))}
          InputProps={{ sx: { borderRadius: 0.5, fontSize: 13 } }}
          sx={{ minWidth: 160, backgroundColor: "#fff" }}
        />

        <FormControl size="small" sx={{ minWidth: 160 }}>
          {isRestaurant ? (
            <Select
              value={draftFilters.order_type ?? ""}
              displayEmpty
              renderValue={(selected) =>
                selected
                  ? selected
                  : <Box component="span" sx={{ color: "text.disabled", fontSize: 13 }}>All Types</Box>
              }
              onChange={e => setDraftFilters(f => ({ ...f, order_type: e.target.value }))}
              sx={{ borderRadius: 0.5, fontSize: 13, backgroundColor: "#fff" }}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="Dine-In">Dine-In</MenuItem>
              <MenuItem value="Delivery">Delivery</MenuItem>
              <MenuItem value="Takeaway">Takeaway</MenuItem>
            </Select>
          ) : (
            <Select
              value={draftFilters.payment_status}
              displayEmpty
              renderValue={(selected) => {
                if (!selected) return <Box component="span" sx={{ color: "text.disabled", fontSize: 13 }}>All Status</Box>;
                if (selected === "fully_paid")     return "Paid";
                if (selected === "partially_paid") return "Partial";
                if (selected === "unpaid")         return "Unpaid";
                if (selected === "returned")       return "Returned";
                if (selected === "partial_return") return "Partial Return";
                return selected;
              }}
              onChange={e => setDraftFilters(f => ({ ...f, payment_status: e.target.value }))}
              sx={{ borderRadius: 0.5, fontSize: 13, backgroundColor: "#fff" }}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="fully_paid">Paid</MenuItem>
              <MenuItem value="partially_paid">Partial</MenuItem>
              <MenuItem value="unpaid">Unpaid</MenuItem>
              <MenuItem value="returned">Returned</MenuItem>
              <MenuItem value="partial_return">Partial Return</MenuItem>
            </Select>
          )}
        </FormControl>

        <Button
          variant="contained" color="primary" disableElevation size="medium"
          sx={{ px: 3.5, height: 40, borderRadius: 0.5, textTransform: "none", fontWeight: 700, fontSize: 13 }}
          onClick={() => setAppliedFilters({ ...draftFilters })}
        >
          Apply
        </Button>
        <Button
          variant="outlined" color="inherit" size="medium"
          sx={{ px: 2, height: 40, borderRadius: 0.5, textTransform: "none", fontWeight: 700, fontSize: 13, borderColor: "#D1D5DB", color: "#6B7280", "&:hover": { borderColor: "#9CA3AF", bgcolor: "#F9FAFB" } }}
          onClick={() => {
            const empty = { search: "", payment_status: "", from_date: "", to_date: "", order_type: "", cancelled_order: activeTab === "cancelled" };
            setDraftFilters(empty);
            setAppliedFilters(empty);
          }}
        >
          Reset
        </Button>
      </Box>

      {/* Transactions table */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataTable<Sale>
          columns={isCancelledTab ? columns.filter(c => c.key !== "actions") : columns}
          rows={allItems}
          rowKey={(sale) => sale.api_order_id ?? sale.sale_id}
          isLoading={isLoading}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          loadMoreRef={loadMoreRef}
          tableContainerRef={tableContainerRef}
          maxHeight="100%"
          emptyMessage="No sales transactions found."
        />
      </Box>

      {/* Dialogs */}
      {invoiceDialog && (
        <InvoiceDetailDialog saleId={invoiceDialog} onClose={() => setInvoiceDialog(null)} isRestaurant={isRestaurant} />
      )}

      {paymentDialog && (
        <MarkPaymentDialog
          sale={paymentDialog}
          onClose={() => setPaymentDialog(null)}
          onSuccess={() => refetch()}
        />
      )}

      {/* ✅ Pass onSuccess so the history list immediately reflects the new status */}
      {returnDialog && (
        <SalesReturnDialog
          sale={returnDialog}
          onClose={() => setReturnDialog(null)}
          onSuccess={() => refetch()}
        />
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteDialog} onClose={() => !isDeleting && setDeleteDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete {isRestaurant ? "Order" : "Invoice"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Typography>
            Are you sure you want to delete {isRestaurant ? "order" : "invoice"}{" "}
            <strong>
              {isRestaurant
                ? (deleteDialog?.public_order_no ?? deleteDialog?.api_order_id)
                : deleteDialog?.sale_id}
            </strong>?
            This action cannot be undone.
          </Typography>
          {isRestaurant && deleteDialog?.items && deleteDialog.items.length > 0 && (
            <Box
              sx={{
                bgcolor: "#FFF8E1",
                border: "1px solid #FFD54F",
                borderRadius: 1.5,
                px: 2,
                py: 1.5,
                display: "flex",
                gap: 1,
                alignItems: "flex-start",
              }}
            >
              <Box sx={{ fontSize: 18, lineHeight: 1.4 }}>📦</Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#7B4F00" }}>
                  Stock will be restored
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#7B4F00", mt: 0.3 }}>
                  The {deleteDialog.items.length} item{deleteDialog.items.length > 1 ? "s" : ""} from this
                  order will be added back to your inventory once deleted.
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="outlined" color="inherit"
            disabled={isDeleting}
            onClick={() => setDeleteDialog(null)}
          >
            Cancel
          </Button>
          <Button
            variant="contained" color="error" disableElevation
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={14} color="inherit" /> : undefined}
            onClick={async () => {
              if (!deleteDialog) return;
              setIsDeleting(true);
              try {
                const deleteId = isRestaurant
                  ? (deleteDialog.api_order_id ?? deleteDialog.sale_id)
                  : deleteDialog.sale_id;
                await deleteSale(deleteId, isRestaurant, isRestaurant ? deleteDialog.items : undefined);
                setDeleteDialog(null);
                refetch();
              } finally {
                setIsDeleting(false);
              }
            }}
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
