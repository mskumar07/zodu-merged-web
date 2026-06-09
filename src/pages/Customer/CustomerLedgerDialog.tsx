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
  Download as DownloadIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  ErrorOutline as ErrorOutlineIcon,
  CalendarToday as CalendarIcon,
  FilterAlt as FilterAltIcon,
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

/**
 * Fixed-height, brand-focused date input.
 * Targets the native calendar indicator so it stays subtle.
 */
const FilterDateField = styled(TextField)(() => ({
  width: 152,
  "& .MuiOutlinedInput-root": {
    height: 36,
    borderRadius: 6,
    fontSize: "0.75rem",
    backgroundColor: "#fff",
    color: "#475569",
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
  // Style the native date parts consistently across browsers
  "& input": {
    padding: "0 8px 0 12px",
    fontSize: "0.75rem",
    color: "#475569",
    "&::-webkit-calendar-picker-indicator": {
      opacity: 0.4,
      cursor: "pointer",
      width: 13,
      height: 13,
      marginRight: 2,
      filter: "invert(30%) sepia(10%) saturate(500%) hue-rotate(180deg)",
      "&:hover": { opacity: 0.7 },
    },
    "&::-webkit-datetime-edit": { padding: 0 },
    "&::-webkit-datetime-edit-fields-wrapper": { padding: 0 },
    "&::-webkit-datetime-edit-text":        { color: "#cbd5e1" },
    "&::-webkit-datetime-edit-month-field": { color: "#475569" },
    "&::-webkit-datetime-edit-day-field":   { color: "#475569" },
    "&::-webkit-datetime-edit-year-field":  { color: "#475569" },
  },
}));

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
          {Array.from({ length: 6 }).map((__, j) => (
            <TableCell key={j} sx={{ py: 1.5 }}>
              <Skeleton variant="text" width={j === 5 ? 24 : "65%"} height={18} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
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
  // ── Filter state (server-side) ────────────────────────────
  const [salesFromDate,  setSalesFromDate]  = useState("");
  const [salesToDate,    setSalesToDate]    = useState("");
  const [paymentFromDate, setPaymentFromDate] = useState("");
  const [paymentToDate,   setPaymentToDate]   = useState("");
  const [paymentMethod,  setPaymentMethod]  = useState("all");

  // ── Client-side search (debounced) ───────────────────────
  const [searchRaw,   setSearchRaw]   = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchRaw.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [searchRaw]);

  // ── Server filter objects — only recalc on actual value change ──
  const salesFilters  = useMemo<LedgerFilters>(() => ({
    fromDate: salesFromDate  || undefined,
    toDate:   salesToDate    || undefined,
    limit:    100,
  }), [salesFromDate, salesToDate]);

  const paymentFilters = useMemo<LedgerFilters>(() => ({
    fromDate: paymentFromDate || undefined,
    toDate:   paymentToDate   || undefined,
    method:   paymentMethod,
    limit:    100,
  }), [paymentFromDate, paymentToDate, paymentMethod]);

  // ── Merge filter keys so a single query covers both sections ──
  // We use a combined filter; if user filters sales by date vs payments
  // by date separately, we run two queries.
  const salesQuery   = useCustomerLedger(open ? custUuid : null, salesFilters);
  const paymentQuery = useCustomerLedger(open ? custUuid : null, paymentFilters);

  // ── Derived display data ──────────────────────────────────
  const salesAndReturns: SalesReturnRow[] = salesQuery.data?.sales_and_returns ?? [];
  const summary = salesQuery.data?.summary;
  const paymentRows: PaymentRow[] = paymentQuery.data?.payment_history.data ?? [];

  // ── Customer display name (API wins, prop is fallback) ───
  const displayName =
    salesQuery.data?.customer?.cpy_name   ||
    salesQuery.data?.customer?.cust_name  ||
    customerName;

  // ── Client-side invoice search filter ────────────────────
  const filteredSales = useMemo(() => {
    if (!searchQuery) return salesAndReturns;
    return salesAndReturns.filter(
      (r) =>
        r.doc_id.toLowerCase().includes(searchQuery) ||
        r.description.toLowerCase().includes(searchQuery)
    );
  }, [salesAndReturns, searchQuery]);

  // ── Clear filters helper ──────────────────────────────────
  const clearSalesFilters = useCallback(() => {
    setSalesFromDate("");
    setSalesToDate("");
    setSearchRaw("");
  }, []);

  const clearPaymentFilters = useCallback(() => {
    setPaymentFromDate("");
    setPaymentToDate("");
    setPaymentMethod("all");
  }, []);

  const hasSalesFilter   = !!(salesFromDate || salesToDate || searchQuery);
  const hasPaymentFilter = !!(paymentFromDate || paymentToDate || paymentMethod !== "all");

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, maxWidth: "1280px" },
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
            <Box sx={{ width: 8, height: 32, bgcolor: "primary.main", borderRadius: 999 }} />
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.15rem" }}>
              Customer Payment Ledger —{" "}
              <Box component="span" sx={{ color: "primary.main" }}>
                {salesQuery.isLoading
                  ? <Skeleton variant="text" width={180} sx={{ display: "inline-block" }} />
                  : displayName}
              </Box>
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: "#94a3b8" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* ── Content ────────────────────────────────────── */}
        <DialogContent sx={{ p: 3 }}>

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

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>

            {/* ════════════════════════════════════════════
                SALES & RETURNS
            ════════════════════════════════════════════ */}
            <Box>
              {/* Section toolbar */}
              <Box
                sx={{
                  display:        "flex",
                  justifyContent: "space-between",
                  alignItems:     "center",
                  mb: 1.5,
                  flexWrap:       "wrap",
                  gap: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 0.5 }}>
                  <SectionLabel label="Sales & Returns" />
                  {hasSalesFilter && (
                    <Chip
                      label="Clear filters"
                      size="small"
                      icon={<FilterAltIcon sx={{ fontSize: 12 }} />}
                      onClick={clearSalesFilters}
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

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  {/* Date range */}
                  <FilterDateField
                    type="date"
                    size="small"
                    value={salesFromDate}
                    onChange={(e) => setSalesFromDate(e.target.value)}
                    inputProps={{ max: salesToDate || undefined }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ mr: 0.25 }}>
                          <CalendarIcon sx={{ fontSize: 13, color: "#94a3b8" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8", flexShrink: 0 }}>
                    to
                  </Typography>
                  <FilterDateField
                    type="date"
                    size="small"
                    value={salesToDate}
                    onChange={(e) => setSalesToDate(e.target.value)}
                    inputProps={{ min: salesFromDate || undefined }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ mr: 0.25 }}>
                          <CalendarIcon sx={{ fontSize: 13, color: "#94a3b8" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
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
                </Box>
              </Box>

              {/* Table */}
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  border:      "1px solid #e2e8f0",
                  borderRadius: 1.5,
                  maxHeight:   380,
                  overflow:    "auto",
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={TH_SX}>Date</TableCell>
                      <TableCell sx={TH_SX}>ID</TableCell>
                      <TableCell sx={{ ...TH_SX, width: "35%" }}>Description</TableCell>
                      <TableCell align="right" sx={TH_SX}>Total (₹)</TableCell>
                      <TableCell align="right" sx={TH_SX}>Paid (₹)</TableCell>
                      <TableCell align="right" sx={TH_SX}>Balance (₹)</TableCell>
                      <TableCell align="center" sx={TH_SX}>Action</TableCell>
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
                             {row.doc_date}
                            </TableCell>

                            <TableCell sx={{ py: 1.5 }}>
                              <Link
                                href="#"
                                sx={{
                                  fontSize:       "0.8rem",
                                  fontWeight:     600,
                                  color:          "#2563eb",
                                  textDecoration: "none",
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
                            </TableCell>

                            <TableCell align="center" sx={{ py: 1.5 }}>
                              <IconButton size="small" sx={{ color: "#dc2626" }}>
                                <VisibilityIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}

                    {/* Empty */}
                    {!salesQuery.isLoading && filteredSales.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          align="center"
                          sx={{ py: 4, fontSize: "0.8rem", color: "#94a3b8" }}
                        >
                          {hasSalesFilter
                            ? "No records match the selected filters."
                            : "No sales or returns found for this customer."}
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Sticky total row */}
                    {!salesQuery.isLoading && filteredSales.length > 0 && (
                      <TableRow
                        sx={{
                          position: "sticky",
                          bottom: 0,
                          zIndex: 2,
                          "& td": {
                            borderTop:       "2px solid #e2e8f0",
                            borderBottom:    "none",
                            backgroundColor: "#f8fafc",
                          },
                        }}
                      >
                        <TableCell colSpan={3} sx={{ py: 1.75 }}>
                          <Typography sx={{ fontSize: "0.8rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Total
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", py: 1.75, whiteSpace: "nowrap" }}>
                          {formatCurrency(summary?.gross_total ?? 0)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: "0.85rem", fontWeight: 800, color: "#16a34a", py: 1.75, whiteSpace: "nowrap" }}>
                          {formatCurrency(summary?.total_paid ?? 0)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: "0.85rem", fontWeight: 900, color: "#dc2626", py: 1.75, whiteSpace: "nowrap" }}>
                          {formatCurrency(summary?.net_outstanding ?? 0)}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* ════════════════════════════════════════════
                PAYMENT HISTORY
            ════════════════════════════════════════════ */}
            <Box>
              {/* Section toolbar */}
              <Box
                sx={{
                  display:        "flex",
                  justifyContent: "space-between",
                  alignItems:     "center",
                  mb: 1.5,
                  flexWrap:       "wrap",
                  gap: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <SectionLabel label="Payment History" color="#22c55e" />
                  {hasPaymentFilter && (
                    <Chip
                      label="Clear filters"
                      size="small"
                      icon={<FilterAltIcon sx={{ fontSize: 12 }} />}
                      onClick={clearPaymentFilters}
                      sx={{
                        height:  22,
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

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <FilterDateField
                    type="date"
                    size="small"
                    value={paymentFromDate}
                    onChange={(e) => setPaymentFromDate(e.target.value)}
                    inputProps={{ max: paymentToDate || undefined }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ mr: 0.25 }}>
                          <CalendarIcon sx={{ fontSize: 13, color: "#94a3b8" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8", flexShrink: 0 }}>
                    to
                  </Typography>
                  <FilterDateField
                    type="date"
                    size="small"
                    value={paymentToDate}
                    onChange={(e) => setPaymentToDate(e.target.value)}
                    inputProps={{ min: paymentFromDate || undefined }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ mr: 0.25 }}>
                          <CalendarIcon sx={{ fontSize: 13, color: "#94a3b8" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormControl size="small">
                    <FilterSelect
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as string)}
                    >
                      <MenuItem value="all"          sx={{ fontSize: "0.8rem" }}>All Methods</MenuItem>
                      <MenuItem value="upi"          sx={{ fontSize: "0.8rem" }}>UPI</MenuItem>
                      <MenuItem value="cash"         sx={{ fontSize: "0.8rem" }}>Cash</MenuItem>
                      <MenuItem value="bank transfer" sx={{ fontSize: "0.8rem" }}>Bank Transfer</MenuItem>
                      <MenuItem value="store credit" sx={{ fontSize: "0.8rem" }}>Store Credit</MenuItem>
                      <MenuItem value="card"         sx={{ fontSize: "0.8rem" }}>Card</MenuItem>
                    </FilterSelect>
                  </FormControl>
                </Box>
              </Box>

              {/* Table */}
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  border:       "1px solid #e2e8f0",
                  borderRadius: 1.5,
                  maxHeight:    270,
                  overflow:     "auto",
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={TH_SX}>Date</TableCell>
                      <TableCell sx={TH_SX}>Invoice ID</TableCell>
                      <TableCell sx={TH_SX}>Transaction Type</TableCell>
                      <TableCell sx={TH_SX}>Method</TableCell>
                      <TableCell align="right" sx={TH_SX}>Amount (₹)</TableCell>
                      <TableCell align="center" sx={TH_SX}>Receipt</TableCell>
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

                        // Derive display labels from transaction_type
                        // transaction_type in tbl_sale_payment stores the method (upi/cash/…)
                        // Map it to a readable label for "Transaction Type" column
                        const methodLabel = row.transaction_type
                          ? row.transaction_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                          : "—";
                        const txTypeLabel = isRefund ? "Payment Refunded" : "Payment Received";

                        return (
                          <TableRow
                            key={row.payment_id}
                            sx={{
                              "&:hover":    { bgcolor: "#fafafa" },
                              borderBottom: "1px solid #f1f5f9",
                            }}
                          >
                            <TableCell sx={{ fontSize: "0.8rem", color: "#64748b", py: 1.5, whiteSpace: "nowrap" }}>
                              {row.created_at}
                            </TableCell>

                            <TableCell sx={{ py: 1.5 }}>
                              <Link
                                href="#"
                                sx={{
                                  fontSize:       "0.8rem",
                                  fontWeight:     600,
                                  color:          "#2563eb",
                                  textDecoration: "none",
                                  "&:hover":      { textDecoration: "underline" },
                                }}
                              >
                                {row.invoice_id}
                              </Link>
                            </TableCell>

                            <TableCell
                              sx={{
                                fontSize:  "0.8rem",
                                fontWeight: 500,
                                color:     isRefund ? "#dc2626" : "#1e293b",
                                fontStyle: isRefund ? "italic" : "normal",
                                py: 1.5,
                              }}
                            >
                              {txTypeLabel}
                            </TableCell>

                            <TableCell sx={{ fontSize: "0.8rem", color: "#64748b", py: 1.5 }}>
                              {methodLabel}
                            </TableCell>

                            <TableCell
                              align="right"
                              sx={{
                                fontSize:   "0.8rem",
                                fontWeight: 700,
                                color:      isRefund ? "#dc2626" : "#16a34a",
                                py: 1.5,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {formatCurrency(amount)}
                            </TableCell>

                            <TableCell align="center" sx={{ py: 1.5 }}>
                              <IconButton
                                size="small"
                                sx={{
                                  color: "#94a3b8",
                                  "&:hover": { color: "#475569", bgcolor: "#f1f5f9" },
                                }}
                              >
                                <DownloadIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}

                    {/* Empty */}
                    {!paymentQuery.isLoading && paymentRows.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          align="center"
                          sx={{ py: 4, fontSize: "0.8rem", color: "#94a3b8" }}
                        >
                          {hasPaymentFilter
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