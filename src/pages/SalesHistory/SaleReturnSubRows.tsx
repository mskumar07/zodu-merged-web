/**
 * SaleReturnSubRows.tsx
 * The returns / credit notes of one invoice, rendered as regular table rows
 * directly under it in the Sales History table (same look as a sale row). Each
 * row cross-references its invoice in the ID cell, and the invoice lists its
 * return ids the same way. Cells follow the parent table's column order (by
 * key) so every value lines up under its own heading.
 */
import { memo } from "react";
import { Avatar, Box, Button, Stack, Typography, TableRow, TableCell, alpha } from "@mui/material";

// Returns show their exact amount (₹76.95, not ₹77); whole rupees show without decimals (₹299, not ₹299.00).
const INR_FMT = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 2 });
const INR = (v: number) => INR_FMT.format(v);
import type { RefundStatus, Sale, SaleListReturn } from "./useSaleshistory";
import TableActionButton from "@components/Common/TableActionButton";

interface Props {
  sale:        Sale;
  columnKeys:  string[];
  canEdit:     boolean;
  onViewReturn: (ret: SaleListReturn) => void;   // open the return detail dialog
  onViewInvoice: () => void;                     // open the original invoice
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


// Mirrors the DataTable body cell so a return row reads exactly like a sale row
// Same padding and clipping as the table's fitWidth cells, so return rows line up and never push the table wider.
const cellSx = { height: 40, padding: "5px 8px", overflow: "hidden", fontSize: "13px", color: "#374151", verticalAlign: "middle", bgcolor: "#fff" } as const;

function SaleReturnSubRows({ sale, columnKeys, canEdit, onViewReturn, onViewInvoice, onMarkRefund, onEditReturn, onDeleteReturn }: Props) {
  const returns = sale.returns ?? [];

  return (
    <>
      {returns.map((r, i) => {
        const badge   = TYPE_BADGE[r.return_type ?? "SALES_RETURN"] ?? TYPE_BADGE.SALES_RETURN;
        const refund  = r.refund_status ? REFUND_LABEL[r.refund_status] : null;
        const pending = Number(r.pending_refund ?? 0);
        const paid    = Number(r.paid_amount ?? r.refunded_amount ?? 0);
        const canPay  = r.refund_status === "PENDING" || r.refund_status === "PARTIAL";
        const owed    = canPay ? pending : 0;

        const cell = (key: string) => {
          switch (key) {
            case "sale_id":
              return (
                <Box>
                  <Box component="span" sx={{ display: "inline-block", px: 0.6, borderRadius: "4px", fontSize: 9.5, fontWeight: 700, lineHeight: "14px", letterSpacing: "0.02em", bgcolor: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                    {badge.label}
                  </Box>
                  <Typography
                    noWrap onClick={() => onViewReturn(r)}
                    sx={{ fontSize: "13px", fontWeight: 600, color: "#1976d2", cursor: "pointer", lineHeight: 1.35, "&:hover": { textDecoration: "underline" } }}
                  >
                    {r.return_id}
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#475569", lineHeight: 1.4 }}>
                    For -{" "}
                    <Box component="span" onClick={onViewInvoice} sx={{ color: "#0F766E", fontWeight: 700, cursor: "pointer", "&:hover": { color: "#115E59", textDecoration: "underline" } }}>
                      {sale.sale_id}
                    </Box>
                  </Typography>
                </Box>
              );
            case "customer": {
              const name = sale.cust_name || sale.cpy_name || "";
              return (
                <Stack direction="row" alignItems="center" gap={1}>
                  {name && (
                    <Avatar sx={{ width: 24, height: 24, fontSize: "0.65rem", bgcolor: alpha("#10B981", 0.15), color: "#10B981", fontWeight: 700 }}>
                      {name.charAt(0).toUpperCase()}
                    </Avatar>
                  )}
                  <Box>
                    {name
                      ? <Typography fontWeight={600} sx={{ fontSize: "13px", color: "#374151" }}>{name}</Typography>
                      : <Typography sx={{ fontSize: "13px", color: "#374151" }}>-</Typography>}
                    {sale.customer_mobile && <Typography sx={{ fontSize: "13px", color: "#374151" }}>{sale.customer_mobile}</Typography>}
                  </Box>
                </Stack>
              );
            }
            case "created at":
              return <Typography sx={{ fontSize: 13, color: "#374151" }}>{r.return_date_fmt ?? "—"}</Typography>;
            case "total":
              return (
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#D32F2F", textAlign: "right" }}>
                  −{INR(Number(r.return_amount))}
                </Typography>
              );
            case "payment":
              return (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0.5 }}>
                  {/* Status + the Mark Payment action; paid / still owed have their own columns */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "nowrap" }}>
                    {refund && (
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: refund.color, display: "inline-flex", alignItems: "center", gap: 0.6 }}>
                        <Box component="span" sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: refund.color }} />
                        {refund.label}
                      </Typography>
                    )}
                    {canPay && (
                      <Button
                        size="small" variant="contained" disableElevation disabled={!canEdit}
                        onClick={() => onMarkRefund(r)}
                        sx={{ fontSize: "0.65rem", py: 0.2, px: 1.25, height: 22, whiteSpace: "nowrap", textTransform: "none", fontWeight: 700 }}
                      >
                        Mark Payment
                      </Button>
                    )}
                  </Box>
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
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.3 }}>
                  <TableActionButton
                    kind="edit"
                    title={canEdit ? "Edit Return" : "You don't have permission to edit"}
                    disabled={!canEdit}
                    onClick={() => onEditReturn(r)}
                  />
                  <TableActionButton
                    kind="delete"
                    title={onDeleteReturn ? "Delete Return" : "Deleting a return is not available yet"}
                    disabled={!canEdit || !onDeleteReturn}
                    onClick={() => onDeleteReturn?.(r)}
                  />
                </Box>
              );
            default:
              return null;
          }
        };

        return (
          <TableRow key={r.return_uuid} hover sx={{ height: 40 }}>
            {columnKeys.map((key) => (
              <TableCell
                key={key}
                align={key === "total" || key === "paid_amount" || key === "balance_amount" || key === "actions" ? "right" : "left"}
                sx={cellSx}
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
