import { memo, useCallback, useState } from "react";
import { Box, alpha } from "@mui/material";

interface ItemThumbProps {
  /** Photo URL; empty or missing shows the item's initial instead. */
  src?: string | null;
  /** Item name, for the initial and the alt text. */
  name?: string | null;
  /** Square size in px. */
  size?: number;
  /**
   * "lazy" (default) defers rows below the fold until they scroll near view;
   * "eager" for a single photo that is on screen as soon as it renders.
   */
  loading?: "lazy" | "eager";
  /** Corner radius in px. */
  radius?: number;
}

/**
 * A product photo in a list row.
 *
 * The <img> is in the page from the first render, sized up front so the row never
 * shifts, with `loading="lazy"` so only rows near the viewport download and
 * `decoding="async"` so decoding stays off the main thread while a long list
 * scrolls. It fades in over a neutral placeholder once loaded. No photo, or one
 * that fails to load, falls back to the item's initial on a soft green tile of the
 * same size and shape.
 */
function ItemThumb({ src, name, size = 40, loading = "lazy", radius = 6 }: ItemThumbProps) {
  const initial = name?.trim()?.[0]?.toUpperCase() ?? "";
  // Keyed by URL: a row that changes photo starts over at "not loaded".
  const [failed, setFailed] = useState<string | null>(null);

  if (!src || failed === src) {
    // Same square, size and corners as a photo, so rows with and without one line up.
    return (
      <Box
        aria-label={name ?? undefined}
        sx={{
          width: size, height: size, flexShrink: 0,
          borderRadius: `${radius}px`, border: "1px solid", borderColor: alpha("#10B981", 0.25),
          bgcolor: alpha("#10B981", 0.12), color: "#10B981",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: Math.round(size * 0.4), fontWeight: 700, lineHeight: 1, userSelect: "none",
        }}
      >
        {initial}
      </Box>
    );
  }

  return (
    <Photo key={src} src={src} name={name} size={size} loading={loading} radius={radius} onError={() => setFailed(src)} />
  );
}

function Photo({ src, name, size, loading, radius, onError }: Required<Pick<ItemThumbProps, "size" | "loading" | "radius">> & {
  src: string;
  name?: string | null;
  onError: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  // An image already in the browser's cache can finish before React attaches onLoad.
  const ref = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, []);

  return (
    <Box
      sx={{
        width: size, height: size, flexShrink: 0, overflow: "hidden",
        borderRadius: `${radius}px`, border: "1px solid", borderColor: "divider", bgcolor: "#F3F4F6",
      }}
    >
      <img
        ref={ref}
        src={src}
        alt={name ?? ""}
        width={size}
        height={size}
        loading={loading}
        decoding="async"
        draggable={false}
        onLoad={() => setLoaded(true)}
        onError={onError}
        style={{
          display: "block", width: "100%", height: "100%", objectFit: "cover",
          opacity: loaded ? 1 : 0, transition: "opacity 150ms ease-out",
        }}
      />
    </Box>
  );
}

export default memo(ItemThumb);
