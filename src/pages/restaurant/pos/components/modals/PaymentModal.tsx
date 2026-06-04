import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, Divider,
} from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import QrCodeIcon from "@mui/icons-material/QrCode2";
import MoneyIcon from "@mui/icons-material/Money";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { RestaurantCartItem } from "../../api/restaurantPosApi";
import { getItemPrice } from "../../api/restaurantPosApi";

interface Props {
  open: boolean;
  total: number;
  cartItems: RestaurantCartItem[];
  paymentMethod: "Card" | "QR" | "Cash";
  onMethodChange: (method: "Card" | "QR" | "Cash") => void;
  onPay: (method: "Card" | "QR" | "Cash") => void;
  onClose: () => void;
  isLoading: boolean;
}

const METHODS: Array<{
  key: "Cash" | "Card" | "QR";
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}> = [
  {
    key: "Cash",
    label: "Cash",
    icon: <MoneyIcon sx={{ fontSize: 26 }} />,
    color: "#16a34a",
    bg: "#f0fdf4",
  },
  {
    key: "Card",
    label: "Card",
    icon: <CreditCardIcon sx={{ fontSize: 26 }} />,
    color: "#1d4ed8",
    bg: "#eff6ff",
  },
  {
    key: "QR",
    label: "QR Pay",
    icon: <QrCodeIcon sx={{ fontSize: 26 }} />,
    color: "#7c3aed",
    bg: "#f5f3ff",
  },
];

const PaymentModal: React.FC<Props> = ({
  open,
  total,
  cartItems,
  paymentMethod,
  onMethodChange,
  onPay,
  onClose,
  isLoading,
}) => {
  const totalQty = cartItems.reduce((s, i) => s + i.quantity, 0);
  const preview = cartItems.slice(0, 5);
  const remaining = cartItems.length - preview.length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: "14px" } }}
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>
          Confirm Payment
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {totalQty} item{totalQty !== 1 ? "s" : ""} in this order
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pb: 1 }}>
        {/* Order preview */}
        <Box
          sx={{
            bgcolor: "#f9fafb",
            borderRadius: "10px",
            p: 1.5,
            mb: 2.5,
            border: "1px solid #f3f4f6",
          }}
        >
          {preview.map((item, idx) => (
            <Box
              key={idx}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 0.7,
                "&:last-child": { mb: remaining > 0 ? 0.7 : 0 },
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ flex: 1, pr: 1 }} noWrap>
                {item.product.menu_name}
                {(item.product as any).variant_name ? ` (${(item.product as any).variant_name})` : ""}
                {" × "}{item.quantity}
              </Typography>
              <Typography variant="caption" fontWeight={600} color="#374151">
                ₹{(getItemPrice(item.product) * item.quantity).toFixed(2)}
              </Typography>
            </Box>
          ))}
          {remaining > 0 && (
            <Typography variant="caption" color="text.secondary">
              +{remaining} more item{remaining > 1 ? "s" : ""}
            </Typography>
          )}
          <Divider sx={{ my: 1.2 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="body2" fontWeight={700} color="#111827">
              Total Amount
            </Typography>
            <Typography variant="h6" fontWeight={800} color="#d32f2f">
              ₹{total.toFixed(2)}
            </Typography>
          </Box>
        </Box>

        {/* Method label */}
        <Typography
          variant="caption"
          fontWeight={700}
          color="text.secondary"
          sx={{ mb: 1.2, display: "block", letterSpacing: "0.05em", textTransform: "uppercase" }}
        >
          Payment Method
        </Typography>

        {/* Payment method picker */}
        <Box sx={{ display: "flex", gap: 1 }}>
          {METHODS.map((m) => {
            const active = paymentMethod === m.key;
            return (
              <Box
                key={m.key}
                onClick={() => onMethodChange(m.key)}
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.6,
                  py: 1.5,
                  borderRadius: "10px",
                  border: active ? `2px solid ${m.color}` : "1.5px solid #e5e7eb",
                  bgcolor: active ? m.bg : "#fff",
                  cursor: "pointer",
                  position: "relative",
                  transition: "all 0.15s",
                  "&:hover": { border: `1.5px solid ${m.color}`, bgcolor: m.bg },
                }}
              >
                {active && (
                  <CheckCircleIcon
                    sx={{
                      position: "absolute",
                      top: 5,
                      right: 5,
                      fontSize: 14,
                      color: m.color,
                    }}
                  />
                )}
                <Box sx={{ color: active ? m.color : "#9ca3af" }}>{m.icon}</Box>
                <Typography
                  sx={{
                    fontSize: "0.72rem",
                    fontWeight: active ? 700 : 400,
                    color: active ? m.color : "#6b7280",
                  }}
                >
                  {m.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: "#e5e7eb",
            color: "#374151",
            textTransform: "none",
            borderRadius: "8px",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => onPay(paymentMethod)}
          disabled={isLoading}
          variant="contained"
          sx={{
            flex: 1,
            height: 44,
            bgcolor: "#d32f2f",
            "&:hover": { bgcolor: "#b71c1c" },
            "&:disabled": { bgcolor: "#fca5a5", color: "#fff" },
            textTransform: "none",
            borderRadius: "8px",
            fontSize: "0.9rem",
            fontWeight: 700,
          }}
        >
          {isLoading ? "Processing..." : `Collect ₹${total.toFixed(2)}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentModal;
