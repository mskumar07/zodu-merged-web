import { Box, Button, Snackbar, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useAppUpdate } from "@utils/appUpdate";

/**
 * The visible half of the deploy watcher.
 *
 * Most of the time this renders nothing: when a new build lands and the screen
 * holds no unsaved work, `useAppUpdate` reloads straight onto it and the user
 * sees an ordinary page load. The banner is the fallback for the case where a
 * silent reload would destroy something — a half-built cart, most obviously —
 * so the user chooses when to take the update.
 */
export default function AppUpdateBanner() {
  const { updateAvailable, blockedByUnsavedWork, reload } = useAppUpdate();

  if (!updateAvailable) return null;

  return (
    <Snackbar
      open
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{ zIndex: 1000000 }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: 2,
          py: 1.25,
          borderRadius: 2,
          bgcolor: "#111827",
          color: "#fff",
          boxShadow: "0 12px 32px rgba(15,23,42,0.35)",
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>
            A new version of Zodu is available
          </Typography>
          <Typography sx={{ fontSize: 11.5, color: "#9CA3AF" }}>
            {blockedByUnsavedWork
              ? "Finish or clear the current bill, then reload to update."
              : "Reload to get the latest update."}
          </Typography>
        </Box>
        <Button
          size="small"
          startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
          onClick={reload}
          sx={{
            bgcolor: "#C8102E",
            color: "#fff",
            fontWeight: 800,
            fontSize: 12,
            px: 2,
            borderRadius: 1.5,
            whiteSpace: "nowrap",
            "&:hover": { bgcolor: "#A50D26" },
          }}
        >
          RELOAD
        </Button>
      </Box>
    </Snackbar>
  );
}
