// Built on the project's shared DataTable (same look as Purchase / Sales History).
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip, Typography } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DataTable from "@utils/DataTable";
import type { ColumnDef } from "@utils/DataTable";
import type { AccountingEntry, TransactionType } from "./types";
import { fmtAmount, fmtDate, fmtTime } from "./format";

// ─── Static config (module scope: nothing is re-created per render) ───────────
const TYPE_STYLE: Record<TransactionType, { bg: string; color: string; border: string }> = {
  "Sales":           { bg: "#DCFCE7", color: "#15803D", border: "#BBF7D0" },
  "Payment":         { bg: "#DBEAFE", color: "#1D4ED8", border: "#BFDBFE" },
  "Purchase":        { bg: "#FFE4E6", color: "#BE123C", border: "#FECDD3" },
  "Expense":         { bg: "#FEF3C7", color: "#B45309", border: "#FDE68A" },
  "Receipt":         { bg: "#E0F2FE", color: "#0369A1", border: "#BAE6FD" },
  "Sales Return":    { bg: "#DCFCE7", color: "#15803D", border: "#BBF7D0" },
  "Purchase Return": { bg: "#FFE4E6", color: "#BE123C", border: "#FECDD3" },
  "Credit Note":     { bg: "#F3E8FF", color: "#7E22CE", border: "#E9D5FF" },
  "Debit Note":      { bg: "#FFEDD5", color: "#C2410C", border: "#FED7AA" },
};

const BODY = "13px";
const TEXT = "#374151";
const dash = <Box component="span" sx={{ color: "#9CA3AF" }}>-</Box>;

// ─── Table ────────────────────────────────────────────────────────────────────
interface Props {
  rows:      AccountingEntry[];
  loading?:  boolean;
  /** Infinite scroll: reaching the end of the loaded rows calls `onLoadMore`. */
  hasNextPage?:        boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  emptyMessage?: string;
  onView?:   (e: AccountingEntry) => void;
  onEdit?:   (e: AccountingEntry) => void;
  onDelete?: (e: AccountingEntry) => void;
}

const rowKey = (e: AccountingEntry) => e.id;

function AccountingTable({
  rows, loading, hasNextPage, isFetchingNextPage, onLoadMore, emptyMessage = "No transactions found.", onView, onEdit, onDelete,
}: Props) {
  const [menu, setMenu] = useState<{ el: HTMLElement; entry: AccountingEntry } | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLTableRowElement | null>(null);

  // The sentinel row sits under the last loaded row; scrolling it into view loads the next page.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !onLoadMore) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && hasNextPage && !isFetchingNextPage) onLoadMore(); },
      { root: tableContainerRef.current, rootMargin: "120px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore, rows.length]);

  // "#" is the row's position in the list
  const closeMenu = useCallback(() => setMenu(null), []);

  const columns = useMemo<ColumnDef<AccountingEntry>[]>(() => {
    const text = (v: string) => <Typography sx={{ fontSize: BODY, color: TEXT, whiteSpace: "nowrap" }}>{v}</Typography>;

    return [
      {
        key: "date_time", label: "Date & Time", width: 140,
        render: (e) => (
          <Box>
            <Typography sx={{ fontSize: BODY, color: TEXT, lineHeight: 1.3, whiteSpace: "nowrap" }}>{fmtDate(e.date_time)}</Typography>
            <Typography sx={{ fontSize: 12, color: "#6B7280", lineHeight: 1.3 }}>{fmtTime(e.date_time)}</Typography>
          </Box>
        ),
      },
      {
        key: "type", label: "Transaction Type", width: 170,
        render: (e) => {
          const t = TYPE_STYLE[e.type];
          return (
            <Box component="span" sx={{ display: "inline-block", px: 1.25, py: "2px", borderRadius: "6px", fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap", bgcolor: t.bg, color: t.color, border: `1px solid ${t.border}` }}>
              {e.type}
            </Box>
          );
        },
      },
      { key: "reference",    label: "Reference No.",    width: 190, render: (e) => text(e.reference) },
      { key: "party",        label: "Account / Party",      width: 200, render: (e) => text(e.party) },
      { key: "payment_type", label: "Payment Type",  width: 150, render: (e) => text(e.payment_type) },
      { key: "debit",  label: "Debit (₹)",   align: "right", width: 130, render: (e) => (e.debit  != null ? text(fmtAmount(e.debit))  : dash) },
      { key: "credit", label: "Credit (₹)", align: "right", width: 130, render: (e) => (e.credit != null ? text(fmtAmount(e.credit)) : dash) },
      { key: "balance", label: "Balance (₹)", align: "right", width: 150, render: (e) => text(`${fmtAmount(e.balance)} ${e.balance_side}`) },
      {
        key: "actions", label: "Actions", align: "center", width: 110,
        render: (e) => (
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
            <Tooltip title="View">
              <IconButton size="small" aria-label="View" onClick={() => onView?.(e)} sx={{ color: "#6B7280", p: 0.6 }}>
                <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
            <IconButton size="small" aria-label="More actions" onClick={(ev) => setMenu({ el: ev.currentTarget, entry: e })} sx={{ color: "#6B7280", p: 0.6 }}>
              <MoreVertIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Box>
        ),
      },
    ];
  }, [onView]);

  return (
    <>
      <DataTable<AccountingEntry>
        columns={columns}
        rows={rows}
        rowKey={rowKey}
        isLoading={loading}
        skeletonRows={10}
        hasNextPage={!!hasNextPage}
        isFetchingNextPage={!!isFetchingNextPage}
        loadMoreRef={sentinelRef}
        tableContainerRef={tableContainerRef}
        maxHeight="100%"
        emptyMessage={emptyMessage}
      />

      {/* One menu for the whole table, not one per row */}
      <Menu anchorEl={menu?.el} open={!!menu} onClose={closeMenu} slotProps={{ paper: { sx: { minWidth: 150, borderRadius: "10px", mt: 0.5 } } }}>
        <MenuItem onClick={() => { if (menu) onEdit?.(menu.entry); closeMenu(); }}>
          <ListItemIcon><EditOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Edit" />
        </MenuItem>
        <MenuItem onClick={() => { if (menu) onDelete?.(menu.entry); closeMenu(); }} sx={{ color: "#D32F2F" }}>
          <ListItemIcon sx={{ color: "inherit" }}><DeleteOutlineIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>
    </>
  );
}

export default memo(AccountingTable);
