export type ReportType = "orders" | "purchase" | "expense" | "inventory";

export type FilterType = "today" | "week" | "month" | "year" | "custom" | "all_orders" | "date_wise" | "month_year_wise";

export type ReportView = "normal" | "monthwise" | "yearwise";

export interface Pagination {
  page: number;
  limit: number;
  total?: number;
  totalPages?: number;
  totalRecords?: number;
}

export interface OrderItem {
  order_id: string;
  order_date: string;
  customer_name: string;
  total_items: number;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  payment_method?: string;
  status?: string;
}

export interface OrderChartItem {
  month?: string;
  month_no?: number;
  year?: number;
  total_items: number;
  total_amount: number;
}

export interface OrderReportSummary {
  total_items: number;
  total_amount: number;
}

export interface OrdersReportParams {
  zodu_id: string;
  branch_id: string;
  reportView: ReportView;
  filterType?: FilterType;
  page: number;
  limit: number;
  start_date?: string;
  end_date?: string;
  search?: string;
  year?: string;
}

export interface OrdersReportResponse {
  success: boolean;
  data: {
    total_records?: number;
    total_amount?: number;
    list?: OrderItem[];
    summary?: OrderReportSummary;
    chart?: OrderChartItem[];
  };
  pagination: Pagination;
}

export interface PurchaseItem {
  purchase_id: string;
  created_at: string;
  vendor_name: string;
  total_amount: string;
  paid_amount: string;
  balance_amount: string;
  name: string;
  category_id: number;
}

export interface PurchaseDateWise {
  created_at: string;
  total_purchases: string;
  all_total_amount: string;
}

export interface PurchaseMonthData {
  month_number: number;
  month: string;
  total_bills: number;
  total_amount: number;
}

export interface PurchaseYearData {
  year: number;
  total_bills: number;
  total_amount: number;
  months: PurchaseMonthData[];
}

export interface PurchaseReportParams {
  zodu_id: string;
  branch_id: string;
  filterType: string;
  page: number;
  limit: number;
  start_date?: string;
  end_date?: string;
  year?: string;
  search?: string;
}

export interface PurchaseReportResponse {
  success: boolean;
  all_orders?: PurchaseItem[];
  datewise_summary?: PurchaseDateWise[];
  monthly_summary?: PurchaseYearData[];
  over_all_purchase: number;
  over_all_total_amount: number;
  over_all_total_paid: number;
  over_all_total_due: number;
  pagination: Pagination;
}

export interface ExpenseItem {
  expense_id: string;
  expense_date: string;
  expense_name: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  category_name?: string;
  attachment_url?: Array<{
    id: string;
    url: string;
    fileName?: string;
  }>;
  items?: Array<{
    item_name: string;
    qty: number;
    amount: number;
  }>;
  payment_history?: Array<{
    payment_id: string;
    paid_amount: number;
    payment_type: string;
    created_at: string;
  }>;
}

export interface ExpenseChartItem {
  month?: string;
  month_no?: number;
  year?: number;
  total_items: number;
  total_amount: number;
}

export interface InventoryItem {
  item_id: string;
  item_name: string;
  category_name: string;
  stock_qty: number;
  unit_name: string;
  stock_alert?: number;
  value?: number;
  status: "in" | "low" | "out";
}

export interface InventorySummary {
  total_items: number;
  in_stock: number;
  low_stock: number;
  out_of_stock: number;
  total_stock_value: number;
}

export interface CategoryItemDetail {
  item_id: string;
  item_name: string;
  total_qty: number;
  total_amount: number;
}

export interface CategoryWiseOrder {
  category_id: number;
  category_name: string;
  total_qty: number;
  total_amount: number;
  items: CategoryItemDetail[];
}

export interface CategoryWiseSummary {
  totalOrders: number;
  totalQty: number;
  totalAmount: number;
}

export interface OrderCategoryReportParams {
  zodu_id: string;
  branch_id: string;
  page: number;
  limit: number;
  search?: string;
}

export interface OrderCategoryReportResponse {
  message: string;
  summary: CategoryWiseSummary;
  pagination: Pagination;
  Data: CategoryWiseOrder[];
}

export interface ExpenseDateWise {
  created_at: string;
  total_expense: string;
  all_total_amount: string;
}

export interface ExpenseMonthData {
  month_number: number;
  month: string;
  total_bills: number;
  total_amount: number;
}

export interface ExpenseYearData {
  year: number;
  total_bills: number;
  total_amount: number;
  months: ExpenseMonthData[];
}

export interface ExpenseReportParams {
  zodu_id: string;
  branch_id: string;
  filterType: string;
  page: number;
  limit: number;
  start_date?: string;
  end_date?: string;
  year?: string;
  search?: string;
}

export interface ExpenseReportResponse {
  success: boolean;
  all_orders?: ExpenseItem[];
  datewise_summary?: ExpenseDateWise[];
  monthly_summary?: ExpenseYearData[];
  totalBills: number;
  totalAmount: number;
  totalPaid: number;
  totalUnpaid: number;
  totalItems: number;
  pagination: Pagination;
}
