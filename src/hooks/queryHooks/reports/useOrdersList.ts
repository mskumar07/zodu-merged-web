import { useQuery } from "@tanstack/react-query";
import { reportApi } from "@Services/ReportServices";
import type { FilterType, OrderItem, Pagination, ReportView } from "@/types/report";

interface UseOrdersListProps {
  zoduId: string;
  branchId: string;
  filterType: FilterType;
  reportView?: ReportView;
  page: number;
  limit: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  enabled?: boolean;
}

const useOrdersList = ({
  zoduId,
  branchId,
  filterType,
  reportView = "normal",
  page,
  limit,
  startDate,
  endDate,
  search = "",
  enabled = true,
}: UseOrdersListProps) => {
  const { data, ...rest } = useQuery({
    queryKey: [
      "orders-list",
      zoduId,
      branchId,
      filterType,
      reportView,
      page,
      startDate,
      endDate,
      search,
    ],
    queryFn: async () => {
      const params = {
        page,
        limit,
        filterType,
        start_date: startDate,
        end_date: endDate,
        search,
        reportView,
      };

      const response = await reportApi.getReportData(
        "orders",
        zoduId,
        branchId,
        params
      );

      return response;
    },
    enabled,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });

  const ordersList = data?.data?.orders || data?.data?.list || [];
  const totalRecords = data?.data?.total_orders || data?.data?.total_records || 0;
  const totalAmount = data?.data?.total_amount || 0;

  return {
    orders: ordersList,
    totalOrders: totalRecords,
    totalAmount,
    pagination: (data?.pagination || {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    }) as Pagination,
    ...rest,
  };
};

export default useOrdersList;
