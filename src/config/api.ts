interface MenuEndPoints {
  list: (id: string) => string;
  listCategory: (branchId: string, type: string) => string; // Z-T75
  getAllMenuItemsByBranchId: (
    branchId: string,
    searchTerm?: string,
    page?: number,
    pageSize?: number
  ) => string; // Z-T97
  getMenuItemsByType: (
    branchId: string,
    type?: string,
    search?: string,
    page?: number,
    pageSize?: number,
    categoryIds?: number[]
  ) => string;
  getCategoryList: (zoduId: string, branchId: string, types?: string[], page?: number, limit?: number) => string;
  add: string;
  menustatus: (menu_status: boolean, menuId: string) => string;
  menufav: (favorite: boolean, menuId: string) => string;
  addTableKOT: () => string;
  completeKOT: () => string; //zodu-hotfix-01
  getTableKOT: (branchId: string) => string; // Z-T77
  holdMenu: () => string; //Z-T97
  deleteHoldMenu: (menuId: string) => string; //Z-T97
  getUnitsList: (branchId: string) => string; //Z-T97
  getGstList: (branchId: string) => string; //Z-T97
  getHoldMenu: (branchId: string) => string;
  getPosData: (branchId: string, zoduId: string) => string; //Z-T97
  deleteMenuItem: (menuId: string) => string; //Z-T97
  updateMenuItem: (menuId: string) => string; //Z-T97
}

interface RestaurantEndPoints {
  getExpenseList: (branchId: string) => string;
  getExpenseById: (expenseId: string) => string;
  addExpense: () => string; // Z-T94
  getExpenseCategories: (branchId: string) => string; // Z-T94
  getExpenseItems: (branchId: string) => string; // Z-T94
  addExpenseCategory: () => string; // Z-T94
  updateExpenseCategory: () => string; // Z-T94
  paynowExpense: () => string; //Pay Now for Expense and Purchase
  deleteExpense: (expenseId: string) => string;
}
//Z-T87
interface InventoryEndPoints {
  getInventoryList: (branchId: string, inventoryType?: string) => string;
  updateInventoryItem: () => string; //Z-T87
  addIndirectInventory: () => string; //Z-T87
}

interface ReportEndpoints {
  getReport: string; //Z-T87
  salesSummary: string;
  salesMonthlyBreakdown: string;
  salesHistorical: string;
  salesDatewiseSummary: string;
  salesDatewiseBreakdown: string;
  purchaseSummary: string;
  purchaseMonthlyBreakdown: string;
  purchaseHistorical: string;
  purchaseDatewiseSummary: string;
  purchaseDatewiseBreakdown: string;
  expenseSummary: string;
  expenseMonthlyBreakdown: string;
  expenseHistorical: string;
  expenseDatewiseSummary: string;
  expenseDatewiseBreakdown: string;
}

interface DashboardEndpoints {
  dashboard: string;
  getOrders: (zudoId: string, orderId: string, branchId: string) => string;
}

interface VendorEndPoints {
  list: (branchId: string) => string;
  add: string;
}

interface PurchaseEndPoints {
  list: (branchId: string) => string;
  add: string;
  delete: string;
  edit: string;
  getPurchaseById: (purchaseId: string) => string;
}
interface ChecklistPoints {
  getAllChecklists: string;
  createNewCheckList: string;
  updateChecklist: (id: number) => string;
}

interface ApiConstants {
  menu: MenuEndPoints;
  uploadImage: () => string;
  uploadMultipleImages: () => string;
  deleteImage: (fileNmae: string) => string;
  restaurant: RestaurantEndPoints;
  checklist: ChecklistPoints;
  inventory: InventoryEndPoints; //Z-T87
  report: ReportEndpoints; //Z-T87
  vendor: VendorEndPoints;
  purchase: PurchaseEndPoints;
  mainDashboard: DashboardEndpoints;
}

const RESTAURANT_BASE = "/restaurant";

export const apiConfig: ApiConstants = {
  menu: {
    list: (id: string) => `/menu/${id}`,
    listCategory: (branchId: string, type: string) =>
      `${RESTAURANT_BASE}/get/category/${type}/${branchId}`, // Z-T75
    add: `${RESTAURANT_BASE}/api/add/menu_item`,
    menustatus: (menu_status: boolean, menuId: string) =>
      `${RESTAURANT_BASE}/update/menustatus/${menu_status}/${menuId}`,
    menufav: (favorite: boolean, menuId: string) =>
      `${RESTAURANT_BASE}/update/favorite/${favorite}/${menuId}`,
    addTableKOT: () => `${RESTAURANT_BASE}/api/orders/add/orders`, // Z-T77
    completeKOT: () => `${RESTAURANT_BASE}/api/completeorder`, //zodu-hotfix-01
    getTableKOT: (branchId: string) =>
      `${RESTAURANT_BASE}/api/orders/get/orders/${branchId}`, // Z-T77
    holdMenu: () => `${RESTAURANT_BASE}/api/hold/add/hold_menu`, //Z-T97
    getHoldMenu: (branchId: string) =>
      `${RESTAURANT_BASE}/api/hold/get/hold-orders/${branchId}`, //Z-T97
    deleteHoldMenu: (holdId: string) =>
      `${RESTAURANT_BASE}/api/hold/delete/hold-menu/${holdId}`,
    deleteMenuItem: (menuId: string) =>
      `${RESTAURANT_BASE}/delete/menu_item/${menuId}`, //z-T97
    updateMenuItem: (menuId: string) =>
      `${RESTAURANT_BASE}/update/menu_item/${menuId}`, //z-T97
    getAllMenuItemsByBranchId: (
      branchId: string,
      searchTerm?: string,
      page?: number,
      pageSize?: number
    ) => {
      let url = `${RESTAURANT_BASE}/api/menu/get/menu_item/${branchId}`;
      const params = new URLSearchParams();

      if (searchTerm) params.append("search", searchTerm);
      if (page !== undefined) params.append("page", String(page));
      if (pageSize !== undefined) params.append("limit", String(pageSize));

      const queryString = params.toString();
      return queryString ? `${url}?${queryString}` : url;
    }, // Z-T97
    getUnitsList: (branchId: string) =>
      `${RESTAURANT_BASE}/get/units/${branchId}`, //Z-T97
    getGstList: (branchId: string) => `${RESTAURANT_BASE}/get/gst/${branchId}`, //Z-T97,
    getPosData: (branchId: string, zoduId: string) =>
      `${RESTAURANT_BASE}/get/pos_data/${branchId}/${zoduId}`, //Z-T97
    getMenuItemsByType: (branchId, type, search, page, pageSize, categoryIds) => {
      const url = type
        ? `${RESTAURANT_BASE}/api/menu/get/menu_item/${branchId}/${type}`
        : `${RESTAURANT_BASE}/api/menu/get/menu_item/${branchId}`;
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (page !== undefined) params.append("page", String(page));
      if (pageSize !== undefined) params.append("limit", String(pageSize));
      if (categoryIds && categoryIds.length > 0) params.append("category_ids", categoryIds.join(","));
      const qs = params.toString();
      return qs ? `${url}?${qs}` : url;
    },
    getCategoryList: (zoduId, branchId, types, page, limit) => {
      const url = `${RESTAURANT_BASE}/get/category/${zoduId}/${branchId}`;
      const params = new URLSearchParams();
      if (types && types.length > 0) types.forEach((t) => params.append("type", t));
      if (page !== undefined) params.append("page", String(page));
      if (limit !== undefined) params.append("limit", String(limit));
      const qs = params.toString();
      return qs ? `${url}?${qs}` : url;
    },
  },
  restaurant: {
    getExpenseList: (branchId: string) =>
      `${RESTAURANT_BASE}/get/expense-list/${branchId}`,
    addExpense: () => `${RESTAURANT_BASE}/api/add/expense`, // Z-T94
    getExpenseCategories: (branchId: string) =>
      `${RESTAURANT_BASE}/get/expense-category/${branchId}`, // Z-T94
    getExpenseItems: (branchId: string) =>
      `${RESTAURANT_BASE}/get/expense-item/${branchId}`, // Z-T94
    addExpenseCategory: () => `${RESTAURANT_BASE}/api/add/expense-category`, // Z-T94
    getExpenseById: (expenseId: string) =>
      `${RESTAURANT_BASE}/get/expense/${expenseId}`,
    updateExpenseCategory: () => `${RESTAURANT_BASE}/api/edit/expense`, // Z-T94
    paynowExpense: () => `${RESTAURANT_BASE}/api/payment/pay`, //Pay Now for Expense and Purchase
    deleteExpense: (expenseId: string) =>
      `${RESTAURANT_BASE}/api/delete/expense/${expenseId}`,
  },
  //Z-T87
  inventory: {
    getInventoryList: (branchId: string, inventoryType?: string) =>
      `${RESTAURANT_BASE}/get/inventory-list/${branchId}` +
      (inventoryType ? `?type=${inventoryType}` : ""),
    updateInventoryItem: () => `${RESTAURANT_BASE}/api/update/inventory`, //Z-T87
    addIndirectInventory: () => `${RESTAURANT_BASE}/api/add/inventory`, //Z-T87
  },
  vendor: {
    list: (branchId: string) => `${RESTAURANT_BASE}/get/vendor/${branchId}`,
    add: `${RESTAURANT_BASE}/api/add/vendor`,
  },

  purchase: {
    list: (branchId: string) =>
      `${RESTAURANT_BASE}/get/purchase-list/${branchId}`, // ⬅️ NEW
    add: `${RESTAURANT_BASE}/api/add`, // ✅ FIXED
    delete: `${RESTAURANT_BASE}/api/delete/purchase/`,
      getPurchaseById: (purchaseId: string) =>
      `${RESTAURANT_BASE}/get/purchase/${purchaseId}`,
    edit: `${RESTAURANT_BASE}/api/edit/purchase`,
  },

  report: {
    getReport: `${RESTAURANT_BASE}/api/report`,
    salesSummary: `${RESTAURANT_BASE}/api/report/sales/summary`,
    salesMonthlyBreakdown: `${RESTAURANT_BASE}/api/report/sales/monthly-breakdown`,
    salesHistorical: `${RESTAURANT_BASE}/api/report/sales/historical`,
    salesDatewiseSummary: `${RESTAURANT_BASE}/api/report/sales/datewise/summary`,
    salesDatewiseBreakdown: `${RESTAURANT_BASE}/api/report/sales/datewise`,
    purchaseSummary: `${RESTAURANT_BASE}/api/report/purchase/summary`,
    purchaseMonthlyBreakdown: `${RESTAURANT_BASE}/api/report/purchase/monthly-breakdown`,
    purchaseHistorical: `${RESTAURANT_BASE}/api/report/purchase/historical`,
    purchaseDatewiseSummary: `${RESTAURANT_BASE}/api/report/purchase/datewise/summary`,
    purchaseDatewiseBreakdown: `${RESTAURANT_BASE}/api/report/purchase/datewise`,
    expenseSummary: `${RESTAURANT_BASE}/api/report/expense/summary`,
    expenseMonthlyBreakdown: `${RESTAURANT_BASE}/api/report/expense/monthly-breakdown`,
    expenseHistorical: `${RESTAURANT_BASE}/api/report/expense/historical`,
    expenseDatewiseSummary: `${RESTAURANT_BASE}/api/report/expense/datewise/summary`,
    expenseDatewiseBreakdown: `${RESTAURANT_BASE}/api/report/expense/datewise`,
  },

  mainDashboard: {
    dashboard: `${RESTAURANT_BASE}/api/dashboard`,
    getOrders: (zoduId: string, orderId: string, branchId: string) =>
      `${RESTAURANT_BASE}/api/order/${zoduId}/${branchId}/${orderId}`,
  },
  checklist: {
    getAllChecklists: `/checklist/checklists`,
    createNewCheckList: `/checklist/checklists/create`,
    updateChecklist: (id: number) =>
      `${RESTAURANT_BASE}/checklist/checklists/${id}`,
  },

  uploadImage: () => `${RESTAURANT_BASE}/upload`,
  uploadMultipleImages: () => `${RESTAURANT_BASE}/upload/multiple`,
  deleteImage: (fileNmae: string) =>
    `${RESTAURANT_BASE}/delete/file/${fileNmae}`,
};
