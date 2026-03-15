import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@Services/DashBoardServices";

export const useDashboardOrders = (zoduId: string, branchId: string, params: any) => {
  return useQuery({
    queryKey: [
  "dashboard-orders",
  branchId,
  params.page,
  params.limit,
  params.dateType,
  params.fromDate,
  params.toDate,
],
    queryFn: () =>
      dashboardApi.getOrders(zoduId, branchId, {
        page: params.page,
        limit: params.limit,
        dateType: params.dateType,
        fromDate: params.fromDate,
        toDate: params.toDate,
      }),
    enabled: !!branchId,
  });
};
