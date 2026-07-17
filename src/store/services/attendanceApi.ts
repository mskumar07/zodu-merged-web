import { apiSlice } from "./apiSlice";
import { apiConfig } from "@config/api";

// ─── Shared attendance status enum (matches backend `status` column) ──────
export type AttendanceStatus = "Present" | "Absent" | "Weekly Off";

// ─── Mark Attendance (bulk save) ───────────────────────────────────────────

export interface MarkAttendanceRecord {
  employee_id: string;
  status: AttendanceStatus;
  check_in_time: string | null;
  check_out_time: string | null;
  remarks: string | null;
}

export interface MarkAttendancePayload {
  zodu_id: string;
  branch_id: string;
  attendance_date: string; // YYYY-MM-DD
  marked_by: string;
  marked_by_name: string;
  records: MarkAttendanceRecord[];
}

export interface MarkAttendanceResponseRow {
  id: string;
  zodu_id: string;
  branch_id: string;
  employee_id: string;
  attendance_date: string;
  status: AttendanceStatus;
  check_in_time: string | null;
  check_out_time: string | null;
  remarks: string | null;
  marked_by: string;
  marked_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface MarkAttendanceResponse {
  success: boolean;
  data: MarkAttendanceResponseRow[];
}

// ─── Mark Attendance (paginated employee list for a given date) ───────────

export interface MarkAttendanceListRow {
  employee_id: string;
  employee_code: string;
  employee_name: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: AttendanceStatus | null;
}

export interface MarkAttendanceListPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface MarkAttendanceListResponse {
  success: boolean;
  data: MarkAttendanceListRow[];
  pagination: MarkAttendanceListPagination;
}

export interface MarkAttendanceListParams {
  zodu_id: string;
  branch_id: string;
  attendance_date: string; // YYYY-MM-DD
  page: number;
  limit?: number;
}

// ─── Team Attendance (grid + summary) ──────────────────────────────────────

export interface TeamAttendanceDayEntry {
  status: AttendanceStatus;
  check_in_time: string | null;
  check_out_time: string | null;
}

export interface TeamAttendanceEmployee {
  employee_id: string;
  employee_code: string;
  employee_name: string;
  designation: string | null;
  present_days: number;
  absent_days: number;
  days: Record<string, TeamAttendanceDayEntry>;
}

export interface TeamAttendanceSummary {
  avg_present_days: number;
  avg_attendance_pct: number;
  avg_absent_pct: number;
}

export interface TeamAttendanceResponse {
  success: boolean;
  data: {
    summary: TeamAttendanceSummary;
    employees: TeamAttendanceEmployee[];
  };
}

export interface TeamAttendanceParams {
  zodu_id: string;
  branch_id: string;
  employee_id: string;
  month?: number; // 1-12
  year?: number;
}

// ─── My Attendance (personal daily view + summary) ─────────────────────────

export interface MyAttendanceDayEntry {
  attendance_date: string;
  status: AttendanceStatus;
  check_in_time: string | null;
  check_out_time: string | null;
  remarks: string | null;
}

export interface MyAttendanceSummary {
  present_days: number;
  absent_days: number;
  attendance_pct: number;
}

export interface MyAttendanceResponse {
  success: boolean;
  data: {
    summary: MyAttendanceSummary;
    days: MyAttendanceDayEntry[];
  };
}

export interface MyAttendanceParams {
  zodu_id: string;
  branch_id: string;
  employee_id: string;
  month?: number;
  year?: number;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") qs.append(key, String(value));
  });
  return qs.toString();
}

export const attendanceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Mark Attendance — bulk upsert for one date across all employees
    markAttendance: builder.mutation<MarkAttendanceResponse, MarkAttendancePayload>({
      query: (payload) => ({
        url: `/employee/api/attendance`,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["Attendance"],
    }),

    // Mark Attendance — paginated employee list (+ existing marks) for one date, infinite-scroll
    getMarkAttendanceList: builder.query<MarkAttendanceListResponse, MarkAttendanceListParams>({
      query: ({ zodu_id, branch_id, attendance_date, page, limit = 10 }) => ({
        url: `/employee/api/attendance/mark?${buildQuery({ zodu_id, branch_id, attendance_date, page, limit })}`,
        method: "GET",
      }),
      serializeQueryArgs: ({ queryArgs }) => {
        const { zodu_id, branch_id, attendance_date, limit = 10 } = queryArgs;
        return `${zodu_id}|${branch_id}|${attendance_date}|${limit}`;
      },
      merge: (currentCache, incoming) => {
        if (incoming.pagination.page === 1) {
          currentCache.data = incoming.data;
        } else {
          currentCache.data.push(...incoming.data);
        }
        currentCache.pagination = incoming.pagination;
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.page !== previousArg?.page,
      providesTags: ["Attendance"],
    }),

    // Team Attendance — powers the grid + left summary cards
    getTeamAttendance: builder.query<TeamAttendanceResponse, TeamAttendanceParams>({
      query: ({ zodu_id, branch_id, employee_id, month, year }) => ({
        url: `/employee/api/attendance/team?${buildQuery({ zodu_id, branch_id, employee_id, month, year })}`,
        method: "GET",
      }),
      providesTags: ["Attendance"],
    }),

    // My Attendance — powers the personal cards + daily strip
    getMyAttendance: builder.query<MyAttendanceResponse, MyAttendanceParams>({
      query: ({ zodu_id, branch_id, employee_id, month, year }) => ({
        url: `/employee/api/attendance/my?${buildQuery({ zodu_id, branch_id, employee_id, month, year })}`,
        method: "GET",
      }),
      providesTags: ["Attendance"],
    }),

    // Raise Leave Request
    requestLeave: builder.mutation<any, any>({
      query: (payload) => ({
        url: `/employee/attendance/leave`,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["Attendance"],
    }),

    // Approve / Reject Leave
    approveOrRejectLeave: builder.mutation<any,{ leaveId: string; status: "APPROVED" | "REJECTED"; remarks?: string }>({
      query: (payload) => ({
        url: `/employee/attendance/leave/action`,
        method: "PUT",
        data: payload,
      }),
      invalidatesTags: ["Attendance"],
    }),

    // Attendance History
    getAttendanceHistory: builder.query<any, string>({
      query: (employeeId) => ({
        url: `/employee/attendance/history/${employeeId}`,
        method: "GET",
      }),
      providesTags: ["Attendance"],
    }),

    // Leave History
    getLeaveHistory: builder.query<any, string>({
      query: (employeeId) => ({
        url: `/employee/attendance/leave/history/${employeeId}`,
        method: "GET",
      }),
      providesTags: ["Attendance"],
    }),

    // All Leave Requests (Admin)
getLeaveRequests: builder.query<
  any,
  {
    branchId: string;
    status?: string;
    limit?: number;
    offset?: number;
  }
>({
  query: ({ branchId, status, limit = 20, offset = 0 }) => {
    const query = new URLSearchParams({
      branch_id:branchId,
      ...(status && { status }),
      limit: String(limit),
      offset: String(offset),
    }).toString();

    return {
      url: `/employee/attendance/leave/requests?${query}`,
      method: "GET",
    };
  },
  providesTags: ["Attendance"],
}),
  }),
});

export const {
  useMarkAttendanceMutation,
  useGetMarkAttendanceListQuery,
  useGetTeamAttendanceQuery,
  useGetMyAttendanceQuery,
  useRequestLeaveMutation,
  useApproveOrRejectLeaveMutation,
  useGetAttendanceHistoryQuery,
  useGetLeaveHistoryQuery,
  useGetLeaveRequestsQuery,
} = attendanceApi;
