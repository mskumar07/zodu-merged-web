/**
 * DeleteReturnDialog.tsx
 * Permanently deletes a sales return / credit note. The delete restores stock, wipes the
 * refund payments recorded against it and puts the invoice back to its original balance,
 * so the warning spells out exactly what will happen using the row's own figures.
 * Calls DELETE /api/sale-returns/:return_uuid via deleteSaleReturn.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Button, CircularProgress, Dialog, DialogContent, Typography } from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import {
  deleteSaleReturn, apiErrorMessage, resolveNotify, salesQueryKeys,
  type Notify, type SaleListReturn,
} from "./useSaleshistory";
import { useBlockWhenReadOnly } from "@hooks/useSubscriptionGuard";

interface Props {
  invoiceId:   string;                // display id, e.g. INVV1044
  saleUuid:    string;
  ret:         SaleListReturn;
  onClose:     () => void;
  onSuccess?:  () => void;
  notify?:     Notify;
}

const INR = (v: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(v);

export default function DeleteReturnDialog({ invoiceId, saleUuid, ret, onClose, onSuccess, notify }: Props) {
  useBlockWhenReadOnly(true, onClose);
  const say = resolveNotify(notify);
  const queryClient = useQueryClient();

  const refunded = Number(ret.refunded_amount ?? 0);
  const items    = Number(ret.total_items ?? 0);
  const label    = ret.return_type === "CREDIT_NOTE" ? "credit note" : "sales return";

  const mutation = useMutation({
    mutationFn: () => deleteSaleReturn(ret.return_uuid),
    onSuccess: async (res) => {
      const reversed = Number(res.data.refund_reversed ?? 0);
      say(`${res.data.return_id} deleted` + (reversed > 0 ? ` — ${INR(reversed)} refund reversed` : ""));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sales-history"] }),
        queryClient.invalidateQueries({ queryKey: ["sales-summary"] }),
        queryClient.invalidateQueries({ queryKey: salesQueryKeys.detail(saleUuid) }),
        queryClient.invalidateQueries({ queryKey: salesQueryKeys.returns() }),
      ]);
      onSuccess?.();
      onClose();
    },
    onError: (err) => say(apiErrorMessage(err, "Failed to delete the return"), "error"),
  });

  const consequences = [
    {
      icon: <Inventory2OutlinedIcon sx={{ fontSize: 18 }} />,
      text: items > 0
        ? <>Stock of <b>{items} item{items === 1 ? "" : "s"}</b> will be taken back out of inventory.</>
        : <>The returned stock will be taken back out of inventory.</>,
    },
    ...(refunded > 0 ? [{
      icon: <PaymentsOutlinedIcon sx={{ fontSize: 18 }} />,
      text: <>Refund payments of <b>{INR(refunded)}</b> recorded against this return will be deleted. Make sure the cash is adjusted in your drawer.</>,
    }] : []),
    {
      icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 18 }} />,
      text: <>Invoice <b>{invoiceId}</b> will show its original balance again.</>,
    },
  ];

  return (
    <Dialog
      open onClose={mutation.isPending ? undefined : onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden", border: "1px solid #E2E8F0", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" } }}
    >
      <Box sx={{ px: 3, pt: 3, pb: 2, display: "flex", gap: 1.75, alignItems: "flex-start" }}>
        <Box sx={{ p: 1.1, borderRadius: "12px", bgcolor: "#FEE2E2", display: "flex", flexShrink: 0 }}>
          <WarningAmberRoundedIcon sx={{ color: "#D32F2F", fontSize: 26 }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: "1.2rem", fontWeight: 800, color: "#0F172A", lineHeight: 1.25 }}>
            Delete {ret.return_id}?
          </Typography>
          <Typography sx={{ fontSize: "0.85rem", color: "#64748B", mt: 0.4 }}>
            This {label} will be permanently removed.
          </Typography>
        </Box>
      </Box>

      <DialogContent sx={{ px: 3, pt: 0.5, pb: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, p: 2, bgcolor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "12px" }}>
          {consequences.map((c, i) => (
            <Box key={i} sx={{ display: "flex", gap: 1.25, alignItems: "flex-start", color: "#7F1D1D" }}>
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
        <Button
          variant="outlined" onClick={onClose} disabled={mutation.isPending}
          sx={{ flex: 1, py: 1.2, borderRadius: "12px", borderColor: "#E2E8F0", color: "#475569", bgcolor: "#fff", fontWeight: 700, textTransform: "none" }}
        >
          Keep it
        </Button>
        <Button
          variant="contained" disableElevation onClick={() => mutation.mutate()} disabled={mutation.isPending}
          startIcon={mutation.isPending ? <CircularProgress size={18} color="inherit" /> : undefined}
          sx={{
            flex: 1.4, py: 1.2, borderRadius: "12px", bgcolor: "#D32F2F", color: "#fff", fontWeight: 700, textTransform: "none",
            "&:hover": { bgcolor: "#B71C1C" }, "&.Mui-disabled": { bgcolor: "#E2E8F0", color: "#94A3B8" },
          }}
        >
          {mutation.isPending ? "Deleting…" : "Delete permanently"}
        </Button>
      </Box>
    </Dialog>
  );
}
