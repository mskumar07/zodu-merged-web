
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@Services/DashBoardServices";

export const useDashboardSummary = (zoduId: string, branchId: string, params: any) => {
  return useQuery({
    queryKey: ["dashboard-summary", branchId, params.dateType, params.fromDate, params.toDate],
    queryFn: () =>
      dashboardApi.getSummary(zoduId, branchId, {
        dateType: params.dateType,
        fromDate: params.fromDate,
        toDate: params.toDate,
        branch_ids:"ZODU035B1,ZODU035B2"
      }),
    enabled: !!branchId && !!params.fromDate,
  });
};