import { apiSlice } from "./apiSlice";
import { apiConfig } from "@config/api";

export const attendanceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Mark Attendance
    markAttendance: builder.mutation<any, any>({
      query: (payload) => ({
        url: `/employee/attendance/mark`,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["Attendance"],
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

    // Admin / Team Dashboard
    getTeamDashboard: builder.query<any, void>({
      query: () => ({
        url: `/employee/attendance/dashboard/team`,
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


    // Check Today's Attendance Status
    checkTodayAttendanceStatus: builder.query<any, string>({
      query: (employeeId) => ({
        url: `/employee/attendance/today/attendance/${employeeId}`,
        method: "GET",
      }),
      providesTags: ["Attendance"],
    }),

    // Team Employee List
    getTeamEmployeeList: builder.query<any, {branch_id: string, date: string, page: number, limit: number}>({
      query: ({branch_id, date, page, limit}) => ({
        url: `/employee/attendance/team/employees?branch_id=${branch_id}&date=${date}&page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["Attendance"],
    }),
  }),
});

export const {
  useMarkAttendanceMutation,
  useRequestLeaveMutation,
  useApproveOrRejectLeaveMutation,
  useGetAttendanceHistoryQuery,
  useGetLeaveHistoryQuery,
  useGetTeamDashboardQuery,
  useGetLeaveRequestsQuery,
  useCheckTodayAttendanceStatusQuery,
  useGetTeamEmployeeListQuery,
} = attendanceApi;
