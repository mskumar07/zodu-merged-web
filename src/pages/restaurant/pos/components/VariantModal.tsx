import React, { useState } from "react";
import type { RestaurantMenuItem, RestaurantVariant } from "../api/restaurantPosApi";
import styles from "../RestaurantPOS.module.css";

interface Props {
  open: boolean;
  product: RestaurantMenuItem | null;
  onSelect: (product: RestaurantMenuItem, variant: RestaurantVariant) => void;
  onClose: () => void;
}

const VariantModal: React.FC<Props> = ({ open, product, onSelect, onClose }) => {
  const [selected, setSelected] = useState<string | null>(null);

  if (!open || !product) return null;

  const variants = product.variants ?? [];

  const handleConfirm = () => {
    const variant = variants.find((v) => (v.variant_id ?? v.id) === selected);
    if (variant) onSelect(product, variant);
    setSelected(null);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>{product.menu_name}</h3>
        <p className={styles.modalSubtitle}>Select a variant</p>

        <div className={styles.variantList}>
          {variants.map((v) => {
            const id = v.variant_id ?? v.id ?? v.variant_name;
            const isActive = selected === id;
            return (
              <button
                key={id}
                className={`${styles.variantOption} ${isActive ? styles.variantOptionActive : ""}`}
                onClick={() => setSelected(id ?? null)}
              >
                <span className={styles.variantOptionName}>{v.variant_name}</span>
                <span className={styles.variantOptionPrice}>₹{parseFloat(v.price).toFixed(2)}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.modalActions}>
          <button className={styles.modalCancelBtn} onClick={onClose}>Cancel</button>
          <button
            className={styles.modalApplyBtn}
            onClick={handleConfirm}
            disabled={!selected}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default VariantModal;
