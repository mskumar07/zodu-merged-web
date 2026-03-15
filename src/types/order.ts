export interface OrderItem {
  item_name: string;
  price?: number;
  amount?: number;
  qty: number;
}

export interface Order {
  id: string; // Order ID
  customerName?: string;
  tableNumber?: number | null;
  customerPhone?: string;
  order_date?: string;
  order_time?: string;
  order_type?: string;
  items: OrderItem[];
  productTotal?: string; //Z-T97
  summaryItems: OrderItem[] | []; //Z-T97
  subtotal?: number;
  taxes?: number;
  discount?: number;
  total: number; // Grand total
}
