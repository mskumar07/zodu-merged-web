import React from "react";
import {
  Box,
  Typography,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
} from "@mui/material";
import type { Order } from "../../types/order";
import { useAppDispatch } from "../../store/store";
import {
  updateDiscountType,
  updateDiscountValue,
} from "@store/slices/POSslice";

interface Props {
  order: Order;
  setOrder: (order: Order) => void;
  discountType: "Percent" | "Amount";
  discountValue: number;
  discountModalOpen: boolean;
  setDiscountModalOpen: (open: boolean) => void;
}

const SummarySection: React.FC<Props> = ({
  order,
  setOrder,
  discountType,
  discountValue,
  discountModalOpen,
  setDiscountModalOpen,
}) => {
  console.log("order", order);
  const discountAmount =
    discountType === "Percent"
      ? ((order.subtotal ?? 0) * discountValue) / 100
      : discountValue;

  const grandTotal =
    (order.subtotal ?? 0) - discountAmount + (order.taxes ?? 0);
  const dispatch = useAppDispatch();
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="body2">Tax Amount</Typography>
        <Typography variant="body2" color="text.secondary">
          {/* ₹{order.taxes?.toFixed(2) ?? "0.00"} z-T77 */}₹
          {order.taxes ? order.taxes.toFixed(2) : "0.00"}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="body2">{discountType}</Typography>
        <Typography variant="body2" color="success.main">
          -₹{discountAmount.toFixed(2)}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          sx={{ ml: 1 }}
          onClick={() => setDiscountModalOpen(true)}
        >
          {discountType}
        </Button>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="body2">Sub Total</Typography>
        <Typography variant="body2">
          ₹{order.subtotal?.toFixed(2) ?? "0.00"}
        </Typography>
      </Box>
      <Divider sx={{ my: 1 }} />
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="subtitle2">Grand Total</Typography>
        <Typography variant="subtitle2">₹{grandTotal.toFixed(2)}</Typography>
      </Box>

      {/* Discount Modal */}
      <Dialog
        open={discountModalOpen}
        onClose={() => setDiscountModalOpen(false)}
      >
        <DialogTitle>Apply Discount</DialogTitle>
        <DialogContent>
          <ToggleButtonGroup
            exclusive
            value={discountType}
            onChange={(_, value) =>
              value && dispatch(updateDiscountType(value))
            }
            sx={{ mb: 2 }}
          >
            <ToggleButton value="Percent">Percent (%)</ToggleButton>
            <ToggleButton value="Amount">Amount (₹)</ToggleButton>
          </ToggleButtonGroup>
          <TextField
            label={discountType === "Percent" ? "Discount (%)" : "Amount (₹)"}
            type="number"
            size="small"
            fullWidth
            value={discountValue === 0 ? "" : discountValue.toString()}
            onChange={(e) =>
              dispatch(updateDiscountValue(Number(e.target.value)))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDiscountModalOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setOrder({ ...order, total: grandTotal });
              setDiscountModalOpen(false);
            }}
            variant="contained"
            disabled={discountValue < 0}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SummarySection;
