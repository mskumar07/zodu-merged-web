// types/dashboard.ts
export interface DashboardSummary {
  total_orders: number;
  total_amount: number;
  total_expense: number;
  low_stocks: number;
}

export interface Order {
  order_id: string;
  order_type: string;
  total_amt: number;
  no_of_items: number;
  order_date: string;
  customer_name?: string;
  customer_phone?: string;
  items?: OrderItem[];
  payment_method?: string;
  status?: string;
}

export interface OrderItem {
  item_name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface TopItem {
  id?: string;
  name: string;
  category: string;
  qty: number;
  price: number;
}

export interface DatewiseSale {
  date: string;
  amount: number;
  bills: number;
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  expense_date: string;
  item_count: number;
  description?: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  orders: Order[];
  top_items: TopItem[];
  datewise_sales: DatewiseSale[];
  expenses: Expense[];
  pagination?: {
    orders?: PaginationData;
    expenses?: PaginationData;
    top_items?: PaginationData;
    datewise_sales?: PaginationData;
  };
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DateFilter {
  type: "today" | "week" | "month" | "year" | "custom";
  startDate: string;
  endDate: string;
}
