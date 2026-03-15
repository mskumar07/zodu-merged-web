import { apiSlice } from "./apiSlice";
import { apiConfig } from "@config/api";

/* ============================
   TYPES
============================ */

export type ReportType =
  | "expense"
  | "order"
  | "inventory"
  | "purchase";

export type FilterType =
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "custom";

export type ReportView =
  | "normal"
  | "monthwise"
  | "yearwise";

export interface ReportParams {
  zodu_id: string;
  branch_id: string;

  type: ReportType;
  filter: FilterType;

  /** replaces wiseData */
  reportView?: ReportView;

  /** search */
  search?: string;

  /** pagination (normal view) */
  page?: number;
  limit?: number;

  /** sorting (normal view) */
  sortBy?: string;
  sortOrder?: "asc" | "desc";

  /** custom date */
  start_date?: string;
  end_date?: string;
}

export interface ReportResponse {
  success: boolean;
  data: any; // summary object OR chart array
}

/* ============================
   API
============================ */

export const reportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
   getReport: builder.query<ReportResponse, ReportParams>({
  query: ({
    zodu_id,
    branch_id,
    type,
    filter,
    reportView = "normal",
    search = "",
    page = 1,
    limit = 10,
    sortBy = "created_at",
    sortOrder = "desc",
    start_date,
    end_date,
  }) => {
    const params = new URLSearchParams({
      filterType: filter,          // 🔥 matches backend
      reportView,
      page: String(page),
      limit: String(limit),
      sortBy,
      sortOrder,
    });

    if (search) params.append("search", search);

    if (filter === "custom" && start_date && end_date) {
      params.append("start_date", start_date);
      params.append("end_date", end_date);
    }

    return {
      url: `${apiConfig.report.getReport}/${type}/${zodu_id}/${branch_id}?${params.toString()}`,
      method: "GET",
    };
  },
  providesTags: ["Report"],
}),

  }),
});

export const { useGetReportQuery } = reportApi;
