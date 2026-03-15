export interface OrderReportTableProps {
  id:string,
  public_order_no: string;
  orderType: string;
  date: string;
  totalAmount: number;
  totalItems: number;
  gst: number;
  paymentMethod: string;
}
