import { useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDashboardDataQuery } from "@hooks/queryHooks/dashboard";
import { getDateRange } from "@Services/ReportServices";
import { dashboardApi } from "@Services/DashBoardServices";

// const ZODUID = "ZODU035";
const STORAGE_KEY = "dashboard_selected_branch";

export const useDashboard = () => {
  const queryClient = useQueryClient();

  const [selectedBranch, setSelectedBranch] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ;
  });

  const [dateFilter, setDateFilter] = useState({
    type: "today" as string,
    startDate: "",
    endDate: "",
  });

  const [searchQuery, setSearchQuery] = useState("");

  const [ordersPagination, setOrdersPagination] = useState({ page: 1, limit: 10 });
  const [expensesPagination, setExpensesPagination] = useState({ page: 1, limit: 10 });
  const [topItemsPagination, setTopItemsPagination] = useState({ page: 1, limit: 10 });
  const [datewiseSalesPagination, setDatewiseSalesPagination] = useState({ page: 1, limit: 10 });

  const [previousBranch, setPreviousBranch] = useState<string | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isLoadingOrderDetails, setIsLoadingOrderDetails] = useState(false);

  useEffect(() => {
    const { startDate, endDate } = getDateRange("today");
    console.log("🎯 Setting initial date filter:", { startDate, endDate });
    setDateFilter({
      type: "today",
      startDate,
      endDate,
    });
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      localStorage.setItem(STORAGE_KEY, selectedBranch);
    }
  }, [selectedBranch]);

  const handleBranchChange = useCallback(
    (newBranch: string) => {
      queryClient.removeQueries({ queryKey: ["dashboard"] });

      setOrdersPagination({ page: 1, limit: 10 });
      setExpensesPagination({ page: 1, limit: 10 });
      setTopItemsPagination({ page: 1, limit: 10 });
      setDatewiseSalesPagination({ page: 1, limit: 10 });

      setSelectedOrder(null);
      setIsOrderModalOpen(false);

      setPreviousBranch(selectedBranch);
      setSelectedBranch(newBranch);
    },
    [selectedBranch, queryClient]
  );

  const applyDateFilter = useCallback((filterType: string) => {
    console.log("📅 Applying date filter:", filterType);
    if (filterType === "custom") {
      setDateFilter({
        type: "custom",
        startDate: "",
        endDate: "",
      });
    } else {
      const { startDate, endDate } = getDateRange(filterType);
      console.log("📅 Date range for", filterType, ":", { startDate, endDate });
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

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);

    setOrdersPagination({ page: 1, limit: 10 });
    setExpensesPagination({ page: 1, limit: 10 });
    setTopItemsPagination({ page: 1, limit: 10 });
    setDatewiseSalesPagination({ page: 1, limit: 10 });
  }, []);

  const fetchOrderDetails = useCallback(
    async (orderId: string) => {
      try {
        setIsLoadingOrderDetails(true);
        const response = await dashboardApi.getOrderDetails(
          ZODUID,
          selectedBranch,
          orderId
        );
        return response.data || response;
      } finally {
        setIsLoadingOrderDetails(false);
      }
    },
    [selectedBranch]
  );

  const {
    data: dashboardResponse,
    isLoading: dashboardLoading,
    isFetching: dashboardFetching,
    refetch: refetchDashboard,
    error: dashboardError,
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

  const openOrderModal = useCallback(
    async (order: any) => {
      const orderDetails = await fetchOrderDetails(order.order_id);
      setSelectedOrder(orderDetails);
      setIsOrderModalOpen(true);
    },
    [fetchOrderDetails]
  );

  const closeOrderModal = useCallback(() => {
    setSelectedOrder(null);
    setIsOrderModalOpen(false);
  }, []);

  console.log("🎁 useDashboard returning:", {
    dashboardResponse,
    isLoading: dashboardLoading,
    isFetching: dashboardFetching,
    error: dashboardError,
  });

  return {
    selectedBranch,
    dateFilter,
    searchQuery,
    previousBranch,

    setSelectedBranch: handleBranchChange,
    applyDateFilter,
    applyCustomDateRange,
    handleSearch,

    ordersPagination,
    expensesPagination,
    topItemsPagination,
    datewiseSalesPagination,

    handleOrdersPageChange,
    handleExpensesPageChange,
    handleTopItemsPageChange,
    handleDatewiseSalesPageChange,

    selectedOrder,
    isOrderModalOpen,
    isLoadingOrderDetails,

    dashboardData: dashboardResponse ?? {
      summary: {
        total_orders: 0,
        total_amount: 0,
        total_expense: 0,
        low_stocks: 0,
      },
      orders: [],
      orders_total_count: 0,
      expenses: [],
      expenses_total_count: 0,
      top_items: [],
      top_items_total_count: 0,
      datewise_sales: [],
      datewise_sales_total_count: 0,
    },

    isLoading: dashboardLoading,
    isFetching: dashboardFetching,
    error: dashboardError,

    openOrderModal,
    closeOrderModal,

    refetchDashboard,
  };
};
