import { Box, CircularProgress, Typography } from "@mui/material";

/**
 * Footer shown at the end of an infinitely scrolling list: a spinner while the
 * next page is being fetched, and a "No more data" note once every page is in.
 * Renders nothing while more pages remain but none is loading yet.
 */
export default function InfiniteScrollStatus({
  loading,
  done,
}: {
  loading?: boolean;
  done?: boolean;
}) {
  if (!loading && !done) return null;
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, py: 1.25 }}>
      {loading ? (
        <>
          <CircularProgress size={16} sx={{ color: "#D32F2F" }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Loading more items…
          </Typography>
        </>
      ) : (
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          No more data
        </Typography>
      )}
    </Box>
  );
}
