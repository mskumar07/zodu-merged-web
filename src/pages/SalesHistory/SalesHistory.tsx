/**
 * SalesHistoryPage.tsx
 *
 * FIXED vs original:
 *  - sale fields use cust_name / sale_date_fmt / created_at_fmt (not customer_name / sale_date)
 *  - MarkPaymentDialog.onSuccess calls refetch() which re-runs ALL infinite pages
 *  - queryClient.invalidateQueries in the dialog also busts cache independently
 *  - search filter sends customer_search (not invoice_no) to match backend
 */
import React, { useRef, useCallback, useEffect, useState } from "react";
import { useInfiniteQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Box, Card, CardContent, Typography, Button, Stack,
  Avatar, TextField, InputAdornment, Select, MenuItem,
  FormControl, IconButton, Tooltip, alpha,
} from "@mui/material";
import {
  Search as SearchIcon, Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon, Circle,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  fetchHistory, salesQueryKeys,
  type Sale, type Filters,
} from "./useSaleshistory";

import InvoiceDetailDialog from "./Invoicedetaildialog";
import MarkPaymentDialog   from "./MarkPaymentDialog";
import SalesReturnDialog   from "./Salesreturndialog";
import DataTable           from "@utils/DataTable";
import { useNavigate } from "react-router-dom";

// ─── Formatter ────────────────────────────────────────────────
const INR = (v: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(v);

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
    fontFamily:  '"Poppins", sans-serif',
    h5:          { fontWeight: 700, letterSpacing: "-0.5px" },
    h6:          { fontWeight: 600 },
    subtitle2:   { fontWeight: 600, fontSize: "0.78rem", letterSpacing: "0.04em", textTransform: "uppercase" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard:   { styleOverrides: { root: { boxShadow: "0 1px 3px rgba(0,0,0,0.06)", borderRadius: 14 } } },
    MuiButton: { styleOverrides: { root: { textTransform: "none", fontWeight: 600, borderRadius: 8 } } },
    MuiTextField: { styleOverrides: { root: { "& .MuiOutlinedInput-root": { borderRadius: 8 } } } },
  },
});

// ─── Status helpers ───────────────────────────────────────────
type UIStatus = "Paid" | "Partial" | "Unpaid";

function mapStatus(s: Sale["payment_status"]): UIStatus {
  if (s === "fully_paid")     return "Paid";
  if (s === "partially_paid") return "Partial";
  return "Unpaid";
}

function StatusDot({ status }: { status: UIStatus }) {
  const colors: Record<UIStatus, string> = { Paid: "#2E7D32", Partial: "#F57C00", Unpaid: "#C62828" };
  return (
    <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5, color: colors[status], fontWeight: 600 }}>
      <Circle sx={{ fontSize: 8 }} />
      {status}
    </Typography>
  );
}

// ─── Infinite scroll sentinel ─────────────────────────────────
function useInfiniteScroll(
  hasNextPage: boolean | undefined,
  fetchNextPage: () => void,
  isFetchingNextPage: boolean,
  scrollContainerRef: React.RefObject<HTMLElement | null>,
): React.RefObject<HTMLTableRowElement> {
  const sentinelRef = useRef<HTMLTableRowElement | null>(null);
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const root = scrollContainerRef.current ?? null;
    const observer = new IntersectionObserver(handleObserver, { root, threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver, scrollContainerRef]);
  return sentinelRef as React.RefObject<HTMLTableRowElement>;
}

// ─── Root export ──────────────────────────────────────────────
const queryClient = new QueryClient();

export default function SalesHistoryPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <SalesHistoryScreen />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// ─── Main screen ──────────────────────────────────────────────
function SalesHistoryScreen() {
  const [draftFilters,   setDraftFilters]   = useState<Filters>({ search: "", payment_status: "", from_date: "", to_date: "" });
  const [appliedFilters, setAppliedFilters] = useState<Filters>({ search: "", payment_status: "", from_date: "", to_date: "" });
const navigate = useNavigate();
  const [invoiceDialog, setInvoiceDialog] = useState<string | null>(null);
  const [paymentDialog, setPaymentDialog] = useState<Sale   | null>(null);
  const [returnDialog,  setReturnDialog]  = useState<string | null>(null);

  const {
    data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading,
    // ✅ refetch re-runs ALL pages of the infinite query
    refetch,
  } = useInfiniteQuery({
    queryKey:         salesQueryKeys.history(appliedFilters),
    queryFn:          ({ pageParam = 1 }) => fetchHistory(pageParam as number, appliedFilters),
    initialPageParam: 1,
    getNextPageParam: (last) => last.page < last.total_pages ? last.page + 1 : undefined,
  });

  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef       = useInfiniteScroll(hasNextPage, fetchNextPage, isFetchingNextPage, tableContainerRef);
  const allItems          = data?.pages.flatMap(p => p.data) ?? [];
  const totalCount        = data?.pages[0]?.total ?? 0;

  // ── Column definitions ────────────────────────────────────────
  const columns = [
    {
      key: "sale_id",
      label: "Invoice ID",
      render: (sale: Sale) => (
        <Typography
          variant="body2" fontWeight={400} color="#1976d2"
          sx={{ cursor: "pointer" }}
          onClick={() => setInvoiceDialog(sale.sale_id)}
        >
          {sale.sale_id}
        </Typography>
      ),
    },
    {
      key: "date",
      label: "Date & Time",
      render: (sale: Sale) => (
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.78rem" }}>
          {/* ✅ use formatted date from API */}
          {sale.created_at_fmt}
        </Typography>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (sale: Sale) => {
        // ✅ cust_name from joined tbl_customer (null = walk-in)
        const name = sale.cust_name || sale.cpy_name || "Walk-In";
        return (
          <Stack direction="row" alignItems="center" gap={1}>
            <Avatar sx={{ width: 24, height: 24, fontSize: "0.65rem", bgcolor: alpha("#10B981", 0.15), color: "#10B981", fontWeight: 700 }}>
              {name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={500}>{name}</Typography>
              {sale.customer_mobile && (
                <Typography variant="caption" color="text.secondary">{sale.customer_mobile}</Typography>
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
      render: (sale: Sale) => {
        const balance = Number(sale.balance_amount);
        return (
          <>
            <Typography variant="body2" fontWeight={700}>{INR(Number(sale.total_amount))}</Typography>
            {balance > 0 && (
              <Typography variant="caption" color="error.main" display="block">
                Balance: {INR(balance)}
              </Typography>
            )}
          </>
        );
      },
    },
    {
      key: "payment",
    label: <Box sx={{ ml: 5 }}>Payment</Box>,
      
      render: (sale: Sale) => {
        const status = mapStatus(sale.payment_status);
        return (
          <Stack direction="row" alignItems="center" gap={1} marginLeft={5}>
            <StatusDot status={status} />
            {status !== "Paid" && (
              <Button
                size="small" variant="contained" color="primary" disableElevation
                onClick={() => setPaymentDialog(sale)}
                sx={{ fontSize: "0.65rem", py: 0.4, px: 1.5, height: 24, ml: 1, minWidth: 0, whiteSpace: "nowrap", borderRadius: 0.5 }}
              >
                Mark as Paid
              </Button>
            )}
          </Stack>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      align: "right" as const,
      render: (sale: Sale) => (
        <Stack direction="row" justifyContent="flex-end" gap={0.3}>
          <Tooltip title="Sales Return">
            <IconButton size="small" onClick={() => setReturnDialog(sale.sale_id)}
              sx={{ color: "text.secondary", borderRadius: 1.5, "&:hover": { color: "primary.main", bgcolor: alpha("#E53935", 0.06) } }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4 2 4-2 4 2z" />
              </svg>
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Invoice">
            <IconButton    onClick={() => navigate(`/pos?saleId=${sale?.sale_id}`)} size="small"
              sx={{ color: "text.secondary", borderRadius: 1.5, "&:hover": { color: "primary.main", bgcolor: alpha("#E53935", 0.06) } }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Invoice">
            <IconButton size="small"
              sx={{ color: "text.secondary", borderRadius: 1.5, "&:hover": { color: "#C62828", bgcolor: alpha("#C62828", 0.06) } }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", p: { xs: 2, sm: 1 } }}>

      {/* Summary cards */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 1 }}>
        <Box sx={{ display: "flex", gap: 2, flex: 0.4 }}>
          {[
            { label: "Total Transactions", value: String(totalCount),                                                              icon: <ReceiptIcon />,    iconColor: "#E53935", bg: "#FFEBEE" },
            { label: "Net Revenue",        value: INR(allItems.reduce((s, i) => s + Number(i.total_amount), 0)), icon: <TrendingUpIcon />, iconColor: "#E53935", bg: "#E8F5E9" },
          ].map(c => (
            <Card key={c.label} elevation={1} sx={{ flex: 1 }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Stack direction="row" alignItems="center" gap={1.5}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: c.bg, color: c.iconColor, display: "flex", flexShrink: 0 }}>
                    {React.cloneElement(c.icon as React.ReactElement, { sx: { fontSize: 22 } })}
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">{c.label}</Typography>
                    <Typography variant="h6" fontWeight={800}>{c.value}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
        <Button onClick={() => window.history.back()} startIcon={<ReceiptIcon />}
          variant="contained" color="primary" disableElevation sx={{ borderRadius: 0.6, fontWeight: 600 }}>
          <Typography variant="caption" color="white" fontWeight={600}>Back to POS</Typography>
        </Button>
      </Box>

      {/* Filter bar */}
      <Card elevation={3} sx={{ mb: 1, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: 1, "&:last-child": { pb: 2.5 } }}>
          <Stack direction={{ xs: "column", sm: "row" }} gap={2} alignItems="flex-end">
            <Box sx={{ flex: 1.2 }}>
              <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.6}>
                Search Customer
              </Typography>
              <TextField
                placeholder="Customer name or mobile" size="small" fullWidth
                value={draftFilters.search}
                onChange={e => setDraftFilters(f => ({ ...f, search: e.target.value }))}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} /></InputAdornment> }}
              />
            </Box>
            <Box sx={{ flex: 0.5, minWidth: 150 }}>
              <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.6}>From Date</Typography>
              <TextField type="date" size="small" fullWidth value={draftFilters.from_date}
                onChange={e => setDraftFilters(f => ({ ...f, from_date: e.target.value }))} />
            </Box>
            <Box sx={{ flex: 0.5, minWidth: 150 }}>
              <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.6}>To Date</Typography>
              <TextField type="date" size="small" fullWidth value={draftFilters.to_date}
                onChange={e => setDraftFilters(f => ({ ...f, to_date: e.target.value }))} />
            </Box>
            <Box sx={{ flex: 0.5, minWidth: 140 }}>
              <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.6}>Status</Typography>
              <FormControl size="small" fullWidth>
                <Select value={draftFilters.payment_status}
                  onChange={e => setDraftFilters(f => ({ ...f, payment_status: e.target.value }))}>
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="fully_paid">Paid</MenuItem>
                  <MenuItem value="partially_paid">Partial</MenuItem>
                  <MenuItem value="unpaid">Unpaid</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <Typography variant="caption" color="transparent" display="block" mb={0.6} sx={{ userSelect: "none" }}>&nbsp;</Typography>
              <Button variant="contained" color="primary" disableElevation size="medium"
                sx={{ px: 3.5, height: 40 }} onClick={() => setAppliedFilters({ ...draftFilters })}>
                Apply
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Transactions table */}
      <DataTable<Sale>
        columns={columns}
        rows={allItems}
        rowKey={(sale) => sale.sale_id}
        isLoading={isLoading}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        loadMoreRef={loadMoreRef}
        tableContainerRef={tableContainerRef}
        emptyMessage="No sales transactions found."
      />

      {/* Dialogs */}
      {invoiceDialog && (
        <InvoiceDetailDialog saleId={invoiceDialog} onClose={() => setInvoiceDialog(null)} />
      )}

      {paymentDialog && (
        <MarkPaymentDialog
          sale={paymentDialog}
          onClose={() => setPaymentDialog(null)}
          // ✅ refetch re-runs all pages so updated paid_amount/balance/status show immediately
          onSuccess={() => refetch()}
        />
      )}

      {returnDialog && (
        <SalesReturnDialog saleId={returnDialog} onClose={() => setReturnDialog(null)} />
      )}
    </Box>
  );
}
