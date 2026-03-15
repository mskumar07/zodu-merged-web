import { useInfiniteQuery } from "@tanstack/react-query";
import { dashboardApi } from "@Services/DashBoardServices";

export const useInfiniteDashboardOrders = (
  zoduId: string,
  branchId: string,
  params: {
    limit: number;
    dateType: string;
    fromDate: string;
    toDate: string;
  }
) => {
  return useInfiniteQuery({
    queryKey: [
      "dashboard-orders-infinite",
      branchId,
      params.limit,
      params.dateType,
      params.fromDate,
      params.toDate,
    ],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await dashboardApi.getOrders(zoduId, branchId, {
        page: pageParam,
        limit: params.limit,
        dateType: params.dateType,
        fromDate: params.fromDate,
        toDate: params.toDate,
      });

      return response;
    },
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage?.pagination?.page;
      const totalPages = lastPage?.pagination?.totalPages;
      console.log(currentPage, totalPages, "getNextPageParam called with Dashboard orders:");
      if (currentPage < totalPages) {
        return currentPage + 1;
      }

      return undefined;
    },
    enabled: !!branchId && !!params.fromDate,
  });
};
