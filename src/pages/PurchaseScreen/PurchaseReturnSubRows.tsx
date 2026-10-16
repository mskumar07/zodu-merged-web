/**
 * PurchaseReturnSubRows.tsx
 * The returns / debit notes of one purchase, rendered as child rows directly under it in the
 * Purchase table. Cells follow the parent table's column order (by key) so every value lines up
 * under its own heading. Same structure as the sales SaleReturnSubRows.
 */
import { memo } from "react";
import { Box, Button, IconButton, Tooltip, Typography, TableRow, TableCell, alpha } from "@mui/material";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { PurchaseRefundStatus, PurchaseReturnListRow } from "./usePuchaseapi";

interface Props {
  returns:      PurchaseReturnListRow[];
  columnKeys:   string[];
  canEdit:      boolean;
  onView:       (ret: PurchaseReturnListRow) => void;
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
const cellSx   = { py: 0.9, px: 1.5, bgcolor: "#F9FAFB", borderBottom: "1px solid #EEF0F3", fontSize: "13px" } as const;
const RIGHT_KEYS = new Set(["total_amount", "paid_amount", "balance_amount"]);

function PurchaseReturnSubRows({ returns, columnKeys, canEdit, onView, onMarkRefund, onEdit, onDelete }: Props) {
  return (
    <>
      {returns.map((r, i) => {
        const badge   = TYPE_BADGE[r.return_type] ?? TYPE_BADGE.PURCHASE_RETURN;
        const refund  = REFUND_LABEL[r.refund_status];
        const pending = num(r.pending_refund);
        const canPay  = (r.refund_status === "PENDING" || r.refund_status === "PARTIAL") && pending > 0;
        const isLast  = i === returns.length - 1;

        const cell = (key: string) => {
          switch (key) {
            case "purchase_id":
              return (
                // Arrow sits under the parent's chevron; the ID never truncates
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, pl: 0.5 }}>
                  <SubdirectoryArrowRightIcon sx={{ fontSize: 15, color: "#CBD5E1", flexShrink: 0 }} />
                  <Typography onClick={() => onView(r)}
                    sx={{ fontSize: 12, fontWeight: 600, color: "#1976d2", cursor: "pointer", whiteSpace: "nowrap", "&:hover": { textDecoration: "underline" } }}>
                    {r.return_id}
                  </Typography>
                </Box>
              );
            case "vendor_id":
              return (
                <Box>
                  <Box component="span" sx={{ display: "inline-block", px: 1, py: "1px", borderRadius: "6px", fontSize: 11, fontWeight: 700, bgcolor: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                    {badge.label}
                  </Box>
                  {r.return_reason && <Typography noWrap sx={{ fontSize: 11.5, color: "#6B7280", mt: 0.3 }}>{r.return_reason}</Typography>}
                </Box>
              );
            case "purchase_date":
              return <Typography sx={{ fontSize: 12, color: "#64748B" }}>{r.return_date_fmt ?? "—"}</Typography>;
            case "total_amount":
              return <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#D32F2F", textAlign: "right" }}>−{INR(num(r.return_amount))}</Typography>;
            case "payment_status":
              return (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: refund.color, display: "inline-flex", alignItems: "center", gap: 0.6 }}>
                      <Box component="span" sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: refund.color }} />
                      {r.refund_status === "PARTIAL" ? `Partly refunded ${INR(num(r.refunded_amount))}` : refund.label}
                    </Typography>
                    {canPay && (
                      <Button size="small" variant="contained" disableElevation disabled={!canEdit} onClick={() => onMarkRefund(r)}
                        sx={{ fontSize: "0.65rem", py: 0.2, px: 1.25, height: 22, whiteSpace: "nowrap", textTransform: "none", fontWeight: 700 }}>
                        Mark Refund
                      </Button>
                    )}
                  </Box>
                  {canPay && (
                    <Typography sx={{ ml: 1.75, px: 1, py: "1px", borderRadius: "6px", fontSize: 11.5, fontWeight: 700, color: "#92400E", bgcolor: "#FEF3C7", border: "1px solid #FDE68A" }}>
                      {INR(pending)} pending
                    </Typography>
                  )}
                  {num(r.excess_refund) > 0 && (
                    <Typography sx={{ ml: 1.75, fontSize: 11.5, fontWeight: 700, color: "#B45309" }}>{INR(num(r.excess_refund))} refunded in excess</Typography>
                  )}
                </Box>
              );
            case "actions":
              return (
                <Box sx={{ display: "flex", justifyContent: "center", gap: 0.3 }}>
                  <Tooltip title={canEdit ? "Edit return" : "You don't have permission to edit"}>
                    <span><IconButton size="small" disabled={!canEdit} onClick={() => onEdit(r)} sx={{ ...iconBtnSx, color: "#1976d2" }}><EditOutlinedIcon sx={{ fontSize: 16 }} /></IconButton></span>
                  </Tooltip>
                  <Tooltip title={canEdit ? "Delete return" : "You don't have permission to delete"}>
                    <span><IconButton size="small" disabled={!canEdit} onClick={() => onDelete(r)} sx={{ ...iconBtnSx, color: "#D2122E", "&:hover": { bgcolor: "#D2122E22" } }}><DeleteOutlineIcon sx={{ fontSize: 16 }} /></IconButton></span>
                  </Tooltip>
                </Box>
              );
            default:
              return null;
          }
        };

        return (
          <TableRow key={r.return_uuid} sx={{ "& td:first-of-type": { boxShadow: "inset 3px 0 0 #FCA5A5" } }}>
            {columnKeys.map((key) => (
              <TableCell key={key} align={RIGHT_KEYS.has(key) ? "right" : key === "actions" ? "center" : "left"}
                sx={{ ...cellSx, ...(isLast ? {} : { borderBottomStyle: "dashed" }) }}>
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
