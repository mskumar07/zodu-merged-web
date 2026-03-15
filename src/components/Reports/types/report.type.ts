// types/report.types.ts
export const OrderType = {
  DINE_IN: "Dine-in",
  TAKEAWAY: "Takeaway",
  DELIVERY: "Delivery",
} as const;

export type OrderType = (typeof OrderType)[keyof typeof OrderType];

export const PaymentMethod = {
  CASH: "Cash",
  UPI: "Upi",
  WALLET: "Wallet",
  CARD:"Card"
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export interface Order {
  id: string;
  api_order_id: string;
  dateTime: string;
  orderType: OrderType;
  items: OrderItem[];
  gst: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  customerName?: string;
  customerPhone?: string;
  address?: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface OrderDateWise {
  date: string;
  totalBills: number;
  totalAmount: number;
}

export interface OrderMonthWise {
  year: number;
  months: {
    month: string;
    totalBills: number;
    totalAmount: number;
  }[];
  totalBills: number;
  totalAmount: number;
}

export interface CategoryItem {
  itemName: string;
  totalQty: number;
  totalAmount: number;
}

export interface OrderCategoryWise {
  category: string;
  totalItems: number;
  totalAmount: number;
  items: CategoryItem[];
}

export interface Expense {
  id: string;
  expenseId: string;
  date: string;
  category: string;
  expenseName: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  vendor?: string;
  description?: string;
}

export interface Purchase {
  id: string;
  purchaseId: string;
  date: string;
  supplier: string;
  ingredient: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: string;
  paidAmount: number;
  dueAmount: number;
}

export interface Inventory {
  id: string;
  itemId: string;
  itemName: string;
  category: string;
  stockQuantity: number;
  purchase_price: number;
  selling_price: number;
  totalValue: number;
  lastUpdatedDate: string;
  minimumStock: number;
  unit: string;
}

export interface ReportSummary {
  totalOrders?: number;
  totalAmount?: number;
  totalBills?: number;
  totalRevenue?: number;
  totalExpenses?: number;
  totalPaid?: number;
  totalUnpaid?: number;
  totalDue?: number;
  totalPurchases?: number;
  totalPurchaseAmount?: number;
  totalItems?: number;
  totalStockValue?: number;
  lowStockItems?: number;
}

export interface ModalDetails {
  type: "order" | "expense" | "purchase" | "inventory";
  data: any;
}
