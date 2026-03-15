import { useQuery } from "@tanstack/react-query";
import { OrderReportService } from "@Services/OrderReportService";
import type {
  OrderCategoryReportParams,
  CategoryWiseOrder,
  CategoryWiseSummary,
  Pagination,
} from "@/types/report";
import { useState, useEffect, useMemo } from "react";

const REACT_QUERIES = {
  ORDER_CATEGORY_REPORT: (params: OrderCategoryReportParams) => [
    "order-category-report",
    params.page,
    params.limit,
    params.search,
  ],
};

interface UseOrderCategoryReportProps {
  params: OrderCategoryReportParams;
  enabled?: boolean;
}

const useOrderCategoryReport = ({
  params,
  enabled = true,
}: UseOrderCategoryReportProps) => {
  const [allPages, setAllPages] = useState<any[]>([]);

  const { data, ...rest } = useQuery({
    queryKey: REACT_QUERIES.ORDER_CATEGORY_REPORT(params),
    queryFn: () => OrderReportService.getOrderCategoryReport(params),
    enabled,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (params.page === 1) {
      setAllPages([]);
    }
  }, [params.search]);

  useEffect(() => {
    if (data) {
      setAllPages((prev) => {
        const existingPage = prev.find((p) => p.page === params.page);
        if (existingPage) {
          return prev;
        }
        return [...prev, { ...data, page: params.page }];
      });
    }
  }, [data, params.page]);

  const accumulatedData = useMemo(() => {
    const categories = allPages.flatMap((page) => page.Data || []);
    return categories;
  }, [allPages]);

  return {
    categories: accumulatedData as CategoryWiseOrder[],
    summary: (data?.summary || {
      totalOrders: 0,
      totalQty: 0,
      totalAmount: 0,
    }) as CategoryWiseSummary,
    pagination: (data?.pagination || {
      page: 1,
      limit: 10,
      totalRecords: 0,
      totalPages: 0,
    }) as Pagination,
    ...rest,
  };
};

export default useOrderCategoryReport;
