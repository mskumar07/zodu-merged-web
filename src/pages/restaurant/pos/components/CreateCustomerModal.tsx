import React, { useState } from "react";
import styles from "../RestaurantPOS.module.css";

export interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface Props {
  open: boolean;
  onSave: (data: CustomerFormData) => void;
  onClose: () => void;
}

const CreateCustomerModal: React.FC<Props> = ({ open, onSave, onClose }) => {
  const [form, setForm] = useState<CustomerFormData>({ name: "", phone: "", email: "", address: "" });
  const [errors, setErrors] = useState<Partial<CustomerFormData>>({});

  if (!open) return null;

  const validate = () => {
    const e: Partial<CustomerFormData> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    else if (!/^\d{10}$/.test(form.phone.trim())) e.phone = "Enter valid 10-digit phone";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form);
    setForm({ name: "", phone: "", email: "", address: "" });
    setErrors({});
    onClose();
  };

  const handleClose = () => {
    setForm({ name: "", phone: "", email: "", address: "" });
    setErrors({});
    onClose();
  };

  const change = (field: keyof CustomerFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>Create New Customer</h3>

        <div className={styles.formGroup}>
          <input
            className={`${styles.modalInput} ${errors.name ? styles.inputError : ""}`}
            placeholder="Name *"
            value={form.name}
            onChange={change("name")}
          />
          {errors.name && <span className={styles.errorText}>{errors.name}</span>}
        </div>

        <div className={styles.formGroup}>
          <input
            className={`${styles.modalInput} ${errors.phone ? styles.inputError : ""}`}
            placeholder="Phone *"
            value={form.phone}
            onChange={change("phone")}
            maxLength={10}
          />
          {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
        </div>

        <div className={styles.formGroup}>
          <input
            className={styles.modalInput}
            placeholder="Email"
            value={form.email}
            onChange={change("email")}
          />
        </div>

        <div className={styles.formGroup}>
          <input
            className={styles.modalInput}
            placeholder="Address"
            value={form.address}
            onChange={change("address")}
          />
        </div>

        <div className={styles.modalActions}>
          <button className={styles.modalCancelBtn} onClick={handleClose}>Cancel</button>
          <button className={styles.modalApplyBtn} onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default CreateCustomerModal;
