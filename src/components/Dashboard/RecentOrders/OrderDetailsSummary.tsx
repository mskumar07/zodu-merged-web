import React from "react";
import { Box, Typography, Chip } from "@mui/material";

interface OrderDetailsSummaryProps {
  subtal: number;
  tax: number;
  total: number;
  discountType: string;
  discountValue?: number;
}

const OrderDetailsSummary: React.FC<OrderDetailsSummaryProps> = ({
  subtal,
  tax,
  total,
  discountType,
  discountValue,
}) => {
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="body2">Subtotal:</Typography>
        <Typography variant="body2">₹{subtal.toFixed(2)}</Typography>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="body2">Tax:</Typography>
        <Typography variant="body2">₹{tax.toFixed(2)}</Typography>
      </Box>
      {discountValue !== undefined && discountValue > 0 && (
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2">Discount:</Typography>
          <Typography variant="body2">
            {discountType === "FLAT" ? "₹" : ""}
            {discountValue}
            {discountType === "PERCENT" ? "%" : ""}
          </Typography>
        </Box>
      )}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="h6">Total:</Typography>
        <Typography variant="h6">₹{total.toFixed(2)}</Typography>
      </Box>
    </Box>
  );
};

export default OrderDetailsSummary;
