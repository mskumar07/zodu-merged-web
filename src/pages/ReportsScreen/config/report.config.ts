export type ReportType =
  | "orders"
  | "expenses"
  | "purchase"
  | "inventory";

export type ReportView =
  | "daywise"
  | "monthwise"
  | "yearwise";

export const REPORT_CONFIG = {
  orders: {
    label: "Orders",
    views: {
      daywise: {
        path: "orders/day",
        columns: [
          { key: "order_date", label: "Date" },
          { key: "order_id", label: "Order ID" },
          { key: "customer_name", label: "Customer" },
          { key: "total_amt", label: "Amount", align: "right", isAmount: true },
        ],
      },
      monthwise: {
        path: "orders/month",
        columns: [
          { key: "month", label: "Month" },
          { key: "total_items", label: "Total Orders" },
          { key: "total_amount", label: "Total Amount", align: "right", isAmount: true },
        ],
      },
      yearwise: {
        path: "orders/year",
        columns: [
          { key: "year", label: "Year" },
          { key: "total_items", label: "Total Orders" },
          { key: "total_amount", label: "Total Amount", align: "right", isAmount: true },
        ],
      },
    },
  },

  expenses: {
    label: "Expenses",
    views: {
      monthwise: {
        path: "expenses/month",
        columns: [
          { key: "month", label: "Month" },
          { key: "total_amount", label: "Total Expense", align: "right", isAmount: true },
        ],
      },
    },
  },
};
