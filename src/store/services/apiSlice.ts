// Z-T71
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";

/**
 * //z-T94 Added "Expense" tag to tagTypes for expenseApi integration
 * //z-T87 Added "Inventory" tag to tagTypes for inventoryApi integration
 */

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Menu", "TableKOT","Expense", "Inventory", "Report","HoldOrders","Checklist", "Category"],
  endpoints: () => ({}),
});
