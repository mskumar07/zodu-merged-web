import { useEffect, type ReactNode } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useReconcilePersistedSession } from "@hooks/useReconcilePersistedSession";
import { useSignOut } from "@hooks/useSignOut";

/**
 * Holds the authenticated app back while a restored session's permissions are
 * being re-fetched. If that fetch fails, the access token can't be trusted to
 * say what the user may do, so the local session is cleared and the user is
 * sent back to the login page.
 *
 * It only blocks when there is nothing trustworthy to render behind: a session
 * whose cache was written by the current schema version renders immediately
 * and refreshes in the background.
 */
export default function SessionReconciliationGate({ children }: { children: ReactNode }) {
  const { blocking, failed } = useReconcilePersistedSession();
  const signOut = useSignOut();

  useEffect(() => {
    if (failed) void signOut();
  }, [failed, signOut]);

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
      <CircularProgress size={26} sx={{ color: "#c8101f" }} />
      <Typography sx={{ fontSize: 13.5, color: "#8f93a3" }}>
        {failed ? "Signing you out…" : "Updating your access…"}
      </Typography>
    </Box>
  );
}
