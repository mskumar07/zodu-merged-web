import { baseURL } from "./ServicesList";
import axiosInstance from "@store/services/axiosInstance";
import { apiConfig } from "@config/api";
import type {
  ExpenseReportParams,
  ExpenseReportResponse,
} from "@/types/report";

interface AttachmentFile {
  id: string;
  filename: string;
  url: string;
}

interface ExpensePayloadItem {
  id: string;
  name: string;
  qty: number;
  purchase_price: number;
}

export interface CreateExpensePayload {
  zodu_id: string;
  branch_id: string;
  category: number;
  expense_date: string;
  total_amount: number;
  paid_amount: number;
  attachment_url: AttachmentFile[];
  payment_type: string;
  description: string;
  items: ExpensePayloadItem[];
}

export const ExpenseReportService = {
  getExpenseReport: async (
    params: ExpenseReportParams
  ): Promise<ExpenseReportResponse> => {
    const queryParams = new URLSearchParams({
      filtered_type: params.filterType,
      zodu_id: params.zodu_id,
      branch_id: params.branch_id,
    });

    if (params.search) queryParams.append("search", params.search);

    // Allow date filters for both date-wise and full lists (e.g. "all_purchase").
    if (params.start_date) queryParams.append("start_date", params.start_date);
    if (params.end_date) queryParams.append("end_date", params.end_date);

    if (params.filterType === "month_year_wise") {
      if (params.year) queryParams.append("year", params.year);
    }

    const url = `${apiConfig.report.getReport}/expense?${queryParams.toString()}`;
    const response = await axiosInstance.get<ExpenseReportResponse>(url);
    return response.data;
  },
};

export default {
  createExpense: (payload: CreateExpensePayload) => {
    return baseURL.post('/restaurant/api/add/expense', payload);
  },
   createCategoryExpense: (payload: CreateExpensePayload) => {
    return baseURL.post('/restaurant/add/expense-category', payload);
  },

};