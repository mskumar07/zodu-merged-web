/**
 * SaleReturnSubRows.tsx
 * The returns / credit notes of one invoice, rendered as child rows directly
 * under it in the Sales History table. Cells follow the parent table's column
 * order (by key) so every value lines up under its own heading.
 */
import { memo } from "react";
import { Box, Button, IconButton, Tooltip, Typography, TableRow, TableCell, alpha } from "@mui/material";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";

// Same whole-rupee format as the parent table, so amounts read consistently.
const INR = (v: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Math.round(v));
import type { RefundStatus, Sale, SaleListReturn } from "./useSaleshistory";

interface Props {
  sale:        Sale;
  columnKeys:  string[];
  canEdit:     boolean;
  onOpen:      () => void;                       // open the invoice detail
  onMarkRefund: (ret: SaleListReturn) => void;
  onEditReturn: (ret: SaleListReturn) => void;   // reopen the return dialog on this return
  onDeleteReturn?: (ret: SaleListReturn) => void; // not provided until the backend supports it
}

const TYPE_BADGE = {
  SALES_RETURN: { label: "Sales Return", bg: "#FEF2F2", color: "#B91C1C", border: "#FECACA" },
  CREDIT_NOTE:  { label: "Credit Note",  bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
} as const;

const REFUND_LABEL: Record<RefundStatus, { label: string; color: string }> = {
  PENDING:  { label: "Refund pending",     color: "#B45309" },
  PARTIAL:  { label: "Partially refunded", color: "#C2410C" },
  REFUNDED: { label: "Refunded",           color: "#15803D" },
  NA:       { label: "Adjusted to balance", color: "#0369A1" },
};

const REASON_LABEL: Record<string, string> = {
  damaged: "Damaged on arrival",
  wrong:   "Wrong item sent",
  choice:  "Customer choice",
  other:   "Other",
};

const iconBtnSx = { color: "text.secondary", borderRadius: 1.5, "&:hover": { color: "primary.main", bgcolor: alpha("#E53935", 0.06) } } as const;

const cellSx = { py: 0.9, px: 1.5, bgcolor: "#F9FAFB", borderBottom: "1px solid #EEF0F3", fontSize: "13px" } as const;

function SaleReturnSubRows({ sale, columnKeys, canEdit, onOpen, onMarkRefund, onEditReturn, onDeleteReturn }: Props) {
  const returns = sale.returns ?? [];

  return (
    <>
      {returns.map((r, i) => {
        const badge   = TYPE_BADGE[r.return_type ?? "SALES_RETURN"] ?? TYPE_BADGE.SALES_RETURN;
        const refund  = r.refund_status ? REFUND_LABEL[r.refund_status] : null;
        const pending = Number(r.pending_refund ?? 0);
        const canPay  = r.refund_status === "PENDING" || r.refund_status === "PARTIAL";
        const reason  = r.return_reason ? REASON_LABEL[r.return_reason] ?? r.return_reason : null;
        const isLast  = i === returns.length - 1;

        const cell = (key: string) => {
          switch (key) {
            case "sale_id":
              return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, pl: 2.5 }}>
                  <SubdirectoryArrowRightIcon sx={{ fontSize: 15, color: "#CBD5E1", flexShrink: 0 }} />
                  <Typography
                    noWrap onClick={onOpen}
                    sx={{ fontSize: 12, fontWeight: 600, color: "#1976d2", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                  >
                    {r.return_id}
                  </Typography>
                </Box>
              );
            case "customer":
              return (
                <Box>
                  <Box component="span" sx={{ display: "inline-block", px: 1, py: "1px", borderRadius: "6px", fontSize: 11, fontWeight: 700, bgcolor: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                    {badge.label}
                  </Box>
                  {reason && <Typography sx={{ fontSize: 11.5, color: "#6B7280", mt: 0.3 }}>{reason}</Typography>}
                </Box>
              );
            case "created at":
              return <Typography sx={{ fontSize: 12, color: "#64748B" }}>{r.return_date_fmt ?? "—"}</Typography>;
            case "total":
              return (
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#D32F2F", textAlign: "right" }}>
                  −{INR(Number(r.return_amount))}
                </Typography>
              );
            case "payment":
              return (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0.5 }}>
                  {/* Row 1: status + the Mark Refund action */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
                    {refund && (
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: refund.color, display: "inline-flex", alignItems: "center", gap: 0.6 }}>
                        <Box component="span" sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: refund.color }} />
                        {r.refund_status === "PARTIAL" ? `Partly refunded ${INR(Number(r.refunded_amount ?? 0))}` : refund.label}
                      </Typography>
                    )}
                    {canPay && (
                      <Button
                        size="small" variant="contained" disableElevation disabled={!canEdit}
                        onClick={() => onMarkRefund(r)}
                        sx={{ fontSize: "0.65rem", py: 0.2, px: 1.25, height: 22, whiteSpace: "nowrap", textTransform: "none", fontWeight: 700 }}
                      >
                        Mark Refund
                      </Button>
                    )}
                  </Box>
                  {/* Row 2: what is still owed */}
                  {canPay && pending > 0 && (
                    <Typography sx={{ ml: 1.75, px: 1, py: "1px", borderRadius: "6px", fontSize: 11.5, fontWeight: 700, color: "#92400E", bgcolor: "#FEF3C7", border: "1px solid #FDE68A" }}>
                      {INR(pending)} pending
                    </Typography>
                  )}
                </Box>
              );
            case "actions":
              return (
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.3 }}>
                  <Tooltip title={canEdit ? "Edit return" : "You don't have permission to edit"}>
                    <span>
                      <IconButton size="small" disabled={!canEdit} onClick={() => onEditReturn(r)} sx={iconBtnSx}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4 2 4-2 4 2z" />
                        </svg>
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={onDeleteReturn ? "Delete return" : "Deleting a return is not available yet"}>
                    <span>
                      <IconButton size="small" disabled={!canEdit || !onDeleteReturn} onClick={() => onDeleteReturn?.(r)}
                        sx={{ ...iconBtnSx, "&:hover": { color: "#C62828", bgcolor: alpha("#C62828", 0.06) } }}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </IconButton>
                    </span>
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
              <TableCell
                key={key}
                align={key === "total" || key === "paid_amount" || key === "balance_amount" || key === "actions" ? "right" : "left"}
                sx={{ ...cellSx, ...(isLast ? {} : { borderBottomStyle: "dashed" }) }}
              >
                {cell(key)}
              </TableCell>
            ))}
          </TableRow>
        );
      })}
    </>
  );
}

export default memo(SaleReturnSubRows);
