import React, { useState, useEffect } from "react";
import styles from "../RestaurantPOS.module.css";

interface Props {
  open: boolean;
  discountType: "Percent" | "Amount";
  discountValue: number;
  onApply: (type: "Percent" | "Amount", value: number) => void;
  onClose: () => void;
}

const DiscountModal: React.FC<Props> = ({ open, discountType, discountValue, onApply, onClose }) => {
  const [type, setType] = useState<"Percent" | "Amount">(discountType);
  const [value, setValue] = useState(discountValue > 0 ? String(discountValue) : "");

  useEffect(() => {
    if (open) {
      setType(discountType);
      setValue(discountValue > 0 ? String(discountValue) : "");
    }
  }, [open, discountType, discountValue]);

  if (!open) return null;

  const handleApply = () => {
    const num = parseFloat(value) || 0;
    onApply(type, num);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>Apply Discount</h3>

        {/* Type toggle */}
        <div className={styles.discountTypeTabs}>
          <button
            className={`${styles.discountTypeTab} ${type === "Percent" ? styles.discountTypeTabActive : ""}`}
            onClick={() => setType("Percent")}
          >
            Percent (%)
          </button>
          <button
            className={`${styles.discountTypeTab} ${type === "Amount" ? styles.discountTypeTabActive : ""}`}
            onClick={() => setType("Amount")}
          >
            Amount (₹)
          </button>
        </div>

        <input
          className={styles.modalInput}
          type="number"
          min="0"
          placeholder={type === "Percent" ? "Discount (%)" : "Discount (₹)"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />

        <div className={styles.modalActions}>
          <button className={styles.modalCancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.modalApplyBtn} onClick={handleApply}>Apply</button>
        </div>
      </div>
    </div>
  );
};

export default DiscountModal;
