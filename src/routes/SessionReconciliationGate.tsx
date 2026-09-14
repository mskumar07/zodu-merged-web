import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useReconcilePersistedSession } from "@hooks/useReconcilePersistedSession";

/**
 * Holds the authenticated app back while a restored session's permissions are
 * being re-fetched, and offers a retry if that fetch fails.
 *
 * It only blocks when there is nothing trustworthy to render behind: a session
 * whose cache was written by the current schema version renders immediately
 * and refreshes in the background.
 */
export default function SessionReconciliationGate({ children }: { children: ReactNode }) {
  const { blocking, failed, retry } = useReconcilePersistedSession();

  if (!blocking) return <>{children}</>;

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        px: 3,
        textAlign: "center",
      }}
    >
      {failed ? (
        <>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(200,16,31,0.08)",
              color: "#c8101f",
            }}
          >
            <LockOutlinedIcon />
          </Box>
          <Typography sx={{ fontSize: 17, fontWeight: 800, color: "#151822" }}>
            Couldn&apos;t load your permissions
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: "#8f93a3", maxWidth: 420 }}>
            You are still signed in, but we could not confirm what you have access to.
            Check your connection and try again.
          </Typography>
          <Button
            variant="contained"
            onClick={retry}
            sx={{ mt: 0.5, px: 3, borderRadius: "8px", bgcolor: "#c8101f", "&:hover": { bgcolor: "#a80d19" } }}
          >
            Try again
          </Button>
        </>
      ) : (
        <>
          <CircularProgress size={26} sx={{ color: "#c8101f" }} />
          <Typography sx={{ fontSize: 13.5, color: "#8f93a3" }}>
            Updating your access…
          </Typography>
        </>
      )}
    </Box>
  );
}
