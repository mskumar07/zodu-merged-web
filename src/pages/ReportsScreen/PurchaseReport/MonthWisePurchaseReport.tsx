import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LottieLoader from "@components/LottieLoader";
import { Box, Grid, MenuItem, Paper, Select, Skeleton, Typography } from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import { useTenantContext } from "@store/tenantContext";
import DataTable, { type ColumnDef } from "@utils/DataTable";
import {
  usePurchaseSummary,
  usePurchaseMonthlyBreakdown,
  useActiveYears,
  type PurchaseMonthlyBreakdownRow,
} from "../usePurchaseReportapi";

const CURRENT_YEAR = new Date().getFullYear();
const fmt = (val: number | undefined) =>
  val != null
    ? `₹ ${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "₹ 0.00";
const fmtSummary = (val: number | undefined) =>
  `₹ ${(val ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  valueColor?: string;
  loading?: boolean;
}

const StatCard = ({ title, value, icon, iconBg, valueColor, loading }: StatCardProps) => (
  <Box sx={{
    bgcolor: "#fff", border: "1px solid #F1F5F9", borderRadius: "8px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)", px: 2, py: 1.5,
    display: "flex", alignItems: "center", gap: 1.5,
    minWidth: 150, flex: "1 1 150px", width: "fit-content",
  }}>
    <Box sx={{
      width: 36, height: 36, borderRadius: "8px", bgcolor: iconBg,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      {icon}
    </Box>
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography sx={{ fontSize: "11px", fontWeight: 500, color: "#64748B", whiteSpace: "nowrap" }}>
        {title}
      </Typography>
      {loading ? (
        <Skeleton width={80} height={24} sx={{ borderRadius: 1, mt: 0.5 }} />
      ) : (
        <Typography sx={{ fontSize: "1.05rem", fontWeight: 800, color: valueColor || "#0F172A", lineHeight: 1.3, whiteSpace: "nowrap" }}>
          {value}
        </Typography>
      )}
    </Box>
  </Box>
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

const MonthWisePurchaseReport = () => {
  const { zoduId, branchId, businessType } = useTenantContext();
  const isRestaurant = businessType?.toLowerCase() === "restaurant";

  const { data: activeYears = [CURRENT_YEAR], isLoading: yearsLoading } = useActiveYears({
    zodu_id: zoduId ?? "",
    branch_id: branchId ?? "",
    isRestaurant,
  });

  const [year, setYear] = useState<number>(CURRENT_YEAR);
  const selectedYear = activeYears.includes(year) ? year : (activeYears[0] ?? CURRENT_YEAR);

  const apiParams = {
    zodu_id: zoduId ?? "",
    branch_id: branchId ?? "",
    year: selectedYear,
    isRestaurant,
  };

  const { data: summary, isLoading: summaryLoading } = usePurchaseSummary(apiParams);
  const {
    data: breakdownPages,
    isLoading: breakdownLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = usePurchaseMonthlyBreakdown({ ...apiParams, limit: 12 });

  const rows: PurchaseMonthlyBreakdownRow[] = useMemo(
    () => breakdownPages?.pages.flatMap((page) => page.data ?? []) ?? [],
    [breakdownPages],
  );

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useInfiniteScroll(hasNextPage, fetchNextPage, isFetchingNextPage, tableContainerRef as React.RefObject<HTMLDivElement | null>);

  const columns = useMemo<ColumnDef<PurchaseMonthlyBreakdownRow>[]>(
    () => [
      {
        key: "month",
        label: "Month",
        minWidth: 120,
        render: (row) => (
          <Typography sx={{ fontSize: "0.8rem", color: "#000", fontWeight: 500, whiteSpace: "nowrap" }}>
            {row.month}
          </Typography>
        ),
      },
      {
        key: "purchaseCount",
        label: "Purchase Count",
        align: "center",
        minWidth: 130,
        render: (row) => row.purchaseCount ?? "—",
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
      {
        key: "pendingAmount",
        label: "Pending Amount",
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
        label: "Paid Amount",
        align: "right",
        minWidth: 130,
        render: (row) => (
          <Typography sx={{ fontSize: "0.8rem", fontWeight: "bold", color: "#2e7d32", whiteSpace: "nowrap" }}>
            {fmt(row.paidAmount)}
          </Typography>
        ),
      },
    ],
    [],
  );

  if (summaryLoading) return <LottieLoader />;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", p: { xs: 1, md: 1 }, background: "#fff", gap: 1.5 }}>
      {/* STAT CARDS */}
      <Grid container spacing={1.5} sx={{ flexShrink: 0 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={summaryLoading}
            title="Total Purchase"
            value={summary?.totalPurchase != null ? String(Math.floor(summary.totalPurchase)) : "0"}
            iconBg="#e3f2fd"
            icon={<ShoppingCartOutlinedIcon sx={{ color: "#1976d2", fontSize: 18 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={summaryLoading}
            title="Total Amount"
            value={fmtSummary(summary?.totalAmount)}
            iconBg="#e8f5e9"
            icon={<CalendarTodayOutlinedIcon sx={{ color: "#388e3c", fontSize: 18 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={summaryLoading}
            title="Pending Amount"
            value={fmtSummary(summary?.pendingAmount)}
            iconBg="#fff3e0"
            icon={<AccountBalanceWalletOutlinedIcon sx={{ color: "#f57c00", fontSize: 18 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={summaryLoading}
            title="Paid Amount"
            value={fmtSummary(summary?.paidAmount)}
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
                Monthly Purchase Breakdown — {selectedYear}
              </Typography>

              {yearsLoading ? (
                <Skeleton width={90} height={32} sx={{ borderRadius: 1 }} />
              ) : (
                <Select
                  size="small"
                  value={selectedYear}
                  onChange={(e) => setYear(Number(e.target.value))}
                  sx={{ fontSize: "0.8rem", height: 32, minWidth: 90 }}
                >
                  {activeYears.map((y: number) => (
                    <MenuItem key={y} value={y} sx={{ fontSize: "0.85rem" }}>{y}</MenuItem>
                  ))}
                </Select>
              )}
            </Box>

            <Box sx={{ flex: 1, minHeight: 0 }}>
              <DataTable<PurchaseMonthlyBreakdownRow>
                columns={columns}
                rows={rows}
                rowKey={(row) => `${row.month}-${row.totalAmount}-${row.purchaseCount}`}
                isLoading={breakdownLoading}
                skeletonRows={6}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                loadMoreRef={loadMoreRef}
                tableContainerRef={tableContainerRef}
                maxHeight="100%"
                emptyMessage={`No purchase data available for ${selectedYear}`}
              />
            </Box>

            <Box sx={{ px: 2, py: 1, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f0f0f0", flexShrink: 0 }}>
              <Typography variant="caption" color="text.secondary">
                {rows.length > 0
                  ? `Showing ${rows.length} month${rows.length !== 1 ? "s" : ""} · ${selectedYear}`
                  : `Full year performance · ${selectedYear}`}
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

export default MonthWisePurchaseReport;
