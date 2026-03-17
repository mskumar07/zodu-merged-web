import { useState, useMemo } from "react";
import { products as allProducts } from "./data_products";
import type { TabValue, Product } from "./types";

export function useProducts() {
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts: Product[] = useMemo(() => {
    let result = allProducts;

    if (activeTab === "sellable") {
      result = result.filter((p) => p.itemType === "Sellable Product");
    } else if (activeTab === "raw") {
      result = result.filter((p) => p.itemType === "Raw Material");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.hsn.includes(q) ||
          p.id.toLowerCase().includes(q),
      );
    }

    return result;
  }, [activeTab, searchQuery]);

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    filteredProducts,
  };
}
