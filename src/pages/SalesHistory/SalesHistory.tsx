/**
 * SalesHistoryPage.tsx
 */
import React, { useRef, useCallback, useEffect, useState } from "react";
import { useInfiniteQuery, useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Box, Typography, Button, Stack,
  Avatar, TextField, InputAdornment, Select, MenuItem,
  FormControl, IconButton, Tooltip, alpha, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon, Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon, Circle,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  fetchHistory, fetchSummary, salesQueryKeys, deleteSale,
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
    MuiButton:    { styleOverrides: { root: { textTransform: "none", fontWeight: 600, borderRadius: 8 } } },
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

  if (sale.sale_type) {
    params.set("saleType", sale.sale_type);
  }

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

  const { branchId } = useTenantContext();
  const [draftFilters,   setDraftFilters]   = useState<Filters>({ search: "", payment_status: "", from_date: "", to_date: "" });
  const [appliedFilters, setAppliedFilters] = useState<Filters>({ search: "", payment_status: "", from_date: "", to_date: "" });

  const [invoiceDialog, setInvoiceDialog] = useState<string | null>(null);
  const [paymentDialog, setPaymentDialog] = useState<Sale   | null>(null);
  const [returnDialog,  setReturnDialog]  = useState<Sale   | null>(null);
  const [deleteDialog,  setDeleteDialog]  = useState<Sale   | null>(null);
  const [isDeleting,    setIsDeleting]    = useState(false);

  const {
    data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch,
  } = useInfiniteQuery({
    queryKey:         salesQueryKeys.history(branchId ?? '', appliedFilters),
    queryFn:          ({ pageParam = 1 }) => fetchHistory(pageParam as number, appliedFilters),
    initialPageParam: 1,
    getNextPageParam: (last) => last.page < last.total_pages ? last.page + 1 : undefined,
  });

  const { data: summary } = useQuery({
    queryKey: salesQueryKeys.summary(branchId ?? '', appliedFilters),
    queryFn:  () => fetchSummary(appliedFilters),
  });

  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef       = useInfiniteScroll(hasNextPage, fetchNextPage, isFetchingNextPage, tableContainerRef);
  const allItems          = data?.pages.flatMap(p => p.data) ?? [];

  // ── Column definitions ────────────────────────────────────────
  const columns = [
    {
      key: "sale_id",
      label: "Invoice ID",
      width: 130,
      render: (sale: Sale) => (
        <Typography
          fontWeight={600} color="#1976d2"
          sx={{ cursor: "pointer", fontSize: BODY_FONT_SIZE }}
          onClick={() => setInvoiceDialog(sale.sale_id)}
        >
          {sale.sale_id}
        </Typography>
      ),
    },
    {
      key: "date",
      label: "Date",
      width: 170,
      render: (sale: Sale) => (
        <Typography variant="body2" sx={{ fontSize: BODY_FONT_SIZE, color: TABLE_TEXT_COLOR }}>
          {sale.sale_date_fmt}
        </Typography>
      ),
    },
    {
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
              <Typography  fontWeight={600} sx={{ fontSize: BODY_FONT_SIZE, color: TABLE_TEXT_COLOR }}>{name}</Typography>
              {sale.customer_mobile && (
                <Typography sx={{ fontSize: BODY_FONT_SIZE, color: TABLE_TEXT_COLOR }}>
                  {sale.customer_mobile}
                </Typography>
              )}
            </Box>
          </Stack>
        );
      },
    },
    {
      key: "total",
      label: "Total",
      align: "right" as const,
      width: 170,
      render: (sale: Sale) => {
        const fullyReturned = isFullyReturnedSale(sale);
        const isQuotation = isQuotationSale(sale);
        const balance       = Number(sale.balance_amount);
        const totalReturned = Number(sale.total_returned ?? 0);
        const totalAmount   = Number(sale.total_amount);
        const adjustedTotal = totalAmount - totalReturned;
        
        return (
          <Box textAlign="right">
            {/* {totalReturned > 0 && (
              <Typography variant="caption" sx={{ fontSize: "11px", color: "#94A3B8", textDecoration: "line-through" }}>
                {INR(totalAmount)}
              </Typography>
            )} */}
            <Typography variant="body2" fontWeight={700} sx={{ fontSize: BODY_FONT_SIZE, color: TABLE_TEXT_COLOR }}>
              {INR(adjustedTotal)}
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 0.5 }}>
              {balance > 0 && !fullyReturned && !isQuotation && (
                <Typography variant="caption" color="error.main" sx={{ fontSize: "11px" }}>
                  Balance: {INR(balance)}
                </Typography>
              )}
              {/* ✅ Show how much has been returned — was never shown */}
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
        const fullyReturned = isFullyReturnedSale(sale);
        const isQuotation = isQuotationSale(sale);
        const status = fullyReturned ? "Returned":isQuotation? "Quotation" : mapStatus(sale.payment_status);
        const isReturned = status === "Returned" || status === "Partial Return";
        const returnCount = Number(sale.return_count ?? 0);
        return (
          <Stack direction="column" alignItems="flex-start" gap={0.3}>
            <Stack direction="row" alignItems="center" gap={1}>
              <StatusBadge status={status} />
              {/* ✅ Don't show "Mark as Paid" for returned/fully-returned sales */}
              {status !== "Paid" && !isReturned && !isQuotation && (
                <Button
                  size="small" variant="contained" color="primary" disableElevation
                  onClick={() => setPaymentDialog(sale)}
                  sx={{
                    fontSize: "0.65rem", py: 0.4, px: 1.5,
                    height: 24, ml: 1, minWidth: 0,
                    whiteSpace: "nowrap", borderRadius: 0.5,
                  }}
                >
                  Mark as Paid
                </Button>
              )}
            </Stack>
            {/* ✅ Return summary chip */}
            {returnCount > 0 && sale.total_returned && (
              <ReturnChip count={returnCount} amount={sale.total_returned} />
            )}
          </Stack>
        );
      },
    },
    {
      key:"created at",
      label:"Created At",
      width:170,
      render:(sale:Sale)=>(
        <Typography variant="body2" sx={{ fontSize: "12px", color: TABLE_TEXT_COLOR }}>
          {sale.created_at_fmt}
        </Typography>
      )

    },
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
            {!isQuotation && (
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
      <Box sx={{ display: "flex", gap: 2, mb: 1, flexWrap: "wrap" }}>
        <StatCard
          label="Total Transactions"
          value={summary?.total_transactions ?? 0}
          valuePrefix=""
          icon={<ReceiptIcon color="primary" />}
          iconBgColor="#FFEBEE"
        />
        <StatCard
          label="Net Revenue"
          value={INR(summary?.net_revenue ?? 0)}
          valuePrefix=""
          icon={<TrendingUpIcon color="success" />}
          iconBgColor="#E8F5E9"
        />
        <StatCard
          label="Total Quotations"
          value={summary?.total_quotations ?? 0}
          valuePrefix=""
          icon={<ReceiptIcon sx={{ color: "#475569" }} />}
          iconBgColor="#F1F5F9"
        />
      </Box>

      {/* Filter bar */}
      <Box sx={{ mb: 1, px: 0.5, py: 0.25 }}>
        <Stack direction={{ xs: "column", sm: "row" }} gap={2} alignItems="flex-end">
          <Box sx={{ flex: 1.2 }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.6}>
              Search Customer
            </Typography>
            <TextField
              placeholder="Invoice ID or Customer name or mobile"
              size="small" fullWidth
              value={draftFilters.search}
              sx={{ backgroundColor: "#fff" }}
              onChange={e => setDraftFilters(f => ({ ...f, search: e.target.value }))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box sx={{ flex: 0.5, minWidth: 150 }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.6}>From Date</Typography>
            <TextField type="date" size="small" fullWidth value={draftFilters.from_date}
              sx={{ borderRadius: 0.5, backgroundColor: "#fff" }}
              onChange={e => setDraftFilters(f => ({ ...f, from_date: e.target.value }))} />
          </Box>
          <Box sx={{ flex: 0.5, minWidth: 150 }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.6}>To Date</Typography>
            <TextField type="date" size="small" fullWidth value={draftFilters.to_date}
              sx={{ borderRadius: 0.5, backgroundColor: "#fff" }}
              onChange={e => setDraftFilters(f => ({ ...f, to_date: e.target.value }))} />
          </Box>
          <Box sx={{ flex: 0.5, minWidth: 140 }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.6}>Status</Typography>
            <FormControl size="small" fullWidth>
              <Select
                value={draftFilters.payment_status}
                displayEmpty
                sx={{ borderRadius: 0.5, backgroundColor: "#fff" }}
                renderValue={(selected) => {
                  if (!selected)                return "All Status";
                  if (selected === "fully_paid")     return "Paid";
                  if (selected === "partially_paid") return "Partial";
                  if (selected === "unpaid")         return "Unpaid";
                  if (selected === "returned")       return "Returned";
                  if (selected === "partial_return") return "Partial Return";
                  return selected;
                }}
                onChange={e => setDraftFilters(f => ({ ...f, payment_status: e.target.value }))}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="fully_paid">Paid</MenuItem>
                <MenuItem value="partially_paid">Partial</MenuItem>
                <MenuItem value="unpaid">Unpaid</MenuItem>
                {/* ✅ New statuses now filterable */}
                <MenuItem value="returned">Returned</MenuItem>
                <MenuItem value="partial_return">Partial Return</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <Typography variant="caption" color="transparent" display="block" mb={0.6} sx={{ userSelect: "none" }}>&nbsp;</Typography>
            <Button
              variant="contained" color="primary" disableElevation size="medium"
              sx={{ px: 3.5, height: 40 }}
              onClick={() => setAppliedFilters({ ...draftFilters })}
            >
              Apply
            </Button>
          </Box>
        </Stack>
      </Box>

      {/* Transactions table */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataTable<Sale>
          columns={columns}
          rows={allItems}
          rowKey={(sale) => sale.sale_id}
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
        <InvoiceDetailDialog saleId={invoiceDialog} onClose={() => setInvoiceDialog(null)} />
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
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Invoice</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete invoice <strong>{deleteDialog?.sale_id}</strong>? This action cannot be undone.
          </Typography>
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
                await deleteSale(deleteDialog.sale_id);
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
