import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Box, Grid, Paper, Skeleton, Typography,
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
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5001";
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
const getBase = (isRestaurant: boolean) =>
  isRestaurant ? "restaurant" : "retail";

function useYearWiseProfitReport(zoduId: string, branchId: string, isRestaurant: boolean) {
  return useInfiniteQuery<YearWisePageResponse>({
    queryKey: ["profit-yearwise", zoduId, branchId, isRestaurant],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await axios.get(
        `${API_BASE}/${getBase(isRestaurant)}/api/report/profit/yearwise`,
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
      {loading
        ? <Skeleton width={80} height={24} sx={{ borderRadius: 1, mt: 0.5 }} />
        : <Typography sx={{ fontSize: "1.05rem", fontWeight: 800, color: valueColor || "#0F172A", lineHeight: 1.3, whiteSpace: "nowrap" }}>
            {value}
          </Typography>
      }
    </Box>
  </Box>
);

// ── Main ──────────────────────────────────────────────────────
const YearWiseProfitReport: React.FC = () => {
  const { zoduId, branchId, businessType } = useTenantContext();
  const isRestaurant = businessType?.toLowerCase() === "restaurant";

  const {
    data: pages,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useYearWiseProfitReport(zoduId ?? "", branchId ?? "", isRestaurant);

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
        <Typography sx={{ fontSize: "0.8rem", color: "#0F172A", fontWeight: 600, whiteSpace: "nowrap" }}>
          {row.year}
        </Typography>
      ),
    },
    {
      key:      "total_sales",
      label:    isRestaurant ? "TOTAL ORDERS" : "TOTAL SALES",
      align:    "right",
      minWidth: 150,
      render:   (row) => (
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#0F172A", whiteSpace: "nowrap" }}>
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
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#0F172A", whiteSpace: "nowrap" }}>
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
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#0F172A", whiteSpace: "nowrap" }}>
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
  ], [isRestaurant]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", p: { xs: 1, md: 1 }, background: "#fff", gap: 1.5 }}>

      {/* STAT CARDS — overall across all years */}
      <Grid container spacing={1.5} sx={{ flexShrink: 0 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={isLoading}
            title={isRestaurant ? "Total Orders" : "Total Sales"}
            value={fmt(summary?.total_sales ?? 0)}
            iconBg="#e8f5e9"
            icon={<ShoppingBagOutlinedIcon sx={{ color: "#2e7d32", fontSize: 18 }} />}
            valueColor="#0F172A"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={isLoading}
            title="Total Purchase"
            value={fmt(summary?.total_purchase ?? 0)}
            iconBg="#e3f2fd"
            icon={<ShoppingCartOutlinedIcon sx={{ color: "#1565c0", fontSize: 18 }} />}
            valueColor="#0F172A"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={isLoading}
            title="Total Expense"
            value={fmt(summary?.total_expense ?? 0)}
            iconBg="#fff3e0"
            icon={<MoneyOffOutlinedIcon sx={{ color: "#e65100", fontSize: 18 }} />}
            valueColor="#0F172A"
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
