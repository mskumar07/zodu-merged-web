import { useQuery } from "@tanstack/react-query";
import { PurchaseReportService } from "@Services/PurchaseServices";
import type {
  PurchaseReportParams,
  PurchaseItem,
  PurchaseDateWise,
  PurchaseYearData,
  Pagination,
} from "@/types/report";
import { useState, useEffect, useMemo } from "react";

const REACT_QUERIES = {
  PURCHASE_REPORT: (params: PurchaseReportParams) => [
    "purchase-report",
    params.filterType,
    params.page,
    params.limit,
    params.start_date,
    params.end_date,
    params.year,
    params.search,
  ],
};

interface UsePurchaseReportProps {
  params: PurchaseReportParams;
  enabled?: boolean;
}

const usePurchaseReport = ({ params, enabled = true }: UsePurchaseReportProps) => {
  const [allPages, setAllPages] = useState<any[]>([]);

  const { data, ...rest } = useQuery({
    queryKey: REACT_QUERIES.PURCHASE_REPORT(params),
    queryFn: () => PurchaseReportService.getPurchaseReport(params),
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
    let list: PurchaseItem[] = [];
    let dateWiseData: PurchaseDateWise[] = [];
    let yearData: PurchaseYearData[] = [];

    if (params.filterType === "all_purchase") {
      const allOrders = allPages.flatMap(page => page.all_orders || []);
      const uniqueMap = new Map();
      allOrders.forEach(order => {
        const uniqueOrderKey = order.purchase_id || order.id;
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
      dateWiseData = Array.from(uniqueMap.values());
    }

    if (params.filterType === "month_year_wise") {
      yearData = allPages[allPages.length - 1]?.monthly_summary || [];
    }

    return { list, dateWiseData, yearData };
  }, [allPages, params.filterType]);

  return {
    list: accumulatedData.list,
    dateWiseData: accumulatedData.dateWiseData,
    yearData: accumulatedData.yearData,
    overAllPurchase: data?.over_all_purchase || 0,
    overAllTotalAmount: data?.over_all_total_amount || 0,
    overAllTotalPaid: data?.over_all_total_paid || 0,
    overAllTotalDue: data?.over_all_total_due || 0,
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

export default usePurchaseReport;
