// Variant type
export interface Variant {
  id: string;
  price: string;
  variant_name: string;
}

// Single item inside "items" array
export interface MenuItem {
  zodu_id: string;
  branch_id: string;
  menu_name: string;
  variants: Variant[]|[];
  category_id: string;
  category: string;
  sell_price: string;
  purchase_price: string;
  hsn_code: string;
  gst_tax: string;
  gst_id:string;
  food_type: string;
  unit_id:string;
  productTotal?:string;
  tax_include_or_exclude: boolean;
  count: number;
  menu_image: string|null;
  menu_type: string;
  menu_unit: string;
  favorites: string | null;
  active: boolean;
  menu_id: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

// Category type (what API actually returns)
export interface MenuCategory {
  name: string;
  items: MenuItem[];
}
