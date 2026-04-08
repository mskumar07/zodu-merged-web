import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Box, Button, Card, Grid, Paper, Skeleton, Typography } from "@mui/material";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { getTenantContext } from "@store/tenantContext";
import DataTable, { type ColumnDef } from "@utils/DataTable";
import {
  useSalesSummary,
  useSalesMonthlyBreakdown,
  useSalesHistorical,
  type MonthlyBreakdownRow,
  type HistoricalYear,
} from "./useReportapi";

const CURRENT_YEAR = new Date().getFullYear();

const fmt = (val: number | undefined) =>
  val != null ? `₹${val.toLocaleString("en-IN")}` : "—";

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
          <Typography
            fontWeight="bold"
            mt={0.5}
            sx={{ fontSize: 18, lineHeight: 1.3, color: valueColor || "text.primary" }}
          >
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

const SalesReport = () => {
  const { zoduId, branchId } = getTenantContext();

  const apiParams = {
    zodu_id: zoduId ?? "",
    branch_id: branchId ?? "",
    year: CURRENT_YEAR,
  };

  const { data: summary, isLoading: summaryLoading } = useSalesSummary(apiParams);
  const {
    data: breakdownPages,
    isLoading: breakdownLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useSalesMonthlyBreakdown({ ...apiParams, limit: 12 });
  const { data: historical, isLoading: historicalLoading } = useSalesHistorical({
    zodu_id: zoduId ?? "",
    branch_id: branchId ?? "",
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
          <Typography sx={{ fontSize: "0.8rem", color: "primary.main", fontWeight: 500, whiteSpace: "nowrap" }}>
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
        key: "subtotal",
        label: "SUBTOTAL",
        align: "right",
        minWidth: 120,
        render: (row) => fmt(row.subtotal),
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
          <Typography sx={{ fontSize: "0.8rem", fontWeight: "bold", whiteSpace: "nowrap" }}>
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
