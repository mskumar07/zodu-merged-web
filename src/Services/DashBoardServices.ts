// @Services/DashBoardServices.ts
import { apiConfig } from "@config/api";
import axiosInstance from "@store/services/axiosInstance";

const RESTAURANT_BASE = "restaurant";
export const dashboardApi = {
  

  /* =====================================================
     🟢 1️⃣ DASHBOARD SUMMARY
  ===================================================== */
  getSummary: async (
    zoduId: string,
    branchId: string,
    params: {
      dateType?: string;
      fromDate?: string;
      toDate?: string;
      branch_ids?: string;
    }
  ) => {
    try {
      const response = await axiosInstance.get(
        `${RESTAURANT_BASE}/api/dashboard/summary/${zoduId}`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("❌ Summary API Error:", error);
      throw error;
    }
  },

  /* =====================================================
     🟢 2️⃣ DASHBOARD ORDERS (Infinite Scroll)
  ===================================================== */
  getOrders: async (
    zoduId: string,
    branchId: string,
    params: {
      page?: number;
      limit?: number;
      sortOrder?: "asc" | "desc";
      dateType?: string;
      fromDate?: string;
      toDate?: string;
      branch_ids?: string;
    }
  ) => {
    try {
      const response = await axiosInstance.get(
        `${RESTAURANT_BASE}/api/dashboard/orders/${zoduId}`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("❌ Orders API Error:", error);
      throw error;
    }
  },

  /* =====================================================
     🟢 3️⃣ DASHBOARD EXPENSES
  ===================================================== */
  getDashboardExpenses: async (
    zoduId: string,
    branchId: string,
    params: {
      page?: number;
      limit?: number;
      sortOrder?: "asc" | "desc";
      dateType?: string;
      fromDate?: string;
      toDate?: string;
      branch_ids?: string;
    }
  ) => {
    try {
      const response = await axiosInstance.get(
        `${RESTAURANT_BASE}/api/dashboard/expenses/${zoduId}`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("❌ Dashboard Expenses API Error:", error);
      throw error;
    }
  },

  /* =====================================================
     🟢 4️⃣ DASHBOARD TOP ITEMS
  ===================================================== */
  getTopItems: async (
    zoduId: string,
    branchId: string,
    params: {
      page?: number;
      limit?: number;
      dateType?: string;
      fromDate?: string;
      toDate?: string;
      branch_ids?: string;
    }
  ) => {
    try {
      const response = await axiosInstance.get(
        `${RESTAURANT_BASE}/api/dashboard/top-items/${zoduId}`,
        { params }
      );
      console.log("Top Items API Response:", response);
      return response.data;
    } catch (error) {
      console.error("❌ Top Items API Error:", error);
      throw error;
    }
  },

  /* =====================================================
     🟢 5️⃣ DASHBOARD DATEWISE SALES (Chart)
  ===================================================== */
  getDatewiseSales: async (
    zoduId: string,
    branchId: string,
    params: {
      page?: number;
      limit?: number;
      dateType?: string;
      fromDate?: string;
      toDate?: string;
      branch_ids?: string;
    }
  ) => {
    try {
      const response = await axiosInstance.get(
        `${RESTAURANT_BASE}/api/dashboard/datewise/${zoduId}`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("❌ Datewise Sales API Error:", error);
      throw error;
    }
  },

  /* =====================================================
     🔵 EXISTING OTHER APIs (KEPT AS IS)
  ===================================================== */
  getExpenses: async (branchId: string, page: number, limit: number) => {
    try {
      const response = await axiosInstance.get(
        apiConfig.restaurant.getExpenseList(branchId),
        { params: { page, limit } }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching expenses:", error);
      throw error;
    }
  },

  getOrderDetails: async (
    zoduId: string,
    branchId: string,
    orderId: string
  ) => {
    try {
      const response = await axiosInstance.get(
        apiConfig.mainDashboard.getOrders(zoduId, orderId, branchId)
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching order details:", error);
      throw error;
    }
  },
};
