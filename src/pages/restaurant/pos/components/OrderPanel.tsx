import React, { useState, useEffect } from "react";
import {
  Box, Typography, Button, Chip, Divider, Tooltip,
} from "@mui/material";
import TableBarIcon from "@mui/icons-material/TableBar";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import MoneyIcon from "@mui/icons-material/Money";
import KitchenIcon from "@mui/icons-material/Kitchen";
import type {
  RestaurantCartItem,
  RestaurantOrder,
  RunningOrderOrderedItem,
} from "../api/restaurantPosApi";
import { calcDiscount } from "../api/restaurantPosApi";
import CartItem from "./CartItem";

export interface Totals {
  subtotal: number;
  taxAmount: number;
  discount: number;
  grandTotal: number;
}

interface Props {
  order: RestaurantOrder;
  cartItems: RestaurantCartItem[];
  totals: Totals;
  isLoading: boolean;
  orderSummary: RunningOrderOrderedItem[];
  onTableClick: () => void;
  onCustomerClick: () => void;
  onDiscountClick: () => void;
  onPaymentMethodChange: (method: "Card" | "QR" | "Cash") => void;
  onSendToKDS: () => void;
  onPaid: () => void;
  onIncrement: (item: RestaurantCartItem) => void;
  onDecrement: (item: RestaurantCartItem) => void;
  onRemove: (item: RestaurantCartItem) => void;
  onHold: () => void;
}

const PAYMENT_METHODS: Array<{
  key: "Card" | "QR" | "Cash";
  label: string;
  icon: React.ReactNode;
}> = [
  { key: "Card", label: "Card", icon: <CreditCardIcon sx={{ fontSize: 15 }} /> },
  { key: "QR",   label: "QR",   icon: <QrCode2Icon sx={{ fontSize: 15 }} /> },
  { key: "Cash", label: "Cash", icon: <MoneyIcon sx={{ fontSize: 15 }} /> },
];

const OrderPanel: React.FC<Props> = ({
  order, cartItems, totals, isLoading, orderSummary,
  onTableClick, onCustomerClick, onDiscountClick,
  onPaymentMethodChange, onSendToKDS, onPaid,
  onIncrement, onDecrement, onRemove, onHold,
}) => {
  const isDineIn = order.orderType === "DineIn";
  const totalQty = cartItems.reduce((s, i) => s + i.quantity, 0);
  // Allow Pay when: non-DineIn has cart items, OR DineIn has table + (cart items OR running summary)
  const canPaid = isDineIn
    ? (cartItems.length > 0 || orderSummary.length > 0) && !!order.tableNumber
    : cartItems.length > 0;

  const [activeTab, setActiveTab] = useState<"order" | "summary">("order");

  // Switch to Summary when a running order is restored
  useEffect(() => {
    if (orderSummary.length > 0) {
      setActiveTab("summary");
    } else {
      setActiveTab("order");
    }
  }, [orderSummary]);

  // Switch to Order tab when captain starts adding new items
  useEffect(() => {
    if (cartItems.length > 0) setActiveTab("order");
  }, [cartItems.length]);

  const summarySubtotal = orderSummary.reduce((s, i) => {
    const gst  = parseFloat(String(i.gst_tax ?? 0)) || 0;
    const base = i.tax_include_or_exclude ? i.price / (1 + gst / 100) : i.price;
    return s + base * i.qty;
  }, 0);
  const summaryTax = orderSummary.reduce((s, i) => {
    const gst = parseFloat(String(i.gst_tax ?? 0)) || 0;
    if (i.tax_include_or_exclude) {
      const base = i.price / (1 + gst / 100);
      return s + (i.price - base) * i.qty;
    }
    return s + (i.price * gst / 100) * i.qty;
  }, 0);
  const summaryDiscount    = calcDiscount(summarySubtotal, order.discountType, order.discountValue);
  const summaryGrandTotal  = summarySubtotal + summaryTax - summaryDiscount;

  return (
    <Box
      sx={{
        width: 340,
        minWidth: 340,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#fff",
        borderLeft: "1px solid #e5e7eb",
      }}
    >
      {/* ── Context row: table / customer ── */}
      <Box
        sx={{
          px: 1.5,
          py: 0.8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #f3f4f6",
          flexShrink: 0,
          gap: 1,
        }}
      >
        {isDineIn ? (
          <Box
            onClick={onTableClick}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.8,
              cursor: "pointer",
              py: 0.5,
              px: 1.2,
              borderRadius: "8px",
              border: order.tableNumber
                ? "1.5px solid #d32f2f"
                : "1.5px dashed #d1d5db",
              bgcolor: order.tableNumber ? "#fff5f5" : "transparent",
              transition: "all 0.15s",
              "&:hover": { bgcolor: "#fef2f2", border: "1.5px solid #d32f2f" },
            }}
          >
            <TableBarIcon sx={{ fontSize: 15, color: order.tableNumber ? "#d32f2f" : "#9ca3af" }} />
            <Typography
              sx={{
                fontSize: "0.76rem",
                color: order.tableNumber ? "#d32f2f" : "#9ca3af",
                fontWeight: order.tableNumber ? 700 : 400,
              }}
            >
              {order.tableNumber ? `Table ${order.tableNumber}` : "Select Table"}
            </Typography>
          </Box>
        ) : (
          <Box
            onClick={onCustomerClick}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.8,
              cursor: "pointer",
              py: 0.5,
              px: 1.2,
              borderRadius: "8px",
              border: order.customerName
                ? "1.5px solid #6366f1"
                : "1.5px dashed #d1d5db",
              bgcolor: order.customerName ? "#f5f3ff" : "transparent",
              transition: "all 0.15s",
              "&:hover": { bgcolor: "#f5f3ff", border: "1.5px solid #6366f1" },
            }}
          >
            <PersonAddIcon
              sx={{ fontSize: 15, color: order.customerName ? "#6366f1" : "#9ca3af" }}
            />
            <Typography
              sx={{
                fontSize: "0.76rem",
                color: order.customerName ? "#6366f1" : "#9ca3af",
                fontWeight: order.customerName ? 700 : 400,
                maxWidth: 130,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {order.customerName || "Add Customer"}
            </Typography>
          </Box>
        )}

        {totalQty > 0 && (
          <Chip
            label={`${totalQty} item${totalQty > 1 ? "s" : ""}`}
            size="small"
            sx={{
              bgcolor: "#fee2e2",
              color: "#d32f2f",
              fontWeight: 700,
              fontSize: "0.65rem",
              height: 20,
            }}
          />
        )}
      </Box>

      {/* ── Tabs (Dine-In only) ── */}
      {isDineIn && (
        <Box
          sx={{
            display: "flex",
            borderBottom: "1px solid #f3f4f6",
            flexShrink: 0,
          }}
        >
          {(["order", "summary"] as const).map((tab) => {
            const active  = activeTab === tab;
            const badge   = tab === "order" ? cartItems.length : orderSummary.length;
            const label   = tab === "order" ? "Order" : "Summary";
            return (
              <Box
                key={tab}
                onClick={() => setActiveTab(tab)}
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.6,
                  py: 0.9,
                  cursor: "pointer",
                  borderBottom: active ? "2.5px solid #d32f2f" : "2.5px solid transparent",
                  color: active ? "#d32f2f" : "#6b7280",
                  transition: "all 0.15s",
                  "&:hover": { color: "#d32f2f" },
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.78rem",
                    fontWeight: active ? 700 : 500,
                    lineHeight: 1,
                  }}
                >
                  {label}
                </Typography>
                {badge > 0 && (
                  <Box
                    sx={{
                      minWidth: 16,
                      height: 16,
                      borderRadius: "8px",
                      bgcolor: active ? "#d32f2f" : "#e5e7eb",
                      color: active ? "#fff" : "#6b7280",
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      px: 0.4,
                    }}
                  >
                    {badge}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      )}

      {/* ── Content: Order tab (new cart items) ── */}
      {(!isDineIn || activeTab === "order") && (
        <Box sx={{ flex: 1, overflowY: "auto", px: 1.5, "&::-webkit-scrollbar": { width: 3 } }}>
          {cartItems.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 1,
                color: "#d1d5db",
                py: 4,
              }}
            >
              <Typography sx={{ fontSize: "2.8rem", lineHeight: 1 }}>🛒</Typography>
              <Typography variant="body2" color="#9ca3af" fontWeight={500}>
                No items yet
              </Typography>
              <Typography variant="caption" color="#d1d5db" textAlign="center">
                Click products on the left to add them here
              </Typography>
            </Box>
          ) : (
            cartItems.map((ci, idx) => (
              <CartItem
                key={`${ci.product.menu_id}-${(ci.product as any).variant_id ?? idx}`}
                item={ci}
                onIncrement={() => onIncrement(ci)}
                onDecrement={() => onDecrement(ci)}
                onRemove={() => onRemove(ci)}
              />
            ))
          )}
        </Box>
      )}

      {/* ── Content: Summary tab (existing ordered items) ── */}
      {isDineIn && activeTab === "summary" && (
        <Box sx={{ flex: 1, overflowY: "auto", px: 1.5, "&::-webkit-scrollbar": { width: 3 } }}>
          {orderSummary.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 1,
                py: 4,
              }}
            >
              <Typography sx={{ fontSize: "2.2rem", lineHeight: 1 }}>📋</Typography>
              <Typography variant="body2" color="#9ca3af" fontWeight={500}>
                No previous orders
              </Typography>
            </Box>
          ) : (
            <Box>
              {/* KOT reference */}
              {order.kotNo && (
                <Box
                  sx={{
                    mt: 1.2,
                    mb: 0.8,
                    px: 1,
                    py: 0.5,
                    bgcolor: "#eff6ff",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.6,
                  }}
                >
                  <KitchenIcon sx={{ fontSize: 13, color: "#2563eb" }} />
                  <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#1e3a8a" }}>
                    {order.kotNo} — Previously ordered
                  </Typography>
                </Box>
              )}

              {/* Item rows */}
              {orderSummary.map((item, idx) => (
                <Box
                  key={`${item.item_id}-${idx}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    py: 0.9,
                    borderBottom: "1px solid #f3f4f6",
                    "&:last-child": { borderBottom: "none" },
                  }}
                >
                  {/* Qty badge */}
                  <Box
                    sx={{
                      minWidth: 24,
                      height: 24,
                      borderRadius: "6px",
                      bgcolor: "#f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#374151" }}>
                      {item.qty}
                    </Typography>
                  </Box>

                  {/* Name + unit */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: "0.76rem",
                        fontWeight: 600,
                        color: "#111827",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.item_name}
                    </Typography>
                    {item.item_unit && (
                      <Typography sx={{ fontSize: "0.64rem", color: "#9ca3af" }}>
                        {item.item_unit}
                      </Typography>
                    )}
                  </Box>

                  {/* Price */}
                  <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                    <Typography sx={{ fontSize: "0.72rem", color: "#6b7280" }}>
                      ₹{item.price.toFixed(2)} × {item.qty}
                    </Typography>
                    <Typography sx={{ fontSize: "0.76rem", fontWeight: 700, color: "#111827" }}>
                      ₹{(item.price * item.qty).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              ))}

            </Box>
          )}
        </Box>
      )}

      {/* ── Totals: Summary tab ── */}
      {isDineIn && activeTab === "summary" && orderSummary.length > 0 && (
        <Box sx={{ px: 1.5, py: 1.2, borderTop: "1px solid #f3f4f6", flexShrink: 0 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.7 }}>
            <Typography sx={{ fontSize: "0.76rem", color: "#6b7280" }}>Subtotal</Typography>
            <Typography sx={{ fontSize: "0.76rem", color: "#374151", fontWeight: 500 }}>
              ₹{summarySubtotal.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.7 }}>
            <Typography sx={{ fontSize: "0.76rem", color: "#6b7280" }}>GST</Typography>
            <Typography sx={{ fontSize: "0.76rem", color: "#374151" }}>
              ₹{summaryTax.toFixed(2)}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 0.7,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
              <Typography sx={{ fontSize: "0.76rem", color: "#6b7280" }}>Discount</Typography>
              <Chip
                label={
                  order.discountType === "Percent"
                    ? `${order.discountValue}%`
                    : `₹${order.discountValue}`
                }
                size="small"
                icon={<LocalOfferIcon sx={{ fontSize: "10px !important", color: "inherit !important" }} />}
                onClick={onDiscountClick}
                sx={{
                  height: 17,
                  fontSize: "0.6rem",
                  cursor: "pointer",
                  bgcolor: summaryDiscount > 0 ? "#dcfce7" : "#f3f4f6",
                  color: summaryDiscount > 0 ? "#16a34a" : "#6b7280",
                  "& .MuiChip-label": { px: 0.5 },
                }}
              />
            </Box>
            <Typography
              sx={{
                fontSize: "0.76rem",
                color: summaryDiscount > 0 ? "#16a34a" : "#374151",
                fontWeight: summaryDiscount > 0 ? 600 : 400,
              }}
            >
              {summaryDiscount > 0 ? `−₹${summaryDiscount.toFixed(2)}` : "₹0.00"}
            </Typography>
          </Box>
          <Divider sx={{ my: 0.8 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827" }}>
              Grand Total
            </Typography>
            <Typography sx={{ fontSize: "0.9rem", fontWeight: 800, color: "#d32f2f" }}>
              ₹{summaryGrandTotal.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      )}

      {/* ── Totals: Order tab or non-DineIn ── */}
      {(!isDineIn || activeTab === "order") && cartItems.length > 0 && (
        <Box sx={{ px: 1.5, py: 1.2, borderTop: "1px solid #f3f4f6", flexShrink: 0 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.7 }}>
            <Typography sx={{ fontSize: "0.76rem", color: "#6b7280" }}>Subtotal</Typography>
            <Typography sx={{ fontSize: "0.76rem", color: "#374151", fontWeight: 500 }}>
              ₹{totals.subtotal.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.7 }}>
            <Typography sx={{ fontSize: "0.76rem", color: "#6b7280" }}>GST</Typography>
            <Typography sx={{ fontSize: "0.76rem", color: "#374151" }}>
              ₹{totals.taxAmount.toFixed(2)}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 0.7,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
              <Typography sx={{ fontSize: "0.76rem", color: "#6b7280" }}>Discount</Typography>
              <Chip
                label={
                  order.discountType === "Percent"
                    ? `${order.discountValue}%`
                    : `₹${order.discountValue}`
                }
                size="small"
                icon={<LocalOfferIcon sx={{ fontSize: "10px !important", color: "inherit !important" }} />}
                onClick={onDiscountClick}
                sx={{
                  height: 17,
                  fontSize: "0.6rem",
                  cursor: "pointer",
                  bgcolor: totals.discount > 0 ? "#dcfce7" : "#f3f4f6",
                  color: totals.discount > 0 ? "#16a34a" : "#6b7280",
                  "& .MuiChip-label": { px: 0.5 },
                }}
              />
            </Box>
            <Typography
              sx={{
                fontSize: "0.76rem",
                color: totals.discount > 0 ? "#16a34a" : "#374151",
                fontWeight: totals.discount > 0 ? 600 : 400,
              }}
            >
              {totals.discount > 0 ? `−₹${totals.discount.toFixed(2)}` : "₹0.00"}
            </Typography>
          </Box>
          <Divider sx={{ my: 0.8 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827" }}>
              Grand Total
            </Typography>
            <Typography sx={{ fontSize: "0.9rem", fontWeight: 800, color: "#d32f2f" }}>
              ₹{totals.grandTotal.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      )}

      {/* ── Payment method ── */}
      <Box
        sx={{
          px: 1.5,
          py: 1,
          borderTop: "1px solid #f3f4f6",
          display: "flex",
          gap: 0.8,
          flexShrink: 0,
        }}
      >
        {PAYMENT_METHODS.map((pm) => {
          const active = order.paymentMethod === pm.key;
          return (
            <Box
              key={pm.key}
              onClick={() => onPaymentMethodChange(pm.key)}
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
                py: 0.7,
                borderRadius: "8px",
                border: active ? "1.5px solid #d32f2f" : "1.5px solid #e5e7eb",
                bgcolor: active ? "#fff5f5" : "#fff",
                color: active ? "#d32f2f" : "#6b7280",
                cursor: "pointer",
                transition: "all 0.15s",
                "&:hover": { border: "1.5px solid #fca5a5", bgcolor: "#fef2f2" },
              }}
            >
              {pm.icon}
              <Typography sx={{ fontSize: "0.68rem", fontWeight: active ? 700 : 400 }}>
                {pm.label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* ── Action buttons ── */}
      <Box
        sx={{
          px: 1.5,
          pb: 1.5,
          display: "flex",
          gap: 0.8,
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <Tooltip title="Hold Order" placement="top">
          <Box
            onClick={onHold}
            sx={{
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              cursor: "pointer",
              color: "#9ca3af",
              flexShrink: 0,
              "&:hover": { bgcolor: "#f9fafb", color: "#374151" },
            }}
          >
            <PauseCircleOutlineIcon sx={{ fontSize: 20 }} />
          </Box>
        </Tooltip>

        {/* DineIn Order tab → Send KDS only; DineIn Summary tab → Pay only; non-DineIn → Pay only */}
        {isDineIn && activeTab === "order" ? (
          <Button
            onClick={onSendToKDS}
            disabled={isLoading || cartItems.length === 0}
            variant="outlined"
            startIcon={<KitchenIcon sx={{ fontSize: 15 }} />}
            sx={{
              flex: 1,
              height: 40,
              borderColor: "#1d4ed8",
              color: "#1d4ed8",
              fontSize: "0.76rem",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "8px",
              "&:hover": { borderColor: "#1e40af", bgcolor: "#eff6ff" },
              "&:disabled": { borderColor: "#bfdbfe", color: "#93c5fd" },
            }}
          >
            {isLoading ? "…" : "Send KDS"}
          </Button>
        ) : (
          <Button
            onClick={onPaid}
            disabled={isLoading || !canPaid}
            variant="contained"
            sx={{
              flex: 1,
              height: 40,
              bgcolor: "#d32f2f",
              "&:hover": { bgcolor: "#b71c1c" },
              "&:disabled": { bgcolor: "#fca5a5", color: "#fff" },
              fontSize: "0.82rem",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "8px",
            }}
          >
            {isLoading
              ? "Processing…"
              : cartItems.length > 0
              ? `Pay ₹${totals.grandTotal.toFixed(2)}`
              : orderSummary.length > 0
              ? `Pay ₹${summaryGrandTotal.toFixed(2)}`
              : "Pay"}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default OrderPanel;
