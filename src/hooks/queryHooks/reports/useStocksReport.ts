import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@store/services/axiosInstance";
import { apiConfig } from "@config/api";

const REACT_QUERIES = {
  STOCKS_REPORT: (branchId: string, inventoryType?: string) => [
    "stocks-report",
    branchId,
    inventoryType,
  ],
};

interface StockItem {
  item_id: string;
  item_name: string;
  category_name: string;
  current_stock: number;
  min_stock: number;
  unit: string;
  value: number;
  status: "inStock" | "lowStock" | "outOfStock";
}

interface UseStocksReportProps {
  branchId: string;
  inventoryType?: string;
  enabled?: boolean;
}

const useStocksReport = ({
  branchId,
  inventoryType,
  enabled = true,
}: UseStocksReportProps) => {
  const { data, ...rest } = useQuery({
    queryKey: REACT_QUERIES.STOCKS_REPORT(branchId, inventoryType),
    queryFn: async () => {
      const response = await axiosInstance.get(
        apiConfig.inventory.getInventoryList(branchId, inventoryType)
      );
      return response.data;
    },
    enabled,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
    select: (data) => {
      const items: StockItem[] = (data?.data || []).map((item: any) => {
        const currentStock = item.current_stock || 0;
        const minStock = item.min_stock || 0;
        let status: "inStock" | "lowStock" | "outOfStock" = "inStock";

        if (currentStock === 0) {
          status = "outOfStock";
        } else if (currentStock <= minStock) {
          status = "lowStock";
        }

        return {
          item_id: item.item_id,
          item_name: item.item_name,
          category_name: item.category_name,
          current_stock: currentStock,
          min_stock: minStock,
          unit: item.unit,
          value: item.value || 0,
          status,
        };
      });

      const inStockCount = items.filter((i) => i.status === "inStock").length;
      const lowStockCount = items.filter((i) => i.status === "lowStock").length;
      const outOfStockCount = items.filter(
        (i) => i.status === "outOfStock"
      ).length;

      return {
        items,
        totalItems: items.length,
        inStockCount,
        lowStockCount,
        outOfStockCount,
      };
    },
  });

  return {
    items: data?.items || [],
    totalItems: data?.totalItems || 0,
    inStockCount: data?.inStockCount || 0,
    lowStockCount: data?.lowStockCount || 0,
    outOfStockCount: data?.outOfStockCount || 0,
    ...rest,
  };
};

export default useStocksReport;
