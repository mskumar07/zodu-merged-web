import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  Grid,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import DataTable, { type ColumnDef } from "@utils/DataTable";
import { getTenantContext } from "@store/tenantContext";
import {
  useCategoryItemSalesSummary,
  useInfiniteCategoryWiseSales,
  useInfiniteItemWiseSales,
  useSalesVelocity,
  type CategoryWiseSalesRow,
  type ItemWiseSalesRow,
  type SalesVelocityPoint,
} from "./useReportapi";

const today = new Date();
const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
const todayStr = today.toISOString().split("T")[0];

const money = (value: number | undefined) =>
  value != null ? `₹ ${value.toLocaleString("en-IN")}` : "—";

const numberFmt = (value: number | undefined) =>
  value != null ? value.toLocaleString("en-IN") : "—";

const shortDate = (value: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
};

const toIsoDate = (value: Date) => value.toISOString().split("T")[0];

const buildDateSeries = (from: string, to: string) => {
  const start = new Date(from);
  const end = new Date(to);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return [];

  const dates: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    dates.push(toIsoDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates.slice(-9);
};

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  loading?: boolean;
  iconBg: string;
  valueColor?: string;
}

const StatCard = ({ label, value, icon, loading, iconBg, valueColor }: StatCardProps) => (
  <Card sx={{ p: 1, borderRadius: 1, height: "100%", width: "auto", minWidth:200 }} elevation={1}>
    <Box display="flex" justifyContent="space-between" gap={1} alignItems="center" >
      <Box
        sx={{
          width: 40,
          height: 40,
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
               {label}
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

const VelocityChart = ({ rows }: { rows: SalesVelocityPoint[] }) => {
  const maxValue = Math.max(...rows.map((row) => row.sales), 1);

  return (
    <Paper
      sx={{
        borderRadius: 1,
        border: "1px solid #eee",
        display: "flex",
        flexDirection: "column",
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
        }}
      >
        <Typography fontWeight="bold" fontSize="0.9rem">
          Sales Velocity Overview
        </Typography>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#D92D20" }} />
            <Typography sx={{ fontSize: 10, color: "#6B7280" }}>Current Period</Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#E5E7EB" }} />
            <Typography sx={{ fontSize: 10, color: "#6B7280" }}>Prev. Period</Typography>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ px: 2, pb: 2, pt: 1 }}>
        <Box sx={{ height: 220, display: "flex", alignItems: "flex-end", gap: { xs: 1, md: 2 } }}>
          {rows.map((row) => {
            const currentHeight = Math.max(18, (row.sales / maxValue) * 150);
            const previousHeight = Math.max(18, currentHeight * 0.78);

            return (
              <Box key={`${row.date}-${row.sales}`} sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ height: 170, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 0.7 }}>
                  <Box sx={{ width: { xs: 16, md: 22 }, height: previousHeight, bgcolor: "#E5E7EB", borderRadius: "4px 4px 0 0" }} />
                  <Box sx={{ width: { xs: 16, md: 22 }, height: currentHeight, bgcolor: "#D92D20", borderRadius: "4px 4px 0 0" }} />
                </Box>
                <Typography sx={{ mt: 1, fontSize: 9, color: "#94A3B8", fontWeight: 700, textAlign: "center" }}>
                  {shortDate(row.date)}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Paper>
  );
};

const CategoryItemSalesReport = () => {
  const { zoduId, branchId } = getTenantContext();
  const [fromDate, setFromDate] = useState(monthStart);
  const [toDate, setToDate] = useState(todayStr);
  const limit = 8;
  const hasActiveFilters = fromDate !== monthStart || toDate !== todayStr;

  const params = {
    zodu_id: zoduId ?? "",
    branch_id: branchId ?? "",
    from_date: fromDate,
    to_date: toDate,
  };

  const { data: summary, isLoading: summaryLoading } = useCategoryItemSalesSummary(params);
  const {
    data: categoryPages,
    isLoading: categoryLoading,
    isFetchingNextPage: categoryFetchingNextPage,
    hasNextPage: categoryHasNextPage,
    fetchNextPage: fetchNextCategoryPage,
  } = useInfiniteCategoryWiseSales({ ...params, limit });
  const {
    data: itemPages,
    isLoading: itemLoading,
    isFetchingNextPage: itemFetchingNextPage,
    hasNextPage: itemHasNextPage,
    fetchNextPage: fetchNextItemPage,
  } = useInfiniteItemWiseSales({ ...params, limit });
  const { data: velocity = [], isLoading: velocityLoading } = useSalesVelocity(params);

  const categoryRows = useMemo(
    () => categoryPages?.pages.flatMap((page) => page.data ?? []) ?? [],
    [categoryPages],
  );
  const itemRows = useMemo(
    () => itemPages?.pages.flatMap((page) => page.data ?? []) ?? [],
    [itemPages],
  );

  const categoryTableRef = useRef<HTMLDivElement | null>(null);
  const itemTableRef = useRef<HTMLDivElement | null>(null);
  const categoryLoadMoreRef = useInfiniteScroll(
    categoryHasNextPage,
    fetchNextCategoryPage,
    categoryFetchingNextPage,
    categoryTableRef,
  );
  const itemLoadMoreRef = useInfiniteScroll(
    itemHasNextPage,
    fetchNextItemPage,
    itemFetchingNextPage,
    itemTableRef,
  );

  const topCategory = categoryRows[0]?.categoryName || summary?.bestSellingCategory || "—";
  const topItem = itemRows[0]?.itemName || summary?.bestSellingItem || "—";
  const velocityRows = useMemo(() => {
    const dateSeries = buildDateSeries(fromDate, toDate);
    if (dateSeries.length === 0) {
      return Array.from({ length: 9 }, (_, index) => ({
        date: new Date(today.getFullYear(), today.getMonth(), index + 1).toISOString(),
        sales: 0,
        orders: 0,
        quantity: 0,
      }));
    }

    const velocityMap = new Map(
      velocity.map((entry) => [toIsoDate(new Date(entry.date)), entry]),
    );

    return dateSeries.map((date) => {
      const match = velocityMap.get(date);
      return match ?? { date, sales: 0, orders: 0, quantity: 0 };
    });
  }, [fromDate, toDate, velocity]);

  const categoryColumns = useMemo<ColumnDef<CategoryWiseSalesRow>[]>(() => [
    {
      key: "categoryName",
      label: "CATEGORY NAME",
      minWidth: 150,
      render: (row) => (
        <Typography sx={{ fontSize: "0.8rem", color: "#111827", fontWeight: 600, whiteSpace: "nowrap" }}>
          {row.categoryName}
        </Typography>
      ),
    },
    {
      key: "quantity",
      label: "ITEMS",
      align: "right",
      minWidth: 70,
      render: (row) => numberFmt(row.quantity),
    },
    {
      key: "sales",
      label: "TOTAL (₹)",
      align: "right",
      minWidth: 110,
      render: (row) => money(row.sales),
    },
    // {
    //   key: "growth",
    //   label: "GROWTH",
    //   align: "right",
    //   minWidth: 88,
    //   render: (row) => {
    //     const ratio = summary?.totalSales ? (row.sales / summary.totalSales) * 100 : 0;
    //     const positive = ratio >= 0;
    //     return (
    //       <Stack direction="row" spacing={0.2} alignItems="center" justifyContent="flex-end">
    //         {positive ? (
    //           <ArrowUpwardRoundedIcon sx={{ fontSize: 12, color: "#16A34A" }} />
    //         ) : (
    //           <ArrowDownwardRoundedIcon sx={{ fontSize: 12, color: "#D92D20" }} />
    //         )}
    //         <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: positive ? "#16A34A" : "#D92D20" }}>
    //           {`${positive ? "+" : ""}${ratio.toFixed(1)}%`}
    //         </Typography>
    //       </Stack>
    //     );
    //   },
    // },
  ], [summary?.totalSales]);

  const itemColumns = useMemo<ColumnDef<ItemWiseSalesRow>[]>(() => [
    {
      key: "itemName",
      label: "ITEM NAME",
      minWidth: 160,
      render: (row) => (
        <Typography sx={{ fontSize: "0.8rem", color: "#111827", fontWeight: 600, whiteSpace: "nowrap" }}>
          {row.itemName}
        </Typography>
      ),
    },
    {
      key: "categoryName",
      label: "CATEGORY",
      minWidth: 100,
      render: (row) => (
        <Typography sx={{ fontSize: "0.75rem", color: "#3B82F6", fontWeight: 600, whiteSpace: "nowrap" }}>
          {row.categoryName}
        </Typography>
      ),
    },
    {
      key: "quantity",
      label: "QTY",
      align: "right",
      minWidth: 62,
      render: (row) => numberFmt(row.quantity),
    },
    {
      key: "avgPrice",
      label: "PRICE (₹)",
      align: "right",
      minWidth: 80,
      render: (row) => money(row.quantity > 0 ? row.sales / row.quantity : 0),
    },
    {
      key: "sales",
      label: "TOTAL (₹)",
      align: "right",
      minWidth: 100,
      render: (row) => (
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#D92D20", whiteSpace: "nowrap" }}>
          {money(row.sales)}
        </Typography>
      ),
    },
  ], []);

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
      <Box display="flex" justifyContent="space-between" gap={2} flexWrap="wrap" alignItems="center" sx={{ flexShrink: 0 }}>
        {/* <Box>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
            Category/Item-wise Sales Report
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#9CA3AF", mt: 0.3 }}>
            Detailed breakdown of sales performance across categories and products.
          </Typography>
        </Box> */}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="stretch">
         

          {/* <Button
            variant="contained"
            startIcon={<FileDownloadOutlinedIcon />}
            sx={{ borderRadius: 1, px: 1.8, bgcolor: "#D92D20", "&:hover": { bgcolor: "#B42318" }, textTransform: "none", fontWeight: 700 }}
          >
            Export Report
          </Button> */}
        </Stack>
      </Box>

      <Grid container spacing={1.5} sx={{ flexShrink: 0 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={summaryLoading}
            label="Total Sales"
            value={money(summary?.totalSales)}
            icon={<AssessmentOutlinedIcon sx={{ color: "#F57C00", fontSize: 18 }} />}
            iconBg="#FFF3E0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={summaryLoading}
            label="Best Selling Category"
            value={topCategory}
            icon={<CategoryOutlinedIcon sx={{ color: "#388E3C", fontSize: 18 }} />}
            iconBg="#E8F5E9"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={summaryLoading}
            label="Best Selling Item"
            value={topItem}
            icon={<Inventory2OutlinedIcon sx={{ color: "#1976D2", fontSize: 18 }} />}
            iconBg="#E3F2FD"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={summaryLoading}
            label="Total Tax Collected"
            value={money(summary?.totalTaxCollected)}
            icon={<PaymentsOutlinedIcon sx={{ color: "#D32F2F", fontSize: 18 }} />}
            iconBg="#FCE4EC"
          />
        </Grid>
      </Grid>
<Box sx={{display:"flex",justifyContent:"flex-end", gap: 1, alignItems: "center"}}>
       <Button
            variant="outlined"
            onClick={() => {
              setFromDate(monthStart);
              setToDate(todayStr);
            }}
            disabled={!hasActiveFilters}
            sx={{
              borderRadius: 1,
              px: 1.6,
              textTransform: "none",
              fontWeight: 700,
              borderColor: "#E5E7EB",
              color: "#6B7280",
            }}
          >
            Clear Filters
          </Button>
       <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: "fit-content",
              px: 1.1,
              py: 0.65,
              borderRadius: 1,
              border: "1px solid #eee",
              bgcolor: "#fff",
            }}
          >
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

      <Box sx={{ display: "flex", gap: 1.5, flex: 1, overflow: "hidden", minHeight: 0, flexDirection: { xs: "column", lg: "row" } }}>
        <Box sx={{ width: { xs: "100%", lg: "40%" }, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
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
            <Box sx={{ px: 2, pt: 1.5, pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <Stack direction="row" spacing={0.8} alignItems="center">
                <Box sx={{ width: 3, height: 18, bgcolor: "#D92D20", borderRadius: 99 }} />
                <Typography fontWeight="bold" fontSize="0.9rem">Category-wise Sales</Typography>
              </Stack>
              <Chip label={`${categoryPages?.pages[0]?.total ?? categoryRows.length} categories`} size="small" sx={{ height: 18, fontSize: 9, bgcolor: "#F4F4F5" }} />
            </Box>

            <Box sx={{ flex: 1, minHeight: 0 }}>
              <DataTable<CategoryWiseSalesRow>
                columns={categoryColumns}
                rows={categoryRows}
                rowKey={(row) => `${row.categoryId}-${row.categoryName}`}
                isLoading={categoryLoading}
                skeletonRows={7}
                hasNextPage={categoryHasNextPage}
                isFetchingNextPage={categoryFetchingNextPage}
                loadMoreRef={categoryLoadMoreRef}
                tableContainerRef={categoryTableRef}
                maxHeight="100%"
                emptyMessage="No category sales found"
              />
            </Box>

            <Box sx={{ px: 2, py: 1, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f0f0f0", flexShrink: 0 }}>
              <Typography variant="caption" color="text.secondary">
                {categoryRows.length > 0 ? `Showing ${categoryRows.length} categories` : "No category data"}
              </Typography>
              {categoryHasNextPage && !categoryFetchingNextPage && (
                <Typography variant="caption" color="text.secondary">Scroll for more</Typography>
              )}
            </Box>
          </Paper>
        </Box>

        <Box sx={{ width: { xs: "100%", lg: "60%" }, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
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
            <Box sx={{ px: 2, pt: 1.5, pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <Stack direction="row" spacing={0.8} alignItems="center">
                <Box sx={{ width: 3, height: 18, bgcolor: "#D92D20", borderRadius: 99 }} />
                <Typography fontWeight="bold" fontSize="0.9rem">Item-wise Sales Details</Typography>
              </Stack>
              <TuneOutlinedIcon sx={{ fontSize: 17, color: "text.secondary" }} />
            </Box>

            <Box sx={{ flex: 1, minHeight: 0 }}>
              <DataTable<ItemWiseSalesRow>
                columns={itemColumns}
                rows={itemRows}
                rowKey={(row) => `${row.itemId}-${row.itemName}`}
                isLoading={itemLoading}
                skeletonRows={7}
                hasNextPage={itemHasNextPage}
                isFetchingNextPage={itemFetchingNextPage}
                loadMoreRef={itemLoadMoreRef}
                tableContainerRef={itemTableRef}
                maxHeight="100%"
                emptyMessage="No item sales found"
              />
            </Box>

            <Box sx={{ px: 2, py: 1, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f0f0f0", flexShrink: 0 }}>
              <Typography variant="caption" color="text.secondary">
                {itemRows.length > 0 ? `Showing ${itemRows.length} items` : "No item data"}
              </Typography>
              {itemHasNextPage && !itemFetchingNextPage && (
                <Typography variant="caption" color="text.secondary">Scroll for more</Typography>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* {velocityLoading ? (
        <Paper sx={{ borderRadius: 1, border: "1px solid #eee", p: 2 }}>
          <Typography sx={{ fontSize: 13, color: "#9CA3AF" }}>Loading sales velocity…</Typography>
        </Paper>
      ) : (
        <VelocityChart rows={velocityRows} />
      )} */}
    </Box>
  );
};

export default CategoryItemSalesReport;
