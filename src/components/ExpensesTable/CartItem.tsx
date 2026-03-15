import React, { useState } from "react";
import { Box, IconButton, TextField, Typography, Button } from "@mui/material";
import { Delete, Add, Remove } from "@mui/icons-material";

interface CartItemProps {
  name: string;
  price: number;
  id: string | number;
  quantity?: number;
  onRemove: (id: number) => void;
  onQuantityChange?: (quantity: number) => void;
  onPriceChange?: (price: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  name,
  price,
  id,
  quantity = 1,
  onRemove,
  onQuantityChange,
  onPriceChange,
}) => {
  const [qty, setQty] = useState(quantity);

  const handleIncrease = () => {
    const newQty = qty + 1;
    setQty(newQty);
    onQuantityChange?.(newQty);
  };

  const handleDecrease = () => {
    if (qty > 1) {
      const newQty = qty - 1;
      setQty(newQty);
      onQuantityChange?.(newQty);
    }
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="flex-start"
      p={2}
      gap={4}
      borderBottom="1px solid #e5e5e5"
    >
      {/* Item Name */}

      {/* Quantity + Price */}
      <Box display="flex" alignItems="center" flexDirection="row" gap={2}>
        {/* Quantity Controls */}
        <Box>
          <Typography variant="body1">{name}</Typography>
          <Box
            display="flex"
            alignItems="center"
            border="1px solid #ccc"
            borderRadius={1}
            px={1}
          >
            <IconButton size="small" onClick={handleDecrease}>
              <Remove fontSize="small" />
            </IconButton>
            <Typography variant="body1" sx={{ px: 1 }}>
              {qty}
            </Typography>
            <IconButton size="small" onClick={handleIncrease}>
              <Add fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Price Field */}
        <TextField
          label="Price"
          value={price}
          size="small"
          variant="standard"
          onChange={
            onPriceChange
              ? (e) => onPriceChange(parseFloat(e.target.value || "0"))
              : undefined
          }
          sx={{ width: 80 }}
        />
      </Box>

      {/* Total + Delete */}
      <Box display="flex" alignItems="center">
        <Typography variant="body1" fontWeight="bold">
          ₹{(qty * price).toFixed(2)}
        </Typography>
        <IconButton color="error" onClick={() => onRemove(id)}>
          <Delete />
        </IconButton>
      </Box>
    </Box>
  );
};

export default CartItem;
