import React, { useRef, useCallback, useEffect } from "react";
import {
  useInfiniteQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Button,
  Divider,
  Stack,
  Avatar,
  CircularProgress,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
} from "@mui/material";
import {
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon,
  MoneyOff as UnpaidIcon,
  CalendarMonth as CalendarIcon,
  CheckCircle as PaidIcon,
  Warning as PartialIcon,
  ErrorOutline as UnpaidStatusIcon,
  StorefrontOutlined as StoreIcon,
  FileDownloadOutlined as ExportIcon,
  Circle,
} from "@mui/icons-material";
import { createTheme, ThemeProvider, alpha } from "@mui/material/styles";

// ─── Theme ───────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#E53935" },
    success: { main: "#2E7D32" },
    warning: { main: "#F57C00" },
    error: { main: "#C62828" },
    background: { default: "#F5F6FA", paper: "#FFFFFF" },
    text: { primary: "#1A1A2E", secondary: "#6B7280" },
  },
  typography: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    h5: { fontWeight: 700, letterSpacing: "-0.5px" },
    h6: { fontWeight: 600 },
    subtitle2: {
      fontWeight: 600,
      fontSize: "0.78rem",
      letterSpacing: "0.04em",
      textTransform: "uppercase",
    },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          borderRadius: 14,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, borderRadius: 8 },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { "& .MuiOutlinedInput-root": { borderRadius: 8 } },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          fontSize: "0.78rem",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "#6B7280",
          backgroundColor: alpha("#E53935", 0.04),
          borderBottom: "1px solid rgba(0,0,0,0.07)",
        },
        body: {
          fontSize: "0.85rem",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
        },
      },
    },
  },
});

// ─── Types ────────────────────────────────────────────────────────────────────
type PaymentStatus = "Paid" | "Partial" | "Unpaid";

interface Transaction {
  id: string;
  invoiceId: string;
  dateTime: string;
  customer: string;
  total: number;
  balance?: number;
  status: PaymentStatus;
}

interface PageResult {
  items: Transaction[];
  hasMore: boolean;
  nextPage: number;
}

// ─── Fake Data ────────────────────────────────────────────────────────────────
const ALL_TRANSACTIONS: Transaction[] = Array.from({ length: 87 }, (_, i) => {
  const statuses: PaymentStatus[] = ["Paid", "Partial", "Unpaid"];
  const customers = [
    "Eleanor Pena",
    "Jerome Bell",
    "Walk-In Customer",
    "Floyd Miles",
    "Bessie Cooper",
    "Theresa Webb",
    "Arlene McCoy",
    "Devon Lane",
    "Kristin Watson",
    "Cameron Williamson",
    "Dianne Russell",
    "Brooklyn Simmons",
  ];
  const status = statuses[i % 3];
  const total = +(50 + Math.random() * 2000).toFixed(2);
  const balance =
    status === "Partial"
      ? +(total * 0.4).toFixed(2)
      : status === "Unpaid"
        ? total
        : undefined;
  const date = new Date(2023, 9, 26 - Math.floor(i / 3));
  const hours = 8 + (i % 12);
  const mins = (i * 7) % 60;
  const ampm = hours >= 12 ? "PM" : "AM";
  const h12 = hours > 12 ? hours - 12 : hours;
  return {
    id: String(i + 1),
    invoiceId: `#INV-${2841 + i}`,
    dateTime: `${date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })} • ${String(h12).padStart(2, "0")}:${String(mins).padStart(2, "0")} ${ampm}`,
    customer: customers[i % customers.length],
    total,
    balance,
    status,
  };
});

const PAGE_SIZE = 10;

async function fetchTransactionsPage({
  pageParam = 0,
}: {
  pageParam?: number;
}): Promise<PageResult> {
  await new Promise((r) => setTimeout(r, 600));
  const start = pageParam * PAGE_SIZE;
  const items = ALL_TRANSACTIONS.slice(start, start + PAGE_SIZE);
  return {
    items,
    hasMore: start + PAGE_SIZE < ALL_TRANSACTIONS.length,
    nextPage: pageParam + 1,
  };
}

// ─── Summary Cards Config ─────────────────────────────────────────────────────
const SUMMARY_CARDS = [
  {
    label: "Total Transactions",
    value: "342",
    icon: <ReceiptIcon />,
    color: "#E53935",
    bg: "#FFEBEE",
  },
  {
    label: "Net Revenue",
    value: "₹42,858",
    icon: <TrendingUpIcon />,
    color: "#2E7D32",
    bg: "#E8F5E9",
  },
//   {
//     label: "Total Unpaid",
//     value: "₹9,517",
//     icon: <UnpaidIcon />,
//     color: "#C62828",
//     bg: "#FFEBEE",
//   },
//   {
//     label: "This Month",
//     value: "₹184",
//     icon: <CalendarIcon />,
//     color: "#1565C0",
//     bg: "#E3F2FD",
//   },
];

// ─── useInfiniteScroll Hook (mirrors TopItems pattern exactly) ────────────────
//   • tableContainerRef → passed as `root` to IntersectionObserver
//   • returns sentinelRef  → attach to the last <TableRow> sentinel element
function useInfiniteScroll(
  hasNextPage: boolean | undefined,
  fetchNextPage: () => void,
  isFetchingNextPage: boolean,
  scrollContainerRef: React.RefObject<HTMLElement | null>,
): React.RefObject<HTMLTableRowElement> {
  const sentinelRef = useRef<HTMLTableRowElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const root = scrollContainerRef.current ?? null;
    const observer = new IntersectionObserver(handleObserver, {
      root, // observe relative to the scrollable TableContainer
      threshold: 0.1,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver, scrollContainerRef]);

  return sentinelRef as React.RefObject<HTMLTableRowElement>;
}

// ─── Status Chip ──────────────────────────────────────────────────────────────
function StatusChip({ status }: { status: PaymentStatus }) {
  const map = {
    Paid: {
      color: "success" as const,
      icon: <Circle sx={{ fontSize: 8 }} />,
    },
    Partial: {
      color: "warning" as const,
      icon: <Circle sx={{ fontSize: 8 }} />,
    },
    Unpaid: {
      color: "error" as const,
      icon: <Circle sx={{ fontSize: 8 }} />,
    },
  };
  return (
    <Typography variant="body2" color={map[status].color} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      {map[status].icon}
      {status}
    </Typography>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
function SalesHistoryScreen() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["transactions"],
      queryFn: fetchTransactionsPage,
      initialPageParam: 0,
      getNextPageParam: (last) => (last.hasMore ? last.nextPage : undefined),
    });

  // ① Ref for the scrollable TableContainer — used as IntersectionObserver root
  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  // ② Sentinel ref returned from the hook — attach to the last <TableRow>
  const loadMoreRef = useInfiniteScroll(
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    tableContainerRef,
  );

  const allItems = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        p: { xs: 2, sm: 3 },
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1.5} mb={3}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>
          <StoreIcon sx={{ fontSize: 22 }} />
          
        </Avatar>
         <Box>
          <Typography variant="h5" lineHeight={1.1}>
            Sales History
          </Typography>
          
        </Box>
        </Box>
       
        <Button sx={{ textTransform: "none", fontWeight: 600, borderRadius: 0.6 }} onClick={() => window.history.back()} startIcon={<ReceiptIcon />} variant="contained" color="primary" disableElevation>
          <Typography variant="caption" color="white" fontWeight={600}>
            Back to POS
          </Typography>
        </Button>
      </Stack>

      {/* ── Summary Cards + Export CSV (same row) ──────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
        }}
      >
        {/* Left group — first two cards */}
        <Box sx={{ display: "flex", gap: 2, flex: 0.4 }}>
          {SUMMARY_CARDS.slice(0, 2).map((c) => (
            <Card key={c.label} elevation={1} sx={{ flex: 1 }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Stack direction="row" alignItems="center" gap={1.5}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: c.bg,
                      color: c.color,
                      display: "flex",
                      flexShrink: 0,
                    }}
                  >
                    {React.cloneElement(c.icon as React.ReactElement, {
                      sx: { fontSize: 22 },
                    })}
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      {c.label}
                    </Typography>
                    <Typography variant="h6" fontWeight={800} color={c.color}>
                      {c.value}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Right group — last two cards + Export CSV */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "stretch" }}>

          {/* Export CSV — same height as cards */}
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ExportIcon />}
            disableElevation
            sx={{
              alignSelf: "stretch",
              minWidth: 140,
              borderStyle: "dashed",
              whiteSpace: "nowrap",
              px: 2.5,
            }}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* ── Filter Bar ─────────────────────────────────────────────────────── */}
      <Card
        elevation={3}
        sx={{
          mb: 2,
          boxShadow: "0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ mb: 2, letterSpacing: "0.06em" }}
          >
            FILTER TRANSACTIONS
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            gap={2}
            alignItems="flex-end"
          >
            {/* Search */}
            <Box sx={{ flex: 1.2}}>
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
                display="block"
                mb={0.6}
              >
                Search Transaction
              </Typography>
              <TextField
                placeholder="Invoice ID or Customer Name"
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Date Range */}
            <Box sx={{ flex: 0.5, minWidth: 150 }}>
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
                display="block"
                mb={0.6}
              >
                Date Range
              </Typography>
              <FormControl size="small" fullWidth>
                <Select defaultValue="last7">
                  <MenuItem value="last7">Last 7 Days</MenuItem>
                  <MenuItem value="last30">Last 30 Days</MenuItem>
                  <MenuItem value="thisMonth">This Month</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Status */}
            <Box sx={{ flex: 0.5, minWidth: 140 }}>
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
                display="block"
                mb={0.6}
              >
                Status
              </Typography>
              <FormControl size="small" fullWidth>
                <Select defaultValue="all">
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="partial">Partial</MenuItem>
                  <MenuItem value="unpaid">Unpaid</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Apply */}
            <Box>
              <Typography
                variant="caption"
                color="transparent"
                display="block"
                mb={0.6}
                sx={{ userSelect: "none" }}
              >
                &nbsp;
              </Typography>
              <Button
                variant="contained"
                color="primary"
                disableElevation
                size="medium"
                sx={{ px: 3.5, height: 40 }}
              >
                Apply
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* ── Table Card ─────────────────────────────────────────────────────── */}
          <Card
        elevation={3}
        sx={{ boxShadow: "0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.06)" }}
      >
        {/*
          ③ tableContainerRef on TableContainer — this is the scroll root.
             maxHeight + overflow:"auto" makes it scrollable so the
             IntersectionObserver fires correctly when sentinel enters view.
        */}
        <TableContainer
          ref={tableContainerRef}
          component={Paper}
          elevation={0}
          sx={{ maxHeight: 520, overflow: "auto" }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Invoice ID</TableCell>
                <TableCell>Date &amp; Time</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {/* Skeleton rows on initial load */}
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={`sk-${i}`}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton variant="text" width={j === 5 ? 80 : "80%"} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : allItems.map((tx) => (
                    <TableRow
                      key={tx.id}
                      hover
                      sx={{ "&:hover": { bgcolor: alpha("#E53935", 0.03) }, p:3 }}
                    >
                      <TableCell sx={{cursor: "pointer" }}>
                        <Typography variant="body2" fontWeight={700} color="primary">
                          {tx.invoiceId}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                          {tx.dateTime}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Avatar
                            sx={{
                              width: 28, height: 28, fontSize: "0.7rem",
                              bgcolor: alpha("#E53935", 0.12),
                              color: "primary.main", fontWeight: 700,
                            }}
                          >
                            {tx.customer.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" fontWeight={500}>
                            {tx.customer}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          ₹{tx.total.toLocaleString("en-IN")}
                        </Typography>
                        {tx.balance && (
                          <Typography variant="caption" color="error.main" display="block">
                            Balance: ₹{tx.balance.toLocaleString("en-IN")}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <StatusChip status={tx.status} />
                          {tx.status !== "Paid" && (
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              disableElevation
                              sx={{
                                fontSize: "0.68rem", py: 0.3, px: 2,height: 24,ml:5,
                                minWidth: 0, whiteSpace: "nowrap",borderRadius: 1,
                              }}
                            >
                              Mark as Paid
                            </Button>
                          )}
                        </Stack>
                      </TableCell>

                      <TableCell align="right">
                        <Stack direction="row" justifyContent="flex-end" gap={0.3}>
                          {/* Sales Return */}
                          <Tooltip title="Sales Return">
                            <IconButton
                              size="small"
                              sx={{
                                color: "text.secondary",
                                borderRadius: 1.5,
                                "&:hover": { color: "primary.main", bgcolor: alpha("#E53935", 0.06) },
                              }}
                            >
                              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4 2 4-2 4 2z"
                                />
                              </svg>
                            </IconButton>
                          </Tooltip>
 
                          {/* Edit Invoice */}
                          <Tooltip title="Edit Invoice">
                            <IconButton
                              size="small"
                              sx={{
                                color: "text.secondary",
                                borderRadius: 1.5,
                                "&:hover": { color: "primary.main", bgcolor: alpha("#E53935", 0.06) },
                              }}
                            >
                              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                              </svg>
                            </IconButton>
                          </Tooltip>
 
                          {/* Delete Invoice */}
                          <Tooltip title="Delete Invoice">
                            <IconButton
                              size="small"
                              sx={{
                                color: "text.secondary",
                                borderRadius: 1.5,
                                "&:hover": { color: "#C62828", bgcolor: alpha("#C62828", 0.06) },
                              }}
                            >
                              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}

              {/*
                ④ Sentinel <TableRow> — loadMoreRef is attached here.
                   IntersectionObserver (root = tableContainerRef) watches
                   this row; when it scrolls into view it calls fetchNextPage().
              */}
              {hasNextPage && (
                <TableRow ref={loadMoreRef}>
                  <TableCell colSpan={6} sx={{ py: 0, border: 0 }}>
                    <Box sx={{ height: 20 }} />
                  </TableCell>
                </TableRow>
              )}

              {/* Spinner while loading next page */}
              {isFetchingNextPage && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 2 }}>
                    <CircularProgress size={22} color="primary" />
                  </TableCell>
                </TableRow>
              )}

              {/* End of list */}
              {!hasNextPage && allItems.length > 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      All {allItems.length} transactions loaded
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider />

        {/* Footer totals */}
      </Card>
    </Box>
  );
}

export default SalesHistoryScreen;
