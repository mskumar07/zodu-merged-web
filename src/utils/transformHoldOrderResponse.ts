type BackendHoldItem = {
  item_name: string;
  item_id: string;
  item_unit: string;
  qty: number;
  price: number;
  variant_name?: string | null;
  variant_id?: string | null;
};

type BackendHoldOrder = {
  hold_id: string;
  zodu_id: string;
  branch_id: string;
  order_type: string;
  table_no: string | number | null;
  customer_name: string;
  customer_phone?: string | null;
  created_at?: string;
  items: BackendHoldItem[];
};

type Product = {
  zodu_id: string;
  branch_id: string;
  menu_name: string;
  variants: { name: string; id: string | null }[] | null;
  sell_price: string;
  purchase_price: string;
  hsn_code: string | null;
  gst_tax: string;
  active: boolean;
  food_type: string;
  tax_include_or_exclude: boolean;
  count: number;
  menu_image: string | null;
  menu_type: string;
  menu_unit: string;
  favorites: boolean;
  menu_id: string;
  category: string;
};

type TransformedItem = {
  product: Product;
  quantity: number;
};

type TransformedHoldOrder = {
  id: string;
  order: {
    id: string;
    customerName: string;
    tableNumber: number | null;
    items: TransformedItem[];
    subtotal: number;
    kotList: any[];
    taxes: number;
    discount: number;
    total: number;
  };
  tableNumber: number | null;
};

export function transformHoldOrderResponse(
  backendHoldOrder: BackendHoldOrder
): TransformedHoldOrder | null {
  if (!backendHoldOrder) return null;

  const {
    hold_id,
    zodu_id,
    branch_id,
    order_type,
    table_no,
    customer_name,
    items,
  } = backendHoldOrder;

  const transformedItems: TransformedItem[] = items.map((item) => ({
    product: {
      zodu_id,
      branch_id,
      menu_name: item.item_name,
      variants: item.variant_name
        ? [{ name: item.variant_name, id: item.variant_id }]
        : null,
      sell_price: String(item.price),
      purchase_price: "NULL",
      hsn_code: null,
      gst_tax: "5",
      active: true,
      food_type: "Veg",
      tax_include_or_exclude: false,
      count: 10,
      menu_image: null,
      menu_type: "Food",
      menu_unit: item.item_unit,
      favorites: false,
      menu_id: item.item_id,
      category: "Salads",
    },
    quantity: item.qty,
  }));

  const subtotal = transformedItems.reduce(
    (sum, i) => sum + Number(i.product.sell_price) * i.quantity,
    0
  );

  return {
    id: hold_id,
    order: {
      id: hold_id,
      customerName: customer_name,
      tableNumber: Number(table_no) || null,
      items: transformedItems,
      order_type: order_type,
      subtotal,
      kotList: [],
      taxes: 0,
      discount: 0,
      total: subtotal,
    },
    tableNumber: Number(table_no) || null,
  };
}
