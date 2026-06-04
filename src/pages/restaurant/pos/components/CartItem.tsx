import React from "react";
import { Box, Typography, Avatar, IconButton } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { RestaurantCartItem } from "../api/restaurantPosApi";
import { getItemPrice } from "../api/restaurantPosApi";

interface Props {
  item: RestaurantCartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

const FOOD_COLOR: Record<string, string> = {
  veg:     "#16a34a",
  non_veg: "#d32f2f",
  egg:     "#d97706",
};

const CartItem: React.FC<Props> = ({ item, onIncrement, onDecrement, onRemove }) => {
  const price     = getItemPrice(item.product);
  const lineTotal = price * item.quantity;
  const dotColor  = FOOD_COLOR[item.product.food_type?.toLowerCase()] ?? "#16a34a";
  const initials  = (item.product.menu_name ?? "").slice(0, 2).toUpperCase();
  const variant   = (item.product as any).variant_name as string | undefined;

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.2,
        py: 1.1,
        borderBottom: "1px solid #f3f4f6",
        "&:last-child": { borderBottom: "none" },
        alignItems: "flex-start",
      }}
    >
      {/* Avatar with food-type dot */}
      <Box sx={{ position: "relative", flexShrink: 0 }}>
        <Avatar
          src={item.product.menu_image ?? undefined}
          sx={{
            width: 36,
            height: 36,
            bgcolor: "#f3f4f6",
            color: "#9ca3af",
            fontSize: "0.68rem",
            fontWeight: 700,
            borderRadius: "8px",
          }}
        >
          {initials}
        </Avatar>
        <Box
          sx={{
            position: "absolute",
            bottom: -2,
            right: -2,
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: dotColor,
            border: "1.5px solid #fff",
          }}
        />
      </Box>

      {/* Name + variant + price */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: "0.76rem",
            fontWeight: 600,
            color: "#111827",
            lineHeight: 1.25,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.product.menu_name ?? ""}
        </Typography>
        {variant && (
          <Typography sx={{ fontSize: "0.65rem", color: "#9ca3af" }}>
            {variant}
          </Typography>
        )}
        <Typography sx={{ fontSize: "0.7rem", color: "#d32f2f", fontWeight: 600, mt: 0.2 }}>
          ₹{price.toFixed(2)}
        </Typography>
      </Box>

      {/* Controls: stepper + total + remove */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5, flexShrink: 0 }}>
        {/* Qty stepper */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            border: "1px solid #e5e7eb",
            borderRadius: "7px",
            overflow: "hidden",
            height: 26,
          }}
        >
          <Box
            onClick={onDecrement}
            sx={{
              width: 26,
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#374151",
              fontWeight: 700,
              fontSize: "0.9rem",
              "&:hover": { bgcolor: "#f3f4f6" },
            }}
          >
            −
          </Box>
          <Typography
            sx={{
              fontSize: "0.78rem",
              fontWeight: 700,
              px: 0.8,
              minWidth: 22,
              textAlign: "center",
              color: "#111827",
              lineHeight: 1,
            }}
          >
            {item.quantity}
          </Typography>
          <Box
            onClick={onIncrement}
            sx={{
              width: 26,
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#374151",
              fontWeight: 700,
              fontSize: "0.9rem",
              "&:hover": { bgcolor: "#f3f4f6" },
            }}
          >
            +
          </Box>
        </Box>

        {/* Line total + remove */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
          <Typography sx={{ fontSize: "0.76rem", fontWeight: 700, color: "#111827" }}>
            ₹{lineTotal.toFixed(2)}
          </Typography>
          <IconButton
            size="small"
            onClick={onRemove}
            sx={{ color: "#ef4444", p: 0.2, "&:hover": { bgcolor: "#fff1f2" } }}
          >
            <DeleteOutlineIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default CartItem;
