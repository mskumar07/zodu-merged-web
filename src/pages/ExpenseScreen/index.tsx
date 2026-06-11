import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import LottieLoader from "@components/LottieLoader";
import {
  Box, Typography, TextField, Button, IconButton,
  InputAdornment, Fab, CircularProgress,
  FormControl, Select, MenuItem, Skeleton, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Tabs, Tab,
} from "@mui/material";
import { Circle } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AddIcon           from "@mui/icons-material/Add";
import EditOutlinedIcon  from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon        from "@mui/icons-material/Search";
import DataTable, { type ColumnDef } from "@utils/DataTable";
import { useInfiniteExpenses, useExpenseSummary, useDeleteExpense, type ExpenseRow } from "./useExpenseApi";
import AddNewExpenseDialog from "./AddNewExpenseDialog";
import ExpensePaymentDialog from "./ExpensePaymentDialog";
import ExpenseDetailDialog from "./ExpenseDetailDialog";
import ExpenseStats from "./ExpenseStats";
import CategoryTab from "@pages/MenuItemScreen/CategoryTab";

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
const PAGE_LIMIT = 10;
const SCROLL_THRESHOLD = 80;

type ExpenseStatus = "paid" | "partial" | "pending";

const STATUS_STYLES: Record<ExpenseStatus, { label: string; color: string }> = {
  paid:    { label: "Paid",    color: "#2E7D32" },
  partial: { label: "Partial", color: "#F57C00" },
  pending: { label: "Pending", color: "#C62828" },
};

function StatsSkeleton() {
  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} variant="rounded" height={90} sx={{ flex: 1, borderRadius: 3 }} />
      ))}
    </Box>
  );
}

function StatusBadge({ status }: { status: ExpenseStatus }) {
  const st = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  return (
    <Typography
      variant="body2"
      sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, color: st.color, fontWeight: 600, fontSize: 13 }}
    >
      <Circle sx={{ fontSize: 8 }} />
      {st.label}
    </Typography>
  );
}


export default function ExpenseScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | "">("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editExpenseId, setEditExpenseId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget]     = useState<string | null>(null);
  const [paymentTarget, setPaymentTarget]   = useState<ExpenseRow | null>(null);
  const [detailExpenseId, setDetailExpenseId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useExpenseSummary();

  const {
    data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch,
  } = useInfiniteExpenses({
    limit: PAGE_LIMIT,
    ...(search ? { search } : {}),
    ...(statusFilter ? { payment_status: statusFilter } : {}),
  });

  const expenses = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.data),
    [data]
  );

  const { mutate: deleteExpense, isPending: isDeleting } = useDeleteExpense({
    onSuccess: () => { setDeleteTarget(null); refetch(); refetchSummary(); },
  });

  const handleSearchChange = (val: string) => setSearch(val);
  const handleStatusChange = (val: ExpenseStatus | "") => setStatusFilter(val);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight <= SCROLL_THRESHOLD) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // When a page finishes loading, check if the container still has no scrollbar.
  // If content is shorter than the viewport the user can never scroll to trigger
  // handleScroll, so we fetch the next page automatically.
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || expenses.length === 0) return;
    const el = scrollRef.current;
    if (!el) return;
    // Only auto-fetch when there is truly no room to scroll
    if (el.scrollHeight <= el.clientHeight + SCROLL_THRESHOLD) {
      fetchNextPage();
    }
  }, [expenses.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const columns = useMemo<ColumnDef<ExpenseRow>[]>(
    () => [
      {
        key: "expense_id",
        label: "Expense ID",
        width: 180,
        render: (e) => (
          <Typography
            onClick={() => setDetailExpenseId(e.expense_id)}
            sx={{
              fontSize: 13, fontWeight: 700, color: "#1976d2",
              letterSpacing: "0.02em", whiteSpace: "nowrap",
              overflow: "hidden", textOverflow: "ellipsis",
              cursor: "pointer",
              "&:hover": { textDecoration: "underline", color: "#1565C0" },
              transition: "color 0.15s",
            }}
          >
            {e.expense_id}
          </Typography>
        ),
      },
      {
        key: "expense_date",
        label: "Date",
        width: 120,
        render: (e) => (
          <Typography sx={{ fontSize: 13, color: TABLE_TEXT_COLOR, whiteSpace: "nowrap" }}>
            {e.expense_date_formatted ||
              new Date(e.expense_date).toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric",
              })}
          </Typography>
        ),
      },
      {
        key: "vendor_id",
        label: "Vendor",
        width: 200,
        render: (e) => (
          <Box sx={{ maxWidth: 200 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: TABLE_TEXT_COLOR, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {e.vendor_name ?? "—"}
            </Typography>
            {e.company_name && (
              <Typography sx={{ fontSize: 13, color: TABLE_TEXT_COLOR, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {e.company_name}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        key: "category_name",
        label: "Category",
        width: 140,
        render: (e) => (
          <Typography sx={{ fontSize: 13, color: TABLE_TEXT_COLOR, whiteSpace: "nowrap" }}>
            {e.category_name ?? "—"}
          </Typography>
        ),
      },
      {
        key: "total_amount",
        label: "Total (INR)",
        align: "right",
        width: 120,
        render: (e) => (
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1976d2", whiteSpace: "nowrap" }}>
            {INR(e.total_amount)}
          </Typography>
        ),
      },
      {
        key: "paid_amount",
        label: "Paid (INR)",
        align: "right",
        width: 120,
        render: (e) => (
          <Typography sx={{
            fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
            color: Number(e.paid_amount) > 0 ? "#16A34A" : TABLE_TEXT_COLOR,
          }}>
            {INR(e.paid_amount)}
          </Typography>
        ),
      },
      {
        key: "balance_amount",
        label: "Balance (INR)",
        align: "right",
        width: 130,
        render: (e) => {
          const hasBalance = Number(e.balance_amount) > 0;
          return (
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", color: hasBalance ? "#D32F2F" : TABLE_TEXT_COLOR }}>
                {INR(e.balance_amount)}
              </Typography>
              {hasBalance && e.due_date_formatted && (
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: TABLE_TEXT_COLOR, mt: 0.3, whiteSpace: "nowrap" }}>
                  Due: {e.due_date_formatted}
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
        align: "left",
        render: (e) => (
          <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 200 }}>
            <Box sx={{ minWidth: 70 }}>
              <StatusBadge status={e.payment_status} />
            </Box>
            <Box sx={{ width: 110 }}>
              {(e.payment_status === "pending" || e.payment_status === "partial") && (
                <Button
                  size="small" variant="contained" disableElevation
                  onClick={() => setPaymentTarget(e)}
                  sx={{ fontSize: "0.65rem", py: 0.4, px: 1.5, height: 24, width: "100%", whiteSpace: "nowrap", bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" } }}
                >
                  Mark as Paid
                </Button>
              )}
            </Box>
          </Stack>
        ),
      },
      {
        key: "id",
        label: "Actions",
        align: "center",
        width: 90,
        render: (e) => (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => { setEditExpenseId(e.expense_id); setAddDialogOpen(true); }}
              sx={{ color: "#9CA3AF", p: 0.6, borderRadius: 1, "&:hover": { color: "#2563EB", bgcolor: "#EFF6FF" }, transition: "all 0.12s" }}
            >
              <EditOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setDeleteTarget(e.expense_id)}
              sx={{ color: "#9CA3AF", p: 0.6, borderRadius: 1, "&:hover": { color: "#DC2626", bgcolor: "#FEE2E2" }, transition: "all 0.12s" }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        ),
      },
    ],
    [setPaymentTarget]
  );

  if (isLoading && summaryLoading) return <LottieLoader />;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        <Box ref={scrollRef} onScroll={handleScroll} sx={{ flex: 1, overflow: "auto", px: 1, py: 1, display: "flex", flexDirection: "column", gap: 2.5 }}>

          {/* Stats */}
          {summaryLoading || !summary ? <StatsSkeleton /> : <ExpenseStats data={summary} />}

          {/* Tab switcher */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", flexShrink: 0 }}>
            <Tabs
              value={activeTab}
              onChange={(_e, v) => setActiveTab(v)}
              sx={{
                minHeight: 40,
                "& .MuiTab-root": { minHeight: 40, textTransform: "none", fontWeight: 600, fontSize: 13 },
                "& .MuiTabs-indicator": { bgcolor: "#D32F2F" },
                "& .Mui-selected": { color: "#D32F2F !important" },
              }}
            >
              <Tab label="Expenses" />
              <Tab label="Category" />
            </Tabs>
          </Box>

          {activeTab === 1 ? (
            <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
              <CategoryTab typeFilter="E" fixedType="E" />
            </Box>
          ) : (
            <>
              {/* Toolbar */}
              <Box sx={{ px: 1, display: "flex", alignItems: "center", flexShrink: 0, gap: 1.5, flexWrap: "nowrap" }}>
                <TextField
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search expenses, vendors..."
                  size="small"
                  sx={{ flex: 1, minWidth: 0, "& .MuiOutlinedInput-root": { bgcolor: "white", height: 38, fontSize: "0.875rem", borderRadius: 1.5 } }}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 17, color: "#9CA3AF" }} /></InputAdornment> } }}
                />
                <FormControl size="small" sx={{ minWidth: 140, flexShrink: 0 }}>
                  <Select
                    value={statusFilter}
                    onChange={(e) => handleStatusChange(e.target.value as ExpenseStatus | "")}
                    displayEmpty
                    sx={{ bgcolor: "white", height: 38, fontSize: "0.875rem", borderRadius: 1.5 }}
                    renderValue={(value) =>
                      value ? STATUS_STYLES[value as ExpenseStatus]?.label ?? value : "All Status"
                    }
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="partial">Partial</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                  onClick={() => { setEditExpenseId(null); setAddDialogOpen(true); }}
                  disableElevation
                  sx={{ flexShrink: 0, fontSize: 14, fontWeight: 700, bgcolor: "#D32F2F", color: "#fff", px: 2, py: 0.9, borderRadius: 1.5, boxShadow: "0 4px 14px rgba(211,47,47,0.3)", "&:hover": { bgcolor: "#B71C1C" }, whiteSpace: "nowrap" }}
                >
                  Add New Expense
                </Button>
              </Box>

              {/* Table */}
              <Box sx={{ flex: 1, minHeight: 0 }}>
                {isLoading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress size={32} sx={{ color: "#D32F2F" }} />
                  </Box>
                ) : (
                  <DataTable<ExpenseRow>
                    columns={columns}
                    rows={expenses}
                    rowKey={(e) => String(e.id)}
                    maxHeight="100%"
                    emptyMessage={search ? `No expenses found for "${search}"` : "No expenses found."}
                  />
                )}
              </Box>

              {/* Infinite scroll footer */}
              {isFetchingNextPage && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress size={24} sx={{ color: "#D32F2F" }} />
                </Box>
              )}
            </>
          )}
        </Box>

        {/* FAB */}
        <Fab
          color="primary"
          onClick={() => { setEditExpenseId(null); setAddDialogOpen(true); }}
          sx={{ position: "fixed", bottom: 24, right: 24, display: { xs: "flex", md: "none" }, bgcolor: "#D32F2F", boxShadow: "0 8px 24px rgba(211,47,47,0.4)", "&:hover": { bgcolor: "#B71C1C" } }}
        >
          <AddIcon />
        </Fab>

        <AddNewExpenseDialog
          open={addDialogOpen}
          onClose={() => { setAddDialogOpen(false); setEditExpenseId(null); }}
          onSuccess={() => { setAddDialogOpen(false); setEditExpenseId(null); refetch(); refetchSummary(); }}
          editExpenseId={editExpenseId}
        />

        {paymentTarget && (
          <ExpensePaymentDialog
            expense={paymentTarget}
            onClose={() => setPaymentTarget(null)}
            onSuccess={() => { setPaymentTarget(null); refetch(); refetchSummary(); }}
          />
        )}

        <ExpenseDetailDialog
          expenseId={detailExpenseId}
          onClose={() => setDetailExpenseId(null)}
          onEditSuccess={() => { setDetailExpenseId(null); refetch(); refetchSummary(); }}
        />

        <Dialog open={!!deleteTarget} onClose={() => !isDeleting && setDeleteTarget(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
          <DialogTitle sx={{ fontSize: 16, fontWeight: 700 }}>Delete Expense</DialogTitle>
          <DialogContent>
            <Typography sx={{ fontSize: 13, color: "#374151" }}>
              Are you sure you want to delete <strong>{deleteTarget}</strong>? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 2.5, pb: 2, gap: 1 }}>
            <Button onClick={() => setDeleteTarget(null)} disabled={isDeleting} sx={{ color: "#374151", fontWeight: 600 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              disabled={isDeleting}
              startIcon={isDeleting ? <CircularProgress size={14} color="inherit" /> : <DeleteOutlineIcon sx={{ fontSize: 16 }} />}
              onClick={() => deleteTarget && deleteExpense(deleteTarget)}
              disableElevation
              sx={{ fontWeight: 700 }}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
