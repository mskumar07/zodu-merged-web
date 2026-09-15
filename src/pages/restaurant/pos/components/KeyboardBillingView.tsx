import React, { useEffect, useMemo, useState } from "react";
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
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import RestoreIcon from "@mui/icons-material/Restore";
import TableBarIcon from "@mui/icons-material/TableBar";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import MoneyIcon from "@mui/icons-material/Money";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
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
import type { Totals, PaymentMethod } from "./OrderPanel";

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
  onRemove: (item: RestaurantCartItem) => void;
  onClearCart: () => void;

  onHold: () => void;
  onPaid: () => void;
}

const ORDER_TYPES: Array<{
  key: "DineIn" | "Delivery" | "PickUp";
  label: string;
  icon: React.ReactNode;
}> = [
  { key: "DineIn",   label: "Dine In",  icon: <RestaurantMenuIcon sx={{ fontSize: 16 }} /> },
  { key: "PickUp",   label: "Pick Up",  icon: <ShoppingBagOutlinedIcon sx={{ fontSize: 16 }} /> },
  { key: "Delivery", label: "Delivery", icon: <DeliveryDiningIcon sx={{ fontSize: 16 }} /> },
];

const PAYMENT_METHODS: Array<{ key: PaymentMethod; label: string; icon: React.ReactNode }> = [
  { key: "UPI",           label: "UPI",           icon: <QrCodeScannerIcon sx={{ fontSize: 16 }} /> },
  { key: "Card",          label: "Card",          icon: <CreditCardIcon sx={{ fontSize: 16 }} /> },
  { key: "Cash",          label: "Cash",          icon: <MoneyIcon sx={{ fontSize: 16 }} /> },
  { key: "UPI + Cash",    label: "UPI + Cash",    icon: <AccountBalanceWalletIcon sx={{ fontSize: 16 }} /> },
  { key: "Cheque",        label: "Cheque",        icon: <ReceiptIcon sx={{ fontSize: 16 }} /> },
  { key: "Bank Transfer", label: "Bank Transfer", icon: <AccountBalanceIcon sx={{ fontSize: 16 }} /> },
  { key: "Others",        label: "Others",        icon: <MoreHorizIcon sx={{ fontSize: 16 }} /> },
];

function OrderTypePill({
  label, icon, active, onClick,
}: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.6,
        py: 1,
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "0.8rem",
        fontWeight: 700,
        color: active ? "#fff" : "#4b5563",
        bgcolor: active ? RED : "#fff",
        border: "1.5px solid",
        borderColor: active ? RED : "#e5e7eb",
        transition: "all 0.15s",
        "&:hover": { borderColor: RED, color: active ? "#fff" : RED },
      }}
    >
      {icon}
      {label}
    </Box>
  );
}

// Tabular "Keyboard" billing screen — an alternate view of the same order/cart
// state RestaurantPOS owns (no separate data model), laid out for a
// keyboard+mouse cashier workflow: a dense item table on the left, bill
// summary and checkout on the right. Card-grid item picking still happens
// through the shared search box below; a full keyboard-navigation engine
// (arrow-key row focus, inline edit-on-Enter) is intentionally out of scope —
// this mirrors the layout, not pos.tsx's input-handling machinery.
const KeyboardBillingView: React.FC<Props> = ({
  order, cartItems, totals, isBusy,
  searchQuery, onSearchChange, onSearchEnter,
  filterMode, onToggleFavourites,
  filteredCategories, getCartQty, onAddItem,
  runningOrders, onRestoreRunningOrder,
  runningOrderSummary, runningOrderTotals, onSummaryIncrement, onSummaryDecrement, onSummaryRemove,
  isEditingSummary, onEditSummary, onCancelEditSummary, onSendEditedKDS, onSendToKDS,
  heldOrders, activeHoldId, onRestoreHold, onDeleteHold,
  enabledPaymentTypes, onOrderTypeChange, onTableClick, onCustomerClick, onDiscountClick, onPaymentMethodChange,
  onIncrement, onDecrement, onRemove, onClearCart,
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

  const handlePickResult = (product: RestaurantMenuItem) => {
    onAddItem(product);
    onSearchChange("");
  };

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

  return (
    <Box sx={{ flex: 1, display: "flex", position: "relative", overflow: "hidden", minHeight: 0 }}>
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
          <Box sx={{ position: "relative", flex: 1 }}>
            <TextField
              size="small"
              fullWidth
              autoComplete="off"
              disabled={summaryLocked}
              placeholder={summaryLocked ? "Click \"Edit Order\" to add items…" : "Search by item code, name or type to add…"}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); onSearchEnter(); }
                if (e.key === "Escape") onSearchChange("");
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

            {/* Typeahead results — click a row to add it to the bill below */}
            {showSearchResults && (
              <Box
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
                {searchResults.map((item) => {
                  const qty = getCartQty(item.menu_id);
                  return (
                    <Box
                      key={item.menu_id}
                      onClick={() => handlePickResult(item)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.25,
                        px: 1.5,
                        py: 1,
                        cursor: "pointer",
                        borderBottom: "1px solid #f3f4f6",
                        "&:last-of-type": { borderBottom: "none" },
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
                          {item.menu_id} · ₹{getItemPrice(item).toFixed(2)}
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
                {["#", "Item Code", "Item Name", "Price (₹)", "Qty", "Total Amount (₹)", "Action"].map((h, i) => (
                  <TableCell
                    key={h}
                    align={i === 0 ? "left" : i >= 3 ? "right" : "left"}
                    // MUI's stickyHeader gives cells their own `position: sticky` with a
                    // built-in z-index that otherwise renders above the category rail's
                    // floating panel regardless of the rail's own z-index — pin it below.
                    sx={{ fontSize: 11.5, fontWeight: 800, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.4, bgcolor: "#fafbfc", borderBottom: "1.5px solid #e5e7eb", zIndex: 1 }}
                  >
                    {h}
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
                runningOrderSummary.map((item, idx) => {
                  const rowTotal = item.price * item.qty;
                  return (
                    <TableRow key={`${item.item_id}-${idx}`} hover>
                      <TableCell sx={{ fontSize: 13, color: "#6b7280" }}>{idx + 1}</TableCell>
                      <TableCell sx={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>{item.item_id}</TableCell>
                      <TableCell sx={{ fontSize: 13, color: "#1f2937" }}>{item.item_name}</TableCell>
                      <TableCell align="right" sx={{ fontSize: 13, color: "#4b5563" }}>{item.price.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, justifyContent: "flex-end" }}>
                          <IconButton
                            size="small"
                            disabled={summaryLocked}
                            onClick={() => onSummaryDecrement(idx)}
                            sx={{ width: 24, height: 24, bgcolor: "#f3f4f6", "&:hover": { bgcolor: "#fee2e2" } }}
                          >
                            <RemoveIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                          <Typography sx={{ fontSize: 13, fontWeight: 700, width: 24, textAlign: "center" }}>
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
                cartItems.map((ci, idx) => {
                  const price = getItemPrice(ci.product);
                  const rowTotal = price * ci.quantity;
                  return (
                    <TableRow key={`${ci.product.menu_id}-${ci.product.variant_id ?? ""}-${idx}`} hover>
                      <TableCell sx={{ fontSize: 13, color: "#6b7280" }}>{idx + 1}</TableCell>
                      <TableCell sx={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>{ci.product.menu_id}</TableCell>
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
                        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, justifyContent: "flex-end" }}>
                          <IconButton
                            size="small"
                            onClick={() => onDecrement(ci)}
                            sx={{ width: 24, height: 24, bgcolor: "#f3f4f6", "&:hover": { bgcolor: "#fee2e2" } }}
                          >
                            <RemoveIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                          <Typography sx={{ fontSize: 13, fontWeight: 700, width: 24, textAlign: "center" }}>
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
              />
            ))}
          </Box>

          {/* Table + guests (Dine In only) */}
          {isDineIn ? (
            <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", mb: 0.5, textTransform: "uppercase" }}>
                  Table No.
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
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>Grand Total</Typography>
            <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#15803d" }}>₹{effectiveTotals.grandTotal.toFixed(2)}</Typography>
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
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default KeyboardBillingView;
