import { useQuery } from "@tanstack/react-query";
import { reportApi } from "@Services/ReportServices";
import type { FilterType, InventoryItem, InventorySummary, Pagination } from "@/types/report";

interface UseStocksInventoryReportProps {
  zoduId: string;
  branchId: string;
  filterType: FilterType;
  page: number;
  limit: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  category?: string;
  stockStatus?: string;
  enabled?: boolean;
  last_updated: string;
stock_alert: number;

}

const getStockStatus = (item: any): "in" | "low" | "out" => {
  if (item.stock_qty === null || item.stock_qty === 0) return "out";
  if (item.stock_alert !== null && item.stock_qty <= item.stock_alert)
    return "low";
  return "in";
};

const useStocksInventoryReport = ({
  zoduId,
  branchId,
  filterType,
  page,
  limit,
  startDate,
  endDate,
  search = "",
  category = "all",
  stockStatus = "all",
  enabled = true,
}: UseStocksInventoryReportProps) => {
  const { data, ...rest } = useQuery({
    queryKey: [
      "stocks-inventory-report",
      zoduId,
      branchId,
      filterType,
      page,
      startDate,
      endDate,
      search,
      category,
      stockStatus,
    ],
    queryFn: async () => {
      const params = {
        page,
        limit,
        filterType,
        start_date: startDate,
        end_date: endDate,
        reportView: "normal",
        search,
      };

      const response = await reportApi.getReportData(
        "inventory",
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

  const inventoryList = data?.data?.inventory_list || [];
 const stocksData: InventoryItem[] = inventoryList.map((item: any) => ({
  item_id: item.item_id,
  item_name: item.item_name,
  category_name: item.category_name,
  stock_qty: item.stock_qty || 0,
  unit_name: item.unit_name,
  purchase_price: item.purchase_price || 0,
  selling_price: item.selling_price || 0,
  stock_alert: item.stock_alert || 0,
  total_amount: item.total_amount || 0,
  last_updated: item.updated_at,   // ✅ ADD THIS
  status: getStockStatus(item),
}));


  let filteredData = stocksData;
  if (category !== "all") {
    filteredData = stocksData.filter(
      (item) => item.category_name?.toLowerCase() === category.toLowerCase()
    );
  }

  if (stockStatus !== "all") {
    filteredData = filteredData.filter((item) => item.status === stockStatus);
  }

  const totalItems = data?.data?.total_items || 0;
  const inStock = data?.data?.in_stock || 0;
  const lowStock = data?.data?.low_stock || 0;
  const outOfStock = data?.data?.out_of_stock || 0;
  const totalStockValue = data?.data?.total_stock_value || 0;

  return {
    stocks: filteredData,
    totalItems,
    inStockItems: inStock,
    lowStockItems: lowStock,
    outOfStockItems: outOfStock,
    totalStockValue,
    pagination: (data?.pagination || {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    }) as Pagination,
    ...rest,
  };
};

export default useStocksInventoryReport;
