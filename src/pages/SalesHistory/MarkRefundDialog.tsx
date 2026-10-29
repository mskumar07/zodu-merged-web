/**
 * MarkRefundDialog.tsx
 * Record a (partial or full) refund payment against a sales return / credit note.
 * Calls POST /api/sale-returns/:return_uuid/refund via postMarkReturnRefund.
 */
import PaymentModeSelect from "../../components/Common/PaymentModeSelect";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box, Typography, IconButton, Button, TextField, InputAdornment, CircularProgress, Dialog, DialogContent,
} from "@mui/material";
import { Close as CloseIcon, CheckCircle as CheckCircleIcon, Payments as PaymentsIcon } from "@mui/icons-material";
import {
  postMarkReturnRefund, apiErrorMessage, salesQueryKeys, getZoduId, getBranchId,
  REFUND_MODES, resolveNotify, type Notify, type SaleListReturn,
} from "./useSaleshistory";
import { INR } from "./dialogHelpers";
import { useBlockWhenReadOnly } from "@hooks/useSubscriptionGuard";
import { localDateStr } from "@utils/localDate";

interface Props {
  saleUuid: string;
  /** Works for both the list-row return and the detail-dialog return. */
  ret:      Pick<SaleListReturn, "return_uuid" | "return_id" | "return_type" | "refund_due" | "refunded_amount" | "pending_refund">;
  onClose:  () => void;
  notify?:  Notify;
  /** The original sale's date (YYYY-MM-DD) — a refund can't be dated before it. */
  minDate?: string;
}

const todayStr = () => localDateStr();

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px", fontSize: "0.875rem", bgcolor: "#fff",
    "& fieldset":             { borderColor: "#E2E8F0" },
    "&:hover fieldset":       { borderColor: "#CBD5E1" },
    "&.Mui-focused fieldset": { borderColor: "#D2042D", borderWidth: 2 },
  },
};

const captionSx = { fontSize: "0.65rem", fontWeight: 600, color: "#94A3B8", letterSpacing: "0.1em", textTransform: "uppercase", mb: 0.4 } as const;

function FieldLabel({ children }: { children: string }) {
  return <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#334155", mb: 0.5 }}>{children}</Typography>;
}

export default function MarkRefundDialog({ saleUuid, ret, onClose, notify, minDate }: Props) {
  const say = resolveNotify(notify);
  useBlockWhenReadOnly(true, onClose);
  const queryClient = useQueryClient();

  const due     = Number(ret.refund_due ?? 0);
  const pending = Number(ret.pending_refund ?? due - Number(ret.refunded_amount ?? 0));

  const [amount,    setAmount]    = useState(String(pending));
  const [mode,      setMode]      = useState<(typeof REFUND_MODES)[number]>("Cash");
  const [reference, setReference] = useState("");
  const [date,      setDate]      = useState(todayStr());

  const value     = parseFloat(amount);
  const valid     = value > 0 && value <= pending + 0.001;
  const remaining = Math.max(0, pending - (value || 0));

  const mutation = useMutation({
    mutationFn: postMarkReturnRefund,
    onSuccess: async (res) => {
      const { refund_status, pending_refund } = res.data;
      say(refund_status === "REFUNDED" ? "Refund completed" : `Refund recorded — ${INR(pending_refund)} still pending`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: salesQueryKeys.detail(saleUuid) }),
        queryClient.invalidateQueries({ queryKey: ["sales-history"] }),
        queryClient.invalidateQueries({ queryKey: salesQueryKeys.returns() }),
      ]);
      onClose();
    },
    onError: (err) => say(apiErrorMessage(err, "Failed to record refund"), "error"),
  });

  const handleSubmit = () => {
    if (!valid || mutation.isPending) return;
    mutation.mutate({
      return_uuid:   ret.return_uuid,
      zodu_id:       getZoduId()!,
      branch_id:     getBranchId()!,
      refund_amount: value,
      payment_mode:  mode,
      ...(reference.trim() && { reference_no: reference.trim() }),
      ...(date && { refund_date: date }),
    });
  };

  return (
    <Dialog
      open onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden", border: "1px solid #E2E8F0", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" } }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 1.5, borderBottom: "1px solid #F1F5F9" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ p: 1, borderRadius: "8px", bgcolor: "rgba(210,4,45,0.1)", display: "flex" }}>
            <PaymentsIcon sx={{ color: "#D2042D", fontSize: 22 }} />
          </Box>
          <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A" }}>Mark Payment</Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "#64748B" }}><CloseIcon sx={{ fontSize: 20 }} /></IconButton>
      </Box>

      <DialogContent sx={{ px: 3, py: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ p: 1.5, bgcolor: "#F8FAFC", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography sx={captionSx}>{ret.return_type === "CREDIT_NOTE" ? "Credit Note" : "Sales Return"}</Typography>
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#0F172A" }}>{ret.return_id}</Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={captionSx}>Pending refund</Typography>
              <Typography sx={{ fontSize: "1.125rem", fontWeight: 700, color: "#D2042D" }}>{INR(pending)}</Typography>
            </Box>
          </Box>

          <Box>
            <FieldLabel>Refund Amount</FieldLabel>
            <TextField
              size="small" fullWidth type="number" value={amount} error={!!amount && !valid}
              helperText={!!amount && !valid ? `Enter an amount up to ${INR(pending)}` : undefined}
              onChange={(e) => setAmount(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Typography sx={{ fontWeight: 700, color: "#64748B" }}>₹</Typography></InputAdornment>,
                inputProps: { style: { fontWeight: 700, textAlign: "right" }, min: 0, max: pending, step: "0.01" },
              }}
              sx={inputSx}
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            <Box>
              <FieldLabel>Payment Mode</FieldLabel>
              <PaymentModeSelect options={REFUND_MODES} size="small" fullWidth value={mode} onChange={(e) => setMode(e.target.value as typeof mode)} sx={{ borderRadius: "12px", fontSize: "0.875rem" }} />
            </Box>
            <Box>
              <FieldLabel>Refund Date</FieldLabel>
              <TextField size="small" fullWidth type="date" value={date} onChange={(e) => setDate(e.target.value)} inputProps={{ min: minDate }} sx={inputSx} />
            </Box>
          </Box>

          <Box>
            <FieldLabel>Reference No. (optional)</FieldLabel>
            <TextField size="small" fullWidth placeholder="UPI / bank reference" value={reference} onChange={(e) => setReference(e.target.value)} sx={inputSx} />
          </Box>

          {valid && (
            <Box sx={{ p: 1.5, bgcolor: "#F0FDF4", borderRadius: "10px", border: "1px solid #BBF7D0", display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: "0.75rem", color: "#166534", fontWeight: 600 }}>Pending after this refund</Typography>
              <Typography sx={{ fontSize: "0.875rem", color: "#166534", fontWeight: 800 }}>{INR(remaining)}</Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <Box sx={{ px: 3, py: 1.75, bgcolor: "#F8FAFC", borderTop: "1px solid #F1F5F9", display: "flex", gap: 1.5 }}>
        <Button variant="outlined" onClick={onClose} disabled={mutation.isPending}
          sx={{ flex: 1, py: 1, borderRadius: "12px", borderColor: "#E2E8F0", color: "#475569", bgcolor: "#fff", fontWeight: 700 }}>
          Cancel
        </Button>
        <Button variant="contained" disableElevation onClick={handleSubmit} disabled={!valid || mutation.isPending}
          startIcon={mutation.isPending ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon sx={{ fontSize: 20 }} />}
          sx={{
            flex: 2, py: 1, borderRadius: "12px", bgcolor: "#D2042D", color: "#fff", fontWeight: 700,
            "&:hover": { bgcolor: "#B80028" }, "&.Mui-disabled": { bgcolor: "#E2E8F0", color: "#94A3B8" },
          }}>
          {mutation.isPending ? "Saving…" : "Save Refund"}
        </Button>
      </Box>
    </Dialog>
  );
}
