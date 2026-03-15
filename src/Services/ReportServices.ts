import { apiConfig } from "@config/api";
import axiosInstance from "@store/services/axiosInstance";

export const reportApi = {
  getReportData: async (
    type: "orders" | "purchase" | "expense" | "inventory",
    zoduId: string,
    branchId: string,
    params: {
      page?: number;
      limit?: number;
      filterType?: string;
      start_date?: string;
      end_date?: string;
      summaryType?: string;
      search?: string;
      reportView?: string;
    }
  ) => {
    console.log(
      `📋 [${type.toUpperCase()} API] Calling with filterType:`,
      params.filterType
    );

    try {
      const response = await axiosInstance.get(
        apiConfig.report.getReport + `/${type}/${zoduId}/${branchId}`,
        {
          params: {
            page: params.page || 1,
            limit: params.limit || 10,
            filterType: params.filterType || "today", // Ensure filterType is sent
            start_date: params.start_date,
            end_date: params.end_date,
            summaryType: params.summaryType || "all",
            search: params.search || "",
            reportView: params.reportView || "normal",
          },
        }
      );
      console.log(`✅ ${type.toUpperCase()} API Response:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ ${type.toUpperCase()} API Error:`, error);
      return {
        data: {
          [type === "orders"
            ? "orders"
            : type === "expense"
            ? "expenses"
            : "items"]: [],
        },
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: 0,
          totalPages: 0,
        },
      };
    }
  },
};
export const getDateRange = (
  filterType: string
): { startDate: string; endDate: string } => {
  const today = new Date();
  const start = new Date();
  const end = new Date();

  switch (filterType) {
    case "today":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "week":
      start.setDate(today.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "month":
      start.setDate(today.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "year":
      start.setFullYear(today.getFullYear(), 0, 1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "custom":
      // For custom, dates are already set
      break;
    default:
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
  }

  // Format to YYYY-MM-DD
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return {
    startDate: filterType === "custom" ? "" : formatDate(start),
    endDate: filterType === "custom" ? "" : formatDate(end),
  };
};
