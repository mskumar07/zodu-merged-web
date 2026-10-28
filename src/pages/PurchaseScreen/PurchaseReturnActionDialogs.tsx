/**
 * PurchaseReturnActionDialogs.tsx
 * The two small write dialogs on a purchase return, same look as their sales counterparts:
 *   MarkPurchaseRefundDialog  — record money received back from the vendor (partial or full)
 *   DeletePurchaseReturnDialog — reverse the return completely (stock goes back in)
 */
import PaymentModeSelect from "../../components/Common/PaymentModeSelect";
import { useState } from "react";
import {
  Box, Button, CircularProgress, Dialog, DialogContent, IconButton, InputAdornment,
  TextField, Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PaymentsIcon from "@mui/icons-material/Payments";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import type { PurchaseReturnListRow } from "./usePuchaseapi";
import {
  PURCHASE_REFUND_MODES, purchaseApiError, useDeletePurchaseReturn, useMarkPurchaseReturnRefund,
} from "./usePurchaseReturnApi";
import type { Notify } from "./PurchaseReturnDialog";
import { localDateStr } from "@utils/localDate";

const num = (v: unknown) => Number(v ?? 0) || 0;
const INR = (v: number) => `₹${v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const todayStr = () => localDateStr();
const kindLabel = (t: string) => (t === "DEBIT_NOTE" ? "Debit Note" : "Purchase Return");

const paperSx = { borderRadius: "16px", overflow: "hidden", border: "1px solid #E2E8F0", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" } as const;

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

/** The fields the list row and the detail dialog both carry. */
export type RefundTarget = Pick<PurchaseReturnListRow, "return_uuid" | "return_id" | "return_type" | "refund_due" | "refunded_amount" | "pending_refund"> & {
  /** Shown under the return ID so the cashier knows who the money is coming from. */
  vendorName?: string | null;
  /** The original purchase's date (YYYY-MM-DD) — a refund can't be dated before it. */
  minDate?: string;
};

// ── Mark Refund ───────────────────────────────────────────────
export function MarkPurchaseRefundDialog({ ret, onClose, notify }: { ret: RefundTarget; onClose: () => void; notify: Notify }) {
  const pending = num(ret.pending_refund ?? num(ret.refund_due) - num(ret.refunded_amount));

  const [amount, setAmount]       = useState(String(pending));
  const [mode, setMode]           = useState<string>(PURCHASE_REFUND_MODES[0]);
  const [reference, setReference] = useState("");
  const [date, setDate]           = useState(todayStr());

  const mutation  = useMarkPurchaseReturnRefund(ret.return_uuid);
  const value     = parseFloat(amount);
  const valid     = value > 0 && value <= pending + 0.001;
  const remaining = Math.max(0, pending - (value || 0));

  const submit = async () => {
    if (!valid || mutation.isPending) return;
    try {
      const res = await mutation.mutateAsync({
        refund_amount: value, payment_mode: mode,
        ...(reference.trim() && { reference_no: reference.trim() }),
        ...(date && { refund_date: date }),
      });
      notify(res.refund_status === "REFUNDED" ? "Refund completed" : `Refund recorded — ${INR(num(res.pending_refund))} still pending`);
      onClose();
    } catch (err) {
      notify(purchaseApiError(err, "Failed to record refund"), "error");
    }
  };

  return (
    <Dialog open onClose={mutation.isPending ? undefined : onClose} maxWidth="xs" fullWidth PaperProps={{ sx: paperSx }}>
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
              <Typography sx={captionSx}>{kindLabel(ret.return_type)}</Typography>
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#0F172A" }}>{ret.return_id}</Typography>
              {ret.vendorName && <Typography sx={{ fontSize: "0.75rem", fontWeight: 500, color: "#64748B" }}>{ret.vendorName}</Typography>}
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={captionSx}>Pending from supplier</Typography>
              <Typography sx={{ fontSize: "1.125rem", fontWeight: 700, color: "#D2042D" }}>{INR(pending)}</Typography>
            </Box>
          </Box>

          <Box>
            <FieldLabel>Amount Received</FieldLabel>
            <TextField
              size="small" fullWidth type="number" value={amount} error={!!amount && !valid}
              helperText={!!amount && !valid ? `Enter an amount up to ${INR(pending)}` : undefined}
              onChange={(e) => setAmount(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Typography sx={{ fontWeight: 700, color: "#64748B" }}>₹</Typography></InputAdornment>,
                inputProps: { style: { fontWeight: 700 }, min: 0, max: pending, step: "0.01" },
              }}
              sx={inputSx}
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            <Box>
              <FieldLabel>Payment Mode</FieldLabel>
              <PaymentModeSelect options={PURCHASE_REFUND_MODES} size="small" fullWidth value={mode} onChange={(e) => setMode(e.target.value)} sx={{ borderRadius: "12px", fontSize: "0.875rem" }} />
            </Box>
            <Box>
              <FieldLabel>Refund Date</FieldLabel>
              <TextField size="small" fullWidth type="date" value={date} onChange={(e) => setDate(e.target.value)} inputProps={{ min: ret.minDate }} sx={inputSx} />
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
        <Button variant="contained" disableElevation onClick={submit} disabled={!valid || mutation.isPending}
          startIcon={mutation.isPending ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon sx={{ fontSize: 20 }} />}
          sx={{ flex: 2, py: 1, borderRadius: "12px", bgcolor: "#D2042D", color: "#fff", fontWeight: 700, "&:hover": { bgcolor: "#B80028" }, "&.Mui-disabled": { bgcolor: "#E2E8F0", color: "#94A3B8" } }}>
          {mutation.isPending ? "Saving…" : "Save Refund"}
        </Button>
      </Box>
    </Dialog>
  );
}

// ── Delete ────────────────────────────────────────────────────
export function DeletePurchaseReturnDialog({ purchaseId, ret, onClose, notify }: {
  purchaseId: string; ret: PurchaseReturnListRow; onClose: () => void; notify: Notify;
}) {
  const mutation = useDeletePurchaseReturn();
  const refunded = num(ret.refunded_amount);
  const label    = kindLabel(ret.return_type).toLowerCase();

  const consequences = [
    { icon: <Inventory2OutlinedIcon sx={{ fontSize: 18 }} />, text: <>The returned stock will be <b>put back into inventory</b>.</> },
    ...(refunded > 0 ? [{
      icon: <PaymentsOutlinedIcon sx={{ fontSize: 18 }} />,
      text: <>Refund records of <b>{INR(refunded)}</b> received from the supplier will be deleted. Make sure your cash book is adjusted.</>,
    }] : []),
    { icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 18 }} />, text: <>Purchase <b>{purchaseId}</b> will show its payment status and balance without this return.</> },
  ];

  const confirm = async () => {
    try {
      const res = await mutation.mutateAsync(ret.return_uuid);
      notify(`${res.return_id} deleted` + (num(res.refund_reversed) > 0 ? ` — ${INR(num(res.refund_reversed))} refund reversed` : ""));
      onClose();
    } catch (err) {
      notify(purchaseApiError(err, "Failed to delete the return"), "error");
    }
  };

  return (
    <Dialog open onClose={mutation.isPending ? undefined : onClose} maxWidth="xs" fullWidth PaperProps={{ sx: paperSx }}>
      <Box sx={{ px: 3, pt: 3, pb: 2, display: "flex", gap: 1.75, alignItems: "flex-start" }}>
        <Box sx={{ p: 1.1, borderRadius: "12px", bgcolor: "#FEE2E2", display: "flex", flexShrink: 0 }}>
          <WarningAmberRoundedIcon sx={{ color: "#D32F2F", fontSize: 26 }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: "1.2rem", fontWeight: 800, color: "#0F172A", lineHeight: 1.25 }}>Delete {ret.return_id}?</Typography>
          <Typography sx={{ fontSize: "0.85rem", color: "#64748B", mt: 0.4 }}>This {label} will be permanently removed.</Typography>
        </Box>
      </Box>

      <DialogContent sx={{ px: 3, pt: 0.5, pb: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, p: 2, bgcolor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "12px" }}>
          {consequences.map((c, i) => (
            <Box key={i} sx={{ display: "flex", gap: 1.25, alignItems: "flex-start" }}>
              <Box sx={{ mt: "1px", display: "flex", color: "#DC2626" }}>{c.icon}</Box>
              <Typography sx={{ fontSize: "0.85rem", lineHeight: 1.5, color: "#7F1D1D" }}>{c.text}</Typography>
            </Box>
          ))}
        </Box>
        <Typography sx={{ mt: 1.75, fontSize: "0.85rem", fontWeight: 800, color: "#B91C1C", textAlign: "center", letterSpacing: "0.02em" }}>
          This cannot be undone.
        </Typography>
      </DialogContent>

      <Box sx={{ px: 3, py: 2.25, bgcolor: "#F8FAFC", borderTop: "1px solid #F1F5F9", display: "flex", gap: 1.5 }}>
        <Button variant="outlined" onClick={onClose} disabled={mutation.isPending}
          sx={{ flex: 1, py: 1.2, borderRadius: "12px", borderColor: "#E2E8F0", color: "#475569", bgcolor: "#fff", fontWeight: 700 }}>
          Keep it
        </Button>
        <Button variant="contained" disableElevation onClick={confirm} disabled={mutation.isPending}
          startIcon={mutation.isPending ? <CircularProgress size={18} color="inherit" /> : undefined}
          sx={{ flex: 1.4, py: 1.2, borderRadius: "12px", bgcolor: "#D32F2F", color: "#fff", fontWeight: 700, "&:hover": { bgcolor: "#B71C1C" }, "&.Mui-disabled": { bgcolor: "#E2E8F0", color: "#94A3B8" } }}>
          {mutation.isPending ? "Deleting…" : "Delete permanently"}
        </Button>
      </Box>
    </Dialog>
  );
}
