import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Divider,
  Button,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import KitchenIcon from "@mui/icons-material/Kitchen";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import RestoreIcon from "@mui/icons-material/Restore";
import TableBarIcon from "@mui/icons-material/TableBar";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import MoneyIcon from "@mui/icons-material/Money";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import type {
  RestaurantCartItem,
  RestaurantMenuItem,
  RestaurantOrder,
  RestaurantCategory,
  RunningOrder,
  RunningOrderOrderedItem,
  HoldOrder,
} from "../api/restaurantPosApi";
import { getItemPrice } from "../api/restaurantPosApi";
import { ORDER_TYPES, OrderTypePill, type Totals, type PaymentMethod } from "./OrderPanel";

const RED = "#d32f2f";

interface Props {
  order: RestaurantOrder;
  cartItems: RestaurantCartItem[];
  totals: Totals;
  isBusy: boolean;

  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchEnter: () => void;

  filterMode: "All" | "Favourites";
  onToggleFavourites: () => void;

  // Server-filtered category set for the active search — same data
  // RestaurantPOS's card grid already computes, rendered here as a
  // typeahead dropdown instead of a grid.
  filteredCategories: RestaurantCategory[];
  getCartQty: (menuId: string) => number;
  onAddItem: (product: RestaurantMenuItem) => void;

  runningOrders: RunningOrder[];
  onRestoreRunningOrder: (order: RunningOrder) => void;
  // A restored running order's items (already sent to KDS, not yet paid) —
  // a separate list from cartItems, same as the Touch screen's Summary tab.
  // Read-only until the cashier explicitly starts editing (isEditingSummary);
  // onAddItem/onSummaryIncrement/etc. only mutate this list while editing.
  runningOrderSummary: RunningOrderOrderedItem[];
  runningOrderTotals: Totals;
  onSummaryIncrement: (idx: number) => void;
  onSummaryDecrement: (idx: number) => void;
  onSummaryRemove: (idx: number) => void;
  onSummarySetQty: (idx: number, qty: number) => void;
  isEditingSummary: boolean;
  onEditSummary: () => void;
  onCancelEditSummary: () => void;
  onSendEditedKDS: () => void;
  // Fresh Dine In items go to the kitchen first — same "Send KDS" step as
  // Touch mode's Order tab — before the order becomes payable.
  onSendToKDS: () => void;

  heldOrders: HoldOrder[];
  activeHoldId: string | null;
  onRestoreHold: (hold: HoldOrder) => void;
  onDeleteHold: (holdId: string, e: React.MouseEvent) => void;

  enabledPaymentTypes: PaymentMethod[];
  onOrderTypeChange: (key: "DineIn" | "Delivery" | "PickUp") => void;
  onTableClick: () => void;
  onCustomerClick: () => void;
  onDiscountClick: () => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;

  onIncrement: (item: RestaurantCartItem) => void;
  onDecrement: (item: RestaurantCartItem) => void;
  onSetQty: (product: RestaurantMenuItem, newQty: number) => void;
  onRemove: (item: RestaurantCartItem) => void;
  onClearCart: () => void;

  onHold: () => void;
  onPaid: () => void;
}

const PAYMENT_METHODS: Array<{ key: PaymentMethod; label: string; icon: React.ReactNode }> = [
  { key: "UPI",           label: "UPI",           icon: <QrCodeScannerIcon sx={{ fontSize: 16 }} /> },
  { key: "Card",          label: "Card",          icon: <CreditCardIcon sx={{ fontSize: 16 }} /> },
  { key: "Cash",          label: "Cash",          icon: <MoneyIcon sx={{ fontSize: 16 }} /> },
  { key: "Cheque",        label: "Cheque",        icon: <ReceiptIcon sx={{ fontSize: 16 }} /> },
  { key: "Bank Transfer", label: "Bank Transfer", icon: <AccountBalanceIcon sx={{ fontSize: 16 }} /> },
  { key: "Others",        label: "Others",        icon: <MoreHorizIcon sx={{ fontSize: 16 }} /> },
];

// Dense keyboard-driven billing workflow: a dense item table on the left, bill
// summary and checkout on the right. Card-grid item picking still happens
// through the shared search box below, whose typeahead supports Up/Down/Enter
// to add a result without touching the mouse.
const KeyboardBillingView: React.FC<Props> = ({
  order, cartItems, totals, isBusy,
  searchQuery, onSearchChange, onSearchEnter,
  filterMode, onToggleFavourites,
  filteredCategories, getCartQty, onAddItem,
  runningOrders, onRestoreRunningOrder,
  runningOrderSummary, runningOrderTotals, onSummaryIncrement, onSummaryDecrement, onSummaryRemove, onSummarySetQty,
  isEditingSummary, onEditSummary, onCancelEditSummary, onSendEditedKDS, onSendToKDS,
  heldOrders, activeHoldId, onRestoreHold, onDeleteHold,
  enabledPaymentTypes, onOrderTypeChange, onTableClick, onCustomerClick, onDiscountClick, onPaymentMethodChange,
  onIncrement, onDecrement, onSetQty, onRemove, onClearCart,
  onHold, onPaid,
}) => {
  const isDineIn = order.orderType === "DineIn";
  // A restored running order's items live in runningOrderSummary, not
  // cartItems (mirrors the Touch screen's Order/Summary tab split). It's
  // read-only until "Edit Order" is clicked (isEditingSummary) — matching
  // Touch mode, since these items were already sent to the kitchen and a
  // silent add would desync the printed KOT from the bill. While editing,
  // onAddItem/onIncrement/etc. route into this same list (RestaurantPOS
  // gates that internally on isEditingSummary), so cartItems stays empty
  // throughout — it's never "cartItems vs. summary", always one or the other.
  const showingSummary = runningOrderSummary.length > 0 && cartItems.length === 0;
  const hasItems = cartItems.length > 0 || runningOrderSummary.length > 0;
  const effectiveTotals = showingSummary ? runningOrderTotals : totals;
  const summaryLocked = showingSummary && !isEditingSummary;

  // Typeahead dropdown under the search box: open while there's a query and
  // at least one match; picking a result adds it and clears the search so
  // focus returns to the cart table below. Also opens for a bare Favourites
  // filter (no typed query) — filteredCategories already narrows to
  // favourites in that case, so there's nothing else gating it.
  const hasQuery = searchQuery.trim().length > 0;
  const searchResults = useMemo(() => {
    if (!hasQuery && filterMode !== "Favourites") return [];
    return filteredCategories.flatMap((c) => c.items).slice(0, 20);
  }, [hasQuery, filterMode, filteredCategories]);
  const showSearchResults = !summaryLocked && (hasQuery || filterMode === "Favourites") && searchResults.length > 0;

  // The row the QTY column shows as an editable input rather than the usual
  // +/- stepper — set right after adding an item from the search dropdown,
  // so the cashier can immediately type a different quantity and hit Enter
  // to save it, without reaching for the mouse.
  const [editingQtyKey, setEditingQtyKey] = useState<string | null>(null);
  const [qtyDraft, setQtyDraft] = useState("");
  const qtyInputRef = useRef<HTMLInputElement | null>(null);
  // Guards against double-committing one edit session: Enter commits and
  // clears editingQtyKey, which unmounts this row's TextField as part of the
  // same event — and that unmount fires its own native blur, whose handler
  // would otherwise call commitQtyEdit a second time.
  const qtyEditCommittedRef = useRef(false);

  const cartItemKey = (ci: RestaurantCartItem) => `${ci.product.menu_id}-${ci.product.variant_id ?? ""}`;

  const handlePickResult = (product: RestaurantMenuItem) => {
    onAddItem(product);
    onSearchChange("");
    // While editing a running order, onAddItem writes into runningOrderSummary
    // (not cartItems) — bumping qty in place if the item's already a row, or
    // appending a new one otherwise. Focus whichever row it landed on.
    if (isEditingSummary) {
      const existingIdx = runningOrderSummary.findIndex((it) => it.item_id === product.menu_id);
      setEditingSummaryIdx(existingIdx >= 0 ? existingIdx : runningOrderSummary.length);
    } else {
      setEditingQtyKey(`${product.menu_id}-${(product as any).variant_id ?? ""}`);
    }
  };

  // Row navigation through the billing table from the same search box: with
  // no dropdown open, Up/Down move a highlighted row and Enter opens that
  // row's QTY editor below instead of adding an item.
  const [highlightedRowIndex, setHighlightedRowIndex] = useState(-1);
  const rowRefs = useRef<Array<HTMLTableRowElement | null>>([]);
  useEffect(() => {
    if (highlightedRowIndex >= 0) rowRefs.current[highlightedRowIndex]?.scrollIntoView({ block: "nearest" });
  }, [highlightedRowIndex]);

  // The freshly-added row exists only once cartItems re-renders with it —
  // the id is set at pick time (above), but focus/select can't happen until
  // that row's TextField actually mounts.
  useEffect(() => {
    if (!editingQtyKey) return;
    const match = cartItems.find((ci) => cartItemKey(ci) === editingQtyKey);
    if (!match) return;
    setQtyDraft(String(match.quantity));
    qtyEditCommittedRef.current = false;
    // Wait two paints — one for the TextField to mount, one for its value to
    // actually land in the DOM — before focusing; a single rAF can fire while
    // the input still shows the previous render's (empty) value, which makes
    // select() a no-op and leaves the old digits in place instead of
    // highlighted for immediate overtyping.
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = qtyInputRef.current;
        if (!el) return;
        el.focus();
        el.select();
      });
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingQtyKey]);

  const commitQtyEdit = (ci: RestaurantCartItem, refocusSearch = false) => {
    if (qtyEditCommittedRef.current) return;
    qtyEditCommittedRef.current = true;
    const parsed = parseInt(qtyDraft, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      onSetQty(ci.product, parsed);
    }
    setEditingQtyKey(null);
    // Enter — not blur — hands focus back to the search box, so the cashier
    // can keep adding items without reaching for the mouse. A plain blur
    // (clicking elsewhere) leaves focus wherever the cashier put it.
    if (refocusSearch) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  };

  // Same editable-QTY affordance as the fresh cart above, but for a restored
  // running order's items (index-addressed, no product object to key off).
  const [editingSummaryIdx, setEditingSummaryIdx] = useState<number | null>(null);
  useEffect(() => {
    if (editingSummaryIdx === null) return;
    const match = runningOrderSummary[editingSummaryIdx];
    if (!match) return;
    setQtyDraft(String(match.qty));
    qtyEditCommittedRef.current = false;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = qtyInputRef.current;
        if (!el) return;
        el.focus();
        el.select();
      });
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingSummaryIdx]);

  const commitSummaryQtyEdit = (idx: number, refocusSearch = false) => {
    if (qtyEditCommittedRef.current) return;
    qtyEditCommittedRef.current = true;
    const parsed = parseInt(qtyDraft, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      onSummarySetQty(idx, parsed);
    }
    setEditingSummaryIdx(null);
    if (refocusSearch) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  };

  // Arrow-key navigation through the typeahead dropdown — Up/Down move a
  // highlighted row (wrapping at each end), Enter adds whichever row is
  // highlighted, falling back to the code/name/barcode lookup below when
  // nothing is highlighted yet.
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const resultRefs = useRef<Array<HTMLDivElement | null>>([]);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    // A fresh result set invalidates both the selection and the refs that
    // pointed into the previous list — reset together so a stale index can
    // never scrollIntoView an element from the wrong list. A single match
    // is pre-highlighted so Enter adds it immediately, no arrow key needed.
    setHighlightedIndex(searchResults.length === 1 ? 0 : -1);
    resultRefs.current = [];
  }, [searchResults]);
  useEffect(() => {
    if (highlightedIndex >= 0) {
      resultRefs.current[highlightedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  // Land the cashier straight in the search box the moment this screen
  // mounts, so scanning/typing an item code works without a click first.
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Guest count is cosmetic only — no guests field exists on the order API,
  // so this never leaves the browser; it's a dine-in cashier convenience.
  const [guests, setGuests] = useState(1);
  useEffect(() => {
    if (!isDineIn) setGuests(1);
  }, [isDineIn]);

  const payments = enabledPaymentTypes.length > 0
    ? PAYMENT_METHODS.filter((p) => enabledPaymentTypes.includes(p.key))
    : PAYMENT_METHODS.filter((p) => p.key === "Cash" || p.key === "Card");

  const canPaid = isDineIn ? hasItems && !!order.tableNumber : hasItems;

  // Function-key shortcuts for the cashier's most-used actions, mirrored by
  // the badges rendered on each button below. Ignored while typing in a text
  // field (except the order-type/search ones, which are harmless mid-type)
  // so F1-style browser shortcuts don't fire while e.g. editing a QTY cell.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!["F1", "F2", "F3", "F4", "F5", "F9"].includes(e.key)) return;
      e.preventDefault();
      switch (e.key) {
        case "F1":
          onOrderTypeChange("DineIn");
          break;
        case "F2":
          onOrderTypeChange("PickUp");
          break;
        case "F3":
          onOrderTypeChange("Delivery");
          break;
        case "F4":
          if (!summaryLocked) searchInputRef.current?.focus();
          break;
        case "F5":
          if (isDineIn) onTableClick();
          break;
        case "F9":
          if (isBusy || isEditingSummary) break;
          if (isDineIn && cartItems.length > 0) {
            onSendToKDS();
          } else if (canPaid) {
            onPaid();
          }
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOrderTypeChange, summaryLocked, isBusy, isEditingSummary, isDineIn, cartItems.length, canPaid, onSendToKDS, onPaid, onTableClick]);

  // Every action on this screen (payment type, table, guests, row selection,
  // toolbar icons…) is meant to be a quick aside from the search box — the
  // cashier should be able to keep scanning/typing right after. None of
  // those controls need their own focus, so pre-empt the blur at mousedown
  // (preventDefault there stops the browser from ever moving focus off the
  // input, while still letting the click through to the button/row's own
  // onClick) rather than blurring then refocusing on click — the latter
  // flashes the input's focus ring off and back on for every click.
  const rootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea")) return;
      if (document.activeElement === searchInputRef.current) e.preventDefault();
    };
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea")) return;
      if (document.activeElement !== searchInputRef.current) searchInputRef.current?.focus();
    };
    root.addEventListener("mousedown", handleMouseDown);
    root.addEventListener("click", handleClick);
    return () => {
      root.removeEventListener("mousedown", handleMouseDown);
      root.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <Box ref={rootRef} sx={{ flex: 1, display: "flex", position: "relative", overflow: "hidden", minHeight: 0 }}>
      {/* ── Search + item table ── */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0, minWidth: 0, bgcolor: "#fff", position: "relative", zIndex: 0 }}>
        {/* Restored running order — locked until "Edit Order" is pressed, since
            these items already went to the kitchen. Matches Touch mode's Edit/
            Cancel affordance, just always visible here instead of a toolbar icon. */}
        {showingSummary && (
          <Box
            sx={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              px: 2,
              py: 1,
              bgcolor: isEditingSummary ? "#fef2f2" : "#eff6ff",
              borderBottom: "1px solid",
              borderColor: isEditingSummary ? "#fecaca" : "#bfdbfe",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
              <TableBarIcon sx={{ fontSize: 16, color: isEditingSummary ? RED : "#2563eb", flexShrink: 0 }} />
              <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: isEditingSummary ? "#991b1b" : "#1e40af" }}>
                {isEditingSummary
                  ? "Editing running order — add or remove items, then send the update to the kitchen"
                  : `Table ${order.tableNumber ?? ""} — order already sent to the kitchen`}
              </Typography>
            </Box>
            {isEditingSummary ? (
              <Box sx={{ display: "flex", gap: 0.75, flexShrink: 0 }}>
                <Button
                  size="small"
                  onClick={onCancelEditSummary}
                  sx={{ textTransform: "none", fontSize: 12, fontWeight: 700, color: "#6b7280", minWidth: 0, px: 1.25 }}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  disabled={isBusy || runningOrderSummary.length === 0}
                  onClick={onSendEditedKDS}
                  startIcon={<KitchenIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    textTransform: "none",
                    fontSize: 12,
                    fontWeight: 700,
                    borderRadius: "6px",
                    bgcolor: RED,
                    boxShadow: "none",
                    "&:hover": { bgcolor: "#b71c1c", boxShadow: "none" },
                  }}
                >
                  Send Update to KDS
                </Button>
              </Box>
            ) : (
              <Button
                size="small"
                onClick={onEditSummary}
                startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                sx={{
                  textTransform: "none",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#2563eb",
                  minWidth: 0,
                  px: 1.25,
                  flexShrink: 0,
                }}
              >
                Edit Order
              </Button>
            )}
          </Box>
        )}

        {/* Toolbar */}
        <Box sx={{ flexShrink: 0, position: "relative", display: "flex", alignItems: "center", gap: 1, px: 2, pt: 1.5, pb: 1.25 }}>
          <Box sx={{ position: "relative", flex: 1, minWidth: 0 }}>
            <TextField
              size="small"
              fullWidth
              autoComplete="off"
              disabled={summaryLocked}
              placeholder={summaryLocked ? "Click \"Edit Order\" to add items…" : "Search by item code, name or category…"}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              inputRef={searchInputRef}
              onKeyDown={(e) => {
                if (showSearchResults && e.key === "ArrowDown") {
                  e.preventDefault();
                  setHighlightedIndex((i) => (i + 1) % searchResults.length);
                  return;
                }
                if (showSearchResults && e.key === "ArrowUp") {
                  e.preventDefault();
                  setHighlightedIndex((i) => (i <= 0 ? searchResults.length - 1 : i - 1));
                  return;
                }
                // No dropdown open — Up/Down browse the billing table itself,
                // whichever list is currently visible (fresh cart, or a
                // restored running order being edited).
                const activeRowCount = showingSummary ? runningOrderSummary.length : cartItems.length;
                if (!showSearchResults && !summaryLocked && activeRowCount > 0 && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
                  e.preventDefault();
                  const last = activeRowCount - 1;
                  setHighlightedRowIndex((i) =>
                    e.key === "ArrowDown" ? (i >= last ? 0 : i + 1) : (i <= 0 ? last : i - 1)
                  );
                  return;
                }
                // Rows render newest-first, so the visual highlightedRowIndex
                // maps to the real array index in reverse.
                const realHighlightedIndex = activeRowCount - 1 - highlightedRowIndex;
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (showSearchResults && highlightedIndex >= 0 && highlightedIndex < searchResults.length) {
                    handlePickResult(searchResults[highlightedIndex]);
                  } else if (!summaryLocked && highlightedRowIndex >= 0 && highlightedRowIndex < activeRowCount) {
                    if (showingSummary) {
                      setEditingSummaryIdx(realHighlightedIndex);
                    } else {
                      setEditingQtyKey(cartItemKey(cartItems[realHighlightedIndex]));
                    }
                  } else {
                    onSearchEnter();
                  }
                  return;
                }
                // Delete removes the highlighted row, same as clicking its trash icon.
                if (
                  !showSearchResults &&
                  !summaryLocked &&
                  e.key === "Delete" &&
                  highlightedRowIndex >= 0 &&
                  highlightedRowIndex < activeRowCount
                ) {
                  e.preventDefault();
                  if (showingSummary) {
                    onSummaryRemove(realHighlightedIndex);
                  } else {
                    onRemove(cartItems[realHighlightedIndex]);
                  }
                  setHighlightedRowIndex((i) => Math.min(i, activeRowCount - 2));
                  return;
                }
                if (e.key === "Escape") onSearchChange("");
              }}
              inputProps={{
                role: "combobox",
                "aria-expanded": showSearchResults,
                "aria-controls": "keyboard-billing-search-listbox",
                "aria-activedescendant":
                  showSearchResults && highlightedIndex >= 0
                    ? `keyboard-billing-search-option-${highlightedIndex}`
                    : undefined,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  bgcolor: "#fafbfc",
                  height: 40,
                  fontSize: "0.85rem",
                  "& fieldset": { borderColor: "#e5e7eb" },
                  "&:hover fieldset": { borderColor: RED },
                  "&.Mui-focused fieldset": { borderColor: RED },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#9ca3af", fontSize: 18 }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => onSearchChange("")} sx={{ p: 0.3 }}>
                      <CloseIcon sx={{ fontSize: 15, color: "#9ca3af" }} />
                    </IconButton>
                  </InputAdornment>
                ) : (
                  <InputAdornment position="end">
                    <QrCodeScannerIcon sx={{ fontSize: 17, color: "#d1d5db" }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Typeahead results — Up/Down to move the highlight, Enter to add
                it, or click any row directly. */}
            {showSearchResults && (
              <Box
                id="keyboard-billing-search-listbox"
                role="listbox"
                sx={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  right: 0,
                  zIndex: 20,
                  bgcolor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  maxHeight: 320,
                  overflowY: "auto",
                }}
              >
                {searchResults.map((item, idx) => {
                  const qty = getCartQty(item.menu_id);
                  const isHighlighted = idx === highlightedIndex;
                  return (
                    <Box
                      key={item.menu_id}
                      id={`keyboard-billing-search-option-${idx}`}
                      role="option"
                      aria-selected={isHighlighted}
                      ref={(el: HTMLDivElement | null) => { resultRefs.current[idx] = el; }}
                      onClick={() => handlePickResult(item)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.25,
                        px: 1.5,
                        py: 1,
                        cursor: "pointer",
                        borderBottom: "1px solid #f3f4f6",
                        "&:last-of-type": { borderBottom: "none" },
                        bgcolor: isHighlighted ? "#fef2f2" : "transparent",
                        "&:hover": { bgcolor: "#fef2f2" },
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "6px",
                          bgcolor: "#fee2e2",
                          color: RED,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.65rem",
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {item.menu_name.slice(0, 2).toUpperCase()}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }} noWrap>
                          {item.menu_name}
                        </Typography>
                        <Typography sx={{ fontSize: 11.5, color: "#9ca3af" }}>
                          {item.menu_code || item.menu_id} · ₹{getItemPrice(item).toFixed(2)}
                          {qty > 0 ? ` · ${qty} in bill` : ""}
                        </Typography>
                      </Box>
                      <AddIcon sx={{ fontSize: 18, color: RED, flexShrink: 0 }} />
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>

          <Button
            variant="contained"
            disabled={summaryLocked}
            onClick={() => searchInputRef.current?.focus()}
            startIcon={<AddShoppingCartIcon sx={{ fontSize: 18 }} />}
            sx={{
              flexShrink: 0,
              height: 40,
              px: 2,
              borderRadius: "8px",
              bgcolor: RED,
              fontSize: "0.78rem",
              fontWeight: 800,
              letterSpacing: "0.02em",
              boxShadow: "none",
              "&:hover": { bgcolor: "#b71c1c", boxShadow: "none" },
            }}
          >
            Add Item
            <Box component="span" sx={{ ml: 0.6, fontSize: "0.68em", fontWeight: 800, opacity: 0.85 }}>
              [F4]
            </Box>
          </Button>

          <Tooltip title="Favourites">
            <span>
              <IconButton
                onClick={onToggleFavourites}
                disabled={summaryLocked}
                sx={{
                  flexShrink: 0,
                  width: 40,
                  height: 40,
                  borderRadius: "8px",
                  border: "1.5px solid",
                  borderColor: filterMode === "Favourites" ? "#f59e0b" : "#e5e7eb",
                  bgcolor: filterMode === "Favourites" ? "#fffbeb" : "#fff",
                  color: filterMode === "Favourites" ? "#d97706" : "#9ca3af",
                }}
              >
                <StarIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Clear order">
            <span>
              <IconButton
                onClick={onClearCart}
                disabled={!hasItems || summaryLocked}
                sx={{
                  flexShrink: 0,
                  width: 40,
                  height: 40,
                  borderRadius: "8px",
                  border: "1.5px solid #e5e7eb",
                  color: "#9ca3af",
                  "&:hover": { borderColor: RED, color: RED },
                }}
              >
                <DeleteSweepOutlinedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {/* Item table */}
        <TableContainer sx={{ flex: 1, minHeight: 0, px: 2 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {[
                  { label: "#" },
                  { label: "Item Code" },
                  { label: "Item Name" },
                  { label: "Price (₹)" },
                  { label: "Qty", shortcut: "↑↓ / Enter" },
                  { label: "Total Amount (₹)" },
                  { label: "Action", shortcut: "Del" },
                ].map((h, i) => (
                  <TableCell
                    key={h.label}
                    align={i === 0 ? "left" : i >= 3 ? "right" : "left"}
                    // MUI's stickyHeader gives cells their own `position: sticky` with a
                    // built-in z-index that otherwise renders above the category rail's
                    // floating panel regardless of the rail's own z-index — pin it below.
                    sx={{ fontSize: 11.5, fontWeight: 800, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.4, bgcolor: "#fafbfc", borderBottom: "1.5px solid #e5e7eb", zIndex: 1, whiteSpace: "nowrap" }}
                  >
                    {h.label}
                    {h.shortcut && (
                      <Box component="span" sx={{ ml: 0.5, fontSize: "0.85em", fontWeight: 800, color: "#c4c9d1", textTransform: "none", letterSpacing: 0 }}>
                        [{h.shortcut}]
                      </Box>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {!hasItems ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8, border: "none" }}>
                    <ReceiptLongOutlinedIcon sx={{ fontSize: 40, color: "#e5e7eb", mb: 1 }} />
                    <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
                      No items yet — search or scan to add
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : showingSummary ? (
                // Restored running order — same rows/edit affordances as a fresh
                // cart, but backed by runningOrderSummary + the summary handlers.
                // Rendered newest-first: displayIdx is the visual row position
                // (drives row number, refs, highlight); idx maps back to the
                // actual runningOrderSummary index every handler/state key expects.
                [...runningOrderSummary].reverse().map((item, displayIdx) => {
                  const idx = runningOrderSummary.length - 1 - displayIdx;
                  const rowTotal = item.price * item.qty;
                  const isHighlightedRow = displayIdx === highlightedRowIndex;
                  return (
                    <TableRow
                      key={`${item.item_id}-${idx}`}
                      ref={(el: HTMLTableRowElement | null) => { rowRefs.current[displayIdx] = el; }}
                      hover
                      selected={isHighlightedRow}
                      onClick={() => { setHighlightedRowIndex(displayIdx); searchInputRef.current?.focus(); }}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell sx={{ fontSize: 13, color: "#6b7280" }}>{displayIdx + 1}</TableCell>
                      <TableCell sx={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>{item.item_id}</TableCell>
                      <TableCell sx={{ fontSize: 13, color: "#1f2937" }}>{item.item_name}</TableCell>
                      <TableCell align="right" sx={{ fontSize: 13, color: "#4b5563" }}>{item.price.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        {editingSummaryIdx === idx ? (
                          <TextField
                            size="small"
                            type="number"
                            value={qtyDraft}
                            inputRef={qtyInputRef}
                            onChange={(e) => setQtyDraft(e.target.value)}
                            onBlur={() => { if (editingSummaryIdx === idx) commitSummaryQtyEdit(idx); }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") { e.preventDefault(); commitSummaryQtyEdit(idx, true); }
                              if (e.key === "Escape") { e.preventDefault(); setEditingSummaryIdx(null); }
                            }}
                            inputProps={{ min: 1, style: { textAlign: "right", padding: "4px 8px" } }}
                            sx={{ width: 64, "& .MuiOutlinedInput-root": { fontSize: 13, fontWeight: 700 } }}
                          />
                        ) : (
                          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, justifyContent: "flex-end" }}>
                            <IconButton
                              size="small"
                              disabled={summaryLocked}
                              onClick={() => onSummaryDecrement(idx)}
                              sx={{ width: 24, height: 24, bgcolor: "#f3f4f6", "&:hover": { bgcolor: "#fee2e2" } }}
                            >
                              <RemoveIcon sx={{ fontSize: 13 }} />
                            </IconButton>
                            <Typography
                              onClick={() => { if (!summaryLocked) setEditingSummaryIdx(idx); }}
                              sx={{ fontSize: 13, fontWeight: 700, width: 24, textAlign: "center", cursor: summaryLocked ? "default" : "pointer" }}
                            >
                              {item.qty}
                            </Typography>
                            <IconButton
                              size="small"
                              disabled={summaryLocked}
                              onClick={() => onSummaryIncrement(idx)}
                              sx={{ width: 24, height: 24, bgcolor: "#f3f4f6", "&:hover": { bgcolor: "#dcfce7" } }}
                            >
                              <AddIcon sx={{ fontSize: 13 }} />
                            </IconButton>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>
                        {rowTotal.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" disabled={summaryLocked} onClick={() => onSummaryRemove(idx)} sx={{ color: "#ef4444" }}>
                          <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                // Rendered newest-first — cartItems handlers below all take the
                // item object directly, so no index translation is needed.
                [...cartItems].reverse().map((ci, displayIdx) => {
                  const price = getItemPrice(ci.product);
                  const rowTotal = price * ci.quantity;
                  const isEditingQty = editingQtyKey === cartItemKey(ci);
                  const isHighlightedRow = displayIdx === highlightedRowIndex;
                  return (
                    <TableRow
                      key={`${ci.product.menu_id}-${ci.product.variant_id ?? ""}-${displayIdx}`}
                      ref={(el: HTMLTableRowElement | null) => { rowRefs.current[displayIdx] = el; }}
                      hover
                      selected={isHighlightedRow}
                      onClick={() => { setHighlightedRowIndex(displayIdx); searchInputRef.current?.focus(); }}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell sx={{ fontSize: 13, color: "#6b7280" }}>{displayIdx + 1}</TableCell>
                      <TableCell sx={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>{ci.product.menu_code || ci.product.menu_id}</TableCell>
                      <TableCell sx={{ fontSize: 13, color: "#1f2937" }}>
                        {ci.product.menu_name}
                        {ci.product.variant_name && (
                          <Typography component="span" sx={{ fontSize: 11.5, color: "#9ca3af", ml: 0.75 }}>
                            ({ci.product.variant_name})
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: 13, color: "#4b5563" }}>{price.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        {isEditingQty ? (
                          <TextField
                            size="small"
                            type="number"
                            value={qtyDraft}
                            inputRef={qtyInputRef}
                            onChange={(e) => setQtyDraft(e.target.value)}
                            onBlur={() => { if (isEditingQty) commitQtyEdit(ci); }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") { e.preventDefault(); commitQtyEdit(ci, true); }
                              if (e.key === "Escape") { e.preventDefault(); setEditingQtyKey(null); }
                            }}
                            inputProps={{ min: 1, style: { textAlign: "right", padding: "4px 8px" } }}
                            sx={{ width: 64, "& .MuiOutlinedInput-root": { fontSize: 13, fontWeight: 700 } }}
                          />
                        ) : (
                          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, justifyContent: "flex-end" }}>
                            <IconButton
                              size="small"
                              onClick={() => onDecrement(ci)}
                              sx={{ width: 24, height: 24, bgcolor: "#f3f4f6", "&:hover": { bgcolor: "#fee2e2" } }}
                            >
                              <RemoveIcon sx={{ fontSize: 13 }} />
                            </IconButton>
                            <Typography
                              onClick={() => setEditingQtyKey(cartItemKey(ci))}
                              sx={{ fontSize: 13, fontWeight: 700, width: 24, textAlign: "center", cursor: "pointer" }}
                            >
                              {ci.quantity}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => onIncrement(ci)}
                              sx={{ width: 24, height: 24, bgcolor: "#f3f4f6", "&:hover": { bgcolor: "#dcfce7" } }}
                            >
                              <AddIcon sx={{ fontSize: 13 }} />
                            </IconButton>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>
                        {rowTotal.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => onRemove(ci)} sx={{ color: "#ef4444" }}>
                          <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Running orders strip — active Dine In tables not yet paid; click restores
            that table's order into the cart, same as the Touch screen's chip row. */}
        {runningOrders.length > 0 && (
          <Box
            sx={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 1,
              borderTop: "1px solid #fecaca",
              overflowX: "auto",
              scrollbarWidth: "thin",
              "&::-webkit-scrollbar": { height: 6 },
              "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
              "&::-webkit-scrollbar-thumb": { bgcolor: "#fca5a5", borderRadius: 3 },
            }}
          >
            <TableBarIcon sx={{ fontSize: 18, color: RED, flexShrink: 0 }} />
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#991b1b", whiteSpace: "nowrap", flexShrink: 0 }}>
              Running:
            </Typography>
            {runningOrders.map((ro) => {
              const tableNum = parseInt(ro.table_no, 10);
              const itemCount = ro.ordered_items.reduce((s, i) => s + i.qty, 0);
              const isActive = order.tableNumber === tableNum && order.orderId === ro.api_order_id;
              return (
                <Chip
                  key={ro.api_order_id}
                  label={`T${ro.table_no} · ${itemCount} item${itemCount !== 1 ? "s" : ""}`}
                  size="small"
                  icon={<TableBarIcon sx={{ fontSize: "16px !important" }} />}
                  onClick={() => onRestoreRunningOrder(ro)}
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

        {/* Held orders strip — same chip content, sizing and delete affordance
            as the Touch screen's floating hold bar. */}
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
              const itemCount = ho.items?.length ?? 0;
              return (
                <Chip
                  key={ho.hold_id ?? idx}
                  label={`${ho.hold_id} · ${itemCount} item${itemCount !== 1 ? "s" : ""}`}
                  size="small"
                  icon={<RestoreIcon sx={{ fontSize: "16px !important" }} />}
                  onClick={() => onRestoreHold(ho)}
                  onDelete={(e) => onDeleteHold(ho.hold_id, e)}
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

      <Divider orientation="vertical" flexItem sx={{ borderColor: "#e5e7eb" }} />

      {/* ── Right: bill summary + checkout ── */}
      <Box sx={{ width: 380, minWidth: 380, display: "flex", flexDirection: "column", bgcolor: "#fff", overflow: "hidden" }}>
        <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.5 }}>
            <ReceiptLongOutlinedIcon sx={{ fontSize: 18, color: RED }} />
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#1f2937" }}>Bill Summary</Typography>
          </Box>

          {/* Order type */}
          <Box sx={{ display: "flex", gap: 0.75, mb: 1.5 }}>
            {ORDER_TYPES.map((t) => (
              <OrderTypePill
                key={t.key}
                label={t.label}
                icon={t.icon}
                active={order.orderType === t.key}
                onClick={() => onOrderTypeChange(t.key)}
                shortcut={t.shortcut}
              />
            ))}
          </Box>

          {/* Table + guests (Dine In only) */}
          {isDineIn ? (
            <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", mb: 0.5, textTransform: "uppercase" }}>
                  Table No.
                  <Box component="span" sx={{ ml: 0.5, fontWeight: 800, textTransform: "none" }}>
                    [F5]
                  </Box>
                </Typography>
                <Box
                  onClick={onTableClick}
                  sx={{
                    height: 38,
                    display: "flex",
                    alignItems: "center",
                    px: 1.5,
                    borderRadius: "8px",
                    border: "1.5px solid",
                    borderColor: order.tableNumber ? RED : "#e5e7eb",
                    bgcolor: order.tableNumber ? "#fff5f5" : "#fafbfc",
                    color: order.tableNumber ? RED : "#9ca3af",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {order.tableNumber ? `T${order.tableNumber}` : "Select table"}
                </Box>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", mb: 0.5, textTransform: "uppercase" }}>
                  Guests
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, height: 38, border: "1.5px solid #e5e7eb", borderRadius: "8px", px: 0.5 }}>
                  <IconButton size="small" onClick={() => setGuests((g) => Math.max(1, g - 1))} sx={{ width: 24, height: 24 }}>
                    <RemoveIcon sx={{ fontSize: 13 }} />
                  </IconButton>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, width: 20, textAlign: "center" }}>{guests}</Typography>
                  <IconButton size="small" onClick={() => setGuests((g) => g + 1)} sx={{ width: 24, height: 24 }}>
                    <AddIcon sx={{ fontSize: 13 }} />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box
              onClick={onCustomerClick}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                height: 38,
                px: 1.5,
                mb: 2,
                borderRadius: "8px",
                border: "1.5px dashed #d1d5db",
                color: order.customerName ? "#1f2937" : "#9ca3af",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                "&:hover": { borderColor: RED, color: RED },
              }}
            >
              <PersonAddAlt1OutlinedIcon sx={{ fontSize: 16 }} />
              {order.customerName || "Add customer"}
            </Box>
          )}

          <Divider sx={{ borderColor: "#f3f4f6", mb: 1.5 }} />

          {/* Totals */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography sx={{ fontSize: 13, color: "#6b7280" }}>Total Items</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>
              {showingSummary ? runningOrderSummary.length : cartItems.length}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography sx={{ fontSize: 13, color: "#6b7280" }}>Sub Total</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>₹{effectiveTotals.subtotal.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography sx={{ fontSize: 13, color: "#6b7280" }}>Tax</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>₹{effectiveTotals.taxAmount.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
            <Box
              onClick={onDiscountClick}
              sx={{ display: "flex", alignItems: "center", gap: 0.4, cursor: "pointer", color: RED }}
            >
              <LocalOfferOutlinedIcon sx={{ fontSize: 14 }} />
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                {effectiveTotals.discount > 0 ? "Edit Discount" : "Add Discount"}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: effectiveTotals.discount > 0 ? "#16a34a" : "#1f2937" }}>
              {effectiveTotals.discount > 0 ? `−₹${effectiveTotals.discount.toFixed(2)}` : "₹0.00"}
            </Typography>
          </Box>

          <Divider sx={{ borderColor: "#f3f4f6", mb: 1.5 }} />

          {/* Payment type */}
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", mb: 0.75, textTransform: "uppercase" }}>
            Payment Type
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 0.75,
              mb: 2,
            }}
          >
            {payments.map((pm) => {
              const active = order.paymentMethod === pm.key;
              return (
                <Box
                  key={pm.key}
                  onClick={() => onPaymentMethodChange(pm.key)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.5,
                    px: 1.25,
                    py: 0.7,
                    borderRadius: "8px",
                    border: "1.5px solid",
                    borderColor: active ? RED : "#e5e7eb",
                    bgcolor: active ? "#fff5f5" : "#fff",
                    color: active ? RED : "#6b7280",
                    fontSize: 12.5,
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  {pm.icon}
                  {pm.label}
                </Box>
              );
            })}
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: 1.5,
              py: 1,
              mb: 1.5,
              borderRadius: "8px",
              bgcolor: "#dcfce7",
            }}
          >
            <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#15803d" }}>Grand Total</Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#15803d" }}>₹{effectiveTotals.grandTotal.toFixed(2)}</Typography>
          </Box>
        </Box>

        {/* Action bar */}
        <Box sx={{ flexShrink: 0, display: "flex", gap: 1, p: 1.5, borderTop: "1px solid #f3f4f6" }}>
          <Tooltip title="Hold order">
            <span>
              <IconButton
                onClick={onHold}
                disabled={!hasItems || isBusy || isEditingSummary}
                sx={{ width: 42, height: 42, borderRadius: "8px", border: "1.5px solid #e5e7eb", color: "#6b7280" }}
              >
                <PauseCircleOutlineIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </span>
          </Tooltip>
          {/* Fresh Dine In items → Send KDS first (kitchen ticket); editing a
              restored order → handled by the banner above; everything else
              (Pick Up/Delivery, or a Dine In order already sent and now being
              paid) → Pay. Mirrors Touch mode's Order-tab vs. Pay button split. */}
          {isDineIn && cartItems.length > 0 && !isEditingSummary ? (
            <Button
              fullWidth
              variant="contained"
              disabled={isBusy}
              onClick={onSendToKDS}
              startIcon={<KitchenIcon sx={{ fontSize: 16 }} />}
              sx={{
                height: 42,
                borderRadius: "8px",
                bgcolor: RED,
                fontWeight: 800,
                fontSize: 13.5,
                textTransform: "none",
                boxShadow: "none",
                "&:hover": { bgcolor: "#b71c1c", boxShadow: "none" },
                "&.Mui-disabled": { bgcolor: "#f3a8a8", color: "#fff" },
              }}
            >
              {isBusy ? "Processing…" : "Send KDS"}
              {!isBusy && (
                <Box component="span" sx={{ ml: 0.8, fontSize: "0.68em", fontWeight: 800, opacity: 0.85 }}>
                  [F9]
                </Box>
              )}
            </Button>
          ) : (
            <Button
              fullWidth
              variant="contained"
              // While editing a running order, "Send Update to KDS" above is the
              // action — billing resumes once that's sent and edit mode exits.
              disabled={!canPaid || isBusy || isEditingSummary}
              onClick={onPaid}
              sx={{
                height: 42,
                borderRadius: "8px",
                bgcolor: RED,
                fontWeight: 800,
                fontSize: 13.5,
                textTransform: "none",
                boxShadow: "none",
                "&:hover": { bgcolor: "#b71c1c", boxShadow: "none" },
                "&.Mui-disabled": { bgcolor: "#f3a8a8", color: "#fff" },
              }}
            >
              {isBusy
                ? "Processing…"
                : isEditingSummary
                ? "Send the update above first"
                : hasItems
                ? `Pay ₹${effectiveTotals.grandTotal.toFixed(2)}`
                : "Pay"}
              {!isBusy && !isEditingSummary && (
                <Box component="span" sx={{ ml: 0.8, fontSize: "0.68em", fontWeight: 800, opacity: 0.85 }}>
                  [F9]
                </Box>
              )}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default KeyboardBillingView;
