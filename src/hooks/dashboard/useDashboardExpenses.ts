import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@Services/DashBoardServices";

export const useDashboardExpenses = (
  zoduId: string,
  branchId: string,
  params: {
    page: number;
    limit: number;
    dateType: string;
    fromDate: string;
    toDate: string;
  }
) => {
  return useQuery({
    queryKey: [
      "dashboard-expenses",
      branchId,
      params.page,
      params.limit,
      params.dateType,
      params.fromDate,
      params.toDate,
    ],
    queryFn: () =>
      dashboardApi.getDashboardExpenses(zoduId, branchId, {
        page: params.page,
        limit: params.limit,
        dateType: params.dateType,
        fromDate: params.fromDate,
        toDate: params.toDate,
                branch_ids:"ZODU035B1,ZODU035B2"

      }),
    enabled: !!branchId && !!params.fromDate,
  });
};
