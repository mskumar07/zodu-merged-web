/**
 * MarkPaymentDialog.tsx
 * Payment collection form — pixel-matched to HTML design.
 * Calls POST /api/payments/add.
 */
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box, Typography, IconButton, Button, TextField, Select,
  MenuItem, InputAdornment, CircularProgress,
  Dialog, DialogContent,
} from "@mui/material";
import {
  Close as CloseIcon,
  Payments as PaymentsIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { postMarkPayment, type Sale } from "./useSaleshistory";
import { INR } from "./dialogHelpers";
import { toast } from "react-toastify";

interface Props {
  sale: Sale;
  onClose: () => void;
  onSuccess: () => void;
}

// Shared field label — matches HTML "text-sm font-semibold text-slate-700"
function FieldLabel({ children }: { children: string }) {
  return (
    <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#334155", mb: 0.75 }}>
      {children}
    </Typography>
  );
}

// Shared outlined input style — rounded-xl, focus ring matching HTML
const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    fontSize: "0.875rem",
    bgcolor: "#fff",
    "& fieldset":               { borderColor: "#E2E8F0" },
    "&:hover fieldset":         { borderColor: "#CBD5E1" },
    "&.Mui-focused fieldset":   { borderColor: "#D2042D", borderWidth: 2 },
  },
};

export default function MarkPaymentDialog({ sale, onClose, onSuccess }: Props) {
    const queryClient = useQueryClient();

  const balance = Number(sale.balance_amount);

  const [form, setForm] = useState({
    paid_date:      new Date().toISOString().slice(0, 10),
    amount:         String(balance),
    payment_mode:   "UPI",
    transaction_id: "",
    notes:          "",
  });


  const mutation = useMutation({
    mutationFn: postMarkPayment,

  onSuccess: () => {
    toast.success("Payment recorded successfully");

    queryClient.invalidateQueries({ queryKey: ["sales-history"] });
    queryClient.invalidateQueries({ queryKey: ["sale", sale.sale_id] });

    onSuccess();
    onClose();
  },

  onError: () => {
    toast.error("Failed to record payment");
  },
  });

   const handleSubmit = () => {
    const amount = parseFloat(form.amount);


  if (!amount || amount <= 0) {
    toast.error("Enter a valid payment amount");
    return;
  }

  if (amount > balance) {
    toast.error("Payment cannot exceed outstanding amount");
    return;
  }

  toast.info("Saving payment...");
  onClose();

    // mutation.mutate({
    //   zodu_id: "ZODU035",
    //   branch_id: "ZODU035B1",

    //   sale_id: sale.sale_id,
    //   total_amount: Number(sale.total_amount),

    //   paid_amount: amount,
    //   payment_mode: form.payment_mode,
    //   paid_date: form.paid_date,
    //   transaction_id: form.transaction_id,
    //   notes: form.notes,
    // });
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid #E2E8F0",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* ── Header — white bg, icon + title + close ────────────────────── */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        px: 3, py: 2.5,
        borderBottom: "1px solid #F1F5F9",
        bgcolor: "#fff",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* Icon pill — primary/10 bg */}
          <Box sx={{
            p: 1, borderRadius: "8px",
            bgcolor: "rgba(210,4,45,0.1)",
            display: "flex", alignItems: "center",
          }}>
            <PaymentsIcon sx={{ color: "#D2042D", fontSize: 22 }} />
          </Box>
          <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A" }}>
            Mark Payment
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ borderRadius: "999px", color: "#64748B", "&:hover": { bgcolor: "#F1F5F9" } }}
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <DialogContent sx={{ px: 3, py: 3, bgcolor: "#fff" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

          {/* Invoice + Outstanding summary bar */}
          <Box sx={{
            p: 2, bgcolor: "#F8FAFC", borderRadius: "12px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <Box>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 600, color: "#94A3B8", letterSpacing: "0.1em", textTransform: "uppercase", mb: 0.4 }}>
                Invoice
              </Typography>
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#0F172A" }}>
                #{sale.invoice_no}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 600, color: "#94A3B8", letterSpacing: "0.1em", textTransform: "uppercase", mb: 0.4 }}>
                Outstanding
              </Typography>
              <Typography sx={{ fontSize: "1.125rem", fontWeight: 700, color: "#D2042D" }}>
                {INR(balance)}
              </Typography>
            </Box>
          </Box>

          {/* Payment Date */}
          <Box>
            <FieldLabel>Payment Date</FieldLabel>
            <TextField
              type="date"
              size="small"
              fullWidth
              value={form.paid_date}
              onChange={e => setForm(f => ({ ...f, paid_date: e.target.value }))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon sx={{ fontSize: 18, color: "#94A3B8" }} />
                  </InputAdornment>
                ),
              }}
              sx={inputSx}
            />
          </Box>

          {/* Amount to Pay */}
          <Box>
            <FieldLabel>Amount to Pay</FieldLabel>
            <TextField
              size="small"
              fullWidth
              type="number"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#64748B" }}>₹</Typography>
                  </InputAdornment>
                ),
                inputProps: { style: { fontWeight: 700 } },
              }}
              sx={inputSx}
            />
          </Box>

          {/* Payment Type + Reference No — 2 columns */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Box>
              <FieldLabel>Payment Type</FieldLabel>
              <Select
                size="small"
                fullWidth
                value={form.payment_mode}
                onChange={e => setForm(f => ({ ...f, payment_mode: e.target.value }))}
                sx={{
                  borderRadius: "12px",
                  fontSize: "0.875rem",
                  bgcolor: "#fff",
                  "& fieldset":             { borderColor: "#E2E8F0" },
                  "&:hover fieldset":       { borderColor: "#CBD5E1" },
                  "&.Mui-focused fieldset": { borderColor: "#D2042D", borderWidth: 2 },
                }}
              >
                {["Cash", "UPI", "Credit Card", "Bank Transfer"].map(m => (
                  <MenuItem key={m} value={m} sx={{ fontSize: "0.875rem" }}>{m}</MenuItem>
                ))}
              </Select>
            </Box>
            <Box>
              <FieldLabel>Reference No.</FieldLabel>
              <TextField
                size="small"
                fullWidth
                placeholder="TXN-12345"
                value={form.transaction_id}
                onChange={e => setForm(f => ({ ...f, transaction_id: e.target.value }))}
                sx={inputSx}
              />
            </Box>
          </Box>

          {/* Notes */}
          <Box>
            <FieldLabel>Notes (Optional)</FieldLabel>
            <TextField
              multiline
              rows={2}
              size="small"
              fullWidth
              placeholder="Enter details..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              sx={inputSx}
            />
          </Box>

        </Box>
      </DialogContent>

      {/* ── Footer — slate-50 bg, Cancel + Save Payment ─────────────────── */}
      <Box sx={{
        px: 3, py: 3,
        bgcolor: "#F8FAFC",
        borderTop: "1px solid #F1F5F9",
        display: "flex", gap: 1.5, width: "100%",
      }}>
        {/* Cancel — 1 part */}
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            flex: 1, py: 1.5, borderRadius: "12px",
            borderColor: "#E2E8F0", color: "#475569",
            bgcolor: "#fff", fontWeight: 700, fontSize: "0.875rem",
            minWidth: 0,
            "&:hover": { bgcolor: "#F8FAFC", borderColor: "#CBD5E1" },
          }}
        >
          Cancel
        </Button>

        {/* Save Payment — 2 parts */}
        <Button
          onClick={handleSubmit}
          disabled={mutation.isPending}
          variant="contained"
          disableElevation
          startIcon={
            mutation.isPending
              ? <CircularProgress size={18} color="inherit" />
              : <CheckCircleIcon sx={{ fontSize: 20 }} />
          }
          sx={{
            flex: 2, py: 1.5, borderRadius: "12px",
            bgcolor: "#D2042D", color: "#fff",
            fontWeight: 700, fontSize: "0.875rem",
            minWidth: 0,
            boxShadow: "0 4px 14px rgba(210,4,45,0.25)",
            "&:hover":        { bgcolor: "#B80028" },
            "&:active":       { transform: "scale(0.98)" },
            "&.Mui-disabled": { bgcolor: "#E2E8F0", color: "#94A3B8", boxShadow: "none" },
            transition: "all 0.15s",
          }}
        >
          {mutation.isPending ? "Saving…" : "Save Payment"}
        </Button>
      </Box>
    </Dialog>
  );
}