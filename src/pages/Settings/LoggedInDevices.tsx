import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ComputerRoundedIcon from "@mui/icons-material/ComputerRounded";
import PhoneAndroidRoundedIcon from "@mui/icons-material/PhoneAndroidRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import { toast } from "react-toastify";
import { authApis, type UserSession } from "@pages/auth/Authapi";
import { useSignOut } from "@hooks/useSignOut";

const SESSIONS_KEY = ["auth-sessions"] as const;

const PLATFORM_LABEL: Record<string, string> = {
  web: "Web browser",
  desktop: "Desktop app",
  mobile: "Mobile app",
};

function PlatformIcon({ platform }: { platform: string }) {
  const sx = { fontSize: 22, color: "#6b7280" };
  if (platform === "mobile") return <PhoneAndroidRoundedIcon sx={sx} />;
  if (platform === "desktop") return <ComputerRoundedIcon sx={sx} />;
  return <LanguageRoundedIcon sx={sx} />;
}

/** "Chrome on Windows" from a user agent; the raw string when nothing matches. */
function describeAgent(ua?: string | null): string {
  if (!ua) return "Unknown device";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox"
    : /Safari\//.test(ua) ? "Safari" : /Electron\//.test(ua) ? "Zodu desktop" : /Dart|okhttp/i.test(ua) ? "Zodu app" : null;
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS"
    : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : null;
  if (browser && os) return `${browser} on ${os}`;
  return browser ?? os ?? ua.slice(0, 80);
}

const formatWhen = (value?: string | null) =>
  value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "-";

/** The signed-in user's sessions (one per device login): sign one out, or all. */
export default function LoggedInDevices() {
  const queryClient = useQueryClient();
  const signOut = useSignOut();
  const [confirmAll, setConfirmAll] = useState(false);

  const { data: sessions = [], isLoading, isError, refetch } = useQuery({
    queryKey: SESSIONS_KEY,
    queryFn: authApis.getSessions,
  });

  const revoke = useMutation({
    mutationFn: (session: UserSession) => authApis.revokeSession(session.session_id),
    onSuccess: (_, session) => {
      // This device: its refresh cookie is dead now, so end the local session too.
      if (session.current) {
        void signOut();
        return;
      }
      toast.success("Device signed out");
      void queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
    },
    onError: (err: Error) => toast.error(err.message || "Couldn't sign that device out"),
  });

  const logoutAll = useMutation({
    mutationFn: authApis.logoutAll,
    onSuccess: () => void signOut(),
    onError: (err: Error) => toast.error(err.message || "Couldn't sign out everywhere"),
  });

  return (
    <Paper elevation={0} sx={{ borderRadius: 1, border: "1px solid #e6e8ee", bgcolor: "#fff", p: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2}>
        <Box>
          <Typography sx={{ fontSize: { xs: 20, md: 22 }, fontWeight: 800, color: "#1f2937" }}>Logged-in devices</Typography>
          <Typography sx={{ mt: 0.5, fontSize: 13.5, color: "#6b7280" }}>
            Every device signed in to your account. Sign out any you don't recognise.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="error"
          onClick={() => setConfirmAll(true)}
          disabled={logoutAll.isPending}
          sx={{ textTransform: "none", fontWeight: 700, whiteSpace: "nowrap" }}
        >
          Log out everywhere
        </Button>
      </Stack>

      <Box sx={{ mt: 2.5 }}>
        {isLoading && (
          <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress size={24} sx={{ color: "#c8101f" }} />
          </Box>
        )}
        {isError && (
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 2 }}>
            <Typography sx={{ fontSize: 13.5, color: "#b91c1c" }}>Couldn't load your devices.</Typography>
            <Button size="small" onClick={() => refetch()} sx={{ textTransform: "none" }}>Retry</Button>
          </Stack>
        )}
        {!isLoading && !isError && sessions.length === 0 && (
          <Typography sx={{ fontSize: 13.5, color: "#6b7280", py: 2 }}>No active sessions.</Typography>
        )}
        <Stack divider={<Box sx={{ borderTop: "1px solid #f1f2f6" }} />}>
          {sessions.map((s) => (
            <Stack key={s.session_id} direction="row" spacing={2} alignItems="center" sx={{ py: 1.5 }}>
              <PlatformIcon platform={s.platform} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1f2937" }} noWrap>
                    {describeAgent(s.user_agent)}
                  </Typography>
                  {s.current && <Chip label="This device" size="small" color="success" sx={{ height: 20, fontSize: 11 }} />}
                </Stack>
                <Typography sx={{ fontSize: 12.5, color: "#6b7280" }}>
                  {PLATFORM_LABEL[s.platform] ?? s.platform} · Signed in {formatWhen(s.created_at)} · Last active {formatWhen(s.last_used_at)}
                </Typography>
              </Box>
              <Button
                size="small"
                color="error"
                onClick={() => revoke.mutate(s)}
                disabled={revoke.isPending && revoke.variables?.session_id === s.session_id}
                sx={{ textTransform: "none", fontWeight: 700, whiteSpace: "nowrap" }}
              >
                Sign out
              </Button>
            </Stack>
          ))}
        </Stack>
      </Box>

      <Dialog open={confirmAll} onClose={() => setConfirmAll(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Log out everywhere?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 14, color: "#4b5563" }}>
            Every device, including this one, will be signed out and will need your password again.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmAll(false)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            disabled={logoutAll.isPending}
            onClick={() => logoutAll.mutate()}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Log out everywhere
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
