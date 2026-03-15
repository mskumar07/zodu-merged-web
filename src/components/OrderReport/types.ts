import type { OrderReportTableProps } from "../../types/reportTable";
export interface OrderReportTable {
  items: OrderReportTableProps[];
  onRowClick: (item: OrderReportTableProps) => void;
  onEdit:(item: OrderReportTableProps) => void;
  onDelete:(item: OrderReportTableProps) => void;
}
