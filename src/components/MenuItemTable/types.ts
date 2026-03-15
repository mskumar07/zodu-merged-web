import type { MenuItem } from "../../types/menuItem";

export interface MenuItemsTableProps {
  items: MenuItem[];
  onRowClick: (item: MenuItem) => void;
  onStatus: (item: MenuItem) => void;
  onFav: (item: MenuItem) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  pagination: {
    current_page: number;
    total: number;
    limit: number;
    loading: boolean;
    onChangePage?: (page: number) => void;
  };
  rowCount: number;
}
