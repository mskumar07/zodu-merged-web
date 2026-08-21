/**
 * CustomerLedgerModal.tsx
 * Customer Payment Ledger dialog — wired to live API via useCustomerLedger.
 *
 * Changes from v1:
 *  ✅ Real API data via useCustomerLedger hook
 *  ✅ Server-side date filtering (fromDate / toDate)
 *  ✅ Server-side payment method filtering
 *  ✅ Client-side invoice search (debounced)
 *  ✅ Skeleton loading states
 *  ✅ Error + empty states
 *  ✅ Fixed date filter visual style (consistent height, brand focus ring,
 *     styled calendar indicator, uniform border colour)
 */

import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Link,
  InputAdornment,
  Skeleton,
  Alert,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Close as CloseIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  ErrorOutline as ErrorOutlineIcon,
  FilterAlt as FilterAltIcon,
  ShoppingBagOutlined as SalesTabIcon,
  AccountBalanceWalletOutlined as PaymentTabIcon,
  DescriptionOutlined as InvoiceStatIcon,
  ReceiptLongOutlined as OutstandingStatIcon,
  AccountBalanceOutlined as LedgerIcon,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  useCustomerLedger,
  formatDisplayDate,
  toNum,
  formatCurrency,
  type LedgerFilters,
  type SalesReturnRow,
  type PaymentRow,
} from "./useCustomerapi";
import { DateRangeChip } from "../../components/Reports/utils/DateRangeChip";

// ─── Theme ────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary:    { main: "#dc2626" },
    success:    { main: "#16a34a" },
    error:      { main: "#dc2626" },
    background: { default: "#f1f5f9", paper: "#ffffff" },
  },
  shape:      { borderRadius: 8 },
});

// ─── Styled primitives ────────────────────────────────────────

/** Matching-height Select wrapper */
const FilterSelect = styled(Select)(() => ({
  height: 36,
  minWidth: 148,
  borderRadius: 6,
  fontSize: "0.75rem",
  backgroundColor: "#fff",
  color: "#475569",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#e2e8f0",
    transition: "border-color 0.15s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#cbd5e1" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#dc2626",
    borderWidth: "1.5px",
  },
  "& .MuiSelect-select": {
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
    height: "100% !important",
  },
}));

/** Matching-height search field */
const SearchField = styled(TextField)(() => ({
  width: 200,
  "& .MuiOutlinedInput-root": {
    height: 36,
    borderRadius: 6,
    fontSize: "0.75rem",
    backgroundColor: "#fff",
    "& fieldset": {
      borderColor: "#e2e8f0",
      transition: "border-color 0.15s ease",
    },
    "&:hover fieldset": { borderColor: "#cbd5e1" },
    "&.Mui-focused fieldset": {
      borderColor: "#dc2626",
      borderWidth: "1.5px",
    },
  },
  "& input": { padding: "0 8px 0 0", fontSize: "0.75rem", color: "#475569" },
  "& .MuiInputAdornment-root": { ml: 0 },
}));

// ─── Header cell helper ───────────────────────────────────────
const TH_SX = {
  bgcolor: "#f8fafc",
  fontWeight: 600,
  fontSize: "0.8rem",
  color: "#475569",
  borderBottom: "1px solid #e2e8f0",
  whiteSpace: "nowrap" as const,
  py: 1.25,
};

// ─── Skeleton row helpers ─────────────────────────────────────
function SalesSkeletonRows() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 7 }).map((__, j) => (
            <TableCell key={j} sx={{ py: 1.5 }}>
              <Skeleton variant="text" width={j === 2 ? "80%" : j === 6 ? 24 : "60%"} height={18} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function PaymentSkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 5 }).map((__, j) => (
            <TableCell key={j} sx={{ py: 1.5 }}>
              <Skeleton variant="text" width="65%" height={18} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// ─── Whole-rupee formatting for stat cards (no decimals) ──────
function formatCurrencyWhole(amount: number): string {
  return Math.round(Math.abs(amount)).toLocaleString("en-IN");
}

// ─── Compact stat card — same visual language as the shared StatCard,
// sized down so 4 fit comfortably in the ledger dialog header ─────
function CompactStatCard({
  label,
  value,
  valuePrefix = "₹",
  sublabel,
  icon,
  iconColor,
  iconBgColor,
  loading,
}: {
  label:        string;
  value:        string;
  valuePrefix?: string;
  sublabel?:    string;
  icon:         React.ReactNode;
  iconColor:    string;
  iconBgColor:  string;
  loading?:     boolean;
}) {
  return (
    <Box
      sx={{
        bgcolor: "#fff",
        border: "1px solid #F1F5F9",
        borderRadius: "8px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        px: 1.5,
        py: 1,
        display: "flex",
        alignItems: "center",
        gap: 1,
        width: "fit-content",
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: "8px",
          bgcolor: iconBgColor,
          color: iconColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: "0.68rem",
            fontWeight: 500,
            color: "#64748B",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </Typography>
        {loading ? (
          <Skeleton width={60} height={20} sx={{ borderRadius: 1 }} />
        ) : (
          <Typography
            sx={{
              fontSize: "0.9rem",
              fontWeight: 800,
              color: "#0F172A",
              lineHeight: 1.3,
              whiteSpace: "nowrap",
            }}
          >
            {valuePrefix}{value}
          </Typography>
        )}
        {sublabel && (
          <Typography sx={{ fontSize: "0.62rem", color: "#94a3b8", whiteSpace: "nowrap" }}>
            {sublabel}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// ─── Two-line date cell: "19 Aug 2026" then "11:41 AM (Wed)" ──
function DateTimeCell({ value }: { value: string | undefined }) {
  if (!value) return <>—</>;
  const commaIdx = value.indexOf(",");
  const datePart = commaIdx === -1 ? value : value.slice(0, commaIdx);
  const timePart = commaIdx === -1 ? ""    : value.slice(commaIdx + 1).trim();
  return (
    <Box sx={{ lineHeight: 1.35 }}>
      <Box component="span" sx={{ display: "block" }}>{datePart}</Box>
      {timePart && (
        <Box component="span" sx={{ display: "block", color: "#94a3b8", fontSize: "0.7rem" }}>
          {timePart}
        </Box>
      )}
    </Box>
  );
}

// ─── Section label ────────────────────────────────────────────
function SectionLabel({ label, color = "#dc2626" }: { label: string; color?: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ width: 6, height: 16, bgcolor: color, borderRadius: 999 }} />
      <Typography
        variant="subtitle2"
        sx={{
          fontSize: "0.8rem",
          fontWeight: 700,
          color: "#334155",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

// ─── Props ────────────────────────────────────────────────────
export interface CustomerLedgerModalProps {
  open:          boolean;
  onClose:       () => void;
  custUuid:      string | null | undefined; // required for API
  customerName?: string;                    // fallback display name
}

// ─── Component ───────────────────────────────────────────────
const CustomerLedgerModal: React.FC<CustomerLedgerModalProps> = ({
  open,
  onClose,
  custUuid,
  customerName = "Customer",
}) => {
  // ── Filter state (server-side) — one shared date range drives both
  // the Sales & Returns and Payment History queries ─────────────────
  const [fromDate, setFromDate] = useState("");
  const [toDate,   setToDate]   = useState("");

  // ── Client-side search (debounced) ───────────────────────
  const [searchRaw,   setSearchRaw]   = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchRaw.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [searchRaw]);

  // ── Server filter object — shared by both queries ────────────────
  const ledgerFilters = useMemo<LedgerFilters>(() => ({
    fromDate: fromDate || undefined,
    toDate:   toDate   || undefined,
    limit:    100,
  }), [fromDate, toDate]);

  const salesQuery   = useCustomerLedger(open ? custUuid : null, ledgerFilters);
  const paymentQuery = useCustomerLedger(open ? custUuid : null, ledgerFilters);

  // ── Derived display data ──────────────────────────────────
  const salesAndReturns: SalesReturnRow[] = salesQuery.data?.sales_and_returns ?? [];
  const summary = salesQuery.data?.summary;
  const paymentRows: PaymentRow[] = paymentQuery.data?.payment_history.data ?? [];

  // ── Customer display name (API wins, prop is fallback) ───
  const displayName =
    salesQuery.data?.customer?.cpy_name   ||
    salesQuery.data?.customer?.cust_name  ||
    customerName;
  const displayCustId = salesQuery.data?.customer?.cust_id;

  // ── Client-side invoice search filter ────────────────────
  const filteredSales = useMemo(() => {
    if (!searchQuery) return salesAndReturns;
    return salesAndReturns.filter(
      (r) =>
        r.doc_id.toLowerCase().includes(searchQuery) ||
        r.description.toLowerCase().includes(searchQuery)
    );
  }, [salesAndReturns, searchQuery]);

  // ── Payment history total ─────────────────────────────────
  const totalPaymentAmount = useMemo(
    () => paymentRows.reduce((sum, row) => sum + toNum(row.amount), 0),
    [paymentRows]
  );

  // ── Clear filters helper ──────────────────────────────────
  const clearFilters = useCallback(() => {
    setFromDate("");
    setToDate("");
    setSearchRaw("");
  }, []);

  const hasFilter = !!(fromDate || toDate || searchQuery);

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, maxWidth: "1440px" },
        }}
      >
        {/* ── Header ─────────────────────────────────────── */}
        <DialogTitle
          sx={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            borderBottom:   "1px solid #f1f5f9",
            px: 3,
            py: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ p: 0.8, bgcolor: "rgba(200,16,46,0.08)", borderRadius: 2, display: "flex" }}>
              <LedgerIcon sx={{ color: "primary.main", fontSize: 20 }} />
            </Box>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.15rem" }}>
              Customer Payment Ledger —{" "}
              <Box component="span" sx={{ color: "primary.main" }}>
                {salesQuery.isLoading
                  ? <Skeleton variant="text" width={180} sx={{ display: "inline-block" }} />
                  : displayName}
              </Box>
              {!salesQuery.isLoading && displayCustId != null && (
                <Box
                  component="span"
                  sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", ml: 1 }}
                >
                  (ID: {displayCustId})
                </Box>
              )}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: "#94a3b8" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* ── Content ────────────────────────────────────── */}
        <DialogContent sx={{ pt: 4, pr: 3, pb: 3, pl: 1.5 }}>

          {/* Global error banner */}
          {(salesQuery.isError || paymentQuery.isError) && (
            <Alert
              severity="error"
              icon={<ErrorOutlineIcon />}
              sx={{ mb: 2, fontSize: "0.8rem", borderRadius: 1.5 }}
              action={
                <Button
                  size="small"
                  onClick={() => {
                    salesQuery.refetch();
                    paymentQuery.refetch();
                  }}
                >
                  Retry
                </Button>
              }
            >
              Failed to load ledger data. Please check your connection and try again.
            </Alert>
          )}

          {/* Stat cards + shared filters (search, date range) on one line */}
          <Box
            sx={{
              display:        "flex",
              justifyContent: "space-between",
              alignItems:     "flex-start",
              flexWrap:       "wrap",
              gap: 2,
              mt: 2,
              mb: 2.5,
            }}
          >
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <CompactStatCard
                label="Total Sales"
                value={formatCurrencyWhole(summary?.gross_total ?? 0)}
                icon={<SalesTabIcon sx={{ fontSize: 17 }} />}
                iconColor="#dc2626"
                iconBgColor="rgba(220,38,38,0.1)"
                loading={salesQuery.isLoading}
              />
              <CompactStatCard
                label="Total Payments"
                value={formatCurrencyWhole(totalPaymentAmount)}
                icon={<PaymentTabIcon sx={{ fontSize: 17 }} />}
                iconColor="#16a34a"
                iconBgColor="rgba(22,163,74,0.1)"
                loading={paymentQuery.isLoading}
              />
              <CompactStatCard
                label="Outstanding"
                value={formatCurrencyWhole(summary?.net_outstanding ?? 0)}
                icon={<OutstandingStatIcon sx={{ fontSize: 17 }} />}
                iconColor="#dc2626"
                iconBgColor="rgba(220,38,38,0.1)"
                loading={salesQuery.isLoading}
              />
              <CompactStatCard
                label="Total Invoices"
                value={String(summary?.total_invoice ?? 0)}
                valuePrefix=""
                icon={<InvoiceStatIcon sx={{ fontSize: 17 }} />}
                iconColor="#2563eb"
                iconBgColor="rgba(37,99,235,0.1)"
                loading={salesQuery.isLoading}
              />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.75 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                {/* Search */}
                <SearchField
                  size="small"
                  placeholder="Search invoices…"
                  value={searchRaw}
                  onChange={(e) => setSearchRaw(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 15, color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  }}
                />
                {/* Date range */}
                <DateRangeChip
                  fromDate={fromDate}
                  toDate={toDate}
                  onFromDateChange={setFromDate}
                  onToDateChange={setToDate}
                />
              </Box>

              {hasFilter && (
                <Chip
                  label="Clear filters"
                  size="small"
                  icon={<FilterAltIcon sx={{ fontSize: 12 }} />}
                  onClick={clearFilters}
                  sx={{
                    height: 22,
                    fontSize: "0.7rem",
                    bgcolor: "#fee2e2",
                    color:   "#dc2626",
                    border:  "none",
                    cursor:  "pointer",
                    "& .MuiChip-icon": { color: "#dc2626" },
                  }}
                />
              )}
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1.15fr 1fr" },
              gap: 3,
              alignItems: "start",
            }}
          >

            {/* ════════════════════════════════════════════
                SALES & RETURNS
            ════════════════════════════════════════════ */}
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ mb: 1.5 }}>
                <SectionLabel label="Sales & Returns" />
              </Box>

              {/* Table */}
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  border:      "1px solid #e2e8f0",
                  borderRadius: 1.5,
                  height:      380,
                  overflow:    "auto",
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={TH_SX}>Date</TableCell>
                      <TableCell sx={TH_SX}>ID</TableCell>
                      <TableCell sx={{ ...TH_SX, width: "18%", whiteSpace: "normal" }}>Description</TableCell>
                      <TableCell align="right" sx={TH_SX}>Total</TableCell>
                      <TableCell align="right" sx={TH_SX}>Paid</TableCell>
                      <TableCell align="right" sx={TH_SX}>Balance</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {/* Loading */}
                    {salesQuery.isLoading && <SalesSkeletonRows />}

                    {/* Rows */}
                    {!salesQuery.isLoading &&
                      filteredSales.map((row) => {
                        const isReturn   = row.doc_type === "RETURN";
                        const total      = toNum(row.total_amount);
                        const paid       = toNum(row.paid_amount);
                        const balance    = toNum(row.balance_amount);
                        const balancePos = balance > 0;
                        const balanceNeg = balance < 0;
                        

                        return (
                          <TableRow
                            key={row.doc_uuid}
                            sx={{
                              "&:hover": { bgcolor: "#fafafa" },
                              borderBottom: "1px solid #f1f5f9",
                            }}
                          >
                            <TableCell sx={{ fontSize: "0.8rem", color: "#64748b", py: 1.5, whiteSpace: "nowrap" }}>
                              <DateTimeCell value={row.doc_date} />
                            </TableCell>

                            <TableCell sx={{ py: 1.5, whiteSpace: "nowrap" }}>
                              <Link
                                href="#"
                                sx={{
                                  fontSize:       "0.8rem",
                                  fontWeight:     600,
                                  color:          "#2563eb",
                                  textDecoration: "none",
                                  whiteSpace:     "nowrap",
                                  "&:hover":      { textDecoration: "underline" },
                                }}
                              >
                                {row.doc_id}
                              </Link>
                            </TableCell>

                            <TableCell
                              sx={{
                                fontSize:  "0.8rem",
                                color:     isReturn ? "#dc2626" : "#64748b",
                                fontStyle: isReturn ? "italic" : "normal",
                                py: 1.5,
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                              }}
                            >
                              {row.description === "S" ? "Sale" : isReturn ? "Return - " + row.description : row.description}
                            </TableCell>

                            <TableCell align="right" sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#1e293b", py: 1.5, whiteSpace: "nowrap" }}>
                              {formatCurrency(total)}
                            </TableCell>

                            <TableCell
                              align="right"
                              sx={{
                                fontSize:   "0.8rem",
                                color:      paid > 0 ? "#16a34a" : "#94a3b8",
                                py: 1.5,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {formatCurrency(paid)}
                            </TableCell>

                            <TableCell
                              align="right"
                              sx={{
                                fontSize:   "0.8rem",
                                fontWeight: 700,
                                color: balancePos ? "#dc2626" : balanceNeg ? "#16a34a" : "#1e293b",
                                py: 1.5,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {formatCurrency(balance)}
                              {balancePos && row.due_date && (
                                <Typography sx={{ fontSize: "0.68rem", fontWeight: 650, color: "#0c0c0c", mt: 0.15 }}>
                                  Due: {row.due_date}
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}

                    {/* Empty */}
                    {!salesQuery.isLoading && filteredSales.length === 0 && (
                      <TableRow sx={{ height: 300 }}>
                        <TableCell
                          colSpan={6}
                          align="center"
                          sx={{ fontSize: "0.8rem", color: "#94a3b8", border: "none" }}
                        >
                          {hasFilter
                            ? "No records match the selected filters."
                            : "No sales or returns found for this customer."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* ════════════════════════════════════════════
                PAYMENT HISTORY
            ════════════════════════════════════════════ */}
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ mb: 1.5 }}>
                <SectionLabel label="Payment History" color="#22c55e" />
              </Box>

              {/* Table */}
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  border:       "1px solid #e2e8f0",
                  borderRadius: 1.5,
                  height:       380,
                  overflow:     "auto",
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={TH_SX}>Date</TableCell>
                      <TableCell sx={TH_SX}>Invoice ID</TableCell>
                      <TableCell sx={TH_SX}>Reference No / Transaction Type</TableCell>
                      <TableCell align="right" sx={{ ...TH_SX, pr: 1 }}>Amount</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {/* Loading */}
                    {paymentQuery.isLoading && <PaymentSkeletonRows />}

                    {/* Rows */}
                    {!paymentQuery.isLoading &&
                      paymentRows.map((row) => {
                        const amount   = toNum(row.amount);
                        const isRefund = amount < 0;

                        const txTypeLabel = row.transaction_type
                          ? row.transaction_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                          : "—";
                        const referenceNo = row.transaction_id || "-";

                        return (
                          <TableRow
                            key={row.payment_id}
                            sx={{
                              "&:hover":    { bgcolor: "#fafafa" },
                              borderBottom: "1px solid #f1f5f9",
                            }}
                          >
                            <TableCell sx={{ fontSize: "0.8rem", color: "#64748b", py: 1.5, whiteSpace: "nowrap" }}>
                              <DateTimeCell value={row.created_at} />
                            </TableCell>

                            <TableCell sx={{ py: 1.5, whiteSpace: "nowrap" }}>
                              <Link
                                href="#"
                                sx={{
                                  fontSize:       "0.8rem",
                                  fontWeight:     600,
                                  color:          "#2563eb",
                                  textDecoration: "none",
                                  whiteSpace:     "nowrap",
                                  "&:hover":      { textDecoration: "underline" },
                                }}
                              >
                                {row.invoice_id}
                              </Link>
                            </TableCell>

                            <TableCell sx={{ py: 1.5, whiteSpace: "nowrap" }}>
                              <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: isRefund ? "#dc2626" : "#1e293b", fontStyle: isRefund ? "italic" : "normal" }}>
                                {referenceNo}
                              </Typography>
                              <Typography sx={{ fontSize: "0.68rem", fontWeight: 650, color: "#94a3b8", mt: 0.15 }}>
                                {txTypeLabel}
                              </Typography>
                            </TableCell>

                            <TableCell
                              align="right"
                              sx={{
                                fontSize:   "0.8rem",
                                fontWeight: 700,
                                color:      isRefund ? "#dc2626" : "#16a34a",
                                py: 1.5,
                                pr: 1,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {formatCurrency(amount)}
                            </TableCell>
                          </TableRow>
                        );
                      })}

                    {/* Empty */}
                    {!paymentQuery.isLoading && paymentRows.length === 0 && (
                      <TableRow sx={{ height: 300 }}>
                        <TableCell
                          colSpan={4}
                          align="center"
                          sx={{ fontSize: "0.8rem", color: "#94a3b8", border: "none" }}
                        >
                          {hasFilter
                            ? "No payments match the selected filters."
                            : "No payment history found for this customer."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </DialogContent>

        {/* ── Footer ─────────────────────────────────────── */}
        <DialogActions
          sx={{
            px:             3,
            py:             2,
            bgcolor:        "#f8fafc",
            borderTop:      "1px solid #e2e8f0",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.8rem" }}>
            Showing segregated transaction history for{" "}
            <Box component="span" fontWeight={600} sx={{ color: "#334155" }}>
              {displayName}
            </Box>
            .
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
            <Box sx={{ textAlign: "right" }}>
              <Typography
                sx={{
                  fontSize:      "0.7rem",
                  fontWeight:    700,
                  color:         "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Total Outstanding
              </Typography>
              {salesQuery.isLoading ? (
                <Skeleton variant="text" width={80} height={28} />
              ) : (
                <Typography
                  variant="h6"
                  fontWeight={800}
                  sx={{ color: "#dc2626", lineHeight: 1, mt: 0.25, fontSize: "1.2rem" }}
                >
                  ₹{" "}
                  {(summary?.net_outstanding ?? 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </Typography>
              )}
            </Box>

            <Button
              variant="contained"
              startIcon={<PrintIcon sx={{ fontSize: 16 }} />}
              disabled={salesQuery.isLoading}
              sx={{
                bgcolor:         "#dc2626",
                fontWeight:      700,
                px:              3,
                py:              1.25,
                fontSize:        "0.8rem",
                textTransform:   "none",
                borderRadius:    1.5,
                letterSpacing:   "0.04em",
                boxShadow:       "0 4px 12px -2px rgba(220, 38, 38, 0.35)",
                transition:      "all 0.15s ease",
                "&:hover":       { bgcolor: "#b91c1c", boxShadow: "0 6px 16px -2px rgba(220,38,38,0.45)" },
                "&:active":      { transform: "scale(0.97)" },
                "&.Mui-disabled": { bgcolor: "#fca5a5", color: "#fff" },
              }}
            >
              PRINT LEDGER [F12]
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default CustomerLedgerModal;