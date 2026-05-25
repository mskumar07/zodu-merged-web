import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Box, Card, Grid, Paper, Skeleton, Typography,
} from "@mui/material";
import TrendingUpOutlinedIcon   from "@mui/icons-material/TrendingUpOutlined";
import ShoppingBagOutlinedIcon  from "@mui/icons-material/ShoppingBagOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import MoneyOffOutlinedIcon     from "@mui/icons-material/MoneyOffOutlined";
import { useInfiniteQuery }     from "@tanstack/react-query";
import axios                    from "axios";
import { useTenantContext }     from "@store/tenantContext";
import DataTable, { type ColumnDef } from "@utils/DataTable";

// ── Config ────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";
const PAGE_LIMIT = 10;

const fmt = (val: number) =>
  val != null
    ? `₹ ${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "₹ 0.00";

// ── Types ─────────────────────────────────────────────────────
interface YearRow {
  year:           number;
  total_sales:    number;
  total_purchase: number;
  total_expense:  number;
  profit:         number;
}

interface OverallSummary {
  total_sales:    number;
  total_purchase: number;
  total_expense:  number;
  profit:         number;
}

interface YearWisePageResponse {
  success:         boolean;
  overall_summary: OverallSummary;
  data:            YearRow[];
  pagination: {
    page:       number;
    limit:      number;
    total:      number;
    totalPages: number;
  };
}

// ── Infinite-scroll hook ──────────────────────────────────────
function useYearWiseProfitReport(zoduId: string, branchId: string) {
  return useInfiniteQuery<YearWisePageResponse>({
    queryKey: ["profit-yearwise", zoduId, branchId],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await axios.get(
        `${API_BASE}/restaurant/api/report/profit/yearwise`,
        { params: { zodu_id: zoduId, branch_id: branchId, page: pageParam, limit: PAGE_LIMIT } },
      );
      return data as YearWisePageResponse;
    },
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages
        ? last.pagination.page + 1
        : undefined,
    enabled:   !!zoduId && !!branchId,
    staleTime: 5 * 60 * 1000,
  });
}

// ── Sentinel / infinite-scroll helper ────────────────────────
function useInfiniteScroll(
  hasNextPage:        boolean | undefined,
  fetchNextPage:      () => void,
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
      root:      scrollContainerRef.current ?? null,
      threshold: 0.1,
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [handleObserver, scrollContainerRef]);

  return sentinelRef as React.RefObject<HTMLTableRowElement>;
}

// ── StatCard ──────────────────────────────────────────────────
interface StatCardProps {
  title:       string;
  value:       string;
  icon:        React.ReactNode;
  iconBg:      string;
  valueColor?: string;
  loading?:    boolean;
}
const StatCard = ({ title, value, icon, iconBg, valueColor, loading }: StatCardProps) => (
  <Card sx={{ p: 1.5, borderRadius: 1, height: "100%" }} elevation={1}>
    <Box display="flex" gap={1} alignItems="center">
      <Box sx={{
        width: 36, height: 36, borderRadius: "50%", bgcolor: iconBg,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {icon}
      </Box>
      <Box flex={1}>
        <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ letterSpacing: 0.3 }}>
          {title}
        </Typography>
        {loading
          ? <Skeleton width={90} height={24} />
          : <Typography fontWeight="bold" mt={0.5} sx={{ fontSize: 18, lineHeight: 1.3, color: valueColor || "text.primary" }}>
              {value}
            </Typography>
        }
      </Box>
    </Box>
  </Card>
);

// ── Main ──────────────────────────────────────────────────────
const YearWiseProfitReport: React.FC = () => {
  const { zoduId, branchId } = useTenantContext();

  const {
    data: pages,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useYearWiseProfitReport(zoduId ?? "", branchId ?? "");

  // overall_summary is the same across all pages — take it from page 1
  const summary = pages?.pages[0]?.overall_summary;

  // flatten all pages into a single rows array
  const rows: YearRow[] = useMemo(
    () => pages?.pages.flatMap((p) => p.data ?? []) ?? [],
    [pages],
  );

  const totalRecords = pages?.pages[0]?.pagination.total ?? 0;

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useInfiniteScroll(
    hasNextPage, fetchNextPage, isFetchingNextPage,
    tableContainerRef as React.RefObject<HTMLDivElement | null>,
  );

  const columns = useMemo<ColumnDef<YearRow>[]>(() => [
    {
      key:      "year",
      label:    "YEAR",
      minWidth: 120,
      render:   (row) => (
        <Typography sx={{ fontSize: "0.8rem", color: "primary.main", fontWeight: 600, whiteSpace: "nowrap" }}>
          {row.year}
        </Typography>
      ),
    },
    {
      key:      "total_sales",
      label:    "TOTAL SALES",
      align:    "right",
      minWidth: 150,
      render:   (row) => (
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#2e7d32", whiteSpace: "nowrap" }}>
          {fmt(row.total_sales)}
        </Typography>
      ),
    },
    {
      key:      "total_purchase",
      label:    "TOTAL PURCHASE",
      align:    "right",
      minWidth: 160,
      render:   (row) => (
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#1565c0", whiteSpace: "nowrap" }}>
          {fmt(row.total_purchase)}
        </Typography>
      ),
    },
    {
      key:      "total_expense",
      label:    "TOTAL EXPENSE",
      align:    "right",
      minWidth: 160,
      render:   (row) => (
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#e65100", whiteSpace: "nowrap" }}>
          {fmt(row.total_expense)}
        </Typography>
      ),
    },
    {
      key:      "profit",
      label:    "TOTAL PROFIT",
      align:    "right",
      minWidth: 150,
      render:   (row) => (
        <Typography sx={{
          fontSize: "0.85rem", fontWeight: 700, whiteSpace: "nowrap",
          color: row.profit >= 0 ? "#2e7d32" : "#c62828",
        }}>
          {row.profit < 0 ? "-" : ""}{fmt(Math.abs(row.profit))}
        </Typography>
      ),
    },
  ], []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", p: { xs: 1, md: 1 }, background: "#fff", gap: 1.5 }}>

      {/* STAT CARDS — overall across all years */}
      <Grid container spacing={1.5} sx={{ flexShrink: 0 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={isLoading}
            title="Total Sales"
            value={fmt(summary?.total_sales ?? 0)}
            iconBg="#e8f5e9"
            icon={<ShoppingBagOutlinedIcon sx={{ color: "#2e7d32", fontSize: 18 }} />}
            valueColor="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={isLoading}
            title="Total Purchase"
            value={fmt(summary?.total_purchase ?? 0)}
            iconBg="#e3f2fd"
            icon={<ShoppingCartOutlinedIcon sx={{ color: "#1565c0", fontSize: 18 }} />}
            valueColor="#1565c0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={isLoading}
            title="Total Expense"
            value={fmt(summary?.total_expense ?? 0)}
            iconBg="#fff3e0"
            icon={<MoneyOffOutlinedIcon sx={{ color: "#e65100", fontSize: 18 }} />}
            valueColor="#e65100"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={isLoading}
            title="Total Profit"
            value={fmt(summary?.profit ?? 0)}
            iconBg="#f3e5f5"
            icon={<TrendingUpOutlinedIcon sx={{ color: "#7b1fa2", fontSize: 18 }} />}
            valueColor={(summary?.profit ?? 0) >= 0 ? "#2e7d32" : "#c62828"}
          />
        </Grid>
      </Grid>

      {/* TABLE */}
      <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <Paper sx={{ borderRadius: 1, border: "1px solid #eee", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

          {/* Header — no year dropdown */}
          <Box sx={{ px: 2, pt: 1.5, pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <Typography fontWeight="bold" fontSize="0.9rem">
              Yearly Profit Breakdown
            </Typography>
            {isLoading
              ? <Skeleton width={60} height={20} />
              : <Typography variant="caption" color="text.secondary">
                  {totalRecords} year{totalRecords !== 1 ? "s" : ""}
                </Typography>
            }
          </Box>

          <Box sx={{ flex: 1, minHeight: 0 }}>
            <DataTable<YearRow>
              columns={columns}
              rows={rows}
              rowKey={(row) => String(row.year)}
              isLoading={isLoading}
              skeletonRows={5}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              loadMoreRef={loadMoreRef}
              tableContainerRef={tableContainerRef}
              maxHeight="100%"
              emptyMessage="No yearly profit data available"
            />
          </Box>

          <Box sx={{ px: 2, py: 1, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f0f0f0", flexShrink: 0 }}>
            <Typography variant="caption" color="text.secondary">
              {rows.length > 0 ? `Showing ${rows.length} of ${totalRecords} year${totalRecords !== 1 ? "s" : ""}` : "All-time profit breakdown"}
            </Typography>
            {hasNextPage && !isFetchingNextPage && (
              <Typography variant="caption" color="text.secondary">Scroll for more</Typography>
            )}
          </Box>

        </Paper>
      </Box>
    </Box>
  );
};

export default YearWiseProfitReport;
