import { useCallback, useMemo, useRef, useState } from "react";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import MoneyOffOutlinedIcon from "@mui/icons-material/MoneyOffOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import DataTable, { type ColumnDef } from "@utils/DataTable";
import { useTenantContext } from "@store/tenantContext";
import { DateRangeChip } from "@components/Reports/utils/DateRangeChip";
import {
  useCategorywiseExpenseSummary,
  useCategorywiseExpenseBreakdown,
  type CategorywiseExpenseBreakdownRow,
} from "../useExpenseReportapi";
import {
  StatCard,
  fmt,
  fmtSummary,
  toLocalISODate,
  useInfiniteScroll,
} from "./expenseReportShared";

const today = new Date();
const monthStart = toLocalISODate(new Date(today.getFullYear(), today.getMonth(), 1));
const todayStr = toLocalISODate(today);

const columns: ColumnDef<CategorywiseExpenseBreakdownRow>[] = [
  {
    key: "categoryName",
    label: "Category Name",
    minWidth: 180,
    render: (row) => (
      <Typography sx={{ fontSize: "0.8rem", color: "#000" }}>{row.categoryName}</Typography>
    ),
  },
  {
    key: "expenseCount",
    label: "Total Expense",
    align: "center",
    minWidth: 110,
    render: (row) => row.expenseCount,
  },
  {
    key: "totalAmount",
    label: "Total Amount",
    align: "right",
    minWidth: 130,
    render: (row) => (
      <Typography sx={{ fontSize: "0.8rem", color: "#1565C0", fontWeight: 500, whiteSpace: "nowrap" }}>
        {fmt(row.totalAmount)}
      </Typography>
    ),
  },
];

const rowKey = (row: CategorywiseExpenseBreakdownRow) => `${row.expenseDate}|${row.categoryId || row.categoryName}`;

const CategorywiseExpenseReport = () => {
  const { zoduId, branchId, businessType } = useTenantContext();
  const isRestaurant = businessType?.toLowerCase() === "restaurant";
  const [fromDate, setFromDate] = useState(monthStart);
  const [toDate, setToDate] = useState(todayStr);
  const hasActiveFilters = fromDate !== monthStart || toDate !== todayStr;

  const params = useMemo(
    () => ({
      zodu_id: zoduId ?? "",
      branch_id: branchId ?? "",
      from_date: fromDate,
      to_date: toDate,
      isRestaurant,
    }),
    [zoduId, branchId, fromDate, toDate, isRestaurant],
  );

  const { data: summary, isLoading: summaryLoading } = useCategorywiseExpenseSummary(params);
  const {
    data: breakdownPages,
    isLoading: breakdownLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useCategorywiseExpenseBreakdown({ ...params, limit: 15 });

  const rows = useMemo(
    () => breakdownPages?.pages.flatMap((page) => page.data ?? []) ?? [],
    [breakdownPages],
  );

  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useInfiniteScroll(hasNextPage, fetchNextPage, isFetchingNextPage, tableContainerRef);

  const clearFilters = useCallback(() => {
    setFromDate(monthStart);
    setToDate(todayStr);
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", p: 1, background: "#fff", gap: 1.5 }}>
      {/* STAT CARDS — render immediately with skeletons instead of blocking the whole screen */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, flexShrink: 0 }}>
          <StatCard
            loading={summaryLoading}
            title="Total Expense"
            value={String(Math.floor(summary?.totalExpense ?? 0))}
            iconBg="#fff8e1"
            icon={<MoneyOffOutlinedIcon sx={{ color: "#fbc02d", fontSize: 18 }} />}
          />
          <StatCard
            loading={summaryLoading}
            title="Total Amount"
            value={fmtSummary(summary?.totalAmount)}
            iconBg="#e8f5e9"
            icon={<CalendarTodayOutlinedIcon sx={{ color: "#388e3c", fontSize: 18 }} />}
          />
          <StatCard
            loading={summaryLoading}
            title="Pending Amount"
            value={fmtSummary(summary?.pendingAmount)}
            iconBg="#fff3e0"
            icon={<AccountBalanceWalletOutlinedIcon sx={{ color: "#f57c00", fontSize: 18 }} />}
          />
          <StatCard
            loading={summaryLoading}
            title="Paid Amount"
            value={fmtSummary(summary?.paidAmount)}
            valueColor="#2e7d32"
            iconBg="#fce4ec"
            icon={<PaymentsOutlinedIcon sx={{ color: "#c62828", fontSize: 18 }} />}
          />
      </Box>

      {/* DATE FILTER BAR */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, alignItems: "center", flexShrink: 0 }}>
        <Button
          variant="outlined"
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          sx={{ borderRadius: 1, px: 1.6, textTransform: "none", fontWeight: 700, borderColor: "#E5E7EB", color: "#6B7280" }}
        >
          Clear Filters
        </Button>
        <DateRangeChip fromDate={fromDate} toDate={toDate} onFromDateChange={setFromDate} onToDateChange={setToDate} />
      </Box>

      {/* TABLE */}
      <Box sx={{ display: "flex", gap: 1.5, flex: 1, overflow: "hidden", minHeight: 0, flexDirection: { xs: "column", lg: "row" } }}>
        <Box sx={{ width: { xs: "100%", lg: "40%" }, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
        <Paper sx={{ borderRadius: 1, border: "1px solid #eee", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
          <Box sx={{ px: 2, pt: 1.5, pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <Stack direction="row" spacing={0.8} alignItems="center">
              <Box sx={{ width: 3, height: 18, bgcolor: "#D92D20", borderRadius: 99 }} />
              <Typography fontWeight="bold" fontSize="0.9rem">Category-wise Expenses</Typography>
            </Stack>
            <Chip label={`${breakdownPages?.pages[0]?.total ?? rows.length} records`} size="small" sx={{ height: 18, fontSize: 9, bgcolor: "#F4F4F5" }} />
          </Box>

          <Box sx={{ flex: 1, minHeight: 0 }}>
            <DataTable<CategorywiseExpenseBreakdownRow>
              columns={columns}
              rows={rows}
              rowKey={rowKey}
              isLoading={breakdownLoading}
              skeletonRows={7}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              loadMoreRef={loadMoreRef}
              tableContainerRef={tableContainerRef}
              maxHeight="100%"
              emptyMessage="No category expenses found"
            />
          </Box>

          <Box sx={{ px: 2, py: 1, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f0f0f0", flexShrink: 0 }}>
            <Typography variant="caption" color="text.secondary">
              {rows.length > 0 ? `Showing ${rows.length} record${rows.length !== 1 ? "s" : ""}` : "No category data"}
            </Typography>
            {hasNextPage && !isFetchingNextPage && (
              <Typography variant="caption" color="text.secondary">Scroll for more</Typography>
            )}
          </Box>
        </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default CategorywiseExpenseReport;
