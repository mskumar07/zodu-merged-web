import React, { memo, useCallback, useEffect, useRef } from "react";
import { Box, Skeleton, Typography } from "@mui/material";

export const fmt = (val: number | undefined) =>
  val != null
    ? `₹ ${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "₹ 0.00";

export const fmtSummary = (val: number | undefined) =>
  `₹ ${(val ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const formatDate = (value: string) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

/** Local-time YYYY-MM-DD (toISOString shifts the day for timezones ahead of UTC, e.g. IST). */
export const toLocalISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  valueColor?: string;
  loading?: boolean;
}

export const StatCard = memo(({ title, value, icon, iconBg, valueColor, loading }: StatCardProps) => (
  <Box sx={{
    bgcolor: "#fff", border: "1px solid #F1F5F9", borderRadius: "8px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)", px: 2, py: 1.5,
    display: "flex", alignItems: "center", gap: 1.5,
    minWidth: 150, flex: "0 0 auto", width: "fit-content",
  }}>
    <Box sx={{
      width: 36, height: 36, borderRadius: "8px", bgcolor: iconBg,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      {icon}
    </Box>
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography sx={{ fontSize: "11px", fontWeight: 500, color: "#64748B", whiteSpace: "nowrap" }}>
        {title}
      </Typography>
      {loading ? (
        <Skeleton width={80} height={24} sx={{ borderRadius: 1, mt: 0.5 }} />
      ) : (
        <Typography sx={{ fontSize: "1.05rem", fontWeight: 800, color: valueColor || "#0F172A", lineHeight: 1.3, whiteSpace: "nowrap" }}>
          {value}
        </Typography>
      )}
    </Box>
  </Box>
));
StatCard.displayName = "StatCard";

export function useInfiniteScroll(
  hasNextPage: boolean | undefined,
  fetchNextPage: () => void,
  isFetchingNextPage: boolean,
  scrollContainerRef: React.RefObject<HTMLDivElement | null>,
): React.RefObject<HTMLTableRowElement> {
  const sentinelRef = useRef<HTMLTableRowElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(handleObserver, {
      root: scrollContainerRef.current ?? null,
      threshold: 0.1,
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [handleObserver, scrollContainerRef]);

  return sentinelRef as React.RefObject<HTMLTableRowElement>;
}
