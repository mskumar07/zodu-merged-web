import type { Order } from "../../types/order";

export interface SidebarProps {
  order: Order;
  onQuantityChange: (productId: string, qty: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}
