import type { MenuItem } from "../types/menuItem"; // adjust path
import type { Order, OrderItem, KOT } from "../types/order";
import { calculateGroupedTax } from "./util";

// 🧩 Transform backend order -> frontend Order state
export const transformBackendOrderToOrder = (backendOrder: any): Order => {
  // Step 1️⃣ Convert ordered_items → OrderItem[]

  const items: OrderItem[] = backendOrder.ordered_items.map((item: any) => ({
    product: {
      zodu_id: backendOrder.branch_id.split("B")[0] || "", // rough extraction if needed
      branch_id: backendOrder.branch_id,
      menu_name: item.item_name,
      order_time: backendOrder.order_time,
      variant_id : item.variant_id || null,
      variants: [],
      category: "", // backend doesn’t send this
      sell_price: item.price.toString(),
      purchase_price: "",
      hsn_code: "",
      gst_tax: item.gst_tax || "0",
      food_type: "",
      tax_include_or_exclude: item.tax_include_or_exclude,
      count: 0,
      menu_image: item.item_image,
      menu_type: "Food",
      menu_unit: item.item_unit,
      favorites: null,
      active: true,
      menu_id: item.item_id,
    } as MenuItem,
    quantity: item.qty,
  }));

  // Step 2️⃣ Group kot_items by kot_no → create kotList[]
  const kotGroups: Record<string, any[]> = {};
  backendOrder.kot_items?.forEach((kot: any) => {
    if (!kotGroups[kot.kot_no]) kotGroups[kot.kot_no] = [];
    kotGroups[kot.kot_no].push(kot);
  });

  const kotList: KOT[] = Object.entries(kotGroups).map(([kot_no, group]) => ({
    kotId: kot_no,
    items: (group as any[]).map((item) => ({
      product: {
        zodu_id: backendOrder.branch_id.split("B")[0] || "",
        branch_id: backendOrder.branch_id,
        menu_name: item.item_name,
        variants: [],
        category: "",
        sell_price: "0",
        purchase_price: "",
        hsn_code: "",
        gst_tax: item.gst_tax || "0",
        food_type: "",
        tax_include_or_exclude: item.tax_include_or_exclude || "",
        count: 0,
        menu_image: item.item_image,
        menu_type: "Food",
        menu_unit: "",
        favorites: null,
        active: true,
        menu_id: item.item_id,
      } as MenuItem,
      quantity: item.qty,
    })),
    time: new Date(), // You could also use backendOrder.order_time if needed
    status: "pending",
  }));

  // Step 3️⃣ Return unified Order object
  const order: Order = {
    id: backendOrder.api_order_id ,
    customerName: backendOrder.customer_name || "",
    order_time: backendOrder.order_time,
    order_type: backendOrder.order_type,
    tableNumber: Number(backendOrder.table_no),
    kotList,
    items,
    subtotal: calculateGroupedTax(items)[0]?.taxableAmount,
    taxes: calculateGroupedTax(items)[0]?.taxAmount ,
    discount: 0,
    total: calculateGroupedTax(items)[0]?.taxableAmount,
  };

  return order;
};
