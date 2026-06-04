import React from "react";
import type { RestaurantCartItem } from "../api/restaurantPosApi";
import { getItemPrice } from "../api/restaurantPosApi";
import styles from "../RestaurantPOS.module.css";

interface Props {
  item: RestaurantCartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

const FOOD_TYPE_COLORS: Record<string, string> = {
  veg: "#22c55e",
  non_veg: "#ef4444",
  egg: "#f59e0b",
};

const CartItemRow: React.FC<Props> = ({ item, onIncrement, onDecrement, onRemove }) => {
  const price = getItemPrice(item.product);
  const lineTotal = price * item.quantity;
  const dotColor = FOOD_TYPE_COLORS[item.product.food_type?.toLowerCase()] ?? "#22c55e";
  const initials = item.product.menu_name.slice(0, 2).toUpperCase();

  return (
    <div className={styles.cartRow}>
      {/* Avatar */}
      <div className={styles.cartAvatar}>
        {item.product.menu_image ? (
          <img src={item.product.menu_image} alt={item.product.menu_name} className={styles.cartAvatarImg} />
        ) : (
          <div className={styles.cartAvatarInitials}>{initials}</div>
        )}
        <span className={styles.cartFoodDot} style={{ background: dotColor }} />
      </div>

      {/* Name & variant */}
      <div className={styles.cartItemInfo}>
        <p className={styles.cartItemName}>{item.product.menu_name}</p>
        {item.product.variant_name && (
          <p className={styles.cartVariant}>{item.product.variant_name}</p>
        )}
        {item.note && <p className={styles.cartNote}>📝 {item.note}</p>}
        <p className={styles.cartItemPrice}>₹{price.toFixed(2)}</p>
      </div>

      {/* Qty controls */}
      <div className={styles.cartQtyWrap}>
        <button className={styles.cartQtyBtn} onClick={onDecrement}>−</button>
        <span className={styles.cartQty}>{item.quantity}</span>
        <button className={styles.cartQtyBtn} onClick={onIncrement}>+</button>
      </div>

      {/* Line total & remove */}
      <div className={styles.cartLineTotal}>
        <span>₹{lineTotal.toFixed(2)}</span>
        <button className={styles.cartRemoveBtn} onClick={onRemove} title="Remove item">✕</button>
      </div>
    </div>
  );
};

export default CartItemRow;
