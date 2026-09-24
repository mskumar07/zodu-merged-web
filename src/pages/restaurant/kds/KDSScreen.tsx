/**
 * KDSScreen.tsx
 * Kitchen Display Screen — live board of pending KOT tickets, one card per
 * table/order, one block per KOT sent for that order. Tuned for at-a-glance
 * reading from a few feet away and for surfacing what's overdue first.
 *
 * Marking an order ready calls the backend directly (PUT .../kot/order-ready)
 * — there's no client-only "ready" state anymore, the server is the source
 * of truth and a ready order simply drops out of the next GET.
 */
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Box, Chip, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import Lottie from "lottie-react";
import loadingAnimation from "@assets/loading.json";
import { useTenantContext } from "@store/tenantContext";
import {
  useKdsData,
  type KdsOrderCard,
  type KdsKotTicket,
  type KdsItemSummaryEntry,
  type KdsOrderTypeSummaryEntry,
} from "./useKdsData";

// Order-type visual language — three hues spaced apart on the wheel so they
// stay distinguishable at a glance under kitchen lighting: Dine-In in brand
// red, Takeaway in teal (no more black/grey — reads as calm and food-service-
// appropriate rather than a "muted/disabled" tone), Delivery in a deep amber.
function cardHeaderStyle(orderType: string): { bg: string; label: string } {
  const t = (orderType || "").toLowerCase();
  if (t.includes("dine")) return { bg: "#D32F2F", label: "Dine-In" };
  if (t.includes("take") || t.includes("pickup") || t.includes("pick-up")) return { bg: "#00796B", label: "Takeaway" };
  if (t.includes("deliver")) return { bg: "#E65100", label: "Delivery" };
  return { bg: "#455A64", label: orderType || "Order" };
}

/** One order (of possibly several) that currently has a given item pending. */
export interface ItemOrderBreakdownRow {
  apiOrderId: string;
  tableNo: string | null;
  orderType: string;
  qty: number;
  createdAt: string;
  legacyOrderRef: string | null;
  publicOrderNo: string | null;
}

/**
 * Every order currently holding at least one pending unit of `itemName`,
 * newest-first — built by scanning each card's own KOT tickets once
 * (O(cards × tickets × items), the same shape the board already renders) and
 * summing qty per order rather than per ticket, since a table can send the
 * same item across two KOTs. Called once per click, not memoized itself: the
 * board only has a few dozen cards at most, so this is cheap enough to redo
 * on demand and never has to be invalidated when cards refresh.
 */
function buildItemOrderBreakdown(cards: KdsOrderCard[], itemName: string): ItemOrderBreakdownRow[] {
  const rows: ItemOrderBreakdownRow[] = [];
  for (const card of cards) {
    let qty = 0;
    for (const ticket of card.kotTickets) {
      for (const item of ticket.items) {
        if (item.item_name === itemName) qty += item.qty;
      }
    }
    if (qty > 0) {
      rows.push({
        apiOrderId: card.apiOrderId,
        tableNo: card.tableNo,
        orderType: card.orderType,
        qty,
        createdAt: card.createdAt,
        legacyOrderRef: card.legacyOrderRef,
        publicOrderNo: card.publicOrderNo,
      });
    }
  }
  return rows.sort((a, b) => (minutesSince(b.createdAt) ?? 0) - (minutesSince(a.createdAt) ?? 0));
}

function formatClockTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function minutesSince(iso: string): number | null {
  const placed = new Date(iso).getTime();
  if (Number.isNaN(placed)) return null;
  return Math.max(0, Math.floor((Date.now() - placed) / 60000));
}

function formatElapsed(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  }
  const d = Math.floor(minutes / 1440);
  const h = Math.floor((minutes % 1440) / 60);
  const m = minutes % 60;
  if (h === 0 && m === 0) return `${d}d`;
  if (m === 0) return `${d}d ${h}h`;
  return `${d}d ${h}h ${m}m`;
}

// Urgency thresholds tuned for typical kitchen SLAs: fresh (calm green),
// running long (amber, worth a glance), overdue (red, needs attention now).
function urgencyStyle(minutes: number | null): { color: string; label: string } {
  if (minutes === null) return { color: "#586474", label: "—" };
  if (minutes < 10) return { color: "#1B5E20", label: formatElapsed(minutes) };
  if (minutes < 20) return { color: "#B45309", label: formatElapsed(minutes) };
  return { color: "#B71C1C", label: formatElapsed(minutes) };
}

// Order-type summary chips reuse the same color language as the card headers
// so the counts read as "the same Dine-In/Takeaway/Delivery" at a glance.
function orderTypeVisual(orderType: string): { bg: string; fg: string; icon: React.ReactNode } {
  const t = (orderType || "").toLowerCase();
  if (t.includes("dine")) return { bg: "#FDECEA", fg: "#C62828", icon: <TableRestaurantIcon sx={{ fontSize: 15 }} /> };
  if (t.includes("take") || t.includes("pickup") || t.includes("pick-up"))
    return { bg: "#ECEFF1", fg: "#1C1C1E", icon: <ShoppingBagIcon sx={{ fontSize: 15 }} /> };
  if (t.includes("deliver")) return { bg: "#FFF3E0", fg: "#B45309", icon: <TwoWheelerIcon sx={{ fontSize: 15 }} /> };
  return { bg: "#ECEFF1", fg: "#455A64", icon: <RestaurantIcon sx={{ fontSize: 15 }} /> };
}

const SUMMARY_PANEL_WIDTH = 268;

interface SummaryPanelProps {
  itemSummary: KdsItemSummaryEntry[];
  orderTypeSummary: KdsOrderTypeSummaryEntry[];
  open: boolean;
  onToggle: () => void;
  onItemClick: (itemName: string) => void;
}

/**
 * Left rail: kitchen-wide item totals and order-type counts across every
 * pending ticket on the board — "how many Mushroom do I need in total right
 * now", not per-order. Collapsible so it never has to compete with tickets
 * for space on a small screen; collapsed state persists per-browser only
 * (a reload defaults back open), matching the rest of the board's
 * no-server-state-for-UI-prefs approach.
 */
function SummaryPanel({ itemSummary, orderTypeSummary, open, onToggle, onItemClick }: SummaryPanelProps) {
  const sortedItems = useMemo(
    () => [...itemSummary].sort((a, b) => b.qty - a.qty),
    [itemSummary]
  );
  const totalOrders = orderTypeSummary.reduce((sum, e) => sum + e.order_count, 0);

  if (!open) {
    return (
      <Box
        sx={{
          width: 40,
          flexShrink: 0,
          borderRight: "1px solid #E3E7EB",
          bgcolor: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: 1.5,
        }}
      >
        <Tooltip title="Show order summary" placement="right">
          <IconButton size="small" onClick={onToggle} sx={{ border: "1px solid #E3E7EB" }}>
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: SUMMARY_PANEL_WIDTH,
        flexShrink: 0,
        borderRight: "1px solid #E3E7EB",
        bgcolor: "#fff",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 1.75, py: 1.25, borderBottom: "1px solid #EEF1F4" }}
      >
        <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#1A0004", letterSpacing: 0.2 }}>
          Order Summary
        </Typography>
        <Tooltip title="Hide summary">
          <IconButton size="small" onClick={onToggle}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Box sx={{ flex: 1, overflowY: "auto", px: 1.75, py: 1.5 }}>
        {/* Order-type counts */}
        <Stack spacing={1}>
          {orderTypeSummary.map((entry) => {
            const visual = orderTypeVisual(entry.order_type);
            return (
              <Stack
                key={entry.order_type}
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  px: 1,
                  py: 0.75,
                  borderRadius: 1.25,
                  bgcolor: visual.bg,
                  color: visual.fg,
                }}
              >
                {visual.icon}
                <Typography sx={{ fontSize: 15, fontWeight: 700, flex: 1 }}>{entry.order_type}</Typography>
                <Typography sx={{ fontSize: 15.5, fontWeight: 800 }}>{entry.order_count}</Typography>
              </Stack>
            );
          })}
          {orderTypeSummary.length === 0 && (
            <Typography sx={{ fontSize: 12, color: "text.disabled" }}>No active orders</Typography>
          )}
        </Stack>

        {totalOrders > 0 && (
          <Typography sx={{ fontSize: 11, color: "text.disabled", mt: 0.75, textAlign: "right" }}>
            {totalOrders} order{totalOrders === 1 ? "" : "s"} total
          </Typography>
        )}

        {/* Item totals */}
        <Typography
          sx={{ fontSize: 11.5, fontWeight: 800, color: "#8B97A7", letterSpacing: 0.4, mt: 2, mb: 1 }}
        >
          ITEMS PENDING
        </Typography>
        <Stack spacing={0.1}>
          {sortedItems.map((entry) => (
            <Stack
              key={entry.item_name}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              onClick={() => onItemClick(entry.item_name)}
              sx={{
                py: 0.7,
                px: 0.5,
                mx: -0.5,
                borderRadius: 1,
                borderBottom: "1px solid #F3F5F7",
                cursor: "pointer",
                transition: "background-color 0.12s",
                "&:hover": { bgcolor: "#FAFBFC" },
              }}
            >
              <Typography sx={{ fontSize: 16, color: "#333", fontWeight: 500, pr: 1 }}>
                {entry.item_name}
              </Typography>
              <Box
                sx={{
                  flexShrink: 0,
                  minWidth: 26,
                  height: 23,
                  px: 0.6,
                  borderRadius: 0.75,
                  bgcolor: "#FDECEA",
                  color: "#C62828",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13.5,
                  fontWeight: 800,
                }}
              >
                {entry.qty}
              </Box>
            </Stack>
          ))}
          {sortedItems.length === 0 && (
            <Typography sx={{ fontSize: 12, color: "text.disabled" }}>Nothing pending</Typography>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

interface ItemOrdersModalProps {
  itemName: string | null;
  rows: ItemOrderBreakdownRow[];
  onClose: () => void;
}

/**
 * "Where is this item, and how much of it" for one item off the summary
 * rail — one row per order currently holding it, newest first, with the same
 * order-type color language as the board's own cards so a glance here maps
 * straight back to a card out on the floor.
 */
function ItemOrdersModal({ itemName, rows, onClose }: ItemOrdersModalProps) {
  const totalQty = useMemo(() => rows.reduce((sum, r) => sum + r.qty, 0), [rows]);

  return (
    <Dialog
      open={itemName !== null}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: "14px" } }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={700} lineHeight={1.2}>{itemName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {totalQty} pending across {rows.length} order{rows.length === 1 ? "" : "s"}
          </Typography>
        </Box>
        <Box
          onClick={onClose}
          sx={{ cursor: "pointer", color: "#9ca3af", "&:hover": { color: "#374151" }, p: 0.5 }}
        >
          <CloseIcon fontSize="small" />  
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pb: 2.5 }}>
        <Stack spacing={1}>
          {rows.map((row) => {
            const style = cardHeaderStyle(row.orderType);
            const minutes = minutesSince(row.createdAt);
            const isDineIn = row.tableNo != null;
            // Dine-In is identified by its table — the legacy order ref rides
            // along as a secondary reference. Takeaway/Delivery have no table,
            // so the human-readable public order number (what the customer's
            // own receipt/SMS shows) takes the primary spot instead of the
            // raw UUID, falling back to a shortened one only if it's missing.
            const title = isDineIn
              ? `Table ${row.tableNo}`
              : `Order ID - ${row.publicOrderNo ?? row.apiOrderId.slice(0, 8)}`;
            // A Dine-In order is identified by its table number alone — the legacy
            // order ref no longer rides along. Takeaway/Delivery already show their
            // order number in the title above.
            const subtitle = null;
            return (
              <Stack
                key={row.apiOrderId}
                direction="row"
                alignItems="center"
                spacing={1.25}
                sx={{
                  px: 1.25,
                  py: 1,
                  borderRadius: 1.5,
                  border: "1px solid #ECEFF1",
                }}
              >
                <Box
                  sx={{
                    flexShrink: 0,
                    px: 1,
                    py: 0.4,
                    borderRadius: 1,
                    bgcolor: style.bg,
                    color: "#fff",
                    fontSize: 11.5,
                    fontWeight: 800,
                    letterSpacing: 0.2,
                  }}
                >
                  {style.label}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: "#1A0004", lineHeight: 1.3 }} noWrap>
                    {title}
                    {subtitle && (
                      <Typography component="span" sx={{ fontSize: 12.5, fontWeight: 700, color: "#586474" }}>
                        {" "}· {subtitle}
                      </Typography>
                    )}
                  </Typography>
                  <Typography sx={{ fontSize: 11.5, color: "text.disabled" }} noWrap>
                    {minutes !== null ? `${formatElapsed(minutes)} ago` : "—"}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    flexShrink: 0,
                    minWidth: 34,
                    height: 26,
                    px: 0.75,
                    borderRadius: 1,
                    bgcolor: "#FDECEA",
                    color: "#C62828",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 800,
                  }}
                >
                  {row.qty} x
                </Box>
              </Stack>
            );
          })}
          {rows.length === 0 && (
            <Typography sx={{ fontSize: 13, color: "text.disabled", textAlign: "center", py: 2 }}>
              No pending orders for this item
            </Typography>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

interface KotBlockProps {
  ticket: KdsKotTicket;
}

function KotBlock({ ticket }: KotBlockProps) {
  return (
    <Box
      sx={{
        borderRadius: 1.5,
        border: "1.5px solid #ECEFF1",
        bgcolor: "#fff",
        p: 1.4,
        mb: 1.1,
        "&:last-of-type": { mb: 0 },
      }}
    >
      <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#8B97A7", letterSpacing: 0.4, mb: 0.9 }}>
        {ticket.kot_no.toUpperCase()}
      </Typography>

      <Box>
        {ticket.items.map((item, idx) => (
          <Stack
            key={`${item.item_id}-${idx}`}
            direction="row"
            alignItems="flex-start"
            spacing={1}
            sx={{
              py: 0.65,
              borderBottom: idx < ticket.items.length - 1 ? "1px dashed #E3E7EB" : "none",
            }}
          >
            <Box
              sx={{
                flexShrink: 0,
                minWidth: 32,
                height: 22,
                px: 0.6,
                borderRadius: 0.75,
                bgcolor: "#FDECEA",
                color: "#C62828",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12.5,
                fontWeight: 800,
              }}
            >
              {item.qty} x
            </Box>
            <Typography sx={{ fontSize: 14.5, fontWeight: 600, color: "#1A0004", lineHeight: 1.35 }}>
              {item.item_name}
            </Typography>
          </Stack>
        ))}
      </Box>
    </Box>
  );
}

interface OrderCardProps {
  card: KdsOrderCard;
  isBusy: boolean;
  onMarkReady: () => void;
  now: number;
}

function OrderCard({ card, isBusy, onMarkReady, now }: OrderCardProps) {
  const style = cardHeaderStyle(card.orderType);
  const isDineIn = card.tableNo != null;
  // Dine-In's headline is just its table — the order ref no longer rides
  // along. Takeaway/Delivery have no table — the type name is already on the
  // chip badge to the right, so the headline here is the customer-facing
  // public order number instead of repeating the type.
  const title = isDineIn ? `Table ${card.tableNo}` : null;
  const orderRef = isDineIn ? null : (card.publicOrderNo ?? `#${card.apiOrderId.slice(0, 8)}`);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- `now` is the tick that forces this to recompute every minute
  const minutes = useMemo(() => minutesSince(card.createdAt), [card.createdAt, now]);
  const urgency = urgencyStyle(minutes);

  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(15,23,42,0.1)",
        bgcolor: "#fff",
        opacity: isBusy ? 0.6 : 1,
        pointerEvents: isBusy ? "none" : "auto",
        transition: "opacity 0.2s ease",
      }}
    >
      {/* Header */}
      <Box sx={{ bgcolor: style.bg, color: "#fff", px: 1.6, py: 1.1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="baseline" spacing={0.75} sx={{ minWidth: 0 }}>
            {title && (
              <Typography sx={{ fontWeight: 800, fontSize: 17, letterSpacing: 0.2, flexShrink: 0 }}>
                {title}
              </Typography>
            )}
            {orderRef && (
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: title ? 14 : 17,
                  letterSpacing: title ? "normal" : 0.2,
                  opacity: title ? 0.92 : 1,
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                noWrap
              >
                {title ? `· ${orderRef}` : `Order ID - ${orderRef}`}
              </Typography>
            )}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.6} sx={{ flexShrink: 0 }}>
            <Chip
              label={style.label}
              size="small"
              sx={{
                height: 21,
                fontSize: 10.5,
                fontWeight: 800,
                bgcolor: "rgba(255,255,255,0.22)",
                color: "#fff",
              }}
            />
          </Stack>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.6 }}>
          <AccessTimeIcon sx={{ fontSize: 13, opacity: 0.9 }} />
          <Typography sx={{ fontSize: 11.5, opacity: 0.92, fontWeight: 500 }}>
            {formatClockTime(card.createdAt)}
          </Typography>
          <Box
            sx={{
              ml: "auto",
              px: 0.9,
              py: 0.15,
              borderRadius: 5,
              bgcolor: "rgba(255,255,255,0.9)",
              color: urgency.color,
              fontSize: 11.5,
              fontWeight: 800,
              lineHeight: 1.6,
            }}
          >
            {urgency.label} ago
          </Box>
        </Stack>
      </Box>

      {/* Body: one block per KOT ticket sent for this order */}
      <Box sx={{ p: 1.4, bgcolor: "#FAFBFC" }}>
        {card.kotTickets.map((ticket) => (
          <KotBlock key={`${ticket.api_order_id}-${ticket.kot_no}`} ticket={ticket} />
        ))}

        <Box
          component="button"
          onClick={onMarkReady}
          disabled={isBusy}
          sx={{
            width: "100%",
            border: "none",
            borderRadius: 1,
            py: 1,
            mt: 1.1,
            fontSize: 13.5,
            fontWeight: 800,
            letterSpacing: 0.2,
            cursor: isBusy ? "default" : "pointer",
            color: "#fff",
            bgcolor: "#43A047",
            "&:hover": { bgcolor: "#2E7D32" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.75,
          }}
        >
          {isBusy ? <CircularProgress size={15} sx={{ color: "#fff" }} /> : null}
          {isBusy ? "Marking Ready…" : "Order Ready"}
        </Box>
      </Box>
    </Box>
  );
}

const MASONRY_COLUMN_WIDTH = 260;
const MASONRY_GAP = 12;

/**
 * True masonry: each card is placed into whichever column is currently
 * shortest, the way Pinterest/Trello-style boards pack. CSS multi-column
 * (`column-count`/`columns`) instead fills one column completely before
 * starting the next, which leaves a tall empty gap in the last column
 * whenever the card count doesn't divide evenly — this avoids that.
 */
function MasonryBoard({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const items = React.Children.toArray(children);
  const [columnCount, setColumnCount] = useState(1);
  const [columns, setColumns] = useState<React.ReactNode[][]>([]);

  const recompute = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const count = Math.max(1, Math.floor((width + MASONRY_GAP) / (MASONRY_COLUMN_WIDTH + MASONRY_GAP)));
    setColumnCount(count);

    const heights = new Array(count).fill(0);
    const buckets: React.ReactNode[][] = Array.from({ length: count }, () => []);
    items.forEach((item, i) => {
      const shortest = heights.indexOf(Math.min(...heights));
      buckets[shortest].push(item);
      heights[shortest] += (itemRefs.current[i]?.offsetHeight ?? 0) + MASONRY_GAP;
    });
    setColumns(buckets);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- children identity changes every render; length + a resize/content trigger below is what actually matters
  }, [items.length]);

  // Measure every card off-screen first (one per column-width column so
  // heights match what they'll render at), then distribute — a card's
  // height depends on its item count, which we can't know without a render.
  useLayoutEffect(() => {
    recompute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, recompute]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => recompute());
    observer.observe(container);
    return () => observer.disconnect();
  }, [recompute]);

  return (
    <Box ref={containerRef} sx={{ width: "100%" }}>
      {/* Hidden measuring pass — renders every card once at the target column
          width so we can read real heights before deciding column placement. */}
      <Box sx={{ position: "absolute", visibility: "hidden", pointerEvents: "none", width: MASONRY_COLUMN_WIDTH }}>
        {items.map((item, i) => (
          <div key={i} ref={(el) => { itemRefs.current[i] = el; }}>
            {item}
          </div>
        ))}
      </Box>

      <Box sx={{ display: "flex", gap: `${MASONRY_GAP}px`, alignItems: "flex-start" }}>
        {columns.map((col, i) => (
          <Box key={i} sx={{ display: "flex", flexDirection: "column", gap: `${MASONRY_GAP}px`, flex: 1, minWidth: 0 }}>
            {col}
          </Box>
        ))}
        {columns.length === 0 &&
          Array.from({ length: columnCount }).map((_, i) => <Box key={i} sx={{ flex: 1 }} />)}
      </Box>
    </Box>
  );
}

export default function KDSScreen() {
  const theme = useTheme();
  const { branchId, zoduId } = useTenantContext();
  const {
    cards,
    itemSummary,
    orderTypeSummary,
    isLoading,
    isFetching,
    pendingOrderIds,
    markOrderReady,
    refreshNow,
  } = useKdsData(zoduId ?? "", branchId ?? "");

  const [summaryOpen, setSummaryOpen] = useState(true);

  // The item clicked in the summary rail, if any — drives the breakdown
  // modal below. Kept as just the name (not the rows) so the modal always
  // reads the latest cards on every render rather than a snapshot from
  // click time; the breakdown itself is cheap enough to rebuild each time.
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Drives the elapsed-time badges — ticks every 30s so "Xm ago" and the
  // urgency color stay accurate without a full data refetch.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const sortedCards = useMemo(() => {
    // Oldest / most-overdue orders lead the board so nothing quietly ages out of view.
    return [...cards].sort((a, b) => (minutesSince(b.createdAt) ?? 0) - (minutesSince(a.createdAt) ?? 0));
  }, [cards]);

  const selectedItemRows = useMemo(
    () => (selectedItem ? buildItemOrderBreakdown(cards, selectedItem) : []),
    [cards, selectedItem]
  );

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <Box sx={{ width: 160 }}>
          <Lottie animationData={loadingAnimation} loop autoplay />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "#EEF1F4" }}>
      {/* Top bar */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 3,
          py: 1.5,
          bgcolor: "#fff",
          borderBottom: `1px solid ${theme.palette.divider}`,
          position: "sticky",
          top: 0,
          zIndex: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1.5,
              bgcolor: theme.palette.primary.main,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RestaurantIcon sx={{ color: "#fff", fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 19, lineHeight: 1.15 }}>Kitchen Display</Typography>
            <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 500 }}>
              Live order board — auto-refreshing
            </Typography>
          </Box>
          <Chip
            label={`${cards.length} pending`}
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: 12.5,
              height: 26,
              ml: 1.5,
              bgcolor: cards.length > 0 ? "#FDECEA" : theme.palette.background.light,
              color: cards.length > 0 ? "#C62828" : "text.secondary",
            }}
          />
        </Stack>
        <Tooltip title="Refresh now">
          <IconButton
            size="small"
            onClick={refreshNow}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              animation: isFetching ? "kds-spin 0.9s linear infinite" : "none",
              "@keyframes kds-spin": { to: { transform: "rotate(360deg)" } },
            }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Summary rail + board */}
      <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <SummaryPanel
          itemSummary={itemSummary}
          orderTypeSummary={orderTypeSummary}
          open={summaryOpen}
          onToggle={() => setSummaryOpen((v) => !v)}
          onItemClick={setSelectedItem}
        />

        <Box sx={{ flex: 1, overflow: "auto", p: 2.5 }}>
          {sortedCards.length === 0 ? (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <Stack alignItems="center" spacing={1}>
                <RestaurantIcon sx={{ fontSize: 40, color: "text.disabled" }} />
                <Typography sx={{ color: "text.disabled", fontWeight: 500 }}>
                  No active orders right now
                </Typography>
              </Stack>
            </Box>
          ) : (
            <MasonryBoard>
              {sortedCards.map((card) => (
                <OrderCard
                  key={card.apiOrderId}
                  card={card}
                  isBusy={pendingOrderIds.has(card.apiOrderId)}
                  onMarkReady={() => markOrderReady(card.apiOrderId)}
                  now={now}
                />
              ))}
            </MasonryBoard>
          )}
        </Box>
      </Box>

      <ItemOrdersModal
        itemName={selectedItem}
        rows={selectedItemRows}
        onClose={() => setSelectedItem(null)}
      />
    </Box>
  );
}
