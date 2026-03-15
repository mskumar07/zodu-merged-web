import axiosInstance from "@store/services/axiosInstance";
import { apiConfig } from "@config/api";
import type {
  PurchaseReportParams,
  PurchaseReportResponse,
} from "@/types/report";

export const PurchaseReportService = {
  getPurchaseReport: async (
    params: PurchaseReportParams
  ): Promise<PurchaseReportResponse> => {
    const queryParams = new URLSearchParams({
      filtered_type: params.filterType,
      zodu_id: params.zodu_id,
      branch_id: params.branch_id,
      page: params.page.toString(),
      limit: params.limit.toString(),
    });

    if (params.search) queryParams.append("search", params.search);

    // Allow date filters for both date-wise and full lists (e.g. "all_purchase").
    if (params.start_date) queryParams.append("start_date", params.start_date);
    if (params.end_date) queryParams.append("end_date", params.end_date);

    if (params.filterType === "month_year_wise") {
      if (params.year) queryParams.append("year", params.year);
    }

    const url = `${apiConfig.report.getReport}/purchase?${queryParams.toString()}`;
    const response = await axiosInstance.get<PurchaseReportResponse>(url);
    return response.data;
  },
};
