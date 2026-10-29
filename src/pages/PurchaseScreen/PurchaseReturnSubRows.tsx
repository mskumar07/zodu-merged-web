/**
 * PurchaseReturnSubRows.tsx
 * The returns / debit notes of one purchase, rendered as regular table rows directly under it in
 * the Purchase table (same look as a purchase row). Each row cross-references its purchase in the
 * ID cell, and the purchase lists its return ids the same way. Cells follow the parent table's
 * column order (by key) so every value lines up under its own heading. Same structure as the
 * sales SaleReturnSubRows.
 */
import { memo } from "react";
import { Box, Button, IconButton, Tooltip, Typography, TableRow, TableCell, alpha } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { PurchaseRefundStatus, PurchaseReturnListRow, PurchaseRow } from "./usePuchaseapi";

interface Props {
  purchase:     PurchaseRow;
  returns:      PurchaseReturnListRow[];
  columnKeys:   string[];
  canEdit:      boolean;
  onView:       (ret: PurchaseReturnListRow) => void;
  onViewPurchase: () => void;                  // open the original purchase
  onMarkRefund: (ret: PurchaseReturnListRow) => void;
  onEdit:       (ret: PurchaseReturnListRow) => void;
  onDelete:     (ret: PurchaseReturnListRow) => void;
}

const INR = (v: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(v);
const num = (v: unknown) => Number(v ?? 0) || 0;

const TYPE_BADGE = {
  PURCHASE_RETURN: { label: "Purchase Return", bg: "#FEF2F2", color: "#B91C1C", border: "#FECACA" },
  DEBIT_NOTE:      { label: "Debit Note",      bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
} as const;

const REFUND_LABEL: Record<PurchaseRefundStatus, { label: string; color: string }> = {
  PENDING:  { label: "Refund pending",      color: "#B45309" },
  PARTIAL:  { label: "Partially refunded",  color: "#C2410C" },
  REFUNDED: { label: "Refunded",            color: "#15803D" },
  NA:       { label: "Adjusted to balance", color: "#0369A1" },
};

const iconBtnSx = { color: "text.secondary", borderRadius: 1.5, p: 0.6, "&:hover": { color: "primary.main", bgcolor: alpha("#E53935", 0.06) } } as const;
// Mirrors the DataTable body cell so a return row reads exactly like a purchase row
const cellSx   = { height: 40, padding: "5px 12px", fontSize: "13px", color: "#374151", verticalAlign: "middle", bgcolor: "#fff" } as const;
const RIGHT_KEYS = new Set(["total_amount", "paid_amount", "balance_amount"]);

function PurchaseReturnSubRows({ purchase, returns, columnKeys, canEdit, onView, onViewPurchase, onMarkRefund, onEdit, onDelete }: Props) {
  return (
    <>
      {returns.map((r) => {
        const badge   = TYPE_BADGE[r.return_type] ?? TYPE_BADGE.PURCHASE_RETURN;
        const refund  = REFUND_LABEL[r.refund_status];
        const pending = num(r.pending_refund);
        const paid    = num(r.paid_amount ?? r.refunded_amount);
        const canPay  = (r.refund_status === "PENDING" || r.refund_status === "PARTIAL") && pending > 0;
        const owed    = canPay ? pending : 0;

        const cell = (key: string) => {
          switch (key) {
            case "purchase_id":
              return (
                <Box>
                  <Box component="span" sx={{ display: "inline-block", px: 0.6, borderRadius: "4px", fontSize: 9.5, fontWeight: 700, lineHeight: "14px", letterSpacing: "0.02em", bgcolor: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                    {badge.label}
                  </Box>
                  <Typography noWrap onClick={() => onView(r)}
                    sx={{ fontSize: 13, fontWeight: 700, color: "#1976d2", cursor: "pointer", lineHeight: 1.35, letterSpacing: "0.02em", "&:hover": { textDecoration: "underline" } }}>
                    {r.return_id}
                  </Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 500, color: "#475569", lineHeight: 1.4 }}>
                    For -{" "}
                    <Box component="span" onClick={onViewPurchase} sx={{ color: "#0F766E", fontWeight: 700, cursor: "pointer", "&:hover": { color: "#115E59", textDecoration: "underline" } }}>
                      {purchase.purchase_id}
                    </Box>
                  </Typography>
                </Box>
              );
            case "vendor_id":
              return (
                <Box sx={{ maxWidth: 200 }}>
                  <Typography noWrap sx={{ fontSize: 13, fontWeight: 600, color: "#374151", lineHeight: 1.3 }}>{purchase.vendor_name ?? "—"}</Typography>
                  {purchase.company_name && <Typography noWrap sx={{ fontSize: 13, color: "#374151", lineHeight: 1.3 }}>{purchase.company_name}</Typography>}
                </Box>
              );
            case "purchase_date":
              return <Typography sx={{ fontSize: 13, color: "#374151" }}>{r.return_date_fmt ?? "—"}</Typography>;
            case "total_amount":
              return <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#D32F2F", textAlign: "right" }}>−{INR(num(r.return_amount))}</Typography>;
            case "payment_status":
              return (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: refund.color, display: "inline-flex", alignItems: "center", gap: 0.6 }}>
                      <Box component="span" sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: refund.color }} />
                      {refund.label}
                    </Typography>
                    {canPay && (
                      <Button size="small" variant="contained" disableElevation disabled={!canEdit} onClick={() => onMarkRefund(r)}
                        sx={{ fontSize: "0.65rem", py: 0.2, px: 1.25, height: 22, whiteSpace: "nowrap", textTransform: "none", fontWeight: 700 }}>
                        Mark Payment
                      </Button>
                    )}
                  </Box>
                  {num(r.excess_refund) > 0 && (
                    <Typography sx={{ ml: 1.75, fontSize: 11.5, fontWeight: 700, color: "#B45309" }}>{INR(num(r.excess_refund))} refunded in excess</Typography>
                  )}
                </Box>
              );
            case "paid_amount":
              // Paid out on this return so far (green, like an invoice's Paid column)
              return <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#15803D", textAlign: "right" }}>{INR(paid)}</Typography>;
            case "balance_amount":
              // Still owed on this return (red while something is due, like an invoice's Balance)
              return <Typography sx={{ fontSize: 13, fontWeight: 700, color: owed > 0 ? "#D32F2F" : "#374151", textAlign: "right" }}>{INR(owed)}</Typography>;
            case "actions":
              return (
                <Box sx={{ display: "flex", justifyContent: "center", gap: 0.3 }}>
                  <Tooltip title={canEdit ? "Edit Return" : "You don't have permission to edit"}>
                    <span><IconButton size="small" disabled={!canEdit} onClick={() => onEdit(r)} sx={{ ...iconBtnSx, color: "#1976d2" }}><EditOutlinedIcon sx={{ fontSize: 16 }} /></IconButton></span>
                  </Tooltip>
                  <Tooltip title={canEdit ? "Delete Return" : "You don't have permission to delete"}>
                    <span><IconButton size="small" disabled={!canEdit} onClick={() => onDelete(r)} sx={{ ...iconBtnSx, color: "#D2122E", "&:hover": { bgcolor: "#D2122E22" } }}><DeleteOutlineIcon sx={{ fontSize: 16 }} /></IconButton></span>
                  </Tooltip>
                </Box>
              );
            default:
              return null;
          }
        };

        return (
          <TableRow key={r.return_uuid} hover sx={{ height: 40 }}>
            {columnKeys.map((key) => (
              <TableCell key={key} align={RIGHT_KEYS.has(key) ? "right" : key === "actions" ? "center" : "left"}
                sx={cellSx}>
                {cell(key)}
              </TableCell>
            ))}
          </TableRow>
        );
      })}
    </>
  );
}

export default memo(PurchaseReturnSubRows);
