import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  MenuItem,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState, useEffect } from "react";

interface PaymentData {
  balance_amount: number;
}

interface PaymentModalProps {
  open: boolean;
  data: PaymentData;
  onClose: () => void;
  onSubmit: (payload: {
    amount: number;
    paymentType: string;
  }) => void;
}

const paymentTypes = ["Cash", "UPI", "Card", "Bank Transfer"];

export default function PaymentModal({
  open,
  data,
  onClose,
  onSubmit,
}: PaymentModalProps) {
  const [amount, setAmount] = useState<number|string>("");
  const [paymentType, setPaymentType] = useState<string>("");
  console.log(data, "my data")
  useEffect(() => {
    if (open) {
      setAmount(data.balance_amount);
      setPaymentType("");
    }
  }, [open, data.balance_amount]);

  const handleSubmit = () => {
    onSubmit({
      amount,
      paymentType,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {/* Header */}
      <DialogTitle>
        Make Payment
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          {/* Due Amount */}
          <Typography variant="subtitle1">
            Due Amount:
            <Typography component="span" color="error" fontWeight={600}>
              {" ₹" + data.balance_amount}
            </Typography>
          </Typography>

          {/* Amount Input */}
          <TextField
            label="Payment Amount"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          {/* Payment Type */}
          <TextField
            select
            label="Payment Type"
            fullWidth
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
          >
            {paymentTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>

      {/* Footer */}
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!amount || !paymentType}
        >
          Pay Now
        </Button>
      </DialogActions>
    </Dialog>
  );
}
