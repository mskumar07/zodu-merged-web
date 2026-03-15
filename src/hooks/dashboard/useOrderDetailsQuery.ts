import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@Services/DashBoardServices";

const ZODUID = "ZODU035";

interface OrderDetailsParams {
  branchId: string;
  orderId: string;
  enabled?: boolean;
}

export const useOrderDetailsQuery = ({ branchId, orderId, enabled = true }: OrderDetailsParams) => {
  return useQuery({
    queryKey: ["orderDetails", orderId, branchId],
    queryFn: async () => {
      console.log("🔍 Fetching order details:", orderId);
      const response = await dashboardApi.getOrderDetails(ZODUID, branchId, orderId);
      return response.data || response;
    },
    enabled: enabled && !!orderId && !!branchId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
