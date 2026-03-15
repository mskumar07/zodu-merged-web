import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Skeleton,
  Card,
  CardContent,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import SearchIcon from "@mui/icons-material/Search";

import DateFilterNav from "./filters/DateFilterNav";
import RecentOrders from "./RecentOrders/RecentOrders";
import TopItems from "./TopItems/TopItems";
import DatewiseSales from "./DateWiseSale/DateWiseSale";
import ExpensesDataTable from "./Expenses/Expenses";
import SummaryCards from "./SummaryCards/SummaryCards";
import { getDateRange } from "@Services/ReportServices";
import { useDashboardDataQuery } from "@hooks/dashboard";
import {
  useDashboardSummary,
  useDashboardOrders,
  useDashboardExpenses,
  useDashboardTopItems,
  useDashboardDatewiseSales,
  useInfiniteDashboardOrders,
  useInfiniteTopItems
} from "@hooks/dashboard";
import {useAppSelector} from "@store/store"
import {ZoduId} from "@store/slices/userSlice"
import { useInfiniteDashboardExpenses } from "@hooks/dashboard/useInfiniteDashboardExpense";


const STORAGE_KEY = "dashboard_selected_branch";

const DashboardLayout: React.FC = () => {
  const queryClient = useQueryClient();

  const [selectedBranch] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved || "ZODU035B1";
  });

  const [dateFilter, setDateFilter] = useState({
    type: "today" as string,
    startDate: "",
    endDate: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const [ordersPagination, setOrdersPagination] = useState({ page: 1, limit: 10 });
  const [expensesPagination, setExpensesPagination] = useState({ page: 1, limit: 10 });
  const [topItemsPagination, setTopItemsPagination] = useState({ page: 1, limit: 10 });
  const [datewiseSalesPagination, setDatewiseSalesPagination] = useState({ page: 1, limit: 10 });

  useEffect(() => {
    const { startDate, endDate } = getDateRange("today");
    setDateFilter({
      type: "today",
      startDate,
      endDate,
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const {
    data: dashboardData,
    isLoading,
    isFetching,
    refetch: refetchDashboard,
  } = useDashboardDataQuery({
    branchId: selectedBranch,
    ordersPage: ordersPagination.page,
    ordersLimit: ordersPagination.limit,
    expensesPage: expensesPagination.page,
    expensesLimit: expensesPagination.limit,
    topItemsPage: topItemsPagination.page,
    topItemsLimit: topItemsPagination.limit,
    datewiseSalesPage: datewiseSalesPagination.page,
    datewiseSalesLimit: datewiseSalesPagination.limit,
    dateType: dateFilter.type as any,
    fromDate: dateFilter.startDate,
    toDate: dateFilter.endDate,
    searchQuery,
  });

  const ZODUID = useAppSelector(ZoduId)

  const summaryQuery = useDashboardSummary(ZODUID, selectedBranch, {
  dateType: dateFilter.type,
  fromDate: dateFilter.startDate,
  toDate: dateFilter.endDate,
 });






    
 const ordersQuery = useDashboardOrders(ZODUID, selectedBranch, {
  page: ordersPagination.page,
  limit: ordersPagination.limit,
  dateType: dateFilter.type,
  fromDate: dateFilter.startDate,
  toDate: dateFilter.endDate,
});
/* Top Items */
const {
  data: topItemsData,
  fetchNextPage: fetchNextTopItemsPage,
  hasNextPage: hasNextTopItemsPage,
  isFetchingNextPage: isFetchingTopItemsNextPage,
  isLoading: isTopItemsLoading,
} = useInfiniteTopItems(ZODUID, selectedBranch, {
  page: topItemsPagination.page,
  limit: topItemsPagination.limit,
  dateType: dateFilter.type,
  fromDate: dateFilter.startDate,
  toDate: dateFilter.endDate,
});
const topItems =
  topItemsData?.pages.flatMap((page) => page.data || []) || [];

const topItemsTotal =
  topItemsData?.pages?.[0]?.pagination?.totalRecords || 0;
  console.log("💸 top items in DashboardLayout:", {
  topItems,
  topItemsData,
  topItemsTotal
});
/* Recent Orders */
 const {
  data: recentOrdersData,
  fetchNextPage: fetchNextRecentOrderPage,
  hasNextPage: hasNextRecentOrdersPage,
  isFetchingNextPage: isFetchingRecentOrdersNextPage,
  isLoading: isRecentOrdersLoading,
} = useInfiniteDashboardOrders(ZODUID, selectedBranch, {
  limit: 10,
  dateType: dateFilter.type,
  fromDate: dateFilter.startDate,
  toDate: dateFilter.endDate,
});
const recentOrders =
  recentOrdersData?.pages.flatMap((page) => page.data || []) || [];


const recentOrdersTotal =
  recentOrdersData?.pages?.[0]?.pagination?.total || 0;
console.log(recentOrdersData, "recentOrdersTotal in DashboardLayout");
console.log("💸 recent orders in DashboardLayout:", {
  recentOrders,
  recentOrdersData,
  recentOrdersTotal
});

/* Expenses */
const {
  data: expensesData,
  fetchNextPage: fetchNextExpensesPage,
  hasNextPage: hasNextExpensesPage,
  isFetchingNextPage: isFetchingNextExpensesPage,
  isLoading: isExpensesLoading,
} = useInfiniteDashboardExpenses(ZODUID, selectedBranch, {
  limit: 10,
  dateType: dateFilter.type,
  fromDate: dateFilter.startDate,
  toDate: dateFilter.endDate,
});

const expenses =
  expensesData?.pages.flatMap((page) => page.data || []) || [];
console.log("💸 expenses in DashboardLayout:", {
  expenses,
  expensesData,
});

const expensesTotal =
  expensesData?.pages?.[0]?.pagination?.totalRecords || 0;



// const topItemsQuery = useDashboardTopItems(ZODUID, selectedBranch, {
//   page: topItemsPagination.page,
//   limit: topItemsPagination.limit,
//   dateType: dateFilter.type,
//   fromDate: dateFilter.startDate,
//   toDate: dateFilter.endDate,
// });

const datewiseQuery = useDashboardDatewiseSales(ZODUID, selectedBranch, {
  page: datewiseSalesPagination.page,
  limit: datewiseSalesPagination.limit,
  dateType: dateFilter.type,
  fromDate: dateFilter.startDate,
  toDate: dateFilter.endDate,
});





  const applyDateFilter = useCallback((filterType: string) => {
    if (filterType === "custom") {
      setDateFilter({
        type: "custom",
        startDate: "",
        endDate: "",
      });
    } else {
      const { startDate, endDate } = getDateRange(filterType);
      setDateFilter({
        type: filterType,
        startDate,
        endDate,
      });
    }

    setOrdersPagination({ page: 1, limit: 10 });
    setExpensesPagination({ page: 1, limit: 10 });
    setTopItemsPagination({ page: 1, limit: 10 });
    setDatewiseSalesPagination({ page: 1, limit: 10 });
  }, []);

  const applyCustomDateRange = useCallback((start: string, end: string) => {
    setDateFilter({
      type: "custom",
      startDate: start,
      endDate: end,
    });

    setOrdersPagination({ page: 1, limit: 10 });
    setExpensesPagination({ page: 1, limit: 10 });
    setTopItemsPagination({ page: 1, limit: 10 });
    setDatewiseSalesPagination({ page: 1, limit: 10 });
  }, []);

  const handleOrdersPageChange = useCallback((_: any, page: number) => {
    setOrdersPagination((prev) => ({ ...prev, page }));
  }, []);

  const handleExpensesPageChange = useCallback((_: any, page: number) => {
    setExpensesPagination((prev) => ({ ...prev, page }));
  }, []);

  const handleTopItemsPageChange = useCallback((_: any, page: number) => {
    setTopItemsPagination((prev) => ({ ...prev, page }));
  }, []);

  const handleDatewiseSalesPageChange = useCallback((_: any, page: number) => {
    setDatewiseSalesPagination((prev) => ({ ...prev, page }));
  }, []);

  return (
    <Box
      sx={{
        height: "90vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f5f5f5",
        overflow: "hidden",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={3}
        py={2}
        bgcolor="#fff"
        borderBottom="1px solid #e0e0e0"
      >
        <Typography variant="h5" fontWeight="bold">
          Dashboard
        </Typography>

        <Box display="flex" gap={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <DateFilterNav
            selectedType={dateFilter.type}
            startDate={dateFilter.startDate}
            endDate={dateFilter.endDate}
            onFilterChange={applyDateFilter}
            onCustomRangeApply={applyCustomDateRange}
          />
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 3,
          py: 2,
        }}
      >
        {isLoading && !dashboardData?.summary ? (
          <>
            <Grid container spacing={2} mb={3}>
              {[1, 2, 3, 4].map((i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Card>
                    <CardContent>
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="80%" height={40} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={3} mb={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Card>
                  <CardContent>
                    <Skeleton variant="rectangular" height={400} />
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card>
                  <CardContent>
                    <Skeleton variant="rectangular" height={400} />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        ) : (
          <>
            <Grid container spacing={3} mb={3} alignItems="stretch">
              <Grid
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                size={{ xs: 12, md: 8 }}
              >
                <SummaryCards
                  summary={summaryQuery?.data?.data}
                  isLoading={isLoading}
                />
                <RecentOrders
                  orders={recentOrders}
                  totalCount={recentOrdersTotal}
                  currentPage={ordersQuery?.data?.data?.pagination?.page}
                  pageSize={ordersQuery?.data?.data?.pagination?.limit}
                  onPageChange={handleOrdersPageChange}
                  isLoading={isRecentOrdersLoading}
                  selectedBranch={selectedBranch}
                  hasNextPage={hasNextRecentOrdersPage}
                  fetchNextPage={fetchNextRecentOrderPage}
                  isFetchingNextPage={isFetchingRecentOrdersNextPage}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <DatewiseSales
                  data={datewiseQuery?.data?.data || []}
                  totalCount={
                    datewiseQuery?.data?.pagination?.totalRecords ||
                    datewiseQuery?.data?.pagination?.total ||
                    0
                  }
                  currentPage={
                    datewiseQuery?.data?.pagination?.page ||
                    datewiseSalesPagination.page
                  }
                  pageSize={
                    datewiseQuery?.data?.pagination?.limit ||
                    datewiseSalesPagination.limit
                  }
                  onPageChange={handleDatewiseSalesPageChange}
                  isLoading={datewiseQuery?.isPending}
                />
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6, lg: 8 }}>
                <ExpensesDataTable
                  expenses={expenses}
                  totalCount={expensesTotal}
                  isLoading={isExpensesLoading}
                  hasNextPage={hasNextExpensesPage}
                  fetchNextPage={fetchNextExpensesPage}
                  isFetchingNextPage={isFetchingNextExpensesPage}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <TopItems
                  items={topItems}
                  totalCount={topItemsTotal}
                  currentPage={1}
                  pageSize={10}
                  onPageChange={handleTopItemsPageChange}
                  isLoading={isTopItemsLoading}
                  fetchNextPage={fetchNextTopItemsPage}
                  hasNextPage={hasNextTopItemsPage}
                  isFetchingNextPage={isFetchingTopItemsNextPage}
                />
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
