import React from "react";
import type { RestaurantCategory } from "../api/restaurantPosApi";
import styles from "../RestaurantPOS.module.css";

interface Props {
  categories: RestaurantCategory[];
  activeCategory: string;
  onSelect: (name: string) => void;
}

const CATEGORY_COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981",
  "#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6",
  "#f97316", "#06b6d4",
];

const CategorySidebar: React.FC<Props> = ({ categories, activeCategory, onSelect }) => {
  return (
    <div className={styles.categorySidebar}>
      <div className={styles.categoryHeader}>
        <span className={styles.categoryHeaderText}>Menu</span>
      </div>

      {/* All button */}
      <button
        className={`${styles.categoryItem} ${activeCategory === "All" ? styles.categoryItemActive : ""}`}
        onClick={() => onSelect("All")}
      >
        <div
          className={styles.categoryIcon}
          style={{ background: activeCategory === "All" ? "#8b0000" : "#e5e7eb" }}
        >
          <span style={{ fontSize: 18 }}>🍽️</span>
        </div>
        <span className={styles.categoryLabel}>All</span>
        <span className={styles.categoryCount}>{categories.reduce((s, c) => s + c.items.length, 0)}</span>
      </button>

      {categories.map((cat, idx) => {
        const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
        const isActive = activeCategory === cat.name;
        return (
          <button
            key={cat.name}
            className={`${styles.categoryItem} ${isActive ? styles.categoryItemActive : ""}`}
            onClick={() => onSelect(cat.name)}
          >
            <div
              className={styles.categoryIcon}
              style={{ background: isActive ? color : `${color}22` }}
            >
              <span className={styles.categoryInitial} style={{ color: isActive ? "#fff" : color }}>
                {cat.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className={styles.categoryLabel}>{cat.name}</span>
            <span className={styles.categoryCount}>{cat.items.length}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategorySidebar;
