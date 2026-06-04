import React from "react";
import type { RestaurantCartItem, RestaurantOrder } from "../api/restaurantPosApi";
import {
  calcSubtotal,
  calcTax,
  calcDiscount,
  calcGrandTotal,
} from "../api/restaurantPosApi";
import CartItemRow from "./CartItemRow";
import styles from "../RestaurantPOS.module.css";

interface Props {
  order: RestaurantOrder;
  cartItems: RestaurantCartItem[];
  onOrderTypeChange: (type: "DineIn" | "Delivery" | "PickUp") => void;
  onAddCustomer: () => void;
  onDiscountClick: () => void;
  onPaymentMethodChange: (method: "Card" | "QR" | "Cash") => void;
  onPaid: () => void;
  onSendToKDS: () => void;
  onIncrement: (item: RestaurantCartItem) => void;
  onDecrement: (item: RestaurantCartItem) => void;
  onRemove: (item: RestaurantCartItem) => void;
  isLoading: boolean;
  tableLabel: string;
}

const ORDER_TYPES: Array<{ key: "DineIn" | "Delivery" | "PickUp"; label: string }> = [
  { key: "DineIn", label: "DineIn" },
  { key: "Delivery", label: "Delivery" },
  { key: "PickUp", label: "PickUp" },
];

const PAYMENT_METHODS: Array<{ key: "Card" | "QR" | "Cash"; label: string }> = [
  { key: "Card", label: "Card" },
  { key: "QR", label: "QR" },
  { key: "Cash", label: "Cash" },
];

const OrderSummaryPanel: React.FC<Props> = ({
  order,
  cartItems,
  onOrderTypeChange,
  onAddCustomer,
  onDiscountClick,
  onPaymentMethodChange,
  onPaid,
  onSendToKDS,
  onIncrement,
  onDecrement,
  onRemove,
  isLoading,
  tableLabel,
}) => {
  const subtotal = calcSubtotal(cartItems);
  const taxAmount = calcTax(cartItems);
  const discount = calcDiscount(subtotal, order.discountType, order.discountValue);
  const grandTotal = calcGrandTotal(subtotal, taxAmount, discount);

  const isDineIn = order.orderType === "DineIn";
  const canPay = isDineIn ? (order.tableNumber !== null) : cartItems.length > 0;

  return (
    <div className={styles.summaryPanel}>
      {/* Order type tabs */}
      <div className={styles.orderTypeTabs}>
        {ORDER_TYPES.map((t) => (
          <button
            key={t.key}
            className={`${styles.orderTypeTab} ${order.orderType === t.key ? styles.orderTypeTabActive : ""}`}
            onClick={() => onOrderTypeChange(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Context row */}
      <div className={styles.contextRow}>
        {isDineIn ? (
          <span className={styles.tableLabel}>{tableLabel}</span>
        ) : (
          <button className={styles.addCustomerBtn} onClick={onAddCustomer}>
            <span className={styles.addCustomerIcon}>👤+</span>
            {order.customerName ? (
              <span>{order.customerName}</span>
            ) : (
              <span>Add Customer</span>
            )}
          </button>
        )}
      </div>

      {/* Cart items */}
      <div className={styles.cartList}>
        {cartItems.length === 0 ? (
          <div className={styles.emptyCart}>
            <span className={styles.emptyCartIcon}>🛒</span>
            <p>No items added</p>
          </div>
        ) : (
          cartItems.map((item, idx) => (
            <CartItemRow
              key={`${item.product.menu_id}-${item.product.variant_id ?? idx}`}
              item={item}
              onIncrement={() => onIncrement(item)}
              onDecrement={() => onDecrement(item)}
              onRemove={() => onRemove(item)}
            />
          ))
        )}
      </div>

      {/* Order totals */}
      <div className={styles.totalsSection}>
        <div className={styles.totalRow}>
          <span>Tax Amount</span>
          <span>₹{taxAmount.toFixed(2)}</span>
        </div>
        <div className={styles.totalRow}>
          <span>Discount</span>
          <div className={styles.discountRow}>
            <span className={styles.discountValue}>
              {order.discountValue > 0
                ? `−₹${discount.toFixed(2)}`
                : "−₹0.00"}
            </span>
            <button className={styles.discountBadge} onClick={onDiscountClick}>
              {order.discountType}
            </button>
          </div>
        </div>
        <div className={styles.totalRow}>
          <span>Sub Total</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className={`${styles.totalRow} ${styles.grandTotalRow}`}>
          <span>Grand Total</span>
          <span>₹{grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment methods */}
      <div className={styles.paymentMethods}>
        {PAYMENT_METHODS.map((pm) => (
          <button
            key={pm.key}
            className={`${styles.paymentBtn} ${order.paymentMethod === pm.key ? styles.paymentBtnActive : ""}`}
            onClick={() => onPaymentMethodChange(pm.key)}
          >
            {pm.label}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className={styles.actionButtons}>
        {isDineIn && (
          <button
            className={styles.sendKdsBtn}
            onClick={onSendToKDS}
            disabled={isLoading || cartItems.length === 0 || order.tableNumber === null}
          >
            {isLoading ? "Sending..." : "Table"}
          </button>
        )}
        <button
          className={`${styles.paidBtn} ${!canPay || cartItems.length === 0 ? styles.paidBtnDisabled : ""}`}
          onClick={onPaid}
          disabled={isLoading || !canPay || cartItems.length === 0}
        >
          {isLoading ? "Processing..." : "Paid"}
        </button>
      </div>
    </div>
  );
};

export default OrderSummaryPanel;
