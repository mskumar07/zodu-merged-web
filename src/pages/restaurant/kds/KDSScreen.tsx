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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import SoupKitchenOutlinedIcon from "@mui/icons-material/SoupKitchenOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import Lottie from "lottie-react";
import loadingAnimation from "@assets/loading.json";
import { useTenantContext } from "@store/tenantContext";
import {
  useKdsData,
  KOT_ITEM_COMPLETED,
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
        if (item.item_name === itemName && item.status !== KOT_ITEM_COMPLETED) qty += item.qty;
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
  if (t.includes("dine")) return { bg: "#FDECEA", fg: "#C62828", icon: <TableRestaurantIcon sx={{ fontSize: 22 }} /> };
  if (t.includes("take") || t.includes("pickup") || t.includes("pick-up"))
    return { bg: "#E0F2F1", fg: "#00796B", icon: <ShoppingBagIcon sx={{ fontSize: 22 }} /> };
  if (t.includes("deliver")) return { bg: "#FFF3E0", fg: "#E65100", icon: <TwoWheelerIcon sx={{ fontSize: 22 }} /> };
  return { bg: "#ECEFF1", fg: "#455A64", icon: <RestaurantIcon sx={{ fontSize: 22 }} /> };
}

/** Order-type counts for the top bar: a tinted pill per type with its icon, name and a large count. */
function OrderTypeCounts({ entries }: { entries: KdsOrderTypeSummaryEntry[] }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mr: 2 }}>
      {entries.map((entry) => {
        const visual = orderTypeVisual(entry.order_type);
        return (
          <Stack
            key={entry.order_type}
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ px: 1.75, py: 0.6, borderRadius: 2.5, bgcolor: visual.bg, color: visual.fg, whiteSpace: "nowrap" }}
          >
            {visual.icon}
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1A0004" }}>{entry.order_type}</Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{entry.order_count}</Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}

const SUMMARY_PANEL_WIDTH = 268;

interface SummaryPanelProps {
  itemSummary: KdsItemSummaryEntry[];
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
function SummaryPanel({ itemSummary, open, onToggle, onItemClick }: SummaryPanelProps) {
  const sortedItems = useMemo(
    () => [...itemSummary].sort((a, b) => b.qty - a.qty),
    [itemSummary]
  );

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
        {/* Item totals (the order-type counts live in the top bar) */}
        <Typography
          sx={{ fontSize: 11.5, fontWeight: 800, color: "#8B97A7", letterSpacing: 0.4, mb: 1 }}
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
  /** In-flight "item::order" keys, so a row's button can show busy and not double-fire. */
  pendingItemKeys: Set<string>;
  onMarkReady: (apiOrderId: string, itemName: string) => void;
  onClose: () => void;
}

/**
 * "Where is this item, and how much of it" for one item off the summary
 * rail — one row per order currently holding it, newest first, with the same
 * order-type color language as the board's own cards so a glance here maps
 * straight back to a card out on the floor. "Mark Ready" flags the item
 * completed on that order's card (struck through there) and drops the row
 * from here; the card itself stays until "Order Ready".
 */
function ItemOrdersModal({ itemName, rows, pendingItemKeys, onMarkReady, onClose }: ItemOrdersModalProps) {
  const totalQty = useMemo(() => rows.reduce((sum, r) => sum + r.qty, 0), [rows]);

  return (
    <Dialog
      open={itemName !== null}
      onClose={onClose}
      maxWidth="sm"
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
            const isBusy = itemName !== null && pendingItemKeys.has(`${row.apiOrderId}::${itemName}`);
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

                <Box
                  component="button"
                  type="button"
                  disabled={isBusy}
                  onClick={() => itemName && onMarkReady(row.apiOrderId, itemName)}
                  sx={{
                    flexShrink: 0, display: "flex", alignItems: "center", gap: 0.5,
                    height: 30, px: 1.25, borderRadius: 1.5, cursor: "pointer",
                    border: "1px solid #2E7D32", bgcolor: "#fff", color: "#2E7D32",
                    fontFamily: "inherit", fontSize: 12.5, fontWeight: 800,
                    transition: "all 0.15s",
                    "&:hover": { bgcolor: "#2E7D32", color: "#fff" },
                    "&:disabled": { opacity: 0.6, cursor: "default", pointerEvents: "none" },
                  }}
                >
                  {isBusy ? <CircularProgress size={14} color="inherit" /> : <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
                  Mark Ready
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
  /** Table or order number plus order type, printed under the KOT number. */
  heading: string;
}

/**
 * Prints one KOT slip through the browser's print dialog, so it goes to whichever printer the
 * kitchen PC has set up. Rendered into a hidden iframe: no popup to get blocked, nothing left on the board.
 */
function printKotTicket(ticket: KdsKotTicket, heading: string) {
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
  const rows = ticket.items.map((i) => `<tr><td class="q">${i.qty} x</td><td>${esc(i.item_name)}</td></tr>`).join("");
  const frame = document.createElement("iframe");
  frame.style.cssText = "position:fixed;width:0;height:0;border:0;visibility:hidden";
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  const win = frame.contentWindow;
  if (!doc || !win) { frame.remove(); return; }
  doc.open();
  doc.write(`<html><head><title>${esc(ticket.kot_no)}</title><style>
    body{font:14px monospace;margin:8px;width:280px}h1{font-size:18px;margin:0}h2{font-size:15px;margin:4px 0 8px}
    table{width:100%;border-top:1px dashed #000;border-collapse:collapse}td{padding:4px 0;border-bottom:1px dashed #000}.q{width:44px;font-weight:bold}
  </style></head><body><h1>${esc(ticket.kot_no.toUpperCase())}</h1><h2>${esc(heading)}</h2>
  <div>${esc(formatClockTime(ticket.created_at))}</div><table>${rows}</table></body></html>`);
  doc.close();
  win.onafterprint = () => frame.remove();
  win.focus();
  win.print();
}

function KotBlock({ ticket, heading }: KotBlockProps) {
  return (
    <Box sx={{ mb: 1.25, "&:last-of-type": { mb: 0 } }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.25}
        sx={{ px: 1.5, py: 1, borderRadius: 1.5, bgcolor: "#F4F6F9" }}
      >
        <SoupKitchenOutlinedIcon sx={{ fontSize: 22, color: "#1A0004" }} />
        <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#1A0004", flex: 1 }}>
          {ticket.kot_no.toUpperCase()}
        </Typography>
        <Box
          component="button"
          type="button"
          onClick={() => printKotTicket(ticket, heading)}
          sx={{
            display: "flex", alignItems: "center", gap: 0.75, px: 1.5, py: 0.6,
            border: "none", borderRadius: 1.25, bgcolor: "#E8ECF1", color: "#1A0004",
            fontSize: 14, fontWeight: 500, cursor: "pointer", "&:hover": { bgcolor: "#DCE2EA" },
          }}
        >
          <PrintOutlinedIcon sx={{ fontSize: 18 }} />
          Print
        </Box>
      </Stack>

      <Box sx={{ px: 0.5 }}>
        {ticket.items.map((item, idx) => {
          const done = item.status === KOT_ITEM_COMPLETED;
          return (
          <Stack
            key={`${item.item_id}-${idx}`}
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{
              py: 1,
              borderBottom: idx < ticket.items.length - 1 ? "1px solid #EEF1F4" : "none",
              opacity: done ? 0.55 : 1,
            }}
          >
            <Box
              sx={{
                flexShrink: 0,
                minWidth: 40,
                height: 30,
                px: 0.75,
                borderRadius: 1,
                bgcolor: done ? "#E8F5E9" : "#FDECEA",
                color: done ? "#2E7D32" : "#D32F2F",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                fontWeight: 800,
              }}
            >
              {item.qty} ×
            </Box>
            <Typography
              sx={{
                fontSize: 16, fontWeight: 500, color: "#1A0004", lineHeight: 1.35, flex: 1,
                textDecoration: done ? "line-through" : "none",
              }}
            >
              {item.item_name}
            </Typography>
            {done && <CheckCircleIcon sx={{ fontSize: 20, color: "#2E7D32", flexShrink: 0 }} />}
          </Stack>
          );
        })}
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
  const visual = orderTypeVisual(card.orderType);
  const isDineIn = card.tableNo != null;
  // Dine-In is identified by its table alone; Takeaway/Delivery by the customer-facing order number.
  const title = isDineIn ? `Table ${card.tableNo}` : (card.publicOrderNo ?? `#${card.apiOrderId.slice(0, 8)}`);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- `now` is the tick that forces this to recompute every minute
  const minutes = useMemo(() => minutesSince(card.createdAt), [card.createdAt, now]);
  const urgency = urgencyStyle(minutes);

  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: 3,
        overflow: "hidden",
        borderTop: `5px solid ${style.bg}`,
        boxShadow: "0 2px 12px rgba(15,23,42,0.08)",
        bgcolor: "#fff",
        opacity: isBusy ? 0.6 : 1,
        pointerEvents: isBusy ? "none" : "auto",
        transition: "opacity 0.2s ease",
      }}
    >
      <Box sx={{ p: 2 }}>
        {/* Header: type icon, order ref, type chip */}
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 48,
              height: 48,
              flexShrink: 0,
              borderRadius: "50%",
              bgcolor: style.bg,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {React.cloneElement(visual.icon as React.ReactElement<{ sx?: object }>, { sx: { fontSize: 24 } })}
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            {!isDineIn && <Typography sx={{ fontSize: 12.5, color: "text.secondary", lineHeight: 1.2 }}>Order ID</Typography>}
            <Typography noWrap sx={{ fontSize: 20, fontWeight: 800, color: "#1A0004", lineHeight: 1.25 }}>
              {title}
            </Typography>
          </Box>
          <Chip
            label={style.label}
            sx={{ height: 30, fontSize: 13.5, fontWeight: 600, bgcolor: visual.bg, color: visual.fg, flexShrink: 0 }}
          />
        </Stack>

        {/* Placed time + elapsed */}
        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mt: 1.5, mb: 2 }}>
          <AccessTimeIcon sx={{ fontSize: 20, color: "#586474" }} />
          <Typography sx={{ fontSize: 15, color: "#333" }}>{formatClockTime(card.createdAt)}</Typography>
          <Box sx={{ width: "1px", height: 22, bgcolor: "#E3E7EB" }} />
          <Box
            sx={{
              px: 1.25,
              py: 0.3,
              borderRadius: 5,
              bgcolor: `${urgency.color}1A`,
              color: urgency.color,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {urgency.label} ago
          </Box>
        </Stack>

        {/* One block per KOT ticket sent for this order */}
        {card.kotTickets.map((ticket) => (
          <KotBlock key={`${ticket.api_order_id}-${ticket.kot_no}`} ticket={ticket} heading={`${title} (${style.label})`} />
        ))}

        <Box
          component="button"
          onClick={onMarkReady}
          disabled={isBusy}
          sx={{
            width: "100%",
            border: "none",
            borderRadius: 1.5,
            py: 1.5,
            mt: 2,
            fontSize: 16,
            fontWeight: 700,
            cursor: isBusy ? "default" : "pointer",
            color: "#fff",
            bgcolor: "#388E3C",
            "&:hover": { bgcolor: "#2E7D32" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          {isBusy ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : <CheckCircleIcon sx={{ fontSize: 24 }} />}
          {isBusy ? "Marking Ready…" : "Order Ready"}
        </Box>
      </Box>
    </Box>
  );
}

const MASONRY_COLUMN_WIDTH = 320;
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
  // Which column each card sits in, by its React key. Only the placement is stored — the cards
  // themselves are always rendered from the current `children`, so a card whose content changes
  // (e.g. an item struck through) updates in place instead of showing a stale snapshot.
  const [placement, setPlacement] = useState<Map<React.Key, number>>(new Map());

  const recompute = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const count = Math.max(1, Math.floor((width + MASONRY_GAP) / (MASONRY_COLUMN_WIDTH + MASONRY_GAP)));
    setColumnCount(count);

    const heights = new Array(count).fill(0);
    const next = new Map<React.Key, number>();
    items.forEach((item, i) => {
      const shortest = heights.indexOf(Math.min(...heights));
      if (React.isValidElement(item) && item.key != null) next.set(item.key, shortest);
      heights[shortest] += (itemRefs.current[i]?.offsetHeight ?? 0) + MASONRY_GAP;
    });
    setPlacement(next);
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
        {Array.from({ length: columnCount }).map((_, col) => (
          <Box key={col} sx={{ display: "flex", flexDirection: "column", gap: `${MASONRY_GAP}px`, flex: 1, minWidth: 0 }}>
            {items.filter((item) => React.isValidElement(item) && (placement.get(item.key as React.Key) ?? 0) === col)}
          </Box>
        ))}
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
    pendingItemKeys,
    markItemReady,
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
        <Stack direction="row" alignItems="center">
          <OrderTypeCounts entries={orderTypeSummary} />
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
      </Stack>

      {/* Summary rail + board */}
      <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <SummaryPanel
          itemSummary={itemSummary}
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
        pendingItemKeys={pendingItemKeys}
        onMarkReady={markItemReady}
        onClose={() => setSelectedItem(null)}
      />
    </Box>
  );
}
