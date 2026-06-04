/**
 * RestaurantPOS.tsx
 * Modern restaurant billing POS screen.
 * Uses hooks from ./api/restaurantPosApi.ts
 * Reusable components live in ./components/
 */

import React, { useState, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import { useAppSelector } from "../../../store/store";
import { BranchId, ZoduId } from "@store/slices/userSlice";

import {
  useRestaurantMenuQuery,
  useTableOrdersQuery,
  useHoldOrdersQuery,
  useAddOrderMutation,
  useCompleteOrderMutation,
  useHoldOrderMutation,
  useDeleteHoldOrderMutation,
  calcSubtotal,
  calcTax,
  calcDiscount,
  calcGrandTotal,
  getItemPrice,
  type RestaurantCategory,
  type RestaurantMenuItem,
  type RestaurantCartItem,
  type RestaurantOrder,
  type RestaurantVariant,
} from "./api/restaurantPosApi";

import CategorySidebar from "./components/CategorySidebar";
import ProductCard from "./components/ProductCard";
import OrderSummaryPanel from "./components/OrderSummaryPanel";
import DiscountModal from "./components/DiscountModal";
import CreateCustomerModal, { type CustomerFormData } from "./components/CreateCustomerModal";
import VariantModal from "./components/VariantModal";
import styles from "./RestaurantPOS.module.css";

const ORDER_TYPE_MAP: Record<string, string> = {
  DineIn: "DINE_IN",
  Delivery: "DELIVERY",
  PickUp: "TAKEAWAY",
};

function buildInitialOrder(): RestaurantOrder {
  return {
    orderId: `ORD-${Date.now()}`,
    tableNumber: null,
    items: [],
    customerName: "",
    customerPhone: "",
    orderType: "DineIn",
    subtotal: 0,
    taxAmount: 0,
    discount: 0,
    discountType: "Percent",
    discountValue: 0,
    grandTotal: 0,
    paymentMethod: "Cash",
    notes: "",
  };
}

const RestaurantPOS: React.FC = () => {
  const branchId = useAppSelector(BranchId);
  const zoduId = useAppSelector(ZoduId);

  // ── Remote data ─────────────────────────────────────────────
  const { data: menuData, isLoading: menuLoading, isError: menuError } = useRestaurantMenuQuery(branchId);
  const { data: tableOrdersData, isLoading: tableLoading } = useTableOrdersQuery(branchId);
  const { data: holdOrdersData } = useHoldOrdersQuery(branchId);

  // ── Mutations ────────────────────────────────────────────────
  const { mutateAsync: addOrder, isPending: addingOrder } = useAddOrderMutation();
  const { mutateAsync: completeOrder, isPending: completingOrder } = useCompleteOrderMutation();
  const { mutateAsync: holdOrder, isPending: holdingOrder } = useHoldOrderMutation();
  const { mutateAsync: deleteHold } = useDeleteHoldOrderMutation();

  // ── Local state ──────────────────────────────────────────────
  const [order, setOrder] = useState<RestaurantOrder>(buildInitialOrder());
  const [cartItems, setCartItems] = useState<RestaurantCartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"All" | "Favourites">("All");
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [variantModalProduct, setVariantModalProduct] = useState<RestaurantMenuItem | null>(null);

  const isLoading = addingOrder || completingOrder || holdingOrder;

  // ── Derived data ─────────────────────────────────────────────
  const categories: RestaurantCategory[] = useMemo(() => menuData ?? [], [menuData]);

  const filteredCategories = useMemo(() => {
    let cats = categories;

    if (filterMode === "Favourites") {
      cats = cats.map((c) => ({ ...c, items: c.items.filter((i) => i.favorites) })).filter((c) => c.items.length > 0);
    }

    if (activeCategory !== "All") {
      cats = cats.filter((c) => c.name === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      cats = cats
        .map((c) => ({
          ...c,
          items: c.items.filter(
            (i) =>
              i.menu_name.toLowerCase().includes(q) ||
              i.category.toLowerCase().includes(q)
          ),
        }))
        .filter((c) => c.items.length > 0);
    }

    return cats;
  }, [categories, activeCategory, searchQuery, filterMode]);

  const tableLabel = useMemo(() => {
    if (order.orderType !== "DineIn") return "";
    return order.tableNumber ? `Table / Customer: Table ${order.tableNumber}` : "Table / Customer: Table";
  }, [order.orderType, order.tableNumber]);

  const activeTableOrders: number[] = useMemo(() => {
    if (!tableOrdersData) return [];
    return tableOrdersData.map((o: any) => Number(o.table_no)).filter((n: number) => n > 0);
  }, [tableOrdersData]);

  const heldOrders: Array<{ id: string; label: string }> = useMemo(() => {
    if (!holdOrdersData?.data) return [];
    return holdOrdersData.data.map((ho: any, idx: number) => ({
      id: ho.hold_uuid ?? ho.id ?? String(idx),
      label: `HOLD${idx + 1}`,
    }));
  }, [holdOrdersData]);

  // ── Cart helpers ─────────────────────────────────────────────

  const addToCart = useCallback((product: RestaurantMenuItem, variant?: RestaurantVariant) => {
    setCartItems((prev) => {
      const variantId = variant ? (variant.variant_id ?? variant.id) : undefined;
      const existing = prev.find(
        (c) =>
          c.product.menu_id === product.menu_id &&
          (variantId ? c.product.variant_id === variantId : !c.product.variant_id)
      );

      if (existing) {
        return prev.map((c) =>
          c === existing ? { ...c, quantity: c.quantity + 1 } : c
        );
      }

      const enriched: RestaurantMenuItem = variant
        ? {
            ...product,
            sell_price: variant.price,
            variant_id: variant.variant_id ?? variant.id,
            variant_name: variant.variant_name,
          } as RestaurantMenuItem & { variant_id?: string; variant_name?: string }
        : product;

      return [...prev, { product: enriched, quantity: 1 }];
    });
  }, []);

  const handleSelectProduct = useCallback(
    (product: RestaurantMenuItem) => {
      if (product.variants && product.variants.length > 0) {
        setVariantModalProduct(product);
        return;
      }
      addToCart(product);
    },
    [addToCart]
  );

  const incrementCart = useCallback((item: RestaurantCartItem) => {
    setCartItems((prev) =>
      prev.map((c) => (c === item ? { ...c, quantity: c.quantity + 1 } : c))
    );
  }, []);

  const decrementCart = useCallback((item: RestaurantCartItem) => {
    setCartItems((prev) => {
      const updated = prev.map((c) =>
        c === item ? { ...c, quantity: Math.max(0, c.quantity - 1) } : c
      );
      return updated.filter((c) => c.quantity > 0);
    });
  }, []);

  const removeFromCart = useCallback((item: RestaurantCartItem) => {
    setCartItems((prev) => prev.filter((c) => c !== item));
  }, []);

  const incrementByProduct = useCallback((product: RestaurantMenuItem) => {
    const found = cartItems.find(
      (c) => c.product.menu_id === product.menu_id && !c.product.variant_id
    );
    if (found) incrementCart(found);
    else addToCart(product);
  }, [cartItems, incrementCart, addToCart]);

  const decrementByProduct = useCallback((product: RestaurantMenuItem) => {
    const found = cartItems.find(
      (c) => c.product.menu_id === product.menu_id && !c.product.variant_id
    );
    if (found) decrementCart(found);
  }, [cartItems, decrementCart]);

  // ── Reset order ──────────────────────────────────────────────

  const resetOrder = useCallback(() => {
    setCartItems([]);
    setOrder(buildInitialOrder());
  }, []);

  // ── Checkout / Send to KDS ───────────────────────────────────

  const buildItemsPayload = (items: RestaurantCartItem[]) =>
    items.map((item) => ({
      menu_id: item.product.menu_id,
      name: item.product.menu_name,
      price: getItemPrice(item.product),
      qty: item.quantity,
      tax: parseFloat(item.product.gst_tax) || 0,
      tax_inclusive: item.product.tax_include_or_exclude ?? false,
      variant_id: item.product.variant_id ?? null,
      variant_name: item.product.variant_name ?? null,
      image: item.product.menu_image,
      menu_unit: item.product.menu_unit,
    }));

  const handleSendToKDS = async () => {
    if (cartItems.length === 0) { toast.error("Add items before sending to KDS"); return; }
    if (order.orderType === "DineIn" && !order.tableNumber) { toast.error("Select a table first"); return; }

    const subtotal = calcSubtotal(cartItems);
    const taxAmount = calcTax(cartItems);
    const discount = calcDiscount(subtotal, order.discountType, order.discountValue);
    const grandTotal = calcGrandTotal(subtotal, taxAmount, discount);

    try {
      const response = await addOrder({
        zodu_id: zoduId,
        branch_id: branchId,
        table_no: order.tableNumber ?? 0,
        order_type: ORDER_TYPE_MAP[order.orderType] ?? "DINE_IN",
        items: buildItemsPayload(cartItems),
        no_of_items: cartItems.length,
        total_amt: grandTotal,
        discount_type: order.discountType === "Amount" ? "FLAT" : "PERCENT",
        discount_value: order.discountValue,
        final_payment: false,
        order_date: new Date().toISOString().split("T")[0],
        order_time: new Date().toLocaleTimeString("en-GB"),
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
      });

      setOrder((prev) => ({ ...prev, orderId: response?.Data?.api_order_id ?? prev.orderId }));
      toast.success("Order sent to KDS!");
      setCartItems([]);
    } catch {
      toast.error("Failed to send to KDS");
    }
  };

  const handlePaid = async () => {
    if (cartItems.length === 0 && order.orderType !== "DineIn") {
      toast.error("No items in cart");
      return;
    }

    const subtotal = calcSubtotal(cartItems);
    const taxAmount = calcTax(cartItems);
    const discount = calcDiscount(subtotal, order.discountType, order.discountValue);
    const grandTotal = calcGrandTotal(subtotal, taxAmount, discount);

    try {
      if (order.orderType === "DineIn") {
        if (!order.tableNumber) { toast.error("Select a table"); return; }
        await completeOrder({
          api_order_id: order.orderId,
          zodu_id: zoduId,
          branch_id: branchId,
          tableNumber: order.tableNumber,
          items: buildItemsPayload(cartItems),
          discount_type: order.discountType === "Amount" ? "FLAT" : "PERCENT",
          discount_value: order.discountValue,
          totalAmount: grandTotal,
          paymentType: order.paymentMethod,
        });
      } else {
        await addOrder({
          zodu_id: zoduId,
          branch_id: branchId,
          table_no: 0,
          order_type: ORDER_TYPE_MAP[order.orderType] ?? "TAKEAWAY",
          items: buildItemsPayload(cartItems),
          no_of_items: cartItems.length,
          total_amt: grandTotal,
          discount_type: order.discountType === "Amount" ? "FLAT" : "PERCENT",
          discount_value: order.discountValue,
          final_payment: true,
          order_date: new Date().toISOString().split("T")[0],
          order_time: new Date().toLocaleTimeString("en-GB"),
          customer_name: order.customerName,
          customer_phone: order.customerPhone,
        });
      }
      toast.success("Payment successful!");
      resetOrder();
    } catch {
      toast.error("Payment failed. Please try again.");
    }
  };

  const handleHold = async () => {
    if (cartItems.length === 0) { toast.error("No items to hold"); return; }
    const subtotal = calcSubtotal(cartItems);
    const taxAmount = calcTax(cartItems);
    const discount = calcDiscount(subtotal, order.discountType, order.discountValue);
    const grandTotal = calcGrandTotal(subtotal, taxAmount, discount);

    try {
      await holdOrder({
        zodu_id: zoduId,
        branch_id: branchId,
        table_no: order.tableNumber,
        order_type: ORDER_TYPE_MAP[order.orderType] ?? "DINE_IN",
        items: buildItemsPayload(cartItems),
        total_amt: grandTotal,
        order_date: new Date().toISOString().split("T")[0],
        order_time: new Date().toLocaleTimeString("en-GB"),
      });
      toast.success("Order placed on hold");
      resetOrder();
    } catch {
      toast.error("Failed to hold order");
    }
  };

  const handleRestoreHeld = async (holdId: string) => {
    if (!holdOrdersData?.data) return;
    const held = holdOrdersData.data.find((ho: any) => (ho.hold_uuid ?? ho.id) === holdId);
    if (!held) return;

    const restoredItems: RestaurantCartItem[] = (held.items ?? []).map((item: any) => ({
      product: {
        menu_id: item.menu_id,
        menu_name: item.name,
        sell_price: String(item.price),
        gst_tax: String(item.tax ?? 0),
        tax_include_or_exclude: item.tax_inclusive ?? false,
        menu_image: item.image ?? null,
        menu_unit: item.menu_unit ?? "",
        food_type: "",
        category: "",
        hsn_code: "",
        purchase_price: "0",
        active: true,
        favorites: null,
        variants: null,
        count: 0,
        menu_type: "",
        variant_id: item.variant_id ?? undefined,
        variant_name: item.variant_name ?? undefined,
      } as RestaurantMenuItem,
      quantity: item.qty ?? 1,
    }));

    setCartItems(restoredItems);
    setOrder((prev) => ({
      ...prev,
      tableNumber: held.table_no ?? null,
      orderType: held.order_type === "DINE_IN" ? "DineIn" : held.order_type === "DELIVERY" ? "Delivery" : "PickUp",
    }));
    toast.info("Hold order restored");
  };

  const handleOrderTypeChange = (type: "DineIn" | "Delivery" | "PickUp") => {
    setOrder((prev) => ({ ...prev, orderType: type, customerName: "", customerPhone: "" }));
  };

  const handleApplyDiscount = (type: "Percent" | "Amount", value: number) => {
    setOrder((prev) => ({ ...prev, discountType: type, discountValue: value }));
  };

  const handleSaveCustomer = (data: CustomerFormData) => {
    setOrder((prev) => ({ ...prev, customerName: data.name, customerPhone: data.phone }));
  };

  const handleVariantSelect = (product: RestaurantMenuItem, variant: RestaurantVariant) => {
    addToCart(product, variant);
    setVariantModalProduct(null);
  };

  const handleTableSelect = (tableNo: number) => {
    setOrder((prev) => ({ ...prev, tableNumber: tableNo, orderType: "DineIn" }));
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className={styles.posRoot}>
      {/* Category sidebar */}
      <CategorySidebar
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      {/* Main product area */}
      <div className={styles.mainArea}>
        {/* Top search & filter bar */}
        <div className={styles.topBar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={styles.filterTabs}>
            {(["All", "Favourites"] as const).map((f) => (
              <button
                key={f}
                className={`${styles.filterTab} ${filterMode === f ? styles.filterTabActive : ""}`}
                onClick={() => setFilterMode(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        <div className={styles.productArea}>
          {menuLoading ? (
            <div className={styles.loadingWrap}>
              <div className={styles.spinner} />
              <span>Loading menu...</span>
            </div>
          ) : menuError ? (
            <div className={styles.errorBanner}>Failed to load menu. Please refresh.</div>
          ) : filteredCategories.length === 0 ? (
            <div className={styles.loadingWrap}>
              <span style={{ fontSize: 40 }}>🍽️</span>
              <span>No items found</span>
            </div>
          ) : (
            filteredCategories.map((cat) => (
              <div key={cat.name} className={styles.categorySection}>
                <h3 className={styles.categorySectionTitle}>
                  {cat.name} — {cat.items.length}
                </h3>
                <div className={styles.productGrid}>
                  {cat.items.map((item) => (
                    <ProductCard
                      key={item.menu_id}
                      item={item}
                      cartItems={cartItems}
                      onSelect={handleSelectProduct}
                      onIncrement={incrementByProduct}
                      onDecrement={decrementByProduct}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Active tables bar */}
        {activeTableOrders.length > 0 && order.orderType === "DineIn" && (
          <div className={styles.tableBar}>
            <span className={styles.tableBarLabel}>Tables:</span>
            {activeTableOrders.map((t) => (
              <button
                key={t}
                className={`${styles.tableChip} ${order.tableNumber === t ? styles.tableChipActive : ""}`}
                onClick={() => handleTableSelect(t)}
              >
                T{t}
              </button>
            ))}
          </div>
        )}

        {/* Hold orders bar */}
        {heldOrders.length > 0 && (
          <div className={styles.holdBar}>
            <span className={styles.holdBarLabel}>On Hold:</span>
            {heldOrders.map((ho) => (
              <button
                key={ho.id}
                className={styles.holdChip}
                onClick={() => handleRestoreHeld(ho.id)}
              >
                ⏸ {ho.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Order summary / cart panel */}
      <OrderSummaryPanel
        order={order}
        cartItems={cartItems}
        onOrderTypeChange={handleOrderTypeChange}
        onAddCustomer={() => setShowCustomerModal(true)}
        onDiscountClick={() => setShowDiscountModal(true)}
        onPaymentMethodChange={(m) => setOrder((p) => ({ ...p, paymentMethod: m }))}
        onPaid={handlePaid}
        onSendToKDS={handleSendToKDS}
        onIncrement={incrementCart}
        onDecrement={decrementCart}
        onRemove={removeFromCart}
        isLoading={isLoading}
        tableLabel={tableLabel}
      />

      {/* Modals */}
      <DiscountModal
        open={showDiscountModal}
        discountType={order.discountType}
        discountValue={order.discountValue}
        onApply={handleApplyDiscount}
        onClose={() => setShowDiscountModal(false)}
      />
      <CreateCustomerModal
        open={showCustomerModal}
        onSave={handleSaveCustomer}
        onClose={() => setShowCustomerModal(false)}
      />
      <VariantModal
        open={!!variantModalProduct}
        product={variantModalProduct}
        onSelect={handleVariantSelect}
        onClose={() => setVariantModalProduct(null)}
      />
    </div>
  );
};

export default RestaurantPOS;
