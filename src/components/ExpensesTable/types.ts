export interface MenuItem {
  id: string;
  sku: string;
  name: string;
  sellPrice: number;
  stock: number;
  status: boolean;
  imageUrl?: string;
  description?: string;
  category?: string;
}

export interface MenuItemsTableProps {
  items: MenuItem[];
  onRowClick?: (item: MenuItem) => void;
  onEdit?: (item: MenuItem) => void;
  onDelete?: (item: MenuItem) => void;
  loading?: boolean;
}