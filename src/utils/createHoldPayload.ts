interface Product {
  zodu_id: string;
  branch_id: string;
  menu_name: string;
  sell_price: string;
  menu_unit: string;
  menu_id: string;
  category: string;
  variants: any;
}

interface OrderItem {
  product: Product;
  quantity: number;
}

export interface OrderDetails {
  id: string;
  customerName: string | null;
  tableNumber: string | null;
  items: OrderItem[];
  subtotal: number;
  taxes: number;
  discount: number;
  total: number;
}

interface HoldKOTPayload {
  // order_id: string;
  zodu_id: string;
  branch_id: string;
  orderType: string;
  table_no: string | null;
  customerName: string | null;
  customerPhone: string | null;
  items: {
    item_name: string;
    item_id: string;
    item_unit: string;
    qty: number;
    price: number;
    variant_name: string | null;
    variant_id: string | null;
  }[];
}

export function createHoldKOTPayload(order: OrderDetails): HoldKOTPayload {
  return {
    // order_id: order.id,
    zodu_id: order.items[0]?.product.zodu_id || "",
    branch_id: order.items[0]?.product.branch_id || "",
    orderType: order.tableNumber ? "Dine_in" : "Pickup",
    table_no: String(order.tableNumber) || null,
    customerName: order.customerName || null,
    customerPhone: null, // you can fill if available
    items: order.items.map((item) => ({
      item_name: item.product.menu_name,
      item_id: item.product.menu_id,
      item_unit: item.product.menu_unit,
      qty: item.quantity,
      price: Number(item.product.sell_price),
      variant_name: item.product.variants?.name || null,
      variant_id: item.product.variants?.id || null,
    })),
  };
}
