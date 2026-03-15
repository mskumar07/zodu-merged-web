import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@Services/DashBoardServices";

const ZODUID = "ZODU035";

interface DashboardParams {
  branchId: string;
  ordersPage: number;
  ordersLimit: number;
  expensesPage: number;
  expensesLimit: number;
  topItemsPage: number;
  topItemsLimit: number;
  datewiseSalesPage: number;
  datewiseSalesLimit: number;
  dateType: "today" | "yesterday" | "week" | "30days" | "custom";
  fromDate: string;
  toDate: string;
  searchQuery?: string;
}

export const useDashboardDataQuery = (params: DashboardParams) => {
  return useQuery({
    queryKey: [
      "dashboard",
      params.branchId,
      params.dateType,
      params.fromDate,
      params.toDate,
      params.searchQuery,
      params.ordersPage,
      params.expensesPage,
      params.topItemsPage,
      params.datewiseSalesPage,
    ],
    queryFn: async () => {
      console.log("🔍 Dashboard Query Running with:", {
        dateType: params.dateType,
        fromDate: params.fromDate,
        toDate: params.toDate,
      });

      const response = await dashboardApi.getDashboardData(ZODUID, params.branchId, {
        ordersPage: params.ordersPage,
        ordersLimit: params.ordersLimit,
        expensesPage: params.expensesPage,
        expensesLimit: params.expensesLimit,
        topItemsPage: params.topItemsPage,
        topItemsLimit: params.topItemsLimit,
        datewiseSalesPage: params.datewiseSalesPage,
        datewiseSalesLimit: params.datewiseSalesLimit,
        dateType: params.dateType,
        fromDate: params.fromDate,
        toDate: params.toDate,
      });

      console.log("📦 Dashboard Response:", response);
      const data = response.data || response;
      console.log("📊 Dashboard Data:", data);
      console.log("📈 Pagination:", response.pagination);

      const transformedData = {
        summary: {
          total_orders: Number(data.summary?.total_orders) || 0,
          total_amount: Number(data.summary?.total_sales || data.summary?.total_amount) || 0,
          total_expense: Number(data.summary?.total_expense) || 0,
          low_stocks: Number(data.summary?.low_stocks) || 0,
        },
        orders: data.orders || [],
        orders_total_count: Number(response.pagination?.orders?.total) || 0,

        expenses: data.expenses || [],
        expenses_total_count: Number(response.pagination?.expenses?.total) || 0,

        top_items: data.top_items || [],
        top_items_total_count: Number(response.pagination?.topItems?.total) || 0,

        datewise_sales: data.datewise_sales || [],
        datewise_sales_total_count: Number(response.pagination?.datewise?.total) || 0,
      };

      return transformedData;
    },
    enabled: !!params.branchId && !!params.fromDate,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};
