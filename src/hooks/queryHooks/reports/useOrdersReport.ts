import { useQuery } from "@tanstack/react-query";
import { OrderReportService } from "@Services/OrderReportService";
import type {
  OrdersReportParams,
  OrderItem,
  OrderChartItem,
  Pagination,
} from "@/types/report";
import { useState, useEffect, useMemo } from "react";

const REACT_QUERIES = {
  ORDERS_REPORT: (params: OrdersReportParams) => [
    "orders-report",
    params.filterType,
    params.page,
    params.limit,
    params.start_date,
    params.end_date,
    params.year,
    params.search,
  ],
};

interface UseOrdersReportProps {
  params: OrdersReportParams;
  enabled?: boolean;
}

const useOrdersReport = ({ params, enabled = true }: UseOrdersReportProps) => {
  const [allPages, setAllPages] = useState<any[]>([]);

  const { data, ...rest } = useQuery({
    queryKey: REACT_QUERIES.ORDERS_REPORT(params),
    queryFn: () => OrderReportService.getOrdersReport(params),
    enabled,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (params.page === 1) {
      setAllPages([]);
    }
  }, [params.filterType, params.start_date, params.end_date, params.year, params.search]);

  useEffect(() => {
    if (data) {
      setAllPages(prev => {
        const existingPage = prev.find(p => p.page === params.page);
        if (existingPage) {
          return prev;
        }
        return [...prev, { ...data, page: params.page }];
      });
    }
  }, [data, params.page]);

  const accumulatedData = useMemo(() => {
    let list: any[] = [];
    let chartData: any[] = [];

    if (params.filterType === "all_orders") {
      const allOrders = allPages.flatMap(page => page.all_orders || []);
      const uniqueMap = new Map();
      allOrders.forEach(order => {
        const uniqueOrderKey =
          order.api_order_id || order.order_id || order.public_order_no;
        if (!uniqueOrderKey) return;
        if (!uniqueMap.has(uniqueOrderKey)) {
          uniqueMap.set(uniqueOrderKey, order);
        }
      });
      list = Array.from(uniqueMap.values());
    }

    if (params.filterType === "date_wise") {
      const allDateWise = allPages.flatMap(page => page.datewise_summary || []);
      const uniqueMap = new Map();
      allDateWise.forEach(item => {
        const uniqueDateKey = item.created_at || item.date;
        if (!uniqueDateKey) return;
        if (!uniqueMap.has(uniqueDateKey)) {
          uniqueMap.set(uniqueDateKey, item);
        }
      });
      chartData = Array.from(uniqueMap.values());
    }

    if (params.filterType === "month_year_wise") {
      const yearData = allPages[allPages.length - 1]?.monthly_summary?.[0];
      chartData = yearData?.months || [];
    }

    return { list, chartData };
  }, [allPages, params.filterType]);
console.log("accumulatedData:", accumulatedData)
console.log("data from query:",  {
    list: accumulatedData.list as OrderItem[],
    chartData: accumulatedData.chartData as OrderChartItem[],
    totalAmount: data?.totalAmount,
    totalItems: data?.totalItems,
    pagination: (data?.pagination || {
      page: 1,
      limit: 10,
      totalRecords: 0,
      totalPages: 0,
    }) as Pagination,
    success: data?.success || false,
    ...rest,
  })
  return {
    list: accumulatedData.list as OrderItem[],
    chartData: accumulatedData.chartData as OrderChartItem[],
    totalAmount: data?.totalAmount,
    totalItems: data?.totalItems,
    pagination: (data?.pagination || {
      page: 1,
      limit: 10,
      totalRecords: 0,
      totalPages: 0,
    }) as Pagination,
    success: data?.success || false,
    ...rest,
  };
};

export default useOrdersReport;
