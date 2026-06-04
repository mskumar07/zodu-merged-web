import React, {
  useState, useMemo, useCallback, useRef, useEffect,
} from "react";
import {
  Box, Typography, TextField, InputAdornment, Chip, CircularProgress, Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import RestoreIcon from "@mui/icons-material/Restore";
import type { HoldOrder, RunningOrder, RunningOrderOrderedItem } from "./api/restaurantPosApi";
import TableBarIcon from "@mui/icons-material/TableBar";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
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

import CategoryNav          from "./components/CategoryNav";
import ProductCard          from "./components/ProductCard";
import OrderPanel, { type Totals } from "./components/OrderPanel";
import TableModal           from "./components/modals/TableModal";
import VariantModal         from "./components/modals/VariantModal";
import DiscountModal        from "./components/modals/DiscountModal";
import CustomerModal, { type CustomerFormData } from "./components/modals/CustomerModal";
import PaymentModal         from "./components/modals/PaymentModal";

// ─── Constants ──────────────────────────────────────────────────────────────

// Used by hold-order API
const HOLD_ORDER_TYPE_MAP: Record<string, string> = {
  DineIn:   "DINE_IN",
  Delivery: "DELIVERY",
  PickUp:   "TAKEAWAY",
};

// Used by add-order / KDS API  ("Dine-In" | "Takeaway" | "Delivery")
const ADD_ORDER_TYPE_MAP: Record<string, string> = {
  DineIn:   "Dine-In",
  Delivery: "Delivery",
  PickUp:   "Takeaway",
};

const ORDER_TYPES: Array<{
  key: "DineIn" | "Delivery" | "PickUp";
  label: string;
  icon: React.ReactNode;
}> = [
  { key: "DineIn",   label: "Dine In",  icon: <TableBarIcon sx={{ fontSize: 15 }} /> },
  { key: "Delivery", label: "Delivery", icon: <DeliveryDiningIcon sx={{ fontSize: 15 }} /> },
  { key: "PickUp",   label: "Pick Up",  icon: <ShoppingBagIcon sx={{ fontSize: 15 }} /> },
];

function buildInitialOrder(): RestaurantOrder {
  return {
    orderId:       `ORD-${Date.now()}`,
    tableNumber:   null,
    kotNo:         null,
    items:         [],
    customerName:  "",
    customerPhone: "",
    orderType:     "DineIn",
    subtotal:      0,
    taxAmount:     0,
    discount:      0,
    discountType:  "Percent",
    discountValue: 0,
    grandTotal:    0,
    paymentMethod: "Cash",
    notes:         "",
  };
}

// ─── Component ──────────────────────────────────────────────────────────────

const RestaurantPOS: React.FC = () => {
  const branchId = "ZODU035B1"; // useAppSelector(BranchId);
  const zoduId   = "ZODU035";

  // ── API ─────────────────────────────────────────────────────────────────
  const { data: menuData,        isLoading: menuLoading } = useRestaurantMenuQuery(branchId);
  const { data: tableOrdersData                         } = useTableOrdersQuery(branchId);
  const { data: holdOrdersData                          } = useHoldOrdersQuery(branchId);

  const { mutateAsync: addOrder,      isPending: addingOrder      } = useAddOrderMutation();
  const { mutateAsync: completeOrder, isPending: completingOrder  } = useCompleteOrderMutation();
  const { mutateAsync: holdOrder,     isPending: holdingOrder     } = useHoldOrderMutation();
  const { mutateAsync: deleteHoldOrder                            } = useDeleteHoldOrderMutation();

  const isBusy = addingOrder || completingOrder || holdingOrder;

  // ── State ────────────────────────────────────────────────────────────────
  const [order,        setOrder       ] = useState<RestaurantOrder>(buildInitialOrder());
  const [cartItems,    setCartItems   ] = useState<RestaurantCartItem[]>([]);
  const [searchQuery,  setSearchQuery ] = useState("");
  const [filterMode,   setFilterMode  ] = useState<"All" | "Favourites">("All");
  const [activeCategory, setActiveCategory] = useState("All");

  // Modal open flags
  const [showTable,    setShowTable   ] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const [showCustomer, setShowCustomer] = useState(false);
<<<<<<< work-sandy
=======
  const [showPayment,  setShowPayment ] = useState(false);
>>>>>>> main
  const [runningOrderSummary, setRunningOrderSummary] = useState<RunningOrderOrderedItem[]>([]);
  const [variantItem,  setVariantItem ] = useState<RestaurantMenuItem | null>(null);

  // ── Auto-scroll refs ─────────────────────────────────────────────────────
  const menuScrollRef    = useRef<HTMLDivElement>(null);
  const sectionRefs      = useRef<Map<string, HTMLDivElement>>(new Map());
  const manualScrollRef  = useRef(false);   // suppress observer while programmatic scrolling

  // ── Derived data ─────────────────────────────────────────────────────────
  const categories: RestaurantCategory[] = useMemo(() => menuData ?? [], [menuData]);

  const filteredCategories = useMemo(() => {
    let cats = categories;

    if (filterMode === "Favourites") {
      cats = cats
        .map((c) => ({ ...c, items: c.items.filter((i) => i.favorites) }))
        .filter((c) => c.items.length > 0);
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
  }, [categories, searchQuery, filterMode]);

  const runningOrders: RunningOrder[] = useMemo(
    () => tableOrdersData ?? [],
    [tableOrdersData]
  );

  const activeTableNumbers: number[] = useMemo(
    () => runningOrders.map((o) => parseInt(o.table_no, 10)).filter((n) => n > 0),
    [runningOrders]
  );

  const heldOrders = useMemo(() => holdOrdersData ?? [], [holdOrdersData]);

  const totals: Totals = useMemo(() => {
    const subtotal   = calcSubtotal(cartItems);
    const taxAmount  = calcTax(cartItems);
    const discount   = calcDiscount(subtotal, order.discountType, order.discountValue);
    const grandTotal = calcGrandTotal(subtotal, taxAmount, discount);
    return { subtotal, taxAmount, discount, grandTotal };
  }, [cartItems, order.discountType, order.discountValue]);

  // ── Auto-scroll: click category → scroll section into view ───────────────
  const handleCategorySelect = useCallback((catName: string) => {
    setActiveCategory(catName);

    if (catName === "All") {
      menuScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const el        = sectionRefs.current.get(catName);
    const container = menuScrollRef.current;
    if (!el || !container) return;

    manualScrollRef.current = true;

    const containerTop = container.getBoundingClientRect().top;
    const elTop        = el.getBoundingClientRect().top;
    const offset       = container.scrollTop + elTop - containerTop - 12;

    container.scrollTo({ top: Math.max(0, offset), behavior: "smooth" });

    // Re-enable observer after animation finishes (~700 ms)
    setTimeout(() => { manualScrollRef.current = false; }, 750);
  }, []);

  // ── Auto-scroll: scroll → update active category in sidebar ──────────────
  useEffect(() => {
    const container = menuScrollRef.current;
    if (!container || filteredCategories.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (manualScrollRef.current) return;

        // Pick topmost visible section header
        const topEntry = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (topEntry) {
          const cat = topEntry.target.getAttribute("data-category");
          if (cat) setActiveCategory(cat);
        }
      },
      {
        root:       container,
        threshold:  0,
        // Section is "active" once its top edge is in the upper 30% of the container
        rootMargin: "0px 0px -70% 0px",
      }
    );

    sectionRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [filteredCategories]);

  // ── Cart helpers ──────────────────────────────────────────────────────────
  const addToCart = useCallback(
    (product: RestaurantMenuItem, variant?: RestaurantVariant) => {
      setCartItems((prev) => {
        const variantId = variant ? (variant.variant_id ?? variant.id) : undefined;
        const existing  = prev.find(
          (c) =>
            c.product.menu_id === product.menu_id &&
            (variantId ? (c.product as any).variant_id === variantId : !(c.product as any).variant_id)
        );

        if (existing) {
          return prev.map((c) =>
            c === existing ? { ...c, quantity: c.quantity + 1 } : c
          );
        }

        const enriched = variant
          ? {
              ...product,
              sell_price:   variant.price,
              variant_id:   variant.variant_id ?? variant.id,
              variant_name: variant.variant_name,
            }
          : product;

        return [...prev, { product: enriched as any, quantity: 1 }];
      });
    },
    []
  );

  const handleProductClick = useCallback(
    (product: RestaurantMenuItem) => {
      if (product.variants && product.variants.length > 0) {
        setVariantItem(product);
        return;
      }
      addToCart(product);
    },
    [addToCart]
  );

  // Total qty in cart for a given menu item (all variants combined)
  const getCartQty = useCallback(
    (menuId: string) =>
      cartItems
        .filter((c) => c.product.menu_id === menuId)
        .reduce((s, c) => s + c.quantity, 0),
    [cartItems]
  );

  const incrementCart = useCallback((ci: RestaurantCartItem) => {
    setCartItems((prev) => prev.map((c) => (c === ci ? { ...c, quantity: c.quantity + 1 } : c)));
  }, []);

  const decrementCart = useCallback((ci: RestaurantCartItem) => {
    setCartItems((prev) => {
      const updated = prev.map((c) =>
        c === ci ? { ...c, quantity: Math.max(0, c.quantity - 1) } : c
      );
      return updated.filter((c) => c.quantity > 0);
    });
  }, []);

  const removeFromCart = useCallback((ci: RestaurantCartItem) => {
    setCartItems((prev) => prev.filter((c) => c !== ci));
  }, []);

  const incrementByProduct = useCallback(
    (product: RestaurantMenuItem) => {
      const found = cartItems.find(
        (c) => c.product.menu_id === product.menu_id && !(c.product as any).variant_id
      );
      if (found) incrementCart(found);
      else addToCart(product);
    },
    [cartItems, incrementCart, addToCart]
  );

  const decrementByProduct = useCallback(
    (product: RestaurantMenuItem) => {
      const found = cartItems.find(
        (c) => c.product.menu_id === product.menu_id && !(c.product as any).variant_id
      );
      if (found) decrementCart(found);
    },
    [cartItems, decrementCart]
  );

  const setQtyByProduct = useCallback(
    (product: RestaurantMenuItem, newQty: number) => {
      setCartItems((prev) => {
        const found = prev.find(
          (c) => c.product.menu_id === product.menu_id && !("variant_id" in c.product)
        );
        if (!found) return prev;
        const updated = prev.map((c) =>
          c === found ? { ...c, quantity: Math.max(1, newQty) } : c
        );
        return updated;
      });
    },
    []
  );

  const resetOrder = useCallback(() => {
    setCartItems([]);
    setRunningOrderSummary([]);
    setOrder(buildInitialOrder());
  }, []);

  // ── Build items payload ───────────────────────────────────────────────────
  const buildPayloadItems = (items: RestaurantCartItem[]) =>
    items.map((i) => ({
      menu_id:         i.product.menu_id,
      name:            i.product.menu_name,
      price:           getItemPrice(i.product),
      qty:             i.quantity,
      tax:             parseFloat(i.product.gst_tax) || 0,
      gst_percentage:  parseFloat(i.product.gst_tax) || 0,
      tax_inclusive:   i.product.tax_include_or_exclude ?? false,
      menu_unit:       i.product.menu_unit,
      variant_id:      i.product.variant_id ?? null,
      variant_name:    i.product.variant_name ?? null,
    }));

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleSendToKDS = async () => {
    if (!cartItems.length)        
     { toast.error("Add items first"); return; }
    if (order.orderType === "DineIn" && !order.tableNumber) { setShowTable(true); return; }
    console.log("Sending to KDS with payload:", order);

    try {
      const res = await addOrder({
        zodu_id:       zoduId,
        branch_id:     branchId,
        table_no:      order.tableNumber ?? null,
        order_type:    ADD_ORDER_TYPE_MAP[order.orderType],
        kot_no:        order.kotNo ?? "KOT-1",
        items:         buildPayloadItems(cartItems),
        no_of_items:   cartItems.length,
        total_amt:     totals.grandTotal,
        discount_type: order.discountType === "Amount" ? "FLAT" : "PERCENT",
        discount_value: order.discountValue,
        final_payment: false,
        
        order_date:    new Date().toISOString().split("T")[0],
        order_time:    new Date().toLocaleTimeString("en-GB"),
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
      });
      setOrder((p) => ({
        ...p,
        orderId: res?.Data?.api_order_id ?? p.orderId,
        kotNo:   res?.Data?.kot_no        ?? p.kotNo,
      }));
      toast.success("Order sent to KDS!");
      setCartItems([]);
    } catch {
      toast.error("Failed to send to KDS");
    }
  };

  const handlePay = async (payMethod: "Card" | "QR" | "Cash") => {
    try {
      if (order.orderType === "DineIn") {
        if (!order.tableNumber) { toast.error("Select a table first"); return; }
        const summaryTotal = runningOrderSummary.reduce((s, i) => s + i.price * i.qty, 0);
        const payTotal = cartItems.length > 0 ? totals.grandTotal : summaryTotal;
        await completeOrder({
          api_order_id:  order.orderId,
          zodu_id:       zoduId,
          branch_id:     branchId,
          tableNumber:   order.tableNumber,
          items:         buildPayloadItems(cartItems),
          discount_type: order.discountType === "Amount" ? "FLAT" : "PERCENT",
          discount_value: order.discountValue,
          totalAmount:   payTotal,
          paymentType:   payMethod,
        });
      } else {
        await addOrder({
          zodu_id:       zoduId,
          kot_no:        order.kotNo ?? "KOT-1",
          branch_id:     branchId,
          table_no:      null,
          order_type:    ADD_ORDER_TYPE_MAP[order.orderType],
          items:         buildPayloadItems(cartItems),
          no_of_items:   cartItems.length,
          total_amt:     totals.grandTotal,
          discount_type: order.discountType === "Amount" ? "FLAT" : "PERCENT",
          discount_value: order.discountValue,
          final_payment: true,
          order_date:    new Date().toISOString().split("T")[0],
          order_time:    new Date().toLocaleTimeString("en-GB"),
          customer_name: order.customerName,
          customer_phone: order.customerPhone,
        });
      }
      toast.success("Payment successful!");
      setShowPayment(false);
      resetOrder();
    } catch {
      toast.error("Payment failed. Please try again.");
    }
  };

  const handleHold = async () => {
    if (!cartItems.length) { toast.error("No items to hold"); return; }
    try {
      await holdOrder({
        zodu_id:       zoduId,
        branch_id:     branchId,
        orderType:     HOLD_ORDER_TYPE_MAP[order.orderType],
        table_no:      order.tableNumber != null ? String(order.tableNumber) : null,
        customerName:  order.customerName || null,
        customerPhone: order.customerPhone || null,
        items: cartItems.map((ci) => ({
          item_id:      ci.product.menu_id,
          item_name:    ci.product.menu_name,
          item_unit:    ci.product.menu_unit || null,
          qty:          ci.quantity,
          price:        getItemPrice(ci.product),
          variant_name: ci.product.variant_name ?? null,
          variant_id:   ci.product.variant_id ?? null,
        })),
      });
      toast.success("Order placed on hold");
      resetOrder();
    } catch {
      toast.error("Failed to hold order");
    }
  };

  const handleRestoreRunningOrder = (ro: RunningOrder) => {
    const tableNum    = parseInt(ro.table_no, 10) || null;
    const latestKotNo = ro.kot_items[ro.kot_items.length - 1]?.kot_no ?? null;
    setCartItems([]);
    setRunningOrderSummary(ro.ordered_items);
    setOrder((p) => ({
      ...p,
      orderId:       ro.api_order_id,
      tableNumber:   tableNum,
      kotNo:         latestKotNo,
      orderType:     "DineIn",
      customerName:  ro.customer_name ?? "",
      customerPhone: ro.customer_phone ?? "",
    }));
    toast.info(`Table ${ro.table_no} selected — add items for next KOT`);
  };

  const handleDeleteHold = async (holdId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteHoldOrder(holdId);
      toast.success("Hold order removed");
    } catch {
      toast.error("Failed to remove hold order");
    }
  };

  const handleRestoreHold = async (held: HoldOrder) => {
    const restoredItems: RestaurantCartItem[] = held.items.map((i) => ({
      product: {
        menu_id:                i.item_id,
        menu_name:              i.item_name,
        sell_price:             String(i.price),
        gst_tax:                "0",
        tax_include_or_exclude: false,
        menu_image:             null,
        menu_unit:              i.item_unit ?? "",
        food_type:              "",
        category:               "",
        hsn_code:               "",
        purchase_price:         "0",
        active:                 true,
        favorites:              null,
        variants:               null,
        count:                  0,
        menu_type:              "",
        variant_id:             i.variant_id ?? undefined,
        variant_name:           i.variant_name ?? undefined,
      } as RestaurantMenuItem,
      quantity: i.qty,
    }));
    setCartItems(restoredItems);
    setOrder((p) => ({
      ...p,
      tableNumber:   held.table_no ? Number(held.table_no) : null,
      customerName:  held.customer_name ?? "",
      customerPhone: held.customer_phone ?? "",
      orderType:
        held.order_type === "DINE_IN"   ? "DineIn"
        : held.order_type === "DELIVERY" ? "Delivery"
        : "PickUp",
    }));
    try {
      await deleteHoldOrder(held.hold_id);
    } catch {
      // restore succeeded even if delete fails — don't block the user
    }
    toast.info("Hold order restored");
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1299,
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f5f5f5",
        overflow: "hidden",
      }}
    >
      {/* ════ Header / Navbar ════ */}
      <Box
        sx={{
          height: 54,
          bgcolor: "#fff",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          px: 2,
          gap: 1.5,
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <Typography
          sx={{
            fontWeight: 900,
            fontSize: "1.2rem",
            color: "#d32f2f",
            fontStyle: "italic",
            letterSpacing: "-0.02em",
            whiteSpace: "nowrap",
          }}
        >
          zodu
        </Typography>
        <Divider orientation="vertical" flexItem sx={{ borderColor: "#e5e7eb" }} />
        <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ whiteSpace: "nowrap" }}>
          Restaurant POS
        </Typography>

        <Box sx={{ flex: 1 }} />

        {/* Search */}
        <TextField
          size="small"
          placeholder="Search dishes by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            width: { xs: 140, sm: 200, md: 240 },
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              bgcolor: "#f9fafb",
              height: 34,
              fontSize: "0.82rem",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#9ca3af", fontSize: 17 }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Favourites toggle */}
        <Box
          onClick={() => setFilterMode(filterMode === "Favourites" ? "All" : "Favourites")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            px: 1.2,
            py: 0.55,
            borderRadius: "20px",
            border: filterMode === "Favourites" ? "1.5px solid #f59e0b" : "1.5px solid #e5e7eb",
            bgcolor: filterMode === "Favourites" ? "#fffbeb" : "#fff",
            color: filterMode === "Favourites" ? "#d97706" : "#6b7280",
            fontSize: "0.75rem",
            fontWeight: filterMode === "Favourites" ? 700 : 500,
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "all 0.15s",
            "&:hover": { border: "1.5px solid #f59e0b", color: "#d97706" },
          }}
        >
          <StarIcon sx={{ fontSize: 14 }} />
          <Typography sx={{ fontSize: "0.75rem", fontWeight: "inherit", lineHeight: 1 }}>
            Favourites
          </Typography>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ borderColor: "#e5e7eb" }} />

        {/* Order type tabs */}
        {ORDER_TYPES.map((t) => {
          const active = order.orderType === t.key;
          return (
            <Box
              key={t.key}
              onClick={() =>
                setOrder((p) => ({ ...p, orderType: t.key, customerName: "", customerPhone: "" }))
              }
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                px: 1,
                height: "100%",
                cursor: "pointer",
                borderBottom: active ? "2.5px solid #d32f2f" : "2.5px solid transparent",
                color: active ? "#d32f2f" : "#6b7280",
                transition: "all 0.15s",
                "&:hover": { color: "#d32f2f" },
              }}
            >
              {t.icon}
              <Typography sx={{ fontSize: "0.78rem", fontWeight: active ? 700 : 500, lineHeight: 1 }}>
                {t.label}
              </Typography>
            </Box>
          );
        })}

      </Box>

      {/* ════ Body ════ */}
      <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── Category sidebar ── */}
        <CategoryNav
          categories={categories}
          activeCategory={activeCategory}
          onSelect={handleCategorySelect}
          totalItems={categories.reduce((s, c) => s + c.items.length, 0)}
        />

        {/* ── Center: search + product grid ── */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Scrollable product grid */}
          <Box
            ref={menuScrollRef}
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 2,
              "&::-webkit-scrollbar": { width: 5 },
              "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
              "&::-webkit-scrollbar-thumb": { bgcolor: "#e5e7eb", borderRadius: 3 },
            }}
          >
            {menuLoading ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "80%",
                  gap: 2,
                }}
              >
                <CircularProgress sx={{ color: "#d32f2f" }} size={36} />
                <Typography color="text.secondary" variant="body2">
                  Loading menu...
                </Typography>
              </Box>
            ) : filteredCategories.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "80%",
                  gap: 1,
                }}
              >
                <Typography sx={{ fontSize: "3rem" }}>🍽️</Typography>
                <Typography color="text.secondary">No items found</Typography>
              </Box>
            ) : (
              filteredCategories.map((cat) => (
                /* ── Category section ── */
                <Box
                  key={cat.name}
                  ref={(el: HTMLDivElement | null) => {
                    if (el) sectionRefs.current.set(cat.name, el);
                    else    sectionRefs.current.delete(cat.name);
                  }}
                  data-category={cat.name}
                  sx={{ mb: 3 }}
                >
                  {/* Section header */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      color="#111827"
                    >
                      {cat.name}
                    </Typography>
                    <Box
                      sx={{
                        px: 0.8,
                        py: 0.1,
                        borderRadius: "10px",
                        bgcolor: "#fee2e2",
                        color: "#d32f2f",
                        fontSize: "0.62rem",
                        fontWeight: 700,
                      }}
                    >
                      {cat.items.length}
                    </Box>
                    <Divider sx={{ flex: 1 }} />
                  </Box>

                  {/* Product grid */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "repeat(auto-fill, minmax(160px, 1fr))",
                        sm: "repeat(auto-fill, minmax(185px, 1fr))",
                        md: "repeat(auto-fill, minmax(200px, 1fr))",
                        lg: "repeat(auto-fill, minmax(210px, 1fr))",
                        xl: "repeat(auto-fill, minmax(220px, 1fr))",
                      },
                      gap: 1.5,
                    }}
                  >
                    {cat.items.map((item) => (
                      <ProductCard
                        key={item.menu_id}
                        item={item}
                        qty={getCartQty(item.menu_id)}
                        onAdd={() => handleProductClick(item)}
                        onIncrement={() => incrementByProduct(item)}
                        onDecrement={() => decrementByProduct(item)}
                        onSetQty={(n) => setQtyByProduct(item, n)}
                      />
                    ))}
                  </Box>
                </Box>
              ))
            )}
          </Box>

          {/* ── Running orders bar ── */}
          {runningOrders.length > 0 && (
            <Box
              sx={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 0.9,
                bgcolor: "#eff6ff",
                borderTop: "1px solid #bfdbfe",
                overflowX: "auto",
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              <TableBarIcon sx={{ fontSize: 15, color: "#2563eb", flexShrink: 0 }} />
              <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#1e3a8a", whiteSpace: "nowrap", flexShrink: 0 }}>
                Running:
              </Typography>
              {runningOrders.map((ro) => {
                const tableNum  = parseInt(ro.table_no, 10);
                const latestKot = ro.kot_items[ro.kot_items.length - 1]?.kot_no;
                const itemCount = ro.ordered_items.reduce((s, i) => s + i.qty, 0);
                const isActive  = order.tableNumber === tableNum && order.orderId === ro.api_order_id;
                return (
                  <Chip
                    key={ro.api_order_id}
                    label={`T${ro.table_no}${latestKot ? ` · ${latestKot}` : ""} · ${itemCount} item${itemCount !== 1 ? "s" : ""}`}
                    size="small"
                    icon={<TableBarIcon sx={{ fontSize: "12px !important" }} />}
                    onClick={() => handleRestoreRunningOrder(ro)}
                    sx={{
                      height: 26,
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      bgcolor: isActive ? "#bfdbfe" : "#dbeafe",
                      color: "#1e3a8a",
                      border: isActive ? "1.5px solid #2563eb" : "1px solid #bfdbfe",
                      cursor: "pointer",
                      flexShrink: 0,
                      "& .MuiChip-icon": { color: "#2563eb" },
                      "&:hover": { bgcolor: "#bfdbfe" },
                    }}
                  />
                );
              })}
            </Box>
          )}

          {/* ── Floating hold bar ── */}
          {heldOrders.length > 0 && (
            <Box
              sx={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 0.9,
                bgcolor: "#fffbeb",
                borderTop: "1px solid #fcd34d",
                overflowX: "auto",
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              <PauseCircleOutlineIcon sx={{ fontSize: 15, color: "#d97706", flexShrink: 0 }} />
              <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#92400e", whiteSpace: "nowrap", flexShrink: 0 }}>
                On Hold:
              </Typography>
              {heldOrders.map((ho, idx) => {
                const typeLabel =
                  ho.order_type === "DINE_IN"   ? "Dine In"
                  : ho.order_type === "DELIVERY" ? "Delivery"
                  : "Pickup";
                const itemCount = ho.items?.length ?? 0;
                const tableInfo = ho.table_no ? ` · T${ho.table_no}` : "";
                return (
                  <Chip
                    key={ho.hold_id ?? idx}
                    label={`${typeLabel}${tableInfo} · ${itemCount} item${itemCount !== 1 ? "s" : ""}`}
                    size="small"
                    icon={<RestoreIcon sx={{ fontSize: "12px !important" }} />}
                    onClick={() => handleRestoreHold(ho)}
                    onDelete={(e) => handleDeleteHold(ho.hold_id, e)}
                    sx={{
                      height: 26,
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      bgcolor: "#fef3c7",
                      color: "#92400e",
                      border: "1px solid #fcd34d",
                      cursor: "pointer",
                      flexShrink: 0,
                      "& .MuiChip-icon": { color: "#d97706" },
                      "&:hover": { bgcolor: "#fde68a" },
                    }}
                  />
                );
              })}
            </Box>
          )}
        </Box>

        {/* ── Right: order panel ── */}
        <OrderPanel
          order={order}
          cartItems={cartItems}
          totals={totals}
          isLoading={isBusy}
          orderSummary={runningOrderSummary}
          onTableClick={() => setShowTable(true)}
          onCustomerClick={() => setShowCustomer(true)}
          onDiscountClick={() => setShowDiscount(true)}
          onPaymentMethodChange={(m) => setOrder((p) => ({ ...p, paymentMethod: m }))}
          onSendToKDS={handleSendToKDS}
          onPaid={() => setShowPayment(true)}
          onIncrement={incrementCart}
          onDecrement={decrementCart}
          onRemove={removeFromCart}
          onHold={handleHold}
        />
      </Box>

      {/* ════ Modals ════ */}
      <TableModal
        open={showTable}
        activeTableNumbers={activeTableNumbers}
        selectedTable={order.tableNumber}
        onSelect={(n) => {
          setOrder((p) => ({ ...p, tableNumber: n, orderType: "DineIn" }));
          setShowTable(false);
        }}
        onClose={() => setShowTable(false)}
      />

      <DiscountModal
        open={showDiscount}
        discountType={order.discountType}
        discountValue={order.discountValue}
        onApply={(type, value) => {
          setOrder((p) => ({ ...p, discountType: type, discountValue: value }));
          setShowDiscount(false);
        }}
        onClose={() => setShowDiscount(false)}
      />

      <CustomerModal
        open={showCustomer}
        onSave={(data: CustomerFormData) => {
          setOrder((p) => ({ ...p, customerName: data.name, customerPhone: data.phone }));
          setShowCustomer(false);
        }}
        onClose={() => setShowCustomer(false)}
      />

      <VariantModal
        open={!!variantItem}
        product={variantItem}
        onSelect={(product, variant) => {
          addToCart(product, variant);
          setVariantItem(null);
        }}
        onClose={() => setVariantItem(null)}
      />

      <PaymentModal
        open={showPayment}
        total={cartItems.length > 0
          ? totals.grandTotal
          : runningOrderSummary.reduce((s, i) => s + i.price * i.qty, 0)}
        cartItems={cartItems}
        paymentMethod={order.paymentMethod}
        onMethodChange={(m) => setOrder((p) => ({ ...p, paymentMethod: m }))}
        onPay={handlePay}
        onClose={() => setShowPayment(false)}
        isLoading={isBusy}
      />
    </Box>
  );
};

export default RestaurantPOS;
