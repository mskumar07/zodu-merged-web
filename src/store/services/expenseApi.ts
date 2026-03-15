// src/store/services/expenseApi.ts
import { apiSlice } from "./apiSlice";
import { apiConfig } from "@config/api";

// Define an Expense type (you can adjust fields once you know the actual API response)
export interface ExpenseItem {
  id: string;
  expense_type: string;
  amount: number;
  date: string;
  description?: string;
  created_by?: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  zodu_id: string;
  branch_id: string;
}

export interface ExpenseItems {
  id: string;
  name: string;
  zodu_id: string;
  branch_id: string;
  item_code :string;
}

export interface ExpenseFormData {
  expenseId: string;
  date: string;
  expenseName: string;
  expenseItems?: { itemName: string; qty: string; price: string }[];
  category: string;
  totalAmount: string;
  amountPaid: string;
  paymentMethod: string;
  attachments: File | null;
  description: string;
}

// Inject new endpoints into the existing apiSlice
export const expenseApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET: Expense list by branch ID
    getExpenseList: builder.query<ExpenseItem[], string>({
      query: (branchId) => ({
        url: `${apiConfig.restaurant.getExpenseList(branchId)}`,
        method: "GET",
      }),
      providesTags: ["Expense"],
    }),
    //GetExpense by iD
    getExpenseById: builder.query<ExpenseItem, string>({
      query: (
        expenseId
      ) => ({
        url: `${apiConfig.restaurant.getExpenseById(expenseId)}`,
        method: "GET",
      }),
      providesTags: ["Expense"],
    }),
    // GET: Expense categories by branch ID
    getExpenseCategories: builder.query<ExpenseCategory[], string>({
      query: (branchId) => ({
        url: `${apiConfig.restaurant.getExpenseCategories(branchId)}`,
        method: "GET",
      }),
      providesTags: ["Expense"],
    }),
     getExpenseItems: builder.query<ExpenseItems[], string>({
      query: (branchId) => ({
        url: `${apiConfig.restaurant.getExpenseItems(branchId)}`,
        method: "GET",
      }),
      providesTags: ["Expense"],
    }),
     addExpense: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: `${apiConfig.restaurant.addExpense()}`,
        method: "POST",
        data: formData,
      }),
      invalidatesTags: ["Expense"], // Refresh expense list after add
    }),
    addExpenseCategory: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: `${apiConfig.restaurant.addExpenseCategory()}`,
        method: "POST",
        data: formData,
      }),
      invalidatesTags: ["Expense"], // Refresh expense list after add
    }),
    //updateExpenseCategory
    updateExpenseCategory: builder.mutation<any, { categoryId: string; payload: any }>({
      query: ( payload ) => {
        return {
        url: apiConfig.restaurant.updateExpenseCategory(),
        method: "PUT",
        data: payload, // 👈 Use body for normal JSON
      }  
    },
      invalidatesTags: ["Expense"], // Refresh expense list after add
    }),
    //Pay Now for Purchase and Expense
    paynowExpense: builder.mutation<any, { payload: any }>({
      query: ({ payload }) => {
        return {
        url: apiConfig.restaurant.paynowExpense(),
        method: "POST",
        data: payload, // 👈 Use body for normal JSON
      }  
    },
      invalidatesTags: ["Expense"], // Refresh expense list after add
    }),
    //Delete Expense by ID
    deleteExpense: builder.mutation<any, string>({
      query: (expenseId) => ({
        url: `${apiConfig.restaurant.deleteExpense(expenseId)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Expense"], // Refresh expense list after delete
    }),
  }),
});

// Export hooks
export const { useGetExpenseListQuery,useAddExpenseMutation,useUpdateExpenseCategoryMutation,useGetExpenseCategoriesQuery,useGetExpenseItemsQuery,useAddExpenseCategoryMutation, useGetExpenseByIdQuery, usePaynowExpenseMutation, useDeleteExpenseMutation } = expenseApi;
