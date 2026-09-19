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
import { Box, Chip, CircularProgress, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import RefreshIcon from "@mui/icons-material/Refresh";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import Lottie from "lottie-react";
import loadingAnimation from "@assets/loading.json";
import { useTenantContext } from "@store/tenantContext";
import { useKdsData, type KdsOrderCard, type KdsKotTicket } from "./useKdsData";

// Order-type visual language — Dine-In in brand red, Takeaway in near-black,
// Delivery in amber/orange.
function cardHeaderStyle(orderType: string): { bg: string; label: string } {
  const t = (orderType || "").toLowerCase();
  if (t.includes("dine")) return { bg: "#D32F2F", label: "Dine-In" };
  if (t.includes("take") || t.includes("pickup") || t.includes("pick-up")) return { bg: "#1C1C1E", label: "Takeaway" };
  if (t.includes("deliver")) return { bg: "#EF6C00", label: "Delivery" };
  return { bg: "#455A64", label: orderType || "Order" };
}

function formatClockTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function shortOrderId(apiOrderId: string): string {
  return apiOrderId.split("-")[0] || apiOrderId;
}

function minutesSince(iso: string): number | null {
  const placed = new Date(iso).getTime();
  if (Number.isNaN(placed)) return null;
  return Math.max(0, Math.floor((Date.now() - placed) / 60000));
}

function formatElapsed(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// Urgency thresholds tuned for typical kitchen SLAs: fresh (calm green),
// running long (amber, worth a glance), overdue (red, needs attention now).
function urgencyStyle(minutes: number | null): { color: string; label: string } {
  if (minutes === null) return { color: "#586474", label: "—" };
  if (minutes < 10) return { color: "#1B5E20", label: formatElapsed(minutes) };
  if (minutes < 20) return { color: "#B45309", label: formatElapsed(minutes) };
  return { color: "#B71C1C", label: formatElapsed(minutes) };
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
              {item.qty}x
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
  const title = card.tableNo ? `Table ${card.tableNo}` : "Takeaway";

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
          <Typography sx={{ fontWeight: 800, fontSize: 17, letterSpacing: 0.2 }}>{title}</Typography>
          <Stack direction="row" alignItems="center" spacing={0.6}>
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
          <Typography sx={{ fontSize: 11.5, opacity: 0.75 }}>#{shortOrderId(card.apiOrderId)}</Typography>
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
  const { cards, isLoading, isFetching, pendingOrderIds, markOrderReady, refreshNow } = useKdsData(
    zoduId ?? "",
    branchId ?? ""
  );

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

      {/* Board */}
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
  );
}
