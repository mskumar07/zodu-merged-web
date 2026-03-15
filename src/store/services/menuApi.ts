// src/store/services/menuApi.ts
import { apiSlice } from "./apiSlice";
import { apiConfig } from "@config/api";

export interface KotItem {
  menu_id: string;
  menu_unit: string;
  tax: number;
  tax_inclusive?: string | boolean;
  image: string;
  name: string;
  price: number;
  qty: number;
}

export interface KotData {
  zodu_id: string;
  branch_id: string;
  kot_no: string;
  table_no: number;
  order_type: string;
  order_id: number | string;
  items: KotItem[];
  no_of_items: number;
  total_amt: number;
  final_payment: boolean;
  order_date: string; // format: 'yyyy-MM-dd'
  order_time: string; // format: 'HH:mm:ss'
  customer_name: string;
  customer_phone: string;
}
//ZODU-hotfix-01
export interface completeKOTData {
  orderId: string;
  zodu_id: string;
  api_order_id: string;
  branch_id: string;
  tableNumber: number;
  totalAmount: number;
  items: KotData[];
  paymentType: string;
  discount_type: string;
  discount_value: number;
}

export interface menuCategory {
  branchId: string;
  type: "Product" | "Food";
}

export const menuApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    //Z-T97
    getAllMenuItems: builder.query<
      any,
      {
        branchId: string;
        searchTerm?: string;
        page?: number;
        pageSize?: number;
      }
    >({
      query: ({ branchId, searchTerm, page, pageSize }) => ({
        url: apiConfig.menu.getAllMenuItemsByBranchId(
          branchId,
          searchTerm,
          page,
          pageSize
        ),
        method: "GET",
      }),
      providesTags: ["Menu"],
    }),
    deleteMenuItem: builder.mutation<any, string>({
      query: (menuId) => ({
        url: apiConfig.menu.deleteMenuItem(menuId),
        method: "DELETE",
      }),
      invalidatesTags: ["Menu"],
    }),
    updateMenuItem: builder.mutation<any, { menuId: string; payload: any }>({
      query: ({ menuId, payload }) => ({
        url: apiConfig.menu.updateMenuItem(menuId),
        method: "PUT",
        data: payload, // 👈 Use body for normal JSON
      }),
      invalidatesTags: ["Menu"],
    }),
    //Z-T97
    getAllPOSData: builder.query<any, string>({
      query: (branchId) => ({
        url: apiConfig.menu.getPosData(branchId),
        method: "GET",
      }),
      providesTags: ["Menu"],
    }),
    getMenuItems: builder.query<any[], void>({
      query: () => ({ url: "/menu", method: "GET" }),
      providesTags: ["Menu"],
    }),
    addMenuItem: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: apiConfig.menu.add,
        method: "POST",
        data: formData,
      }),
      invalidatesTags: ["Menu"],
    }),
    uploadImage: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: apiConfig.uploadImage(),
        method: "POST",
        data: formData,
      }),
    }),
    uploadMultipleImages: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: apiConfig.uploadMultipleImages(),
        method: "POST",
        data: formData,
      }),
    }),
    //Z-T75
    getMenuCategory: builder.query<any, menuCategory>({
      query: ({ branchId, type }) => ({
        url: apiConfig.menu.listCategory(branchId, type),
        method: "GET",
      }),
    }),
    //z-T77
    getTableKOT: builder.query<any, string>({
      query: (branchId) => ({
        url: apiConfig.menu.getTableKOT(branchId),
        method: "GET",
      }),
      providesTags: ["TableKOT"],
    }),
    updateMenuStatus: builder.mutation<
      any,
      { menuId: string; menu_status: boolean }
    >({
      query: ({ menuId, menu_status }) => ({
        url: apiConfig.menu.menustatus(menu_status, menuId),
        method: "PUT",
      }),
      invalidatesTags: ["Menu"], // refresh menu items after status update
    }),
    updateMenuFavorite: builder.mutation<
      any,
      { menuId: string; favorite: boolean }
    >({
      query: ({ menuId, favorite }) => ({
        url: apiConfig.menu.menufav(favorite, menuId),
        method: "PUT",
      }),
      invalidatesTags: ["Menu"], // refresh menu items after status update
    }),
    addTableKOT: builder.mutation<any, KotData>({
      query: (KotData) => ({
        url: apiConfig.menu.addTableKOT(),
        method: "POST",
        data: KotData,
      }),
      invalidatesTags: ["TableKOT"],
    }),
    // completeKOT: builder.mutation<any, completeKOTData>({
    //   //ZODU-hotfix-01
    //   query: ({zodu_id, branch_id, api_order_id, tableNumber, totalAmount, items, paymentType, discount_value, discount_type }) => ({
    //     url: apiConfig.menu.completeKOT(),
    //     method: "POST",
    //     data: {zodu_id:zodu_id, branch_id:branch_id, api_order_id: api_order_id , final_payment: true, table_no: tableNumber, total_amt:totalAmount,items:items,payment_type:paymentType, discount_value:discount_value, discount_type:discount_type },
    //   }),
    //   invalidatesTags: ["TableKOT", "HoldOrders"],
    // }),
    completeKOT: builder.mutation<any, completeKOTData>({
  //ZODU-hotfix-01
  query: ({
    zodu_id,
    branch_id,
    api_order_id,
    tableNumber,
    totalAmount,
    items,
    paymentType,
    discount_value,
    discount_type
  }) => {

    console.log("completeKOT payload:", {
      zodu_id,
      branch_id,
      api_order_id,
      tableNumber,
      totalAmount,
      items,
      paymentType,
      discount_value,
      discount_type,
    });

    console.log("api_order_id value:", api_order_id);

    return {
      url: apiConfig.menu.completeKOT(),
      method: "POST",
      data: {
        zodu_id: zodu_id,
        branch_id: branch_id,
        api_order_id: api_order_id,
        final_payment: true,
        table_no: tableNumber,
        total_amt: totalAmount,
        items: items,
        payment_type: paymentType,
        discount_value: discount_value,
        discount_type: discount_type,
      },
    };
  },
  invalidatesTags: ["TableKOT", "HoldOrders"],
}),

    holdMenu: builder.mutation<any, any>({
      query: (payload) => ({
        url: apiConfig.menu.holdMenu(),
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["HoldOrders"],
    }),
    getHoldMenu: builder.query({
      query: (branchId) => ({
        url: apiConfig.menu.getHoldMenu(branchId),
        method: "GET",
      }),
      providesTags: ["HoldOrders"],
    }),
    deleteHoldMenu: builder.mutation<any, string>({
      query: (menuId) => ({
        url: apiConfig.menu.deleteHoldMenu(menuId),
        method: "DELETE",
      }),
      invalidatesTags: ["HoldOrders"],
    }),
    //Z-T97
    getUnitsList: builder.query({
      query: (branchId) => ({
        url: apiConfig.menu.getUnitsList(branchId),
        method: "GET",
      }),
    }),
    getGstList: builder.query({
      query: (branchId) => ({
        url: apiConfig.menu.getGstList(branchId),
        method: "GET",
      }),
    }),
    getVendors: builder.query<any, string>({
      query: (branchId) => ({
        url: apiConfig.vendor.list(branchId),
        method: "GET",
      }),
      providesTags: ["Vendors"],
    }),

    addVendor: builder.mutation<any, any>({
      query: (vendorData) => ({
        url: apiConfig.vendor.add,
        method: "POST",
        data: vendorData, // ✅ Axios expects "data"
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Vendors"],
    }),

    getPurchases: builder.query<any, string>({
      query: (branchId) => ({
        url: `restaurant/get/purchase-list/${branchId}`,
        method: "GET",
      }),
      providesTags: ["Purchases"],
    }),
    getExpense: builder.query<any, string>({
      query: (branchId) => ({
        url: `restaurant/get/expense-list/${branchId}`,
        method: "GET",
      }),
      providesTags: ["Expense"],
    }),
    addPurchase: builder.mutation<any, any>({
      query: (purchaseData) => ({
        url: apiConfig.purchase.add + "/purchase_orders",
        method: "POST",
        data: purchaseData, // ⬅️ Axios expects "data", not "body"
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Purchases"],
    }),
     getPurchaseById: builder.query<any, string>({
          query: (
            purchaseId
          ) => ({
            url: `${apiConfig.purchase.getPurchaseById(purchaseId)}`,
            method: "GET",
          }),
          providesTags: ["Purchase"],
        }),
    deletePurchase: builder.mutation<any, any>({
      query: ({ purchaseId, type }) => ({
        url: apiConfig.purchase.delete + `${purchaseId}`,
        method: "DELETE",
        params: { type },
      }),
      invalidatesTags: ["Purchases"], // Invalidate cache on delete
    }),

    editPurchase: builder.mutation<any, any>({
      query: (purchaseData) => ({
        url: apiConfig.purchase.edit,
        method: "PUT",
        data: purchaseData,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Purchases"],
    }),

    getInventoryItems: builder.query<any, { branchId: string; type: string }>({
      query: ({ branchId, type }) => ({
        url: `restaurant/get/inventory-list/${branchId}`,
        method: "GET",
        params: { type },
      }),
      providesTags: ["InventoryItems"],
    }),
  }),
});

export const {
  useGetAllMenuItemsQuery, // New query for fetching all menu items
  useGetMenuItemsQuery,
  useDeleteMenuItemMutation, // New mutation for deleting a menu item
  useAddMenuItemMutation,
  useGetMenuCategoryQuery,
  useUpdateMenuStatusMutation,
  useUpdateMenuFavoriteMutation,
  useUpdateMenuItemMutation, // New mutation for updating a menu item
  useAddTableKOTMutation,
  useGetTableKOTQuery,
  useCompleteKOTMutation, //zodu-hotfix-01
  useHoldMenuMutation, //z-T97
  useGetHoldMenuQuery, //Z-T97
  useGetUnitsListQuery, //Z-T97
  useGetGstListQuery, //Z-T97
  useGetAllPOSDataQuery, //Z-T97
  useUploadImageMutation,
  useUploadMultipleImagesMutation,
  useGetPurchasesQuery,
  useDeletePurchaseMutation,
  useGetExpenseQuery,
  useAddPurchaseMutation,
  useEditPurchaseMutation,
  useGetPurchaseByIdQuery, //Z-T87
  useGetVendorsQuery,
  useAddVendorMutation,
  useGetInventoryItemsQuery,
  useDeleteHoldMenuMutation, //Z-T97
} = menuApi;
