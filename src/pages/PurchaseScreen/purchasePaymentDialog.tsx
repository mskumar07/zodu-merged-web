/**
 * MarkPaymentDialog.tsx
 * Payment collection form.
 * Calls POST /api/sales/:sale_id/payment via postMarkPayment.
 * On success → invalidates sales-history + sale detail cache → triggers refetch.
 */
import PaymentModeSelect from "../../components/Common/PaymentModeSelect";
import { useState } from "react";
import {
  Box, Typography, IconButton, Button, TextField, InputAdornment, CircularProgress,
  Dialog, DialogContent,
} from "@mui/material";
import {
  Close as CloseIcon,
  Payments as PaymentsIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useMarkPayment, getZoduId, getBranchId } from "./usePuchaseapi";
import { closeFromControlsOnly } from "@utils/dialog";
import { useBlockWhenReadOnly } from "@hooks/useSubscriptionGuard";
import type { Notify } from "./PurchaseReturnDialog";

interface Props {
  purchase: any;
  onClose: () => void;
  onSuccess: () => void;
  /** Shows the result in the screen's SuccessToast — it outlives this dialog, which closes on success. */
  notify: Notify;
}

function FieldLabel({ children }: { children: string }) {
  return (
    <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#334155", mb: 0.5 }}>
      {children}
    </Typography>
  );
}

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "6px",
    fontSize: "0.875rem",
    bgcolor: "#fff",
    "& fieldset":             { borderColor: "#E2E8F0" },
    "&:hover fieldset":       { borderColor: "#CBD5E1" },
    "&.Mui-focused fieldset": { borderColor: "#D2042D", borderWidth: 2 },
  },
};

// ✅ Payment types that match tbl_sale_payment.transaction_type
const PAYMENT_TYPES = ["Cash", "UPI","Bank Transfer", "Others"] as const;

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function PurchasePaymentDialog({ purchase, onClose, onSuccess, notify }: Props) {
  useBlockWhenReadOnly(true, onClose);
const balance = Number(purchase.balance_amount);

  const [form, setForm] = useState({
    amount:           String(balance),
    transaction_type: "Cash",
    transaction_id:   "",
    payment_date:     todayStr(),
  });

  // ✅ Mutation wired to real API — no more commented-out code
const markPayment = useMarkPayment();

const handleSubmit = () => {
  const amount = parseFloat(form.amount);

  if (!amount || amount <= 0) {
    notify("Enter a valid payment amount", "error");
    return;
  }

  if (amount > balance) {
    notify(`Payment cannot exceed ₹${balance.toLocaleString("en-IN")}`, "error");
    return;
  }

  markPayment.mutate(
    {
      purchase_id: purchase.purchase_id, // ✅ FIXED
      data: {
        zodu_id: getZoduId() ?? "",
        branch_id: getBranchId() ?? "",
        payment_date: form.payment_date || todayStr(),
        paid_amount: amount,
        transaction_type: form.transaction_type,
        transaction_id: form.transaction_id || null,
      },
    },
    {
      onSuccess: () => {
        notify("Payment recorded successfully");
        onSuccess();
        onClose();
      },
      onError: (err: any) => {
        notify(err?.message || "Failed to record payment", "error");
      },
    }
  );
};

  return (
    <Dialog
      open
      onClose={closeFromControlsOnly(onClose)}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px", overflow: "hidden",
          border: "1px solid #E2E8F0",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          display: "flex", flexDirection: "column",
        },
      }}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        px: 3, py: 1.5, borderBottom: "1px solid #F1F5F9", bgcolor: "#fff",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ p: 1, borderRadius: "8px", bgcolor: "rgba(210,4,45,0.1)", display: "flex" }}>
            <PaymentsIcon sx={{ color: "#D2042D", fontSize: 22 }} />
          </Box>
          <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A" }}>
            Mark Payment
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small"
          sx={{ borderRadius: "999px", color: "#64748B", "&:hover": { bgcolor: "#F1F5F9" } }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* ── Body ───────────────────────────────────────────────── */}
      <DialogContent sx={{ px: 3, py: 2, bgcolor: "#fff" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>

          {/* Invoice + Outstanding summary */}
          <Box sx={{
            p: 1.5, bgcolor: "#F8FAFC", borderRadius: "12px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <Box>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 600, color: "#94A3B8", letterSpacing: "0.1em", textTransform: "uppercase", mb: 0.4 }}>
                Invoice
              </Typography>
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#0F172A" }}>
              {purchase.purchase_id}
              </Typography>
              {(purchase.vendor_name || purchase.company_name) && (
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 500, color: "#64748B" }}>
                  {purchase.vendor_name || purchase.company_name}
                </Typography>
              )}
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 600, color: "#94A3B8", letterSpacing: "0.1em", textTransform: "uppercase", mb: 0.4 }}>
                Outstanding
              </Typography>
              <Typography sx={{ fontSize: "1.125rem", fontWeight: 700, color: "#D2042D" }}>
                ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
          </Box>

          {/* Amount to Pay */}
          <Box>
            <FieldLabel>Amount to Pay</FieldLabel>
            <TextField
              size="small" fullWidth type="number"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#64748B" }}>₹</Typography>
                  </InputAdornment>
                ),
                inputProps: { style: { fontWeight: 700 }, min: 0, max: balance },
              }}
              sx={inputSx}
            />
          </Box>

          {/* Payment Type + Payment Date */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            <Box>
              <FieldLabel>Payment Type</FieldLabel>
              <PaymentModeSelect options={PAYMENT_TYPES}
                size="small" fullWidth
                value={form.transaction_type}
                onChange={e => setForm(f => ({ ...f, transaction_type: e.target.value }))}
                sx={{
                  borderRadius: "6px", fontSize: "0.875rem", bgcolor: "#fff",
                  "& fieldset":             { borderColor: "#E2E8F0" },
                  "&:hover fieldset":       { borderColor: "#CBD5E1" },
                  "&.Mui-focused fieldset": { borderColor: "#D2042D", borderWidth: 2 },
                }}
              > 
              </PaymentModeSelect>
            </Box>
            <Box>
              <FieldLabel>Payment Date</FieldLabel>
              <TextField
                size="small" fullWidth type="date"
                value={form.payment_date}
                onChange={e => setForm(f => ({ ...f, payment_date: e.target.value }))}
                inputProps={{ max: todayStr() }}
                sx={inputSx}
              />
            </Box>
          </Box>

          {/* Reference No */}
          <Box>
            <FieldLabel>Reference No.</FieldLabel>
            <TextField
              size="small" fullWidth placeholder="TXN-12345"
              value={form.transaction_id}
              onChange={e => setForm(f => ({ ...f, transaction_id: e.target.value }))}
              sx={inputSx}
            />
          </Box>

          {/* Balance preview after payment */}
          {form.amount && parseFloat(form.amount) > 0 && parseFloat(form.amount) <= balance && (
            <Box sx={{
              p: 1.5, bgcolor: "#F0FDF4", borderRadius: "10px",
              border: "1px solid #BBF7D0",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <Typography sx={{ fontSize: "0.75rem", color: "#166534", fontWeight: 600 }}>
                Remaining balance after payment
              </Typography>
              <Typography sx={{ fontSize: "0.875rem", color: "#166534", fontWeight: 800 }}>
                ₹{Math.max(0, balance - parseFloat(form.amount)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
          )}

        </Box>
      </DialogContent>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <Box sx={{
        px: 3, py: 1.75, bgcolor: "#F8FAFC",
        borderTop: "1px solid #F1F5F9",
        display: "flex", gap: 1.5, width: "100%",
      }}>
        <Button
          variant="outlined" onClick={onClose}
          disabled={markPayment.isPending}
          sx={{
            flex: 1, py: 1, borderRadius: "12px",
            borderColor: "#E2E8F0", color: "#475569",
            bgcolor: "#fff", fontWeight: 700, fontSize: "0.875rem",
            "&:hover": { bgcolor: "#F8FAFC", borderColor: "#CBD5E1" },
          }}
        >
          Cancel
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={markPayment.isPending}
          variant="contained" disableElevation
          startIcon={
            markPayment.isPending
              ? <CircularProgress size={18} color="inherit" />
              : <CheckCircleIcon sx={{ fontSize: 20 }} />
          }
          sx={{
            flex: 2, py: 1, borderRadius: "12px",
            bgcolor: "#D2042D", color: "#fff",
            fontWeight: 700, fontSize: "0.875rem",
            boxShadow: "0 4px 14px rgba(210,4,45,0.25)",
            "&:hover":        { bgcolor: "#B80028" },
            "&:active":       { transform: "scale(0.98)" },
            "&.Mui-disabled": { bgcolor: "#E2E8F0", color: "#94A3B8", boxShadow: "none" },
            transition: "all 0.15s",
          }}
        >
          {markPayment.isPending ? "Saving…" : "Save Payment"}
        </Button>
      </Box>
    </Dialog>
  );
}
