// src/store/services/inventoryApi.ts
import { apiSlice } from "./apiSlice";
import { apiConfig } from "@config/api";

// Define an InventoryItem type (adjust fields based on actual API response)
export interface InventoryItem {
  id: string;
  item_name: string;
  category: string;
  quantity: number;
  unit: string;
  purchase_price?: number;
  sell_price?: number;
  created_by?: string;
  created_at?: string;
}

// Define form data type for adding inventory
export interface InventoryFormData {
  itemName: string;
  category: string;
  quantity: string;
  unit: string;
  purchasePrice: string;
  sellPrice: string;
  description?: string;
  attachments?: File | null;
}

export interface IndirectInventoryFormData {
  zodu_id: string;
  branch_id: string;
  item_name: string;
  item_unit: string;
  stock_qty: number;
  stock_alert: number;
  selling_price: number;
  last_purchase_date: string;
}


// Inject inventory endpoints into the apiSlice
export const inventoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET: Inventory list by branch ID
    getInventoryList: builder.query<
      InventoryItem[],
      { branchId: string; inventoryType?: string }
    >({
      query: ({ branchId, inventoryType }) => ({
        url: `${apiConfig.inventory.getInventoryList(branchId, inventoryType)}`,
        method: "GET",
      }),
      providesTags: ["Inventory"],
    }),
    //POST: Add indirect-inventory Z=T87
    addIndirectInventory: builder.mutation<any, IndirectInventoryFormData>({
      query: (formData) => ({
        url: apiConfig.inventory.addIndirectInventory(),
        method: "POST",
        data: formData,
      }),
      invalidatesTags: ["Inventory"],
    }),
    // POST: Add new inventory item
    updateInventoryItem: builder.mutation<
      void,
      InventoryFormData 
    >({
      query: (formData) => ({
        url: apiConfig.inventory.updateInventoryItem(), //Z-T87
        method: "PUT",
        data:formData, //Z-T87
      }),
    }),
  }),
});

// Export generated hooks
export const { useGetInventoryListQuery, useUpdateInventoryItemMutation, useAddIndirectInventoryMutation } =
  inventoryApi;
