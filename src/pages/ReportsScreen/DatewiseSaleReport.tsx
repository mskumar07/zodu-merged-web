import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Paper,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import DataTable, { type ColumnDef } from "@utils/DataTable";
import { useTenantContext } from "@store/tenantContext";
import {
  useDatewiseSaleSummary,
  useDatewiseSaleBreakdown,
  useRestaurantDatewiseSaleReport,
  type DatewiseBreakdownRow,
  type RestaurantDatewiseSummaryRow,
} from "./useReportapi";

// ── Restaurant datewise sub-component ────────────────────────────────────────

const RestaurantDatewiseReport = ({
  zoduId,
  branchId,
  fromDate,
  toDate,
  dateFilterBar,
}: {
  zoduId: string;
  branchId: string;
  fromDate: string;
  toDate: string;
  dateFilterBar: React.ReactNode;
}) => {
  const {
    data: pages,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useRestaurantDatewiseSaleReport({
    zodu_id: zoduId,
    branch_id: branchId,
    start_date: fromDate,
    end_date: toDate,
    limit: 15,
  });

  const rows: RestaurantDatewiseSummaryRow[] = useMemo(
    () => pages?.pages.flatMap((p) => p.data ?? []) ?? [],
    [pages],
  );

  const summary = pages?.pages[0];
  const totalAmount = summary?.totalAmount ?? 0;
  const totalItems = summary?.totalItems ?? 0;
  const totalOrders = rows.reduce((acc, r) => acc + Number(r.total_orders), 0);

  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage)
          fetchNextPage();
      },
      { root: tableContainerRef.current ?? null, threshold: 0.1 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const columns = useMemo<ColumnDef<RestaurantDatewiseSummaryRow>[]>(
    () => [
      {
        key: "date",
        label: "DATE",
        minWidth: 180,
        render: (row) => (
          <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#111827", whiteSpace: "nowrap" }}>
            {row.date}
          </Typography>
        ),
      },
      {
        key: "total_orders",
        label: "TOTAL BILLS",
        align: "center",
        minWidth: 120,
        render: (row) => row.total_orders,
      },
      {
        key: "total_amt",
        label: "TOTAL AMOUNT",
        align: "right",
        minWidth: 140,
        render: (row) => (
          <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#1976D2", whiteSpace: "nowrap" }}>
            {fmt(row.total_amt)}
          </Typography>
        ),
      },
    ],
    [],
  );

  return (
    <>
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

      {dateFilterBar}

      <Box sx={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Paper sx={{ borderRadius: 1, border: "1px solid #eee", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
            <Box sx={{ px: 2, pt: 1.5, pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <Typography fontWeight="bold" fontSize="0.9rem">Day-wise Orders Breakdown</Typography>
              <Typography variant="caption" color="text.secondary">{fromDate} — {toDate}</Typography>
            </Box>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <DataTable<RestaurantDatewiseSummaryRow>
                columns={columns}
                rows={rows}
                rowKey={(row) => row.date}
                isLoading={isLoading}
                skeletonRows={8}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                loadMoreRef={sentinelRef as React.RefObject<HTMLTableRowElement>}
                tableContainerRef={tableContainerRef}
                maxHeight="100%"
                emptyMessage="No order data found for the selected date range"
              />
            </Box>
            <Box sx={{ px: 2, py: 1, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f0f0f0", flexShrink: 0 }}>
              <Typography variant="caption" color="text.secondary">
                {rows.length > 0 ? `Showing ${rows.length} day${rows.length !== 1 ? "s" : ""}` : "No data in selected range"}
              </Typography>
              {hasNextPage && !isFetchingNextPage && (
                <Typography variant="caption" color="text.secondary">Scroll for more</Typography>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </>
  );
};

const today = new Date();
const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  .toISOString()
  .split("T")[0];
const todayStr = today.toISOString().split("T")[0];

const fmt = (val: number | undefined) =>
  val != null
    ? `₹ ${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "₹ 0.00";

const formatDate = (value: string) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  valueColor?: string;
  loading?: boolean;
}

const StatCard = ({
  title,
  value,
  icon,
  iconBg,
  valueColor,
  loading,
}: StatCardProps) => (
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
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage)
        fetchNextPage();
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

const DatewiseSaleReport = () => {
  const { zoduId, branchId, businessType } = useTenantContext();
  console.log("[DatewiseSaleReport] businessType:", businessType);
  const isRestaurant = businessType?.toLowerCase() === "restaurant";
  const [fromDate, setFromDate] = useState(monthStart);
  const [toDate, setToDate] = useState(todayStr);
  const hasActiveFilters = fromDate !== monthStart || toDate !== todayStr;

  const retailParams = {
    zodu_id: zoduId ?? "",
    branch_id: branchId ?? "",
    from_date: fromDate,
    to_date: toDate,
  };

  const { data: summary, isLoading: summaryLoading } =
    useDatewiseSaleSummary({ ...retailParams, disabled: isRestaurant });
  const {
    data: breakdownPages,
    isLoading: breakdownLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useDatewiseSaleBreakdown({ ...retailParams, limit: 15, disabled: isRestaurant });

  const rows: DatewiseBreakdownRow[] = useMemo(
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

  const columns = useMemo<ColumnDef<DatewiseBreakdownRow>[]>(
    () => [
      {
        key: "saleDate",
        label: "DATE",
        minWidth: 120,
        render: (row) => (
          <Typography sx={{ fontSize: "0.8rem", color: "#111827", fontWeight: 500, whiteSpace: "nowrap" }}>
            {formatDate(row.saleDate)}
          </Typography>
        ),
      },
      {
        key: "billCount",
        label: "BILL COUNT",
        align: "center",
        minWidth: 90,
        render: (row) => row.billCount ?? "—",
      },
      {
        key: "totalAmount",
        label: "TOTAL AMOUNT",
        align: "right",
        minWidth: 130,
        render: (row) => (
          <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#1976D2", whiteSpace: "nowrap" }}>
            {fmt(row.totalAmount)}
          </Typography>
        ),
      },
      {
        key: "taxAmount",
        label: "TAX AMOUNT",
        align: "right",
        minWidth: 120,
        render: (row) => fmt(row.taxAmount),
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

  const dateFilterBar = (
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, alignItems: "center", flexShrink: 0 }}>
      <Button
        variant="outlined"
        onClick={() => { setFromDate(monthStart); setToDate(todayStr); }}
        disabled={!hasActiveFilters}
        sx={{ borderRadius: 1, px: 1.6, textTransform: "none", fontWeight: 700, borderColor: "#E5E7EB", color: "#6B7280" }}
      >
        Clear Filters
      </Button>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.1, py: 0.65, borderRadius: 1, border: "1px solid #eee", bgcolor: "#fff" }}>
        <CalendarTodayOutlinedIcon sx={{ fontSize: 15, color: "#D92D20" }} />
        <TextField
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          variant="standard"
          InputProps={{ disableUnderline: true }}
          inputProps={{ max: toDate, style: { fontSize: 11, fontWeight: 700 } }}
          sx={{ minWidth: 126 }}
        />
        <Typography sx={{ fontSize: 11, color: "#9CA3AF", fontWeight: 700 }}>-</Typography>
        <TextField
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          variant="standard"
          InputProps={{ disableUnderline: true }}
          inputProps={{ min: fromDate, style: { fontSize: 11, fontWeight: 700 } }}
          sx={{ minWidth: 126 }}
        />
      </Box>
    </Box>
  );

  if (isRestaurant) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", p: { xs: 1, md: 1 }, background: "#fff", gap: 1.5 }}>
        <RestaurantDatewiseReport
          zoduId={zoduId ?? ""}
          branchId={branchId ?? ""}
          fromDate={fromDate}
          toDate={toDate}
          dateFilterBar={dateFilterBar}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", p: { xs: 1, md: 1 }, background: "#fff", gap: 1.5 }}>
      {/* ── STAT CARDS ── */}
      <Grid container spacing={1.5} sx={{ flexShrink: 0 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={summaryLoading}
            title="Total Bills"
            value={summary?.totalOrders != null ? summary.totalOrders.toLocaleString("en-IN") : "—"}
            iconBg="#fff3e0"
            icon={<ShoppingBagOutlinedIcon sx={{ color: "#f57c00", fontSize: 18 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={summaryLoading}
            title="Total Amount"
            value={fmt(summary?.totalSales)}
            iconBg="#e8f5e9"
            icon={<CalendarTodayOutlinedIcon sx={{ color: "#388e3c", fontSize: 18 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={summaryLoading}
            title="Tax Amount"
            value={fmt(summary?.totalTax)}
            iconBg="#fce4ec"
            icon={<PaymentsOutlinedIcon sx={{ color: "#c62828", fontSize: 18 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={summaryLoading}
            title="Net Sales"
            value={fmt(summary?.netSales)}
            valueColor="#2e7d32"
            iconBg="#e3f2fd"
            icon={<TrendingUpOutlinedIcon sx={{ color: "#1976d2", fontSize: 18 }} />}
          />
        </Grid>
      </Grid>

      {/* ── DATE FILTER BAR ── */}
      {dateFilterBar}

      {/* ── TABLE ── */}
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Paper sx={{ borderRadius: 1, border: "1px solid #eee", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
            <Box sx={{ px: 2, pt: 1.5, pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <Typography fontWeight="bold" fontSize="0.9rem">Day-wise Sales Breakdown</Typography>
              <Typography variant="caption" color="text.secondary">{fromDate} — {toDate}</Typography>
            </Box>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <DataTable<DatewiseBreakdownRow>
                columns={columns}
                rows={rows}
                rowKey={(row) => row.saleDate}
                isLoading={breakdownLoading}
                skeletonRows={8}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                loadMoreRef={loadMoreRef}
                tableContainerRef={tableContainerRef}
                maxHeight="100%"
                emptyMessage="No sales data found for the selected date range"
              />
            </Box>
            <Box sx={{ px: 2, py: 1, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f0f0f0", flexShrink: 0 }}>
              <Typography variant="caption" color="text.secondary">
                {rows.length > 0 ? `Showing ${rows.length} day${rows.length !== 1 ? "s" : ""}` : "No data in selected range"}
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

export default DatewiseSaleReport;
