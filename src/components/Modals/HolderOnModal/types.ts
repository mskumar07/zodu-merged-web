import { Order } from "../../../types/order";

export interface HoldOrderModalProps {
  open: boolean;
  order: Order;
  onClose: () => void;
  onResume: () => void;
}
