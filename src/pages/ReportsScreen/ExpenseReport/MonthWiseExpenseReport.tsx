import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Box, Card, Grid, Paper, Skeleton, Typography } from "@mui/material";
import MoneyOffOutlinedIcon from "@mui/icons-material/MoneyOffOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { useTenantContext } from "@store/tenantContext";
import DataTable, { type ColumnDef } from "@utils/DataTable";
import {
  useExpenseSummary,
  useExpenseMonthlyBreakdown,
  type ExpenseMonthlyBreakdownRow,
} from "../useExpenseReportapi";

const CURRENT_YEAR = new Date().getFullYear();
const fmt = (val: number | undefined) =>
  val != null ? `₹ ${Math.round(val).toLocaleString("en-IN")}` : "0";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  valueColor?: string;
  loading?: boolean;
}

const StatCard = ({ title, value, icon, iconBg, valueColor, loading }: StatCardProps) => (
  <Card sx={{ p: 1.5, borderRadius: 1, height: "100%" }} elevation={1}>
    <Box display="flex" justifyContent="space-between" gap={1} alignItems="center">
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          bgcolor: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box flex={1}>
        <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ letterSpacing: 0.3 }}>
          {title}
        </Typography>
        {loading ? (
          <Skeleton width={90} height={24} />
        ) : (
          <Typography fontWeight="bold" mt={0.5} sx={{ fontSize: 18, lineHeight: 1.3, color: valueColor || "text.primary" }}>
            {value}
          </Typography>
        )}
      </Box>
    </Box>
  </Card>
);

function useInfiniteScroll(
  hasNextPage: boolean | undefined,
  fetchNextPage: () => void,
  isFetchingNextPage: boolean,
  scrollContainerRef: React.RefObject<HTMLDivElement | null>,
): React.RefObject<HTMLTableRowElement> {
  const sentinelRef = useRef<HTMLTableRowElement | null>(null);
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(handleObserver, {
      root: scrollContainerRef.current ?? null,
      threshold: 0.1,
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [handleObserver, scrollContainerRef]);

  return sentinelRef as React.RefObject<HTMLTableRowElement>;
}

const MonthWiseExpenseReport = () => {
  const { zoduId, branchId } = useTenantContext();

  const apiParams = {
    zodu_id: zoduId ?? "",
    branch_id: branchId ?? "",
    year: CURRENT_YEAR,
  };

  const { data: summary, isLoading: summaryLoading } = useExpenseSummary(apiParams);
  const {
    data: breakdownPages,
    isLoading: breakdownLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useExpenseMonthlyBreakdown({ ...apiParams, limit: 12 });

  const rows: ExpenseMonthlyBreakdownRow[] = useMemo(
    () => breakdownPages?.pages.flatMap((page) => page.data ?? []) ?? [],
    [breakdownPages],
  );

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useInfiniteScroll(hasNextPage, fetchNextPage, isFetchingNextPage, tableContainerRef as React.RefObject<HTMLDivElement | null>);

  const columns = useMemo<ColumnDef<ExpenseMonthlyBreakdownRow>[]>(
    () => [
      {
        key: "month",
        label: "MONTH",
        minWidth: 120,
        render: (row) => (
          <Typography sx={{ fontSize: "0.8rem", color: "primary.main", fontWeight: 500, whiteSpace: "nowrap" }}>
            {row.month}
          </Typography>
        ),
      },
      {
        key: "expenseCount",
        label: "EXPENSE COUNT",
        align: "center",
        minWidth: 130,
        render: (row) => row.expenseCount ?? "—",
      },
      {
        key: "totalAmount",
        label: "TOTAL AMOUNT",
        align: "right",
        minWidth: 130,
        render: (row) => fmt(row.totalAmount),
      },
      {
        key: "pendingAmount",
        label: "PENDING AMOUNT",
        align: "right",
        minWidth: 140,
        render: (row) => (
          <Typography sx={{ fontSize: "0.8rem", color: "#f57c00", whiteSpace: "nowrap" }}>
            {fmt(row.pendingAmount)}
          </Typography>
        ),
      },
      {
        key: "paidAmount",
        label: "PAID AMOUNT",
        align: "right",
        minWidth: 130,
        render: (row) => (
          <Typography sx={{ fontSize: "0.8rem", fontWeight: "bold", whiteSpace: "nowrap" }}>
            {fmt(row.paidAmount)}
          </Typography>
        ),
      },
    ],
    [],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", p: { xs: 1, md: 1 }, background: "#fff", gap: 1.5 }}>
      {/* STAT CARDS */}
      <Grid container spacing={1.5} sx={{ flexShrink: 0 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={summaryLoading}
            title="Total Expense"
            value={summary?.totalExpense != null ? summary.totalExpense.toLocaleString("en-IN") : "—"}
            iconBg="#fff8e1"
            icon={<MoneyOffOutlinedIcon sx={{ color: "#fbc02d", fontSize: 18 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={summaryLoading}
            title="Total Amount"
            value={fmt(summary?.totalAmount)}
            iconBg="#e8f5e9"
            icon={<CalendarTodayOutlinedIcon sx={{ color: "#388e3c", fontSize: 18 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={summaryLoading}
            title="Pending Amount"
            value={fmt(summary?.pendingAmount)}
            iconBg="#fff3e0"
            icon={<AccountBalanceWalletOutlinedIcon sx={{ color: "#f57c00", fontSize: 18 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={summaryLoading}
            title="Paid Amount"
            value={fmt(summary?.paidAmount)}
            valueColor="#2e7d32"
            iconBg="#fce4ec"
            icon={<PaymentsOutlinedIcon sx={{ color: "#c62828", fontSize: 18 }} />}
          />
        </Grid>
      </Grid>

      {/* TABLE */}
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Paper sx={{ borderRadius: 1, border: "1px solid #eee", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
            <Box sx={{ px: 2, pt: 1.5, pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <Typography fontWeight="bold" fontSize="0.9rem">
                Monthly Expense Breakdown — {CURRENT_YEAR}
              </Typography>
              <TuneOutlinedIcon sx={{ fontSize: 17, color: "text.secondary", cursor: "pointer" }} />
            </Box>

            <Box sx={{ flex: 1, minHeight: 0 }}>
              <DataTable<ExpenseMonthlyBreakdownRow>
                columns={columns}
                rows={rows}
                rowKey={(row) => `${row.month}-${row.totalAmount}-${row.expenseCount}`}
                isLoading={breakdownLoading}
                skeletonRows={6}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                loadMoreRef={loadMoreRef}
                tableContainerRef={tableContainerRef}
                maxHeight="100%"
                emptyMessage={`No expense data available for ${CURRENT_YEAR}`}
              />
            </Box>

            <Box sx={{ px: 2, py: 1, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f0f0f0", flexShrink: 0 }}>
              <Typography variant="caption" color="text.secondary">
                {rows.length > 0
                  ? `Showing ${rows.length} month${rows.length !== 1 ? "s" : ""} · ${CURRENT_YEAR}`
                  : `Full year performance · ${CURRENT_YEAR}`}
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

export default MonthWiseExpenseReport;
