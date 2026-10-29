import {
  Dialog,
  Box,
  Typography,
  IconButton
} from "@mui/material";
import { useState, useMemo, useRef, useEffect, useCallback, type ReactElement } from "react";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import { useStockHistory, type StockHistoryItem } from "./useInventoryapi";
import DataTable, { type ColumnDef } from "@utils/DataTable";

const PAGE_SIZE = 30;
const MONTH_NAMES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

// Static lookups live outside the component so they aren't rebuilt on every render.
const TYPE_CONFIG: Record<string, { color: string; bg: string; icon: ReactElement | null }> = {
  purchase: { color: "#16a34a", bg: "#ecfdf5", icon: <AddCircleIcon sx={{ fontSize: 14 }} /> },
  sale: { color: "#dc2626", bg: "#fef2f2", icon: <RemoveCircleIcon sx={{ fontSize: 14 }} /> },
  wastage: { color: "#ea580c", bg: "#fff7ed", icon: <DeleteIcon sx={{ fontSize: 14 }} /> },
  return: { color: "#2563eb", bg: "#eff6ff", icon: <KeyboardReturnIcon sx={{ fontSize: 14 }} /> }
};
const DEFAULT_TYPE_CONFIG = { color: "#6b7280", bg: "#f3f4f6", icon: null };

const getTypeConfig = (type?: string) => TYPE_CONFIG[type?.toLowerCase() ?? ""] ?? DEFAULT_TYPE_CONFIG;

const getInitials = (name: string = "") =>
  name.split(" ").slice(0, 2).map((word) => word[0]).join("").toUpperCase();

// YYYY-MM-DD -> "29-JUL-2026"
const formatDateDisplay = (dateString: string): string => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  if (!year || !month || !day) return "";
  return `${day}-${MONTH_NAMES[Number(month) - 1]}-${year}`;
};

// The API already sends "01 May 2026, 10:03 AM" — split it instead of re-parsing a Date per cell.
const splitCreatedAt = (value?: string): [string, string] => {
  if (!value) return ["-", ""];
  const i = value.indexOf(",");
  return i === -1 ? [value, ""] : [value.slice(0, i).trim(), value.slice(i + 1).trim()];
};

const COLUMNS: ColumnDef<StockHistoryItem>[] = [
  {
    label: "Date & Time",
    key: "date",
    width: "2.2fr",
    render: (r) => {
      const [date, time] = splitCreatedAt(r.created_at);
      return (
        <Box>
          <Typography fontSize={13} fontWeight={600}>{date}</Typography>
          <Typography fontSize={11} color="#9CA3AF">{time}</Typography>
        </Box>
      );
    }
  },
  {
    label: "Type",
    key: "type",
    width: "1.3fr",
    align: "left",
    render: (r) => {
      const type = getTypeConfig(r.transaction_type);
      return (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            px: 1,
            py: "2px",
            borderRadius: "999px",
            fontSize: 10,
            fontWeight: 700,
            bgcolor: type.bg,
            color: type.color,
            width: "fit-content"
          }}
        >
          {type.icon}
          {r.transaction_type?.toUpperCase()}
        </Box>
      );
    }
  },
  { label: "Reference ID", key: "reference", width: "2fr", render: (r) => r.reference_id || "-" },
  {
    label: "Qty Change",
    key: "qty",
    width: "1.3fr",
    align: "right",
    render: (r) => {
      const qty = Number(r.qty_change);
      return (
        <Typography sx={{ color: qty > 0 ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
          {qty > 0 ? "+" : ""}
          {qty.toFixed(2)}
        </Typography>
      );
    }
  },
  { label: "Final Stock", key: "final", width: "1fr", align: "right", render: (r) => Number(r.stock_after).toFixed(2) }
];

const rowKey = (r: StockHistoryItem) => r.ledger_id;

const dateBoxSx = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: 0.6,
  minWidth: 130,
  height: 33,
  px: 1.25,
  borderRadius: 1.5,
  border: "1px solid #E5E7EB",
  bgcolor: "#fff",
  cursor: "pointer",
  "&:hover": { borderColor: "#C8102E" }
} as const;

const hiddenDateInputStyle = { position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 } as const;

export default function StockHistoryModal({ open, onClose, item }: any) {
  const itemUuid: string | null = item?.item_uuid ?? null;

  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const fromDateInputRef = useRef<HTMLInputElement>(null);
  const toDateInputRef = useRef<HTMLInputElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const sentinelRef = useRef<HTMLTableRowElement>(null) as React.RefObject<HTMLTableRowElement>;

  // The modal stays mounted between items — start each one with no filters.
  useEffect(() => {
    setFromDate("");
    setToDate("");
  }, [itemUuid]);

  // Filtering is done by the server; no request while the dialog is closed.
  const { data, isLoading, isFetching, hasNextPage, isFetchingNextPage, fetchNextPage } = useStockHistory(
    open ? itemUuid : null,
    { limit: PAGE_SIZE, from_date: fromDate, to_date: toDate }
  );

  // Page 1 carries the item and summary; every page contributes its rows.
  const firstPage = data?.pages[0];
  const currentStock = firstPage?.summary?.current_stock ?? 0;
  const itemDetails = firstPage?.item || item;
  const rows = useMemo(() => data?.pages.flatMap((p) => (Array.isArray(p.data) ? p.data : [])) ?? [], [data]);
  const total = firstPage?.pagination?.total ?? rows.length;
  const hasActiveFilters = !!(fromDate || toDate);

  // Load the next page when the sentinel under the last row scrolls into view.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { root: tableContainerRef.current }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, rows.length]);

  const handleFromChange = useCallback((val: string) => {
    setFromDate(val);
    setToDate((prev) => (prev && val > prev ? "" : prev));
  }, []);

  const handleToChange = useCallback((val: string) => {
    setToDate(val);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFromDate("");
    setToDate("");
  }, []);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <Box sx={{ borderRadius: 3, overflow: "hidden" }}>
        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
            py: 1,
            borderBottom: "1px solid #E5E7EB"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ p: 0.8, bgcolor: "rgba(210,31,60,0.08)", borderRadius: 2, display: "flex" }}>
              <InventoryOutlinedIcon sx={{ color: "#D21F3C", fontSize: 20 }} />
            </Box>
            <Typography fontWeight={700} fontSize={16}>
              Inventory Details
            </Typography>
          </Box>

          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* CONTENT */}
        <Box sx={{ p: 3 }}>
          {/* TOP */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: 2,
                  border: "1px solid #E5E7EB",
                  bgcolor: "#F3F4F6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {itemDetails?.item_img || item?.image ? (
                  <img
                    src={itemDetails?.item_img || item?.image}
                    alt={itemDetails?.item_name}
                    width={70}
                    height={70}
                    decoding="async"
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
                  />
                ) : (
                  <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
                    {getInitials(itemDetails?.item_name)}
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#b91c1c", bgcolor: "#fef2f2", px: 1, py: "2px", borderRadius: "6px", display: "inline-block", mb: 0.5 }}>
                  SKU: {itemDetails?.item_id}
                </Typography>
                <Typography sx={{ fontSize: 22, fontWeight: 800 }}>
                  {itemDetails?.item_name}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Box
                  onClick={() => { fromDateInputRef.current?.showPicker?.(); fromDateInputRef.current?.focus(); }}
                  sx={dateBoxSx}
                >
                  <CalendarTodayIcon sx={{ fontSize: 14, color: "#6B7280" }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: fromDate ? "#111827" : "#94A3B8" }}>
                    {fromDate ? formatDateDisplay(fromDate) : "Select date"}
                  </Typography>
                  <input
                    ref={fromDateInputRef}
                    type="date"
                    value={fromDate}
                    max={toDate || undefined}
                    onChange={(e) => handleFromChange(e.target.value)}
                    style={hiddenDateInputStyle}
                  />
                </Box>

                <Typography>to</Typography>
                <Box
                  onClick={() => { toDateInputRef.current?.showPicker?.(); toDateInputRef.current?.focus(); }}
                  sx={dateBoxSx}
                >
                  <CalendarTodayIcon sx={{ fontSize: 14, color: "#6B7280" }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: toDate ? "#111827" : "#94A3B8" }}>
                    {toDate ? formatDateDisplay(toDate) : "Select date"}
                  </Typography>
                  <input
                    ref={toDateInputRef}
                    type="date"
                    value={toDate}
                    min={fromDate || undefined}
                    onChange={(e) => handleToChange(e.target.value)}
                    style={hiddenDateInputStyle}
                  />
                </Box>

                {hasActiveFilters && (
                  <Box onClick={handleResetFilters} sx={{ cursor: "pointer" }}>
                    <CloseIcon fontSize="small" color="primary" />
                  </Box>
                )}
              </Box>

              <Box
                sx={{
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                  px: 3,
                  py: 1
                }}
              >
                <Typography sx={{ fontSize: 10 }}>
                  CURRENT STOCK
                </Typography>
                <Typography sx={{ fontSize: 22, fontWeight: 800 }}>
                  {Number(currentStock).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* TABLE */}
          <DataTable
            columns={COLUMNS}
            rows={rows}
            rowKey={rowKey}
            isLoading={isLoading}
            emptyMessage={hasActiveFilters ? "No records match the selected dates" : "No stock movements yet"}
            maxHeight={400}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            loadMoreRef={sentinelRef}
            tableContainerRef={tableContainerRef}
          />

          {total > 0 && (
            <Typography sx={{ fontSize: 12, color: "#6B7280", mt: 1.5, opacity: isFetching && !isFetchingNextPage ? 0.6 : 1 }}>
              Showing {rows.length} of {total} record{total === 1 ? "" : "s"}
            </Typography>
          )}
        </Box>
      </Box>
    </Dialog>
  );
}
