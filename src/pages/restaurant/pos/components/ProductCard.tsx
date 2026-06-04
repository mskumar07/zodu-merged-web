import React from "react";
import type { RestaurantMenuItem, RestaurantCartItem } from "../api/restaurantPosApi";
import { getItemPrice } from "../api/restaurantPosApi";
import styles from "../RestaurantPOS.module.css";

interface Props {
  item: RestaurantMenuItem;
  cartItems: RestaurantCartItem[];
  onSelect: (item: RestaurantMenuItem) => void;
  onIncrement: (item: RestaurantMenuItem) => void;
  onDecrement: (item: RestaurantMenuItem) => void;
}

const FOOD_TYPE_COLORS: Record<string, string> = {
  veg: "#22c55e",
  non_veg: "#ef4444",
  egg: "#f59e0b",
};

const ProductCard: React.FC<Props> = ({ item, cartItems, onSelect, onIncrement, onDecrement }) => {
  const cartItem = cartItems.find((c) => c.product.menu_id === item.menu_id);
  const qty = cartItem?.quantity ?? 0;
  const price = getItemPrice(item);
  const dotColor = FOOD_TYPE_COLORS[item.food_type?.toLowerCase()] ?? "#22c55e";
  const initials = item.menu_name.slice(0, 2).toUpperCase();
  const isUnavailable = !item.active;

  return (
    <div
      className={`${styles.productCard} ${isUnavailable ? styles.productCardUnavailable : ""}`}
      onClick={() => !isUnavailable && onSelect(item)}
    >
      {/* Food type indicator dot */}
      <span className={styles.foodTypeDot} style={{ background: dotColor }} />

      {/* Image or initials */}
      <div className={styles.productImageWrap}>
        {item.menu_image ? (
          <img src={item.menu_image} alt={item.menu_name} className={styles.productImage} />
        ) : (
          <div className={styles.productInitials}>{initials}</div>
        )}
        {isUnavailable && <div className={styles.unavailableOverlay}>Unavailable</div>}
      </div>

      {/* Name & price */}
      <div className={styles.productInfo}>
        <p className={styles.productName}>{item.menu_name}</p>
        <p className={styles.productPrice}>₹{price.toFixed(2)}</p>
        {item.variants && item.variants.length > 0 && (
          <span className={styles.variantBadge}>+{item.variants.length} variants</span>
        )}
      </div>

      {/* Quantity control */}
      {qty > 0 && (
        <div className={styles.qtyControl} onClick={(e) => e.stopPropagation()}>
          <button className={styles.qtyBtn} onClick={() => onDecrement(item)}>−</button>
          <span className={styles.qtyValue}>{qty}</span>
          <button className={styles.qtyBtn} onClick={() => onIncrement(item)}>+</button>
        </div>
      )}

      {qty === 0 && !isUnavailable && (
        <button
          className={styles.addBtn}
          onClick={(e) => { e.stopPropagation(); onSelect(item); }}
        >
          ADD
        </button>
      )}
    </div>
  );
};

export default ProductCard;
