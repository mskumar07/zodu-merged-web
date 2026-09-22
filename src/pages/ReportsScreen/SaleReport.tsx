import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LottieLoader from "@components/LottieLoader";
import { Box, Grid, MenuItem, Paper, Select, Skeleton, Typography } from "@mui/material";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import { useTenantContext } from "@store/tenantContext";
import DataTable, { type ColumnDef } from "@utils/DataTable";
import {
  useSalesSummary,
  useSalesMonthlyBreakdown,
  useRestaurantMonthwiseSaleReport,
  type MonthlyBreakdownRow,
  type RestaurantMonthwiseSummaryRow,
} from "./useReportapi";
import { useActiveYears } from "./usePurchaseReportapi";

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

const RestaurantMonthwiseReport = ({
  zoduId,
  branchId,
}: {
  zoduId: string;
  branchId: string;
}) => {
  const { data: activeYears = [CURRENT_YEAR], isLoading: yearsLoading } = useActiveYears({
    zodu_id: zoduId,
    branch_id: branchId,
    isRestaurant: true,
  });

  const [year, setYear] = useState<number>(CURRENT_YEAR);
  const selectedYear = activeYears.includes(year) ? year : (activeYears[0] ?? CURRENT_YEAR);

  const {
    data: pages,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useRestaurantMonthwiseSaleReport({
    zodu_id: zoduId,
    branch_id: branchId,
    year: selectedYear,
    limit: 12,
  });

  const rows: RestaurantMonthwiseSummaryRow[] = useMemo(
    () => pages?.pages.flatMap((p) => p.data ?? []) ?? [],
    [pages],
  );

  const summary = pages?.pages[0];
  const totalAmount = summary?.totalAmount ?? 0;
  const totalItems = summary?.totalItems ?? 0;
  const totalOrders = rows.reduce((acc, r) => acc + r.total_orders, 0);

  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { root: tableContainerRef.current ?? null, threshold: 0.1 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const columns = useMemo<ColumnDef<RestaurantMonthwiseSummaryRow>[]>(
    () => [
      {
        key: "month",
        label: "Month",
        minWidth: 160,
        render: (row) => (
          <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#111827", whiteSpace: "nowrap" }}>
            {row.month}
          </Typography>
        ),
      },
      {
        key: "total_orders",
        label: "Total Orders",
        align: "center",
        minWidth: 120,
        render: (row) => row.total_orders,
      },
      {
        key: "total_amount",
        label: "Total Amount",
        align: "right",
        minWidth: 140,
        render: (row) => (
          <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#1976D2", whiteSpace: "nowrap" }}>
            {fmt(row.total_amount)}
          </Typography>
        ),
      },
    ],
    [],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", p: { xs: 1, md: 1 }, background: "#fff", gap: 1.5 }}>
      <Grid container spacing={1.5} sx={{ flexShrink: 0 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            loading={isLoading}
            title="Total Orders"
            value={totalOrders.toLocaleString("en-IN")}
            iconBg="#fff3e0"
            icon={<ShoppingBagOutlinedIcon sx={{ color: "#f57c00", fontSize: 18 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            loading={isLoading}
            title="Total Amount"
            value={fmtSummary(totalAmount)}
            iconBg="#e8f5e9"
            icon={<CalendarTodayOutlinedIcon sx={{ color: "#388e3c", fontSize: 18 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            loading={isLoading}
            title="Total Items"
            value={totalItems.toLocaleString("en-IN")}
            iconBg="#e3f2fd"
            icon={<InventoryOutlinedIcon sx={{ color: "#1976d2", fontSize: 18 }} />}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Paper sx={{ borderRadius: 1, border: "1px solid #eee", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
            <Box sx={{ px: 2, pt: 1.5, pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <Typography fontWeight="bold" fontSize="0.9rem">Month-wise Orders Breakdown — {selectedYear}</Typography>

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
              <DataTable<RestaurantMonthwiseSummaryRow>
                columns={columns}
                rows={rows}
                rowKey={(row) => row.month}
                isLoading={isLoading}
                skeletonRows={6}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                loadMoreRef={sentinelRef as React.RefObject<HTMLTableRowElement>}
                tableContainerRef={tableContainerRef}
                maxHeight="100%"
                emptyMessage={`No order data available for ${selectedYear}`}
              />
            </Box>
            <Box sx={{ px: 2, py: 1, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f0f0f0", flexShrink: 0 }}>
              <Typography variant="caption" color="text.secondary">
                {rows.length > 0 ? `Showing ${rows.length} month${rows.length !== 1 ? "s" : ""} · ${selectedYear}` : `Full year performance · ${selectedYear}`}
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

const SalesReport = () => {
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

  const { data: summary, isLoading: summaryLoading } = useSalesSummary({ ...apiParams, disabled: isRestaurant });
  const {
    data: breakdownPages,
    isLoading: breakdownLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useSalesMonthlyBreakdown({ ...apiParams, limit: 12, disabled: isRestaurant });

  const rows: MonthlyBreakdownRow[] = useMemo(
    () => breakdownPages?.pages.flatMap((page) => page.data ?? []) ?? [],
    [breakdownPages],
  );

  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useInfiniteScroll(
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    tableContainerRef,
  );

  if (isRestaurant) {
    return (
      <RestaurantMonthwiseReport
        zoduId={zoduId ?? ""}
        branchId={branchId ?? ""}
      />
    );
  }

  const growthVal =
    summary?.growthPercent != null
      ? `${summary.growthPercent >= 0 ? "+" : ""}${summary.growthPercent}%`
      : "—";

  const columns = useMemo<ColumnDef<MonthlyBreakdownRow>[]>(
    () => [
      {
        key: "month",
        label: "Month",
        minWidth: 120,
        render: (row) => (
          <Typography sx={{ fontSize: "0.8rem", color: "#111827", fontWeight: 500, whiteSpace: "nowrap" }}>
            {row.month}
          </Typography>
        ),
      },
      {
        key: "bills",
        label: "Bills",
        align: "center",
        minWidth: 90,
        render: (row) => row.bills ?? "—",
      },
      {
        key: "TOTAL AMOUNT",
        label: "Total Amount",
        align: "right",
        minWidth: 120,
        render: (row) => (
          <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#1976D2", whiteSpace: "nowrap" }}>
            {fmt(row.subtotal)}
          </Typography>
        ),
      },
      {
        key: "tax",
        label: "Tax",
        align: "right",
        minWidth: 100,
        render: (row) => fmt(row.tax),
      },
      {
        key: "netSales",
        label: "Net Sales",
        align: "right",
        minWidth: 130,
        render: (row) => (
          <Typography sx={{ fontSize: "0.8rem", fontWeight: "bold", color: "#16A34A", whiteSpace: "nowrap" }}>
            {fmt(row.netSales)}
          </Typography>
        ),
      },
    ],
    [],
  );

  if (summaryLoading) return <LottieLoader />;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        p: { xs: 1, md: 1 },
        background: "#fff",
        gap: 1.5,
      }}
    >
      <Grid container spacing={1.5} sx={{ flexShrink: 0 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={summaryLoading}
            title="Total Monthly Sales"
            value={fmtSummary(summary?.totalMonthlySales)}
            iconBg="#fff3e0"
            icon={<ShoppingBagOutlinedIcon sx={{ color: "#f57c00", fontSize: 18 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={summaryLoading}
            title="Total Yearly Sales"
            value={fmtSummary(summary?.totalYearlySales)}
            iconBg="#e8f5e9"
            icon={<CalendarTodayOutlinedIcon sx={{ color: "#388e3c", fontSize: 18 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={summaryLoading}
            title="Growth vs Last Year"
            value={growthVal}
            valueColor="#2e7d32"
            iconBg="#e3f2fd"
            icon={<TrendingUpOutlinedIcon sx={{ color: "#1976d2", fontSize: 18 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={summaryLoading}
            title="Top Performing Month"
            value={summary?.topMonth ?? "—"}
            iconBg="#fce4ec"
            icon={<StarOutlineIcon sx={{ color: "#c62828", fontSize: 18 }} />}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", gap: 1.5, flex: 1, overflow: "hidden", minHeight: 0 }}>
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Paper
            sx={{
              borderRadius: 1,
              border: "1px solid #eee",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 2,
                pt: 1.5,
                pb: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <Typography fontWeight="bold" fontSize="0.9rem">
                Monthly Sales Breakdown — {selectedYear}
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
              <DataTable<MonthlyBreakdownRow>
                columns={columns}
                rows={rows}
                rowKey={(row) => `${row.month}-${row.netSales}-${row.bills}`}
                isLoading={breakdownLoading}
                skeletonRows={6}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                loadMoreRef={loadMoreRef}
                tableContainerRef={tableContainerRef}
                maxHeight="100%"
                emptyMessage={`No data available for ${selectedYear}`}
              />
            </Box>

            <Box
              sx={{
                px: 2,
                py: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: "1px solid #f0f0f0",
                flexShrink: 0,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {rows.length > 0
                  ? `Showing ${rows.length} month${rows.length !== 1 ? "s" : ""} · ${selectedYear}`
                  : `Full year performance · ${selectedYear}`}
              </Typography>
              {hasNextPage && !isFetchingNextPage && (
                <Typography variant="caption" color="text.secondary">
                  Scroll for more
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default SalesReport;
