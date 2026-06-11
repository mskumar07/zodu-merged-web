import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LottieLoader from "@components/LottieLoader";
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import DataTable, { type ColumnDef } from "@utils/DataTable";
import { useTenantContext } from "@store/tenantContext";
import {
  useCategoryItemSalesSummary,
  useInfiniteCategoryWiseSales,
  useInfiniteItemWiseSales,
  useRestaurantCategoryReport,
  type CategoryWiseSalesRow,
  type ItemWiseSalesRow,
  type RestaurantCategoryRow,
  type RestaurantCategoryItem,
} from "./useReportapi";

const today = new Date();
const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
const todayStr = today.toISOString().split("T")[0];

const money = (val: number | undefined) =>
  val != null
    ? `₹ ${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "₹ 0.00";

const numberFmt = (value: number | undefined) =>
  value != null ? value.toLocaleString("en-IN") : "0";


interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  loading?: boolean;
  iconBg: string;
  valueColor?: string;
}

const StatCard = ({ label, value, icon, loading, iconBg, valueColor }: StatCardProps) => (
  <Box sx={{
    bgcolor: "#fff", border: "1px solid #F1F5F9", borderRadius: "8px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)", px: 2, py: 1.5,
    display: "flex", alignItems: "center", gap: 1.5,
    width: "100%",
  }}>
    <Box sx={{
      width: 36, height: 36, borderRadius: "8px", bgcolor: iconBg,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      {icon}
    </Box>
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography sx={{ fontSize: "11px", fontWeight: 500, color: "#64748B", whiteSpace: "nowrap" }}>
        {label}
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


const CategoryItemSalesReport = () => {
  const { zoduId, branchId, businessType } = useTenantContext();
  const isRestaurant = businessType?.toLowerCase() === "restaurant";
  const [fromDate, setFromDate] = useState(monthStart);
  const [toDate, setToDate] = useState(todayStr);
  const limit = 8;
  const hasActiveFilters = fromDate !== monthStart || toDate !== todayStr;

  const params = {
    zodu_id: zoduId ?? "",
    branch_id: branchId ?? "",
    from_date: fromDate,
    to_date: toDate,
    isRestaurant,
  };

  // Retail hooks — disabled for restaurant
  const { data: summary, isLoading: summaryLoading } = useCategoryItemSalesSummary({ ...params, disabled: isRestaurant } as any);
  const {
    data: categoryPages,
    isLoading: categoryLoading,
    isFetchingNextPage: categoryFetchingNextPage,
    hasNextPage: categoryHasNextPage,
    fetchNextPage: fetchNextCategoryPage,
  } = useInfiniteCategoryWiseSales({ ...params, limit, disabled: isRestaurant });
  const {
    data: itemPages,
    isLoading: itemLoading,
    isFetchingNextPage: itemFetchingNextPage,
    hasNextPage: itemHasNextPage,
    fetchNextPage: fetchNextItemPage,
  } = useInfiniteItemWiseSales({ ...params, limit, disabled: isRestaurant } as any);

  // Restaurant hook
  const {
    data: restaurantCategoryPages,
    isLoading: restaurantLoading,
    isFetchingNextPage: restaurantFetchingNextPage,
    hasNextPage: restaurantHasNextPage,
    fetchNextPage: fetchNextRestaurantPage,
  } = useRestaurantCategoryReport({ ...params, limit: 10, disabled: !isRestaurant });

  const categoryRows = useMemo(
    () => categoryPages?.pages.flatMap((page) => page.data ?? []) ?? [],
    [categoryPages],
  );
  const itemRows = useMemo(
    () => itemPages?.pages.flatMap((page) => page.data ?? []) ?? [],
    [itemPages],
  );

  // Restaurant derived data
  const restaurantCategories = useMemo(
    () => restaurantCategoryPages?.pages.flatMap((p) => p.categories ?? []) ?? [],
    [restaurantCategoryPages],
  );
  const restaurantItems = useMemo(
    () => restaurantCategories.flatMap((cat) => cat.items.map((item) => ({ ...item, category_name: cat.category_name }))),
    [restaurantCategories],
  );
  const restaurantSummary = restaurantCategoryPages?.pages[0]?.summary;

  const categoryTableRef = useRef<HTMLDivElement | null>(null);
  const itemTableRef = useRef<HTMLDivElement | null>(null);
  const restaurantCategoryTableRef = useRef<HTMLDivElement | null>(null);
  const restaurantItemTableRef = useRef<HTMLDivElement | null>(null);
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
  const restaurantCategoryLoadMoreRef = useInfiniteScroll(
    restaurantHasNextPage,
    fetchNextRestaurantPage,
    restaurantFetchingNextPage,
    restaurantCategoryTableRef,
  );

  const topCategory = categoryRows[0]?.categoryName || summary?.bestSellingCategory || "—";
  const topItem = itemRows[0]?.itemName || summary?.bestSellingItem || "—";

  const restaurantCategoryColumns = useMemo<ColumnDef<RestaurantCategoryRow>[]>(() => [
    {
      key: "category_name",
      label: "CATEGORY NAME",
      minWidth: 150,
      render: (row) => (
        <Typography sx={{ fontSize: "0.8rem", color: "#111827", fontWeight: 600, whiteSpace: "nowrap" }}>
          {row.category_name}
        </Typography>
      ),
    },
    {
      key: "total_qty",
      label: "ITEMS",
      align: "right",
      minWidth: 80,
      render: (row) => numberFmt(row.total_qty),
    },
    {
      key: "total_amount",
      label: "TOTAL (₹)",
      align: "right",
      minWidth: 120,
      render: (row) => (
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#1976D2", whiteSpace: "nowrap" }}>
          {money(row.total_amount)}
        </Typography>
      ),
    },
  ], []);

  type RestaurantItemWithCategory = RestaurantCategoryItem & { category_name: string };

  const restaurantItemColumns = useMemo<ColumnDef<RestaurantItemWithCategory>[]>(() => [
    {
      key: "item_name",
      label: "ITEM NAME",
      minWidth: 160,
      render: (row) => (
        <Box>
          <Typography sx={{ fontSize: "0.8rem", color: "#111827", fontWeight: 600, whiteSpace: "nowrap" }}>
            {row.item_name}
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#3B82F6", fontWeight: 600, whiteSpace: "nowrap" }}>
            {row.category_name}
          </Typography>
        </Box>
      ),
    },
    {
      key: "total_qty",
      label: "QTY",
      align: "right",
      minWidth: 70,
      render: (row) => numberFmt(row.total_qty),
    },
    {
      key: "price",
      label: "PRICE (₹)",
      align: "right",
      minWidth: 90,
      render: (row) => money(row.price),
    },
    {
      key: "total_amount",
      label: "TOTAL (₹)",
      align: "right",
      minWidth: 110,
      render: (row) => (
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#1976D2", whiteSpace: "nowrap" }}>
          {money(row.total_amount)}
        </Typography>
      ),
    },
  ], []);

  const dateFilterBar = (
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, alignItems: "center" }}>
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
        <Grid container spacing={1.5} sx={{ flexShrink: 0 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              loading={restaurantLoading}
              label="Total Orders"
              value={numberFmt(restaurantSummary?.totalOrders)}
              icon={<ShoppingBagOutlinedIcon sx={{ color: "#F57C00", fontSize: 18 }} />}
              iconBg="#FFF3E0"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              loading={restaurantLoading}
              label="Total Qty"
              value={numberFmt(restaurantSummary?.totalQty)}
              icon={<Inventory2OutlinedIcon sx={{ color: "#1976D2", fontSize: 18 }} />}
              iconBg="#E3F2FD"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              loading={restaurantLoading}
              label="Total Amount"
              value={money(restaurantSummary?.totalAmount)}
              icon={<AssessmentOutlinedIcon sx={{ color: "#388E3C", fontSize: 18 }} />}
              iconBg="#E8F5E9"
            />
          </Grid>
        </Grid>

        {dateFilterBar}

        <Box sx={{ display: "flex", gap: 1.5, flex: 1, overflow: "hidden", minHeight: 0, flexDirection: { xs: "column", lg: "row" } }}>
          <Box sx={{ width: { xs: "100%", lg: "40%" }, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
            <Paper sx={{ borderRadius: 1, border: "1px solid #eee", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
              <Box sx={{ px: 2, pt: 1.5, pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <Stack direction="row" spacing={0.8} alignItems="center">
                  <Box sx={{ width: 3, height: 18, bgcolor: "#D92D20", borderRadius: 99 }} />
                  <Typography fontWeight="bold" fontSize="0.9rem">Category-wise Sales</Typography>
                </Stack>
                <Chip label={`${restaurantCategories.length} categories`} size="small" sx={{ height: 18, fontSize: 9, bgcolor: "#F4F4F5" }} />
              </Box>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <DataTable<RestaurantCategoryRow>
                  columns={restaurantCategoryColumns}
                  rows={restaurantCategories}
                  rowKey={(row) => String(row.category_id)}
                  isLoading={restaurantLoading}
                  skeletonRows={7}
                  hasNextPage={restaurantHasNextPage}
                  isFetchingNextPage={restaurantFetchingNextPage}
                  loadMoreRef={restaurantCategoryLoadMoreRef}
                  tableContainerRef={restaurantCategoryTableRef}
                  maxHeight="100%"
                  emptyMessage="No category sales found"
                />
              </Box>
              <Box sx={{ px: 2, py: 1, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f0f0f0", flexShrink: 0 }}>
                <Typography variant="caption" color="text.secondary">
                  {restaurantCategories.length > 0 ? `Showing ${restaurantCategories.length} categories` : "No category data"}
                </Typography>
                {restaurantHasNextPage && !restaurantFetchingNextPage && (
                  <Typography variant="caption" color="text.secondary">Scroll for more</Typography>
                )}
              </Box>
            </Paper>
          </Box>

          <Box sx={{ width: { xs: "100%", lg: "60%" }, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
            <Paper sx={{ borderRadius: 1, border: "1px solid #eee", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
              <Box sx={{ px: 2, pt: 1.5, pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <Stack direction="row" spacing={0.8} alignItems="center">
                  <Box sx={{ width: 3, height: 18, bgcolor: "#D92D20", borderRadius: 99 }} />
                  <Typography fontWeight="bold" fontSize="0.9rem">Item-wise Sales Details</Typography>
                </Stack>
                <TuneOutlinedIcon sx={{ fontSize: 17, color: "text.secondary" }} />
              </Box>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <DataTable<RestaurantItemWithCategory>
                  columns={restaurantItemColumns}
                  rows={restaurantItems}
                  rowKey={(row) => String(row.item_id)}
                  isLoading={restaurantLoading}
                  skeletonRows={7}
                  hasNextPage={false}
                  isFetchingNextPage={false}
                  loadMoreRef={restaurantItemTableRef as React.RefObject<HTMLTableRowElement>}
                  tableContainerRef={restaurantItemTableRef}
                  maxHeight="100%"
                  emptyMessage="No item sales found"
                />
              </Box>
              <Box sx={{ px: 2, py: 1, borderTop: "1px solid #f0f0f0", flexShrink: 0 }}>
                <Typography variant="caption" color="text.secondary">
                  {restaurantItems.length > 0 ? `Showing ${restaurantItems.length} items` : "No item data"}
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    );
  }

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
      render: (row) => (
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#1976D2", whiteSpace: "nowrap" }}>
          {money(row.sales)}
        </Typography>
      ),
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
           <Typography sx={{ fontSize: "0.75rem", color: "#3B82F6", fontWeight: 600, whiteSpace: "nowrap" }}>
           {row.categoryName}
         </Typography>
        </Typography>
      ),
    },
    // {
    //   key: "categoryName",
    //   label: "CATEGORY",
    //   minWidth: 100,
    //   render: (row) => (
    //     <Typography sx={{ fontSize: "0.75rem", color: "#3B82F6", fontWeight: 600, whiteSpace: "nowrap" }}>
    //       {row.categoryName}
    //     </Typography>
    //   ),
    // },
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
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#1976D2", whiteSpace: "nowrap" }}>
          {money(row.sales)}
        </Typography>
      ),
    },
  ], []);

  if (summaryLoading || categoryLoading) return <LottieLoader />;

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
      {dateFilterBar}

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

    </Box>
  );
};

export default CategoryItemSalesReport;
