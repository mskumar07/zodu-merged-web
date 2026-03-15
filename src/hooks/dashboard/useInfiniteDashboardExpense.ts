import { useInfiniteQuery } from "@tanstack/react-query";
import { dashboardApi } from "@Services/DashBoardServices";

export const useInfiniteDashboardExpenses = (
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
      "dashboard-expenses-infinite",
      branchId,
      params.limit,
      params.dateType,
      params.fromDate,
      params.toDate,
    ],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      return dashboardApi.getDashboardExpenses(zoduId, branchId, {
        page: pageParam,
        limit: params.limit,
        dateType: params.dateType,
        fromDate: params.fromDate,
        toDate: params.toDate,
      });
    },
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage?.pagination?.page;
      const totalPages = lastPage?.pagination?.totalPages;
      console.log(currentPage, totalPages, "getNextPageParam called with:");
      if (currentPage < totalPages) {
        return currentPage + 1;
      }

      return undefined;
    },
    enabled: !!branchId && !!params.fromDate,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};
