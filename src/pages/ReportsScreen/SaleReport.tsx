import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Box, Button, Card, Grid, Paper, Skeleton, Typography } from "@mui/material";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import { useTenantContext } from "@store/tenantContext";
import DataTable, { type ColumnDef } from "@utils/DataTable";
import {
  useSalesSummary,
  useSalesMonthlyBreakdown,
  useSalesHistorical,
  useRestaurantMonthwiseSaleReport,
  type MonthlyBreakdownRow,
  type HistoricalYear,
  type RestaurantMonthwiseSummaryRow,
} from "./useReportapi";

const CURRENT_YEAR = new Date().getFullYear();
const fmt = (val: number | undefined) =>
  val != null
    ? `₹ ${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "₹ 0.00";

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
  const {
    data: pages,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useRestaurantMonthwiseSaleReport({
    zodu_id: zoduId,
    branch_id: branchId,
    year: CURRENT_YEAR,
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
        label: "MONTH",
        minWidth: 160,
        render: (row) => (
          <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#111827", whiteSpace: "nowrap" }}>
            {row.month}
          </Typography>
        ),
      },
      {
        key: "total_orders",
        label: "TOTAL ORDERS",
        align: "center",
        minWidth: 120,
        render: (row) => row.total_orders,
      },
      {
        key: "total_amount",
        label: "TOTAL AMOUNT",
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
            value={fmt(totalAmount)}
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
              <Typography fontWeight="bold" fontSize="0.9rem">Month-wise Orders Breakdown — {CURRENT_YEAR}</Typography>
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
                emptyMessage={`No order data available for ${CURRENT_YEAR}`}
              />
            </Box>
            <Box sx={{ px: 2, py: 1, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f0f0f0", flexShrink: 0 }}>
              <Typography variant="caption" color="text.secondary">
                {rows.length > 0 ? `Showing ${rows.length} month${rows.length !== 1 ? "s" : ""} · ${CURRENT_YEAR}` : `Full year performance · ${CURRENT_YEAR}`}
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

  const apiParams = {
    zodu_id: zoduId ?? "",
    branch_id: branchId ?? "",
    year: CURRENT_YEAR,
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
  const { data: historical, isLoading: historicalLoading } = useSalesHistorical({
    zodu_id: zoduId ?? "",
    branch_id: branchId ?? "",
    disabled: isRestaurant,
    isRestaurant,
  });

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

  const histYears: HistoricalYear[] = Array.isArray(historical) ? historical : [];
  const maxSales = Math.max(...histYears.map((year) => year.netSales), 1);
  const peakRevenue = Math.max(...histYears.map((year) => year.netSales), 0);
  const avgGrowth =
    histYears.length > 1
      ? (
          histYears.slice(1).reduce((acc, cur, index) => {
            const prev = histYears[index].netSales;
            return acc + (prev > 0 ? ((cur.netSales - prev) / prev) * 100 : 0);
          }, 0) /
          (histYears.length - 1)
        ).toFixed(1)
      : "—";

  const growthVal =
    summary?.growthPercent != null
      ? `${summary.growthPercent >= 0 ? "+" : ""}${summary.growthPercent}%`
      : "—";
  const avgGrowthDisplay = Number.isFinite(Number(avgGrowth)) ? `+${avgGrowth}%` : "—";

  const columns = useMemo<ColumnDef<MonthlyBreakdownRow>[]>(
    () => [
      {
        key: "month",
        label: "MONTH",
        minWidth: 120,
        render: (row) => (
          <Typography sx={{ fontSize: "0.8rem", color: "#111827", fontWeight: 500, whiteSpace: "nowrap" }}>
            {row.month}
          </Typography>
        ),
      },
      {
        key: "bills",
        label: "BILLS",
        align: "center",
        minWidth: 90,
        render: (row) => row.bills ?? "—",
      },
      {
        key: "TOTAL AMOUNT",
        label: "TOTAL AMOUNT",
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
        label: "TAX",
        align: "right",
        minWidth: 100,
        render: (row) => fmt(row.tax),
      },
      {
        key: "netSales",
        label: "NET SALES",
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
            value={fmt(summary?.totalMonthlySales)}
            iconBg="#fff3e0"
            icon={<ShoppingBagOutlinedIcon sx={{ color: "#f57c00", fontSize: 18 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={summaryLoading}
            title="Total Yearly Sales"
            value={fmt(summary?.totalYearlySales)}
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
                Monthly Sales Breakdown — {CURRENT_YEAR}
              </Typography>
              <TuneOutlinedIcon sx={{ fontSize: 17, color: "text.secondary", cursor: "pointer" }} />
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
                emptyMessage={`No data available for ${CURRENT_YEAR}`}
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
                  ? `Showing ${rows.length} month${rows.length !== 1 ? "s" : ""} · ${CURRENT_YEAR}`
                  : `Full year performance · ${CURRENT_YEAR}`}
              </Typography>
              {hasNextPage && !isFetchingNextPage && (
                <Typography variant="caption" color="text.secondary">
                  Scroll for more
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>

        <Box
          sx={{
            minWidth: 100,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            minHeight: 200,
            overflow: "hidden",
          }}
        >
          <Card elevation={1} sx={{ p: 2, borderRadius: 1.5, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <Typography fontWeight="bold" fontSize="0.9rem" mb={2}>
              Historical Performance
            </Typography>

            {historicalLoading ? (
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-end", flex: 1, minHeight: 100 }}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} variant="rectangular" sx={{ flex: 1, height: `${30 + index * 15}%` }} />
                ))}
              </Box>
            ) : (
              <>
                <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1.5, flex: 1, minHeight: 100, pb: 0.5 }}>
                  {histYears.map((year, index) => {
                    const isLatest = index === histYears.length - 1;
                    const heightPct = maxSales > 0 ? Math.round((year.netSales / maxSales) * 100) : 10;
                    return (
                      <Box
                        key={year.year}
                        sx={{
                          flex: 1,
                          height: `${heightPct}%`,
                          minHeight: 6,
                          bgcolor: isLatest ? "error.main" : "#e0e0e0",
                          borderRadius: "4px 4px 0 0",
                        }}
                      />
                    );
                  })}
                </Box>

                <Box sx={{ display: "flex", gap: 1.5, mt: 0.5 }}>
                  {histYears.map((year, index) => {
                    const isLatest = index === histYears.length - 1;
                    return (
                      <Typography
                        key={year.year}
                        variant="caption"
                        sx={{
                          flex: 1,
                          textAlign: "center",
                          color: isLatest ? "error.main" : "text.secondary",
                          fontWeight: isLatest ? 700 : 400,
                          fontSize: "0.68rem",
                        }}
                      >
                        {year.year}
                      </Typography>
                    );
                  })}
                </Box>
              </>
            )}

            <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Peak Annual Revenue
                </Typography>
                <Typography fontWeight="bold" fontSize="0.9rem">
                  {historicalLoading ? <Skeleton width={70} /> : fmt(peakRevenue)}
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography variant="caption" color="text.secondary">
                  Average Growth
                </Typography>
                <Typography fontWeight="bold" fontSize="0.9rem" color="success.main">
                  {historicalLoading ? <Skeleton width={50} /> : avgGrowthDisplay}
                </Typography>
              </Box>
            </Box>
          </Card>

          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 1.5,
              bgcolor: "#c62828",
              flexShrink: 0,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                width: 80,
                height: 80,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.15)",
                top: -20,
                right: 20,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                width: 120,
                height: 120,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.1)",
                top: -40,
                right: -10,
              }}
            />
            <Typography fontWeight="bold" fontSize="0.95rem" color="#fff" mb={1}>
              Smart Forecast
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.6, display: "block", mb: 2 }}
            >
              Based on {CURRENT_YEAR} trends, Q3 is expected to see a 12% surge in premium category sales. We recommend stocking up by August.
            </Typography>
            <Button
              variant="contained"
              size="small"
              sx={{
                bgcolor: "#fff",
                color: "#c62828",
                fontWeight: 700,
                fontSize: "0.75rem",
                textTransform: "none",
                borderRadius: 1,
                px: 2,
                "&:hover": { bgcolor: "#f5f5f5" },
              }}
            >
              View Strategy
            </Button>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default SalesReport;
