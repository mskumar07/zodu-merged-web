import React, {
  useState, useMemo, useCallback, useRef, useEffect,
} from "react";
import { flushSync } from "react-dom";
import LottieLoader from "@components/LottieLoader";
import { ThermalInvoiceTemplate, type ThermalPaperSize } from "@pages/SalesHistory/ThermalInvoiceTemplate";
import { gstBreakdownFromLines } from "@utils/gstSummary";
import { captureThermalReceipt, writeThermalPrint } from "@utils/thermalPrint";
import {
  Box, Typography, TextField, InputAdornment, Chip, CircularProgress, Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import RestoreIcon from "@mui/icons-material/Restore";
import type { HoldOrder, RunningOrder, RunningOrderOrderedItem } from "./api/restaurantPosApi";
import TableBarIcon from "@mui/icons-material/TableBar";
import SuccessToast from "@components/Common/SuccessToast";
import CameraBarcodeScanner from "@components/Common/CameraBarcodeScanner";
import { useHardwareScannerListener } from "@components/Common/useHardwareScannerListener";
import { isMobileOrTabletDevice } from "@components/Common/deviceType";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import CloseIcon from "@mui/icons-material/Close";
import zoduLogo from "@assets/zlogo.png";

import { useAppSelector } from "../../../store/store";
import { BranchId, ZoduId, BranchName, AllCompanies, UserProfile, addUserData, setRoleAccess, InvoiceSettingsData, PosSettingsData } from "@store/slices/userSlice";
import { setRestaurantBillingView } from "@store/slices/POSslice";
import { collapsedDrawerWidth } from "@layouts/Sidebar/index";
import { authApis } from "@pages/auth/Authapi";
import { useAppDispatch } from "@store/store";
import { MenuItem, Select, IconButton, Avatar, Badge, Tooltip } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import KeyboardOutlinedIcon from "@mui/icons-material/KeyboardOutlined";
import TouchAppOutlinedIcon from "@mui/icons-material/TouchAppOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { Alert, Button, Snackbar } from "@mui/material";
import KotReprintDialog from "@pages/restaurant/kot/KotReprintDialog";
import { useKotPrinting } from "@pages/restaurant/kot/useKotPrinting";
import { buildBillSlip, type BillHeader } from "@utils/kot/billSlip";

import {
  useRestaurantMenuQuery,
  useTableOrdersQuery,
  useHoldOrdersQuery,
  useAddOrderMutation,
  useUpdateOrderMutation,
  useCompleteOrderMutation,
  useHoldOrderMutation,
  useUpdateHoldOrderMutation,
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
import OrderPanel, { type Totals, type PaymentMethod } from "./components/OrderPanel";
import KeyboardBillingView from "./components/KeyboardBillingView";
import { toPaymentTypeLabels } from "@pages/Settings/useInvoiceSettingApi";
import TableModal           from "./components/modals/TableModal";
import VariantModal         from "./components/modals/VariantModal";
import DiscountModal        from "./components/modals/DiscountModal";
import CustomerModal, { type CustomerFormData } from "./components/modals/CustomerModal";
import { useNavigate } from "react-router-dom";

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

function buildInitialOrder(): RestaurantOrder {
  return {
    orderId:       "",
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

// ─── Receipt printing ───────────────────────────────────────────────────────

// Per-device preference for printing the bill automatically once a payment succeeds.
const AUTO_PRINT_STORAGE_KEY = "restaurantPos.autoPrint";

function readAutoPrintPref(): boolean {
  try {
    return localStorage.getItem(AUTO_PRINT_STORAGE_KEY) !== "false";
  } catch {
    return true;
  }
}

// printer_inch is stored as "3 Inch" / "5 Inch" (Restaurant Invoice Settings only offers
// thermal widths); anything unrecognised falls back to the 3" roll.
function toThermalPaperSize(printerInch: string | undefined): ThermalPaperSize {
  if (printerInch?.startsWith("4")) return "4";
  if (printerInch?.startsWith("5")) return "5";
  return "3";
}

// ─── Billing view mode (Touch card-grid vs. Keyboard tabular) ──────────────

type BillingViewMode = "touch" | "keyboard";

// One bill line, normalised from either a cart item or an already-sent KOT item.
interface ReceiptLine {
  itemId:    string;
  name:      string;
  variant:   string | null;
  qty:       number;
  price:     number;
  gstPct:    number;
  inclusive: boolean;
}

// The public order number the server filed the payment under (public_order_no).
// Where it sits depends on the endpoint: /api/completeorder (Dine-In) answers
// { orderData: { public_order_no } }, /orders/add/orders (Takeaway / Delivery)
// answers { order: { public_order_no } } with the inserted row.
function pickOrderNo(res: unknown): string {
  const asObject = (v: unknown) =>
    v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  const body = asObject(res);
  for (const src of [body, asObject(body?.data), asObject(body?.Data), asObject(body?.orderData)]) {
    const no = src?.public_order_no ?? asObject(src?.order)?.public_order_no;
    if (no != null && no !== "") return String(no);
  }
  return "";
}

// ─── Component ──────────────────────────────────────────────────────────────

const RestaurantPOS: React.FC = () => {
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();
  const branchId  = useAppSelector(BranchId) ?? "";
  const zoduId    = useAppSelector(ZoduId)   ?? "";
  // Camera scanning only makes sense on a phone/tablet's own camera — desktop/laptop
  // relies on a hardware USB/Bluetooth scanner instead, so the camera button is hidden there.
  const isMobileOrTablet = useMemo(() => isMobileOrTabletDevice(), []);
  const branchName = useAppSelector(BranchName);
  const companies  = useAppSelector(AllCompanies);
  const profile    = useAppSelector(UserProfile);

  const selectedCompany = companies.find((company) => company.zodu_id === zoduId) ?? null;
  const companyBranches = selectedCompany?.branches ?? [];
  const isEmployee = profile?.user_type?.toLowerCase() === "employee";

  const handleBranchChange = async (selectedBranchId: string) => {
    const found = companyBranches.find((branch) => branch.branch_id === selectedBranchId);
    if (!found || !selectedCompany) return;
    dispatch(
      addUserData({
        branchId:   found.branch_id,
        branchName: found.branch_name,
        zoduId:     selectedCompany.zodu_id,
      })
    );
    try {
      const roleAccess = await authApis.getRoleAccess(selectedCompany.zodu_id, found.branch_id);
      dispatch(setRoleAccess(roleAccess));
    } catch {
      dispatch(setRoleAccess([]));
    }
  };

  // ── API ─────────────────────────────────────────────────────────────────
  const [searchQuery,       setSearchQuery      ] = useState("");
  const [debouncedSearch,   setDebouncedSearch  ] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { data: menuData,        isLoading: menuLoading } = useRestaurantMenuQuery(branchId, zoduId, debouncedSearch);
  // Full, unfiltered catalogue — same query as the "" (no search) case above, so it shares
  // cache and costs nothing extra when the header search box is idle. Used for scan lookups
  // so a barcode/QR scan always resolves regardless of whatever's currently typed in search.
  const { data: fullMenuData } = useRestaurantMenuQuery(branchId, zoduId, "");
  const { data: tableOrdersData                         } = useTableOrdersQuery(branchId, zoduId);
  const { data: holdOrdersData                          } = useHoldOrdersQuery(branchId, zoduId);

  const { mutateAsync: addOrder,      isPending: addingOrder      } = useAddOrderMutation();
  const { mutateAsync: updateOrder,   isPending: updatingOrder    } = useUpdateOrderMutation();
  const { mutateAsync: completeOrder, isPending: completingOrder  } = useCompleteOrderMutation();
  const { mutateAsync: holdOrder,     isPending: holdingOrder     } = useHoldOrderMutation();
  const { mutateAsync: updateHoldOrder                            } = useUpdateHoldOrderMutation();
  const { mutateAsync: deleteHoldOrder                            } = useDeleteHoldOrderMutation();

  const isBusy = addingOrder || updatingOrder || completingOrder || holdingOrder;

  const invoiceSettings = useAppSelector(InvoiceSettingsData);
  const posSettings     = useAppSelector(PosSettingsData);

  // Which payment buttons the billing panel shows, driven by POS Settings' Payment
  // Types picker (payment_types) — same source retail POS reads from. Falls back to
  // Card/Cash when unset, since a branch may predate this field.
  const enabledPaymentTypes = useMemo<PaymentMethod[]>(() => {
    const labels = toPaymentTypeLabels(invoiceSettings?.payment_types);
    return labels.length > 0 ? (labels as PaymentMethod[]) : ["Card", "Cash"];
  }, [invoiceSettings?.payment_types]);

  // ── State ────────────────────────────────────────────────────────────────
  const [order,        setOrder       ] = useState<RestaurantOrder>(buildInitialOrder());
  const [cartItems,    setCartItems   ] = useState<RestaurantCartItem[]>([]);
  const [filterMode,   setFilterMode  ] = useState<"All" | "Favourites">("All");
  const [activeCategory, setActiveCategory] = useState("All");

  // Modal open flags
  const [showTable,    setShowTable   ] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const [showCustomer, setShowCustomer] = useState(false);
  const [showCameraScan, setShowCameraScan] = useState(false);
  const [runningOrderSummary, setRunningOrderSummary] = useState<RunningOrderOrderedItem[]>([]);
  const [runningOrderTotal,   setRunningOrderTotal  ] = useState<number>(0);
  const [isEditingSummary,    setIsEditingSummary   ] = useState(false);
  // Snapshot of runningOrderSummary taken when edit mode starts, restored if the edit is cancelled.
  const [summaryBeforeEdit,   setSummaryBeforeEdit  ] = useState<RunningOrderOrderedItem[]>([]);
  const [variantItem,  setVariantItem ] = useState<RestaurantMenuItem | null>(null);
  const [successMsg,   setSuccessMsg  ] = useState("");
  const [errorMsg,     setErrorMsg    ] = useState("");

  // ── Kitchen tickets ──
  // The order endpoints return this send's per-counter KOTs; they print through the
  // local print bridge without holding up the till. A ticket that didn't reach its
  // kitchen stays on screen (not a timed toast) with a way to reprint it.
  const restaurantName = selectedCompany?.restaurant_name || selectedCompany?.company_name || profile?.restaurant_name || "";
  const { printFromOrderResponse, printBill } = useKotPrinting(zoduId, branchId, restaurantName);
  const [kotIssue,        setKotIssue       ] = useState<{ message: string; apiOrderId: string | null } | null>(null);
  const [lastKotOrderId,  setLastKotOrderId ] = useState<string | null>(null);
  const [reprintOrderId,  setReprintOrderId ] = useState<string | null>(null);

  const printKitchenTickets = useCallback(async (res: unknown) => {
    const { error, apiOrderId } = await printFromOrderResponse(res);
    if (apiOrderId) setLastKotOrderId(apiOrderId);
    if (error) setKotIssue({ message: error, apiOrderId });
  }, [printFromOrderResponse]);
  // hold_id of the hold order currently loaded into the cart (restored but not yet sent/paid) —
  // only deleted from the server once the order is actually sent to KDS, paid, or re-held
  const [activeHoldId, setActiveHoldId] = useState<string | null>(null);

  // Billing view — Touch is the card-grid picker (today's default), Keyboard is the
  // dense tabular billing screen for a mouse+keyboard cashier workflow. Always opens
  // on the branch's POS Settings value (pos_screen_type); switching here via the
  // in-screen toggle only lasts for the current session, not remembered afterward.
  const [billingView, setBillingView] = useState<BillingViewMode>(
    posSettings?.pos_screen_type === "Keyboard" ? "keyboard" : "touch"
  );
  const handleSetBillingView = useCallback((mode: BillingViewMode) => {
    setBillingView(mode);
  }, []);

  // Mirrored into Redux so the app Sidebar (rendered by Layout, outside this
  // component's tree) knows whether to reserve its hover-expand rail here —
  // only Keyboard mode gets it; Touch mode stays the full-screen overlay it
  // always was. Reset back to "touch" on unmount so leaving this screen never
  // leaves a stale billing-route hint behind for the Sidebar.
  useEffect(() => {
    dispatch(setRestaurantBillingView(billingView));
    return () => { dispatch(setRestaurantBillingView("touch")); };
  }, [billingView, dispatch]);

  // Print toggle — when on, the bill prints automatically after a successful payment,
  // on the paper size picked in Invoice Settings.
  const [printEnabled, setPrintEnabled] = useState<boolean>(readAutoPrintPref);
  const [receiptData,  setReceiptData ] = useState<Record<string, unknown> | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const thermalPaperSize = toThermalPaperSize(invoiceSettings?.printer_inch);

  const handleTogglePrint = useCallback(() => {
    setPrintEnabled((prev) => {
      const next = !prev;
      try { localStorage.setItem(AUTO_PRINT_STORAGE_KEY, String(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  // Seed the default payment method from invoice settings once loaded, without
  // overriding a method the user has already picked for the current order.
  // Only seeds when the default is actually one of the buttons shown at
  // checkout (e.g. "QR" can still be picked in Settings but has no billing
  // panel button) — otherwise the order stays on the safe Cash default.
  useEffect(() => {
    const defaultMethod = invoiceSettings?.default_payment_method as PaymentMethod | undefined;
    if (defaultMethod && enabledPaymentTypes.includes(defaultMethod)) {
      setOrder((prev) =>
        prev.paymentMethod === "Cash" ? { ...prev, paymentMethod: defaultMethod } : prev
      );
    }
  }, [invoiceSettings, enabledPaymentTypes]);

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

    return cats;
  }, [categories, filterMode]);

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

  const runningOrderTotals: Totals = useMemo(() => {
    const discType   = order.discountType === "Amount" ? "FLAT" : "PERCENT";
    const subtotal   = runningOrderSummary.reduce((sum, i) => sum + i.price * i.qty, 0);
    const taxAmount  = runningOrderSummary.reduce((sum, i) => {
      const gst = parseFloat(String(i.gst_tax ?? 0)) || 0;
      if (i.tax_include_or_exclude) {
        const base = (i.price * i.qty) / (1 + gst / 100);
        return sum + (i.price * i.qty - base);
      }
      return sum + (i.price * i.qty * gst) / 100;
    }, 0);
    const discount   = discType === "FLAT"
      ? Math.min(order.discountValue, subtotal)
      : (subtotal * order.discountValue) / 100;
    const grandTotal = Math.max(0, subtotal + taxAmount - discount);
    return { subtotal, taxAmount, discount, grandTotal };
  }, [runningOrderSummary, order.discountType, order.discountValue]);

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

  // Total qty in cart for a given menu item (all variants combined).
  // While editing a running KOT, reads/writes go to runningOrderSummary instead of cartItems.
  const getCartQty = useCallback(
    (menuId: string) =>
      isEditingSummary
        ? runningOrderSummary
            .filter((it) => it.item_id === menuId)
            .reduce((s, it) => s + it.qty, 0)
        : cartItems
            .filter((c) => c.product.menu_id === menuId)
            .reduce((s, c) => s + c.quantity, 0),
    [cartItems, isEditingSummary, runningOrderSummary]
  );

  // Adds a menu item into the running KOT summary (edit mode), or bumps its qty if already present.
  const addToSummary = useCallback((product: RestaurantMenuItem) => {
    setRunningOrderSummary((prev) => {
      const found = prev.find((it) => it.item_id === product.menu_id);
      if (found) {
        return prev.map((it) => (it === found ? { ...it, qty: it.qty + 1 } : it));
      }
      return [
        ...prev,
        {
          item_id:   product.menu_id,
          item_name: product.menu_name,
          item_unit: product.menu_unit,
          qty:       1,
          price:     getItemPrice(product),
          gst_tax:   product.gst_tax,
          tax_include_or_exclude: product.tax_include_or_exclude ?? false,
        },
      ];
    });
  }, []);

  const decrementSummaryByProduct = useCallback((product: RestaurantMenuItem) => {
    setRunningOrderSummary((prev) => {
      const found = prev.find((it) => it.item_id === product.menu_id);
      if (!found) return prev;
      const updated = prev.map((it) =>
        it === found ? { ...it, qty: it.qty - 1 } : it
      );
      return updated.filter((it) => it.qty > 0);
    });
  }, []);

  const setSummaryQtyByProduct = useCallback((product: RestaurantMenuItem, newQty: number) => {
    setRunningOrderSummary((prev) => {
      const found = prev.find((it) => it.item_id === product.menu_id);
      if (!found) return prev;
      return prev.map((it) => (it === found ? { ...it, qty: Math.max(1, newQty) } : it));
    });
  }, []);

  // Returns true (and shows a toast) when the requested qty would exceed available stock.
  // Items without a stock_qty are not stock-tracked and are never blocked.
  const isOutOfStock = useCallback(
    (product: RestaurantMenuItem, requestedQty: number) => {
      if (product.stock_qty == null) return false;
      if (requestedQty > product.stock_qty) {
        setErrorMsg(`${product.menu_name} is out of stock`);
        return true;
      }
      return false;
    },
    []
  );

  const handleProductClick = useCallback(
    (product: RestaurantMenuItem) => {
      if (product.variants && product.variants.length > 0) {
        setVariantItem(product);
        return;
      }
      if (isOutOfStock(product, getCartQty(product.menu_id) + 1)) return;
      if (isEditingSummary) addToSummary(product);
      else addToCart(product);
    },
    [addToCart, addToSummary, isEditingSummary, isOutOfStock, getCartQty]
  );

  // Barcode/QR scan (hardware gun or camera) — looks up the FULL catalogue by exact
  // menu_id or qr_code match, then follows the same branches as a manual product click
  // (variant prompt, stock check, cart vs. edit-summary). Mirrors handleProductClick's
  // logic rather than calling it directly, so the success toast only fires on an actual
  // add — not when a variant prompt opens or the item turns out to be out of stock.
  const allMenuItems = useMemo(
    () => (fullMenuData ?? categories).flatMap((c) => c.items),
    [fullMenuData, categories]
  );

  const findItemByCode = useCallback(
    (code: string) => {
      const lower = code.trim().toLowerCase();
      if (!lower) return undefined;
      return allMenuItems.find(
        (i) => i.menu_id?.toLowerCase() === lower || i.qr_code?.toLowerCase() === lower
      );
    },
    [allMenuItems]
  );

  const handleScanCode = useCallback(
    (rawCode: string) => {
      const code = rawCode.trim();
      if (!code) return;
      const product = findItemByCode(code);
      if (!product) {
        setErrorMsg(`No item found for scanned code "${code}"`);
        return;
      }
      if (product.variants && product.variants.length > 0) {
        setVariantItem(product);
        return;
      }
      const priorQty = getCartQty(product.menu_id);
      if (isOutOfStock(product, priorQty + 1)) return;
      if (isEditingSummary) addToSummary(product); else addToCart(product);
      setSuccessMsg(priorQty > 0 ? `"${product.menu_name}" qty increased to ${priorQty + 1}` : `Added "${product.menu_name}"`);
    },
    [findItemByCode, isEditingSummary, addToCart, addToSummary, isOutOfStock, getCartQty]
  );

  // Enter in the combined search/scan box (typed, or sent by a hardware scanner with the
  // box focused): an exact item ID / barcode / QR match is added straight to the order and
  // the box clears; anything else stays in the box as a name search filtering the menu.
  const handleSearchEnter = useCallback(() => {
    const code = searchQuery.trim();
    if (!code) return;
    if (findItemByCode(code)) {
      handleScanCode(code);
      setSearchQuery("");
      return;
    }
    const lower = code.toLowerCase();
    if (!allMenuItems.some((i) => i.menu_name?.toLowerCase().includes(lower))) {
      setErrorMsg(`No item found for "${code}"`);
    }
  }, [searchQuery, findItemByCode, handleScanCode, allMenuItems]);

  // Whether any dialog is currently open — the page-level scanner listener below must
  // stay off while one is, so it doesn't fight with a dialog's own scan handling.
  const anyModalOpen = showCameraScan || showTable || showDiscount || showCustomer || Boolean(variantItem);

  // Auto-detects a connected hardware USB/Bluetooth scanner without requiring the
  // scan bar to be clicked first — active whenever this screen has no dialog open.
  useHardwareScannerListener({ onScan: handleScanCode, active: !anyModalOpen });

  const incrementCart = useCallback((ci: RestaurantCartItem) => {
    if (isOutOfStock(ci.product, ci.quantity + 1)) return;
    setCartItems((prev) => prev.map((c) => (c === ci ? { ...c, quantity: c.quantity + 1 } : c)));
  }, [isOutOfStock]);

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
      if (isOutOfStock(product, getCartQty(product.menu_id) + 1)) return;
      if (isEditingSummary) { addToSummary(product); return; }
      const found = cartItems.find(
        (c) => c.product.menu_id === product.menu_id && !(c.product as any).variant_id
      );
      if (found) incrementCart(found);
      else addToCart(product);
    },
    [cartItems, incrementCart, addToCart, addToSummary, isEditingSummary, isOutOfStock, getCartQty]
  );

  const decrementByProduct = useCallback(
    (product: RestaurantMenuItem) => {
      if (isEditingSummary) { decrementSummaryByProduct(product); return; }
      const found = cartItems.find(
        (c) => c.product.menu_id === product.menu_id && !(c.product as any).variant_id
      );
      if (found) decrementCart(found);
    },
    [cartItems, decrementCart, decrementSummaryByProduct, isEditingSummary]
  );

  const setQtyByProduct = useCallback(
    (product: RestaurantMenuItem, newQty: number) => {
      if (isOutOfStock(product, newQty)) return;
      if (isEditingSummary) { setSummaryQtyByProduct(product, newQty); return; }
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
    [isOutOfStock, isEditingSummary, setSummaryQtyByProduct]
  );

  const resetOrder = useCallback(() => {
    setCartItems([]);
    setRunningOrderSummary([]);
    setRunningOrderTotal(0);
    setOrder(buildInitialOrder());
    setActiveHoldId(null);
    setIsEditingSummary(false);
  }, []);

  // Clearing the cart abandons whatever hold was restored into it too —
  // otherwise a fresh order rung up afterward would wrongly delete that
  // unrelated hold once it's paid (handlePay only keys off activeHoldId).
  const handleClearCart = useCallback(() => {
    setCartItems([]);
    setActiveHoldId(null);
  }, []);

  // Switching the order type away from Dine In abandons any restored running
  // order — it belongs to a specific table, which no longer applies once the
  // order isn't Dine In. Without this, the summary/table state stayed
  // populated underneath: Touch mode just happened to hide it (its cart view
  // is gated on isDineIn), while Keyboard mode's item table isn't gated the
  // same way and kept showing the stale table's items after switching tabs.
  //
  // activeHoldId is deliberately left alone here: it tracks a restored HOLD
  // (cartItems), a completely different thing from a running order
  // (runningOrderSummary) — a held order can legitimately be Pick Up or
  // Delivery, and clearing activeHoldId when the cashier merely (re)selects
  // that same order type meant handlePay's hold cleanup never ran, leaving
  // the sold hold sitting in the Hold list forever.
  const handleOrderTypeChange = useCallback((key: "DineIn" | "Delivery" | "PickUp") => {
    if (key !== "DineIn") {
      setRunningOrderSummary([]);
      setRunningOrderTotal(0);
      setIsEditingSummary(false);
      setOrder((p) => ({
        ...p,
        orderType: key,
        tableNumber: null,
        customerName: "",
        customerPhone: "",
      }));
    } else {
      setOrder((p) => ({ ...p, orderType: key, customerName: "", customerPhone: "" }));
    }
  }, []);

  // ── Edit-mode handlers for already-sent KOT items (runningOrderSummary) ────
  const incrementSummaryItem = useCallback((idx: number) => {
    setRunningOrderSummary((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, qty: it.qty + 1 } : it))
    );
  }, []);

  const decrementSummaryItem = useCallback((idx: number) => {
    setRunningOrderSummary((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, qty: Math.max(1, it.qty - 1) } : it))
    );
  }, []);

  const removeSummaryItem = useCallback((idx: number) => {
    setRunningOrderSummary((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const setSummaryItemQty = useCallback((idx: number, qty: number) => {
    setRunningOrderSummary((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, qty: Math.max(1, qty) } : it))
    );
  }, []);

  const handleEditSummary = useCallback(() => {
    setSummaryBeforeEdit(runningOrderSummary);
    setIsEditingSummary(true);
  }, [runningOrderSummary]);

  // Discards any qty/delete/add changes made during this edit session and
  // restores the KOT items to how they were when Edit was clicked.
  const handleCancelEditSummary = useCallback(() => {
    setRunningOrderSummary(summaryBeforeEdit);
    setIsEditingSummary(false);
  }, [summaryBeforeEdit]);

  // ── Build items payload ───────────────────────────────────────────────────
  // Kitchen notes ride only on the order endpoints that print KOTs — complete-order
  // validates its items strictly and has no use for them.
  const withKitchenNotes = <T extends object>(payload: T[], items: RestaurantCartItem[]) =>
    payload.map((p, idx) => (items[idx]?.note?.trim() ? { ...p, note: items[idx].note!.trim() } : p));

  const buildPayloadItems = (items: RestaurantCartItem[]) =>
    items.map((i) => {
      const price      = getItemPrice(i.product);
      const qty        = i.quantity;
      const gstPct     = parseFloat(i.product.gst_tax) || 0;
      const totalGst   = parseFloat(((price * qty * gstPct) / 100).toFixed(2));
      const halfGst    = parseFloat((totalGst / 2).toFixed(2));
      return {
        menu_id:        i.product.menu_id,
        name:           i.product.menu_name,
        price,
        qty,
        tax:            totalGst,
        gst_percentage: gstPct,
        tax_inclusive:  i.product.tax_include_or_exclude ?? false,
        menu_unit:      i.product.menu_unit ?? null,
        variant_id:     i.product.variant_id ?? null,
        variant_name:   i.product.variant_name ?? null,
        cgst:           halfGst,
        sgst:           halfGst,
      };
    });

  const buildSummaryPayloadItems = (items: typeof runningOrderSummary) =>
    items.map((i) => {
      const gstPct   = parseFloat(String(i.gst_tax ?? 0)) || 0;
      const totalGst = parseFloat(((i.price * i.qty * gstPct) / 100).toFixed(2));
      const halfGst  = parseFloat((totalGst / 2).toFixed(2));
      return {
        menu_id:        i.item_id,
        name:           i.item_name,
        price:          i.price,
        qty:            i.qty,
        tax:            totalGst,
        gst_percentage: gstPct,
        tax_inclusive:  i.tax_include_or_exclude ?? false,
        menu_unit:      i.item_unit ?? null,
        variant_id:     null,
        variant_name:   null,
        cgst:           halfGst,
        sgst:           halfGst,
      };
    });

  const calcSummaryTotals = (items: typeof runningOrderSummary, discountType: string, discountValue: number) => {
    const subtotal  = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const taxAmount = items.reduce((sum, i) => {
      const gst = parseFloat(String(i.gst_tax ?? 0)) || 0;
      if (i.tax_include_or_exclude) {
        const base = (i.price * i.qty) / (1 + gst / 100);
        return sum + (i.price * i.qty - base);
      }
      return sum + (i.price * i.qty * gst) / 100;
    }, 0);
    const discount   = discountType === "FLAT"
      ? Math.min(discountValue, subtotal)
      : (subtotal * discountValue) / 100;
    const grandTotal = Math.max(0, subtotal + taxAmount - discount);
    return { subtotal, taxAmount, discount, grandTotal };
  };

  const handleSendEditedKDS = async () => {
    if (!order.orderId || !runningOrderSummary.length) { setErrorMsg("No items to update"); return; }
    const discType = order.discountType === "Amount" ? "FLAT" : "PERCENT";
    const t = calcSummaryTotals(runningOrderSummary, discType, order.discountValue);
    try {
      const res = await updateOrder({
        zodu_id:         zoduId,
        branch_id:       branchId,
        api_order_id:    order.orderId,
        table_no:        order.tableNumber,
        kot_no:          order.kotNo ?? "KOT-1",
        no_of_items:     runningOrderSummary.length,
        order_type:      ADD_ORDER_TYPE_MAP[order.orderType],
        payment_type:    order.paymentMethod,
        customer_name:   order.customerName || null,
        customer_phone:  order.customerPhone || null,
        subtotal:        t.subtotal,
        tax_amount:      t.taxAmount,
        total_amt:       t.grandTotal,
        discount_type:   discType,
        discount_value:  order.discountValue,
        discount_amount: t.discount,
        final_payment:   false,
        order_date:      new Date().toISOString().split("T")[0],
        order_time:      new Date().toLocaleTimeString("en-GB"),
        items:           buildSummaryPayloadItems(runningOrderSummary),
      });
      setSuccessMsg("Order updated");
      setIsEditingSummary(false);
      // Raised quantities print as ADD tickets, lowered/removed ones as CANCEL.
      void printKitchenTickets(res);
    } catch {
      setErrorMsg("Failed to update order");
    }
  };

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleSendToKDS = async () => {
    if (!cartItems.length)
     { setErrorMsg("Add items first"); return; }
    if (order.orderType === "DineIn" && !order.tableNumber) { setShowTable(true); return; }
    console.log("Sending to KDS with payload:", order);

    try {
      const res = await addOrder({
        zodu_id:         zoduId,
        branch_id:       branchId,
        table_no:        order.tableNumber ?? null,
        order_type:      ADD_ORDER_TYPE_MAP[order.orderType],
        kot_no:          order.kotNo ?? "KOT-1",
        items:           withKitchenNotes(buildPayloadItems(cartItems), cartItems),
        no_of_items:     cartItems.length,
        subtotal:        totals.subtotal,
        total_amt:       totals.grandTotal,
        discount_amount: totals.discount,
        tax_amount:      totals.taxAmount,
        discount_type:   order.discountType === "Amount" ? "FLAT" : "PERCENT",
        discount_value:  order.discountValue,
        payment_type:    "",
        final_payment:   false,
        order_date:      new Date().toISOString().split("T")[0],
        order_time:      new Date().toLocaleTimeString("en-GB"),
        customer_name:   order.customerName,
        customer_phone:  order.customerPhone,
      });
      setSuccessMsg("Order sent to KDS!");
      void printKitchenTickets(res);
      if (activeHoldId) {
        try { await deleteHoldOrder(activeHoldId); } catch { /* ignore */ }
      }
      resetOrder();
    } catch {
      setErrorMsg("Failed to send to KDS");
    }
  };

  // ── Receipt ───────────────────────────────────────────────────────────────
  // The bill being paid, in the shape ThermalInvoiceTemplate reads. Built before the
  // payment call because resetOrder() clears the cart as soon as it succeeds.
  const buildReceiptData = (payMethod: PaymentMethod, t: Totals) => {
    const lines: ReceiptLine[] = cartItems.length > 0
      ? cartItems.map((ci) => ({
          itemId:    ci.product.menu_id,
          name:      ci.product.menu_name,
          variant:   ci.product.variant_name ?? null,
          qty:       ci.quantity,
          price:     getItemPrice(ci.product),
          gstPct:    parseFloat(ci.product.gst_tax) || 0,
          inclusive: ci.product.tax_include_or_exclude ?? false,
        }))
      : runningOrderSummary.map((it) => ({
          itemId:    it.item_id,
          name:      it.item_name,
          variant:   null,
          qty:       it.qty,
          price:     it.price,
          gstPct:    parseFloat(String(it.gst_tax ?? 0)) || 0,
          inclusive: it.tax_include_or_exclude ?? false,
        }));

    // GST slabs, taxed the same way calcTax / calcSummaryTotals tax them on screen.
    const gstBreakdown = gstBreakdownFromLines(lines);
    const now = new Date();

    return {
      date:           now.toLocaleDateString("en-GB"),
      time:            now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      customer_name:   order.customerName.trim() || "Walk-In",
      customer_mobile: order.customerPhone.trim() || "-",
      customer_gstin:  "-",
      payment_mode:    payMethod,
      items: lines.map((l) => ({
        item_id:      l.itemId,
        name:         l.name,
        variant_name: l.variant,
        qty:          l.qty,
        rate:         l.price,
        tax:          l.gstPct,
        total:        l.price * l.qty,
      })),
      subtotal:       t.subtotal,
      discount:       t.discount > 0 ? t.discount : null,
      discount_label: order.discountType === "Percent" ? `Discount (${order.discountValue}%)` : "Discount",
      cgst:           gstBreakdown.reduce((s, r) => s + r.cgstAmount, 0),
      sgst:           gstBreakdown.reduce((s, r) => s + r.sgstAmount, 0),
      total:          t.grandTotal,
      gst_breakdown:  gstBreakdown,
    };
  };

  // The shop details the bill is headed with — the branch's address first, as on the on-screen receipt.
  const billHeader = (): BillHeader => {
    const branch = selectedCompany?.branches?.find((b) => b.branch_id === branchId);
    const line1 = [branch?.address_line_1 || selectedCompany?.address_line_1, branch?.address_line_2 || selectedCompany?.address_line_2];
    const line2 = [branch?.city || selectedCompany?.city, branch?.district || selectedCompany?.district, branch?.state || selectedCompany?.state, branch?.pincode || selectedCompany?.pincode];
    return {
      name:         restaurantName || "Restaurant",
      addressLines: [line1, line2].map((parts) => parts.filter(Boolean).join(", ")).filter(Boolean),
      phone:        profile?.phone_number || selectedCompany?.phone_number || selectedCompany?.mobile_no || null,
      gstin:        selectedCompany?.gst_no || null,
    };
  };

  // Prints the bill on the billing printer from Printer Settings, through the print
  // bridge — silently and in the printer's own font, like a KOT. Only a branch with no
  // billing printer set up falls back to the browser's print dialog.
  //
  // That fallback prints through a hidden iframe rather than window.open: this
  // runs after the payment request resolves, by which point the click that started it
  // may no longer count as a user gesture and a popup blocker would swallow a new window.
  const printReceipt = async (receipt: ReturnType<typeof buildReceiptData> & { sale_id: string | null | undefined }) => {
    const printedOnBillingPrinter = await printBill((paper) => buildBillSlip(receipt, billHeader(), {
      paper,
      showTaxDetails:      invoiceSettings?.show_tax_details ?? false,
      showCustomerDetails: invoiceSettings?.show_customer_details ?? true,
      showPaymentDetails:  invoiceSettings?.show_payment_details ?? false,
      showSerialNo:        invoiceSettings?.show_serial_no ?? true,
      showItemId:          invoiceSettings?.show_item_id ?? false,
      notes:               invoiceSettings?.show_notes ? invoiceSettings.notes : null,
      terms:               invoiceSettings?.show_terms_conditions ? invoiceSettings.terms_conditions : null,
    }));
    if (printedOnBillingPrinter) return;

    flushSync(() => setReceiptData(receipt));
    const node = receiptRef.current;
    if (!node) return;
    const image = await captureThermalReceipt(node);

    const iframe = document.createElement("iframe");
    Object.assign(iframe.style, { position: "fixed", right: "0", bottom: "0", width: "0", height: "0", border: "0" });
    document.body.appendChild(iframe);
    const win = iframe.contentWindow;
    if (!win) { iframe.remove(); return; }

    await writeThermalPrint(win, [image]);

    // After the write — opening the document drops listeners already on its window.
    const cleanup = () => iframe.remove();
    win.addEventListener("afterprint", () => setTimeout(cleanup, 0));
    setTimeout(cleanup, 60000);

    win.focus();
    win.print();
  };

  const handlePay = async (payMethod: PaymentMethod) => {
    const paidOrderType = order.orderType;
    try {
      let receipt: ReturnType<typeof buildReceiptData>;
      let res: unknown;
      if (order.orderType === "DineIn") {
        if (!order.tableNumber) { setErrorMsg("Select a table first"); return; }
        const discType = order.discountType === "Amount" ? "FLAT" : "PERCENT";
        const t = cartItems.length > 0
          ? totals
          : calcSummaryTotals(runningOrderSummary, discType, order.discountValue);
        receipt = buildReceiptData(payMethod, t);
        res = await completeOrder({
          api_order_id:    order.orderId,
          zodu_id:         zoduId,
          branch_id:       branchId,
          table_no:        order.tableNumber,
          payment_type:    payMethod,
          discount_type:   discType,
          discount_value:  order.discountValue,
          items: cartItems.length > 0
            ? buildPayloadItems(cartItems)
            : buildSummaryPayloadItems(runningOrderSummary),
          no_of_items:     cartItems.length > 0 ? cartItems.length : runningOrderSummary.length,
          subtotal:        t.subtotal,
          total_amt:       t.grandTotal,
          discount_amount: t.discount,
          total_tax:       t.taxAmount,
        });
      } else {
        receipt = buildReceiptData(payMethod, totals);
        res = await addOrder({
          zodu_id:         zoduId,
          kot_no:          order.kotNo ?? "KOT-1",
          branch_id:       branchId,
          table_no:        null,
          order_type:      ADD_ORDER_TYPE_MAP[order.orderType],
          items:           withKitchenNotes(buildPayloadItems(cartItems), cartItems),
          no_of_items:     cartItems.length,
          subtotal:        totals.subtotal,
          total_amt:       totals.grandTotal,
          discount_amount: totals.discount,
          tax_amount:      totals.taxAmount,
          discount_type:   order.discountType === "Amount" ? "FLAT" : "PERCENT",
          discount_value:  order.discountValue,
          payment_type:    payMethod,
          final_payment:   true,
          order_date:      new Date().toISOString().split("T")[0],
          order_time:      new Date().toLocaleTimeString("en-GB"),
          customer_name:   order.customerName,
          customer_phone:  order.customerPhone,
        });
      }
      if (activeHoldId) {
        try { await deleteHoldOrder(activeHoldId); } catch { /* ignore */ }
      }
      setSuccessMsg("Payment successful!");
      resetOrder();

      // The bill always prints before the kitchen tickets, so on a shared billing
      // printer the customer's bill comes out first.
      if (printEnabled) {
        // The payment already went through — a print problem must not read as a failed payment.
        try {
          await printReceipt({ ...receipt, sale_id: pickOrderNo(res) });
        } catch (err) {
          setErrorMsg(`Payment successful, but the bill could not be printed${err instanceof Error ? ` — ${err.message}` : ""}`);
        }
      }
      // Pick Up / Delivery reach the kitchen when they're paid for.
      if (paidOrderType !== "DineIn") void printKitchenTickets(res);
    } catch {
      setErrorMsg("Payment failed. Please try again.");
    }
  };

  const handleHold = async () => {
    if (!cartItems.length) { setErrorMsg("No items to hold"); return; }
    // Holding abandons any restored running-order view immediately, before the API call resolves.
    setRunningOrderSummary([]);
    setRunningOrderTotal(0);
    setIsEditingSummary(false);
    const items = cartItems.map((ci) => ({
      item_id:      ci.product.menu_id,
      item_name:    ci.product.menu_name,
      item_unit:    ci.product.menu_unit || null,
      qty:          ci.quantity,
      price:        getItemPrice(ci.product),
      variant_name: ci.product.variant_name ?? null,
      variant_id:   ci.product.variant_id ?? null,
    }));
    try {
      if (activeHoldId) {
        // Already-held order restored into the cart — update it in place instead of
        // creating a new hold record + deleting the old one.
        // Items that came from the original hold carry their row `id` so the backend
        // updates them in place; newly added items are sent without `id` so they're inserted.
        const updateItems = cartItems.map((ci, idx) => ({
          ...items[idx],
          ...(ci.product.hold_item_id != null ? { id: ci.product.hold_item_id } : {}),
        }));
        await updateHoldOrder({
          hold_id:       activeHoldId,
          zodu_id:       zoduId,
          branch_id:     branchId,
          orderType:     HOLD_ORDER_TYPE_MAP[order.orderType],
          table_no:      order.tableNumber != null ? String(order.tableNumber) : null,
          customerName:  order.customerName || null,
          customerPhone: order.customerPhone || null,
          items: updateItems,
        });
      } else {
        await holdOrder({
          zodu_id:       zoduId,
          branch_id:     branchId,
          orderType:     HOLD_ORDER_TYPE_MAP[order.orderType],
          table_no:      order.tableNumber != null ? String(order.tableNumber) : null,
          customerName:  order.customerName || null,
          customerPhone: order.customerPhone || null,
          items,
        });
      }
      setSuccessMsg("Order placed on hold");
      resetOrder();
    } catch {
      setErrorMsg("Failed to hold order");
    }
  };

  const handleRestoreRunningOrder = (ro: RunningOrder) => {
    const tableNum    = parseInt(ro.table_no, 10) || null;
    const latestKotNo = ro.kot_items[ro.kot_items.length - 1]?.kot_no ?? null;

    // Switching to a different running order always exits edit mode for the previous one.
    setIsEditingSummary(false);

    // Build a flat menu lookup so we can enrich ordered_items with tax data
    const menuItemMap = new Map(
      categories.flatMap((cat) => cat.items.map((item) => [item.menu_id, item]))
    );
    const enrichedItems: RunningOrderOrderedItem[] = ro.ordered_items.map((item) => {
      const menuItem = menuItemMap.get(item.item_id);
      return {
        ...item,
        gst_tax:                menuItem?.gst_tax              ?? undefined,
        tax_include_or_exclude: menuItem?.tax_include_or_exclude ?? undefined,
      };
    });

    setCartItems([]);
    setRunningOrderSummary(enrichedItems);
    setRunningOrderTotal(parseFloat(ro.total_amt) || 0);
    setOrder((p) => ({
      ...p,
      orderId:       ro.api_order_id,
      tableNumber:   tableNum,
      kotNo:         latestKotNo,
      orderType:     "DineIn",
      customerName:  ro.customer_name ?? "",
      customerPhone: ro.customer_phone ?? "",
      discountType:  "Percent",
      discountValue: 0,
    }));
  };

  const handleDeleteHold = async (holdId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteHoldOrder(holdId);
      setSuccessMsg("Hold order removed");
    } catch {
      setErrorMsg("Failed to remove hold order");
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
        hold_item_id:           i.id,
      } as RestaurantMenuItem,
      quantity: i.qty,
    }));
    setCartItems(restoredItems);
    setRunningOrderSummary([]);
    setRunningOrderTotal(0);
    setIsEditingSummary(false);
    setOrder((p) => ({
      ...p,
      tableNumber:   held.table_no ? Number(held.table_no) : null,
      customerName:  held.customer_name ?? "",
      customerPhone: held.customer_phone ?? "",
      orderType:
        held.order_type === "DINE_IN"   ? "DineIn"
        : held.order_type === "DELIVERY" ? "Delivery"
        : "PickUp",
      discountType:  "Percent",
      discountValue: 0,
    }));
    // Don't delete the hold record yet — only remove it once this order is actually
    // sent to KDS, paid, or re-held. Track it so those flows can clean it up.
    setActiveHoldId(held.hold_id);
    setSuccessMsg("Hold order restored");
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (menuLoading) return <LottieLoader />;

  // Touch mode stays the full-viewport overlay this screen has always been —
  // maximum space for the card-grid cashier workflow, app chrome hidden.
  // Keyboard mode instead leaves room on the left for the app Sidebar's
  // hover-expand rail (see store/slices/POSslice.ts RestaurantBillingView /
  // layouts/Sidebar), so it sits at a lower z-index than the Sidebar's fixed
  // drawer paper (theme.zIndex.drawer + 1) and starts after its collapsed width.
  const isKeyboard = billingView === "keyboard";

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: isKeyboard ? collapsedDrawerWidth : 0,
        zIndex: isKeyboard ? 1200 : 1299,
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f5f5f5",
        overflow: "hidden",
      }}
    >
      {/* ════ Header / Navbar ════ */}
      {/* Keyboard mode matches the Sidebar's 64px toolbar height so its bottom
          border lines up with the Sidebar's divider instead of the two edges
          sitting at different heights next to each other. */}
      <Box
        sx={{
          height: isKeyboard ? 64 : 54,
          bgcolor: "#fff",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          px: 2,
          gap: 1.5,
          flexShrink: 0,
        }}
      >
        {/* Logo + Back — the app Sidebar already shows its own logo and nav
            once Keyboard mode reserves space for it, so this header's copies
            would just duplicate that. Touch mode has no Sidebar visible, so
            it keeps them. */}
        {!isKeyboard && (
          <>
            <Box
              component="img"
              src={zoduLogo}
              alt="zodu"
              sx={{
                height: 40,
                width: "auto",
                ml: 4,
              }}
            />
            <Divider orientation="vertical" flexItem sx={{ borderColor: "#e5e7eb", ml: 10.2  }} />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                onClick={() => navigate("/sales-history")}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#d32f2f",
                  color: "#fff",
                  borderRadius: "8px",
                  p: 0.5,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "#b71c1c" },
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 18 }} />
              </Box>
            </Box>
          </>
        )}

        {/* Company name — this header stands in for the app Topbar on both
            billing views, so it resolves the name the same way Topbar does. */}
        <Typography
          noWrap
          sx={{
            color: "#111827",
            fontWeight: 700,
            fontSize: { xs: 14, md: 17 },
            textTransform: "uppercase",
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            ml: isKeyboard ? 0 : 1,
          }}
        >
          {selectedCompany?.restaurant_name || selectedCompany?.company_name || profile?.restaurant_name || ""}
        </Typography>
        <Tooltip title={isEmployee ? "" : "Switch Organisation"}>
          <span>
            <IconButton
              size="small"
              disabled={isEmployee}
              onClick={() => navigate("/select-branch", { state: { companies, fromSwitch: true } })}
              sx={{
                color: "#c8101f",
                bgcolor: "rgba(200,16,31,0.07)",
                borderRadius: "8px",
                p: 0.6,
                ml: -0.5,
                flexShrink: 0,
                "&:hover": { bgcolor: "rgba(200,16,31,0.14)" },
                "&.Mui-disabled": { color: "#c8c8c8", bgcolor: "rgba(0,0,0,0.04)" },
              }}
            >
              <SwitchAccountIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </span>
        </Tooltip>

        <Box sx={{ flex: 1 }} />

        {/* Billing view toggle: Keyboard (dense tabular billing) vs. Touch (card grid) */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.25,
            p: 0.4,
            borderRadius: "8px",
            bgcolor: "#f3f4f6",
            flexShrink: 0,
          }}
        >
          {(
            [
              { mode: "keyboard" as const, label: "Keyboard", icon: <KeyboardOutlinedIcon sx={{ fontSize: 16 }} /> },
              { mode: "touch" as const, label: "Touch", icon: <TouchAppOutlinedIcon sx={{ fontSize: 16 }} /> },
            ]
          ).map(({ mode, label, icon }) => {
            const active = billingView === mode;
            return (
              <Box
                key={mode}
                onClick={() => handleSetBillingView(mode)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 1.25,
                  py: 0.6,
                  borderRadius: "6px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  color: active ? "#d32f2f" : "#6b7280",
                  bgcolor: active ? "#fff" : "transparent",
                  boxShadow: active ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s",
                }}
              >
                {icon}
                {label}
              </Box>
            );
          })}
        </Box>

        {/* Kitchen tickets for the open running order, or the order last sent */}
        <Tooltip title="Kitchen tickets (reprint KOT)">
          <span>
            <IconButton
              size="small"
              disabled={!(order.orderId || lastKotOrderId)}
              onClick={() => setReprintOrderId(order.orderId || lastKotOrderId)}
              sx={{ color: "#374151", border: "1px solid #e5e7eb", borderRadius: "8px", width: 34, height: 34 }}
            >
              <ReceiptLongOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </span>
        </Tooltip>

        {/* Branch dropdown */}
        <Select
          size="small"
          value={branchId}
          onChange={(e) => handleBranchChange(e.target.value)}
          sx={{
            minWidth: 150,
            height: 34,
            fontSize: "0.8rem",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
          }}
        >
          {companyBranches.length > 0
            ? companyBranches.map((b) => (
                <MenuItem key={b.branch_id} value={b.branch_id}>
                  {b.branch_name}
                </MenuItem>
              ))
            : <MenuItem value={branchId}>{branchName || branchId}</MenuItem>
          }
        </Select>

        {/* Notifications */}
        <IconButton size="small">
          <Badge color="error" variant="dot">
            <NotificationsIcon sx={{ fontSize: 20 }} />
          </Badge>
        </IconButton>

        {/* User avatar + name */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar
            src="https://randomuser.me/api/portraits/women/65.jpg"
            sx={{ width: 32, height: 32 }}
          />
          <Typography sx={{ display: { xs: "none", sm: "block" }, color: "#111827", fontWeight: 600, fontSize: "0.8rem" }}>
            {profile?.user_type === "super_admin" ? "Super Admin" : "Manager"}
          </Typography>
        </Box>

      </Box>

      {/* ════ Body ════ */}
      {billingView === "keyboard" ? (
        <KeyboardBillingView
          order={order}
          cartItems={cartItems}
          totals={totals}
          isBusy={isBusy}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchEnter={handleSearchEnter}
          filterMode={filterMode}
          onToggleFavourites={() => setFilterMode(filterMode === "Favourites" ? "All" : "Favourites")}
          filteredCategories={filteredCategories}
          getCartQty={getCartQty}
          onAddItem={handleProductClick}
          runningOrders={runningOrders}
          onRestoreRunningOrder={handleRestoreRunningOrder}
          runningOrderSummary={runningOrderSummary}
          runningOrderTotals={runningOrderTotals}
          onSummaryIncrement={incrementSummaryItem}
          onSummaryDecrement={decrementSummaryItem}
          onSummaryRemove={removeSummaryItem}
          onSummarySetQty={setSummaryItemQty}
          isEditingSummary={isEditingSummary}
          onEditSummary={handleEditSummary}
          onCancelEditSummary={handleCancelEditSummary}
          onSendEditedKDS={handleSendEditedKDS}
          onSendToKDS={handleSendToKDS}
          heldOrders={heldOrders}
          activeHoldId={activeHoldId}
          onRestoreHold={handleRestoreHold}
          onDeleteHold={handleDeleteHold}
          enabledPaymentTypes={enabledPaymentTypes}
          onOrderTypeChange={handleOrderTypeChange}
          onTableClick={() => setShowTable(true)}
          onCustomerClick={() => setShowCustomer(true)}
          onDiscountClick={() => setShowDiscount(true)}
          onPaymentMethodChange={(m) => setOrder((p) => ({ ...p, paymentMethod: m }))}
          onIncrement={incrementCart}
          onDecrement={decrementCart}
          onSetQty={setQtyByProduct}
          onRemove={removeFromCart}
          onClearCart={handleClearCart}
          onHold={handleHold}
          onPaid={() => handlePay(order.paymentMethod)}
        />
      ) : (
      <Box sx={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

        {/* ── Category sidebar ── */}
        <CategoryNav
          categories={categories}
          activeCategory={activeCategory}
          onSelect={handleCategorySelect}
          totalItems={categories.reduce((s, c) => s + c.items.length, 0)}
        />

        {/* ── Center: search + product grid ── */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0, minWidth: 0 }}>

          {/* ── Toolbar: combined search / scan + favourites (stays put while the menu scrolls) ── */}
          <Box
            sx={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              pt: 1.5,
              pb: 1,
            }}
          >
            <TextField
              size="small"
              fullWidth
              autoComplete="off"
              placeholder="Search dishes by name, item ID — or scan a barcode/QR…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); handleSearchEnter(); }
                if (e.key === "Escape") setSearchQuery("");
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  bgcolor: "#fff",
                  height: 38,
                  fontSize: "0.85rem",
                  "& fieldset": { borderColor: "#e5e7eb" },
                  "&:hover fieldset": { borderColor: "#d32f2f" },
                  "&.Mui-focused fieldset": { borderColor: "#d32f2f" },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <QrCodeScannerIcon sx={{ color: "#d32f2f", fontSize: 18 }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery("")} sx={{ p: 0.3 }}>
                      <CloseIcon sx={{ fontSize: 15, color: "#9ca3af" }} />
                    </IconButton>
                  </InputAdornment>
                ) : (
                  <InputAdornment position="end">
                    <SearchIcon sx={{ fontSize: 17, color: "#d1d5db" }} />
                  </InputAdornment>
                ),
              }}
            />

            {isMobileOrTablet && (
              <Tooltip title="Scan with camera">
                <IconButton
                  size="small"
                  onClick={() => setShowCameraScan(true)}
                  sx={{ flexShrink: 0, bgcolor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", width: 38, height: 38, color: "#d32f2f" }}
                >
                  <CameraAltOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}

            {/* Favourites toggle */}
            <Box
              onClick={() => setFilterMode(filterMode === "Favourites" ? "All" : "Favourites")}
              sx={{
                height: 38,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.5,
                borderRadius: "8px",
                border: filterMode === "Favourites" ? "1.5px solid #f59e0b" : "1px solid #e5e7eb",
                bgcolor: filterMode === "Favourites" ? "#fffbeb" : "#fff",
                color: filterMode === "Favourites" ? "#d97706" : "#6b7280",
                fontWeight: filterMode === "Favourites" ? 700 : 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
                flexShrink: 0,
                "&:hover": { border: "1.5px solid #f59e0b", color: "#d97706" },
              }}
            >
              <StarIcon sx={{ fontSize: 16 }} />
              <Typography sx={{ fontSize: "0.8rem", fontWeight: "inherit", lineHeight: 1 }}>
                Favourites
              </Typography>
            </Box>
          </Box>

          {/* Scrollable product grid */}
          <Box
            ref={menuScrollRef}
            sx={{
              flex: 1,
              overflowY: "auto",
              px: 2,
              pt: 0.5,
              pb: 2,
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
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 1.5,
                    }}
                  >
                    {cat.items.map((item) => (
                      <ProductCard
                        key={item.menu_id}
                        item={item}
                        qty={getCartQty(item.menu_id)}
                        onAdd={handleProductClick}
                        onIncrement={incrementByProduct}
                        onDecrement={decrementByProduct}
                        onSetQty={setQtyByProduct}
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
                py: 1.2,
                bgcolor: "#ffffff",
                borderTop: "1px solid #fecaca",
                overflowX: "auto",
                scrollbarWidth: "thin",
                "&::-webkit-scrollbar": { height: 6 },
                "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
                "&::-webkit-scrollbar-thumb": { bgcolor: "#fca5a5", borderRadius: 3 },
              }}
            >
              <TableBarIcon sx={{ fontSize: 18, color: "#d32f2f", flexShrink: 0 }} />
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#991b1b", whiteSpace: "nowrap", flexShrink: 0 }}>
                Running:
              </Typography>
              {runningOrders.map((ro) => {
                const tableNum  = parseInt(ro.table_no, 10);
                const itemCount = ro.ordered_items.reduce((s, i) => s + i.qty, 0);
                const isActive  = order.tableNumber === tableNum && order.orderId === ro.api_order_id;
                return (
                  <Chip
                    key={ro.api_order_id}
                    label={`T${ro.table_no} · ${itemCount} item${itemCount !== 1 ? "s" : ""}`}
                    size="small"
                    icon={<TableBarIcon sx={{ fontSize: "16px !important" }} />}
                    onClick={() => handleRestoreRunningOrder(ro)}
                    sx={{
                      height: 34,
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      bgcolor: isActive ? "#fecaca" : "#fee2e2",
                      color: "#dc2626",
                      border: isActive ? "2px solid #dc2626" : "2px solid #ef4444",
                      cursor: "pointer",
                      flexShrink: 0,
                      "& .MuiChip-label": { px: 1.5 },
                      "& .MuiChip-icon": { color: "#ef4444" },
                      "&:hover": { bgcolor: "#fee2e2" },
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
                py: 1.2,
                bgcolor: "#ffffff",
                borderTop: "1px solid #fcd34d",
                overflowX: "auto",
                scrollbarWidth: "thin",
                "&::-webkit-scrollbar": { height: 6 },
                "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
                "&::-webkit-scrollbar-thumb": { bgcolor: "#fcd34d", borderRadius: 3 },
              }}
            >
              <PauseCircleOutlineIcon sx={{ fontSize: 18, color: "#d97706", flexShrink: 0 }} />
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#92400e", whiteSpace: "nowrap", flexShrink: 0 }}>
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
                    label={`${ho.hold_id} · ${itemCount} item${itemCount !== 1 ? "s" : ""}`}
                    size="small"
                    icon={<RestoreIcon sx={{ fontSize: "16px !important" }} />}
                    onClick={() => handleRestoreHold(ho)}
                    onDelete={(e) => handleDeleteHold(ho.hold_id, e)}
                    sx={{
                      height: 34,
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      bgcolor: "#fef3c7",
                      color: "#b45309",
                      border: "2px solid #f59e0b",
                      cursor: "pointer",
                      flexShrink: 0,
                      "& .MuiChip-label": { px: 1.5 },
                      "& .MuiChip-icon": { color: "#f59e0b" },
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
          runningOrderTotal={runningOrderTotal}
          runningOrderTotals={runningOrderTotals}
          onTableClick={() => setShowTable(true)}
          onCustomerClick={() => setShowCustomer(true)}
          onOrderTypeChange={handleOrderTypeChange}
          onDiscountClick={() => setShowDiscount(true)}
          onPaymentMethodChange={(m) => setOrder((p) => ({ ...p, paymentMethod: m }))}
          enabledPaymentTypes={enabledPaymentTypes}
          onSendToKDS={handleSendToKDS}
          onPaid={() => handlePay(order.paymentMethod)}
          onIncrement={incrementCart}
          onDecrement={decrementCart}
          onRemove={removeFromCart}
          onHold={handleHold}
          isEditingSummary={isEditingSummary}
          onEditSummary={handleEditSummary}
          onCancelEditSummary={handleCancelEditSummary}
          onSummaryIncrement={incrementSummaryItem}
          onSummaryDecrement={decrementSummaryItem}
          onSummaryRemove={removeSummaryItem}
          onSummarySetQty={setSummaryItemQty}
          onSendEditedKDS={handleSendEditedKDS}
          onClearCart={handleClearCart}
          printEnabled={printEnabled}
          onTogglePrint={handleTogglePrint}
        />
      </Box>
      )}

      {/* Off-screen receipt — captured by printReceipt() after a successful payment */}
      {receiptData && (
        <Box sx={{ position: "fixed", left: -10000, top: 0, pointerEvents: "none", opacity: 0 }}>
          <ThermalInvoiceTemplate ref={receiptRef} data={receiptData} paperSize={thermalPaperSize} />
        </Box>
      )}

      {/* ════ Modals ════ */}
      <CameraBarcodeScanner
        open={showCameraScan}
        onClose={() => setShowCameraScan(false)}
        onScan={handleScanCode}
      />
      <TableModal
        open={showTable}
        activeTableNumbers={activeTableNumbers}
        selectedTable={order.tableNumber}
        onSelect={(n) => {
          setRunningOrderSummary([]);
          setRunningOrderTotal(0);
          setIsEditingSummary(false);
          setOrder((p) => ({ ...p, tableNumber: n, orderType: "DineIn", discountType: "Percent", discountValue: 0 }));
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

      <SuccessToast message={successMsg} onClose={() => setSuccessMsg("")} />
      <SuccessToast message={errorMsg} severity="error" onClose={() => setErrorMsg("")} />

      <Snackbar open={!!kotIssue} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert
          severity="warning"
          variant="filled"
          onClose={() => setKotIssue(null)}
          action={kotIssue?.apiOrderId ? (
            <Button
              color="inherit"
              size="small"
              sx={{ fontWeight: 800 }}
              onClick={() => { setReprintOrderId(kotIssue.apiOrderId); setKotIssue(null); }}
            >
              Reprint
            </Button>
          ) : undefined}
          sx={{ alignItems: "center", maxWidth: 560 }}
        >
          {kotIssue?.message}
        </Alert>
      </Snackbar>

      <KotReprintDialog
        open={!!reprintOrderId}
        apiOrderId={reprintOrderId}
        onClose={() => setReprintOrderId(null)}
        zoduId={zoduId}
        branchId={branchId}
        restaurantName={restaurantName}
        onResult={(message, severity) => (severity === "error" ? setErrorMsg(message) : setSuccessMsg(message))}
      />

    </Box>
  );
};

export default RestaurantPOS;
