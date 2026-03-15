import axiosInstance from "@store/services/axiosInstance";
import { apiConfig } from "@config/api";
import type {
  OrdersReportParams,
  OrdersReportResponse,
  OrderCategoryReportParams,
  OrderCategoryReportResponse
} from "@/types/report";

export const OrderReportService = {
  getOrdersReport: async (
    params: OrdersReportParams
  ): Promise<OrdersReportResponse> => {
    const queryParams = new URLSearchParams({
      zodu_id: params.zodu_id,
      branch_id: params.branch_id,
      page: String(params.page),
      limit: String(params.limit),
      filtered_type: params.filterType,
    });

    if (params.search) queryParams.append("search", params.search);

    if (params.filterType === "date_wise" || params.filterType === "all_orders") {
      if (params.start_date) queryParams.append("start_date", params.start_date);
      if (params.end_date) queryParams.append("end_date", params.end_date);
    }

    if (params.filterType === "month_year_wise") {
      if (params.year) queryParams.append("year", params.year);
    }

    const url = `${apiConfig.report.getReport}/orders?${queryParams.toString()}`;
    const response = await axiosInstance.get<OrdersReportResponse>(url);
    return response.data;
  },

  getOrderCategoryReport: async (
    params: OrderCategoryReportParams
  ): Promise<OrderCategoryReportResponse> => {
    const queryParams = new URLSearchParams({
      zodu_id: params.zodu_id,
      branch_id: params.branch_id,
    });

    if (params.search) {
      queryParams.append("search", params.search);
    }

    const url = `/restaurant/get/report/order-category?${queryParams.toString()}`;
    const response = await axiosInstance.get<OrderCategoryReportResponse>(url);
    return response.data;
  },
};
