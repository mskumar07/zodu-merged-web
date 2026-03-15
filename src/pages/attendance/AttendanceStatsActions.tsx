import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Stack,
  Skeleton,
  Box,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BarChartIcon from "@mui/icons-material/BarChart";
import TimelapseIcon from "@mui/icons-material/Timelapse";
import LogoutIcon from "@mui/icons-material/Logout";
import EventIcon from "@mui/icons-material/Event";

/* ================= Props ================= */

interface Props {
  isLoading: boolean;
  todayHours: string;
  todayStatusText: string;
  isActive?: boolean;
  totalPresent?: number | string;
  onTimeRatio?: number;
  onCheckout?: () => void;
  onRequestLeave?: () => void;
}

/* ================= Reusable Styles ================= */

const cardSx = {
  backgroundColor: "#fff",
  color: "#1A0004",
  borderRadius: "8px",
  boxShadow: "var(--Paper-shadow)",
  backgroundImage: "var(--Paper-overlay)",
  overflow: "hidden",
  height: "100%",
  transition: "box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)",
};

const cardContentSx = {
  p: 0,
  "&:last-child": {
    paddingBottom: 0,
  },
};

/* ================= Icon Wrapper ================= */

const StatIcon = ({
  icon,
  bg,
}: {
  icon: React.ReactNode;
  bg: string;
}) => (
  <Box
    sx={{
      width: 36,
      height: 36,
      borderRadius: "10px",
      bgcolor: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {icon}
  </Box>
);

/* ================= Component ================= */

const AttendanceStatsActions: React.FC<Props> = ({
  isLoading,
  todayHours,
  todayStatusText,
  isActive,
  totalPresent,
  onTimeRatio,
  onCheckout,
  onRequestLeave,
}) => {
  return (
    <Grid container spacing={3} mb={3} alignItems="stretch">
      {/* ================= Today Hours ================= */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Card sx={cardSx}>
          <CardContent sx={cardContentSx}>
            <Box sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography fontSize={13} color="text.secondary">
                  Today's Hours
                </Typography>

                {isLoading ? (
                  <Skeleton width={50} />
                ) : (
                  <Chip
                    label={isActive ? "ACTIVE" : "INACTIVE"}
                    size="small"
                    color="success"
                    sx={{ fontSize: 11, height: 20 }}
                  />
                )}
              </Stack>

              {isLoading ? (
                <Skeleton height={36} width={120} sx={{ mt: 1 }} />
              ) : (
                <Typography fontSize={28} fontWeight={700} mt={1}>
                  {todayHours}
                  <Typography
                    component="span"
                    fontSize={14}
                    color="text.secondary"
                  >
                    m
                  </Typography>
                </Typography>
              )}

              {isLoading ? (
                <Skeleton width={160} />
              ) : (
                <Typography fontSize={12} color="text.secondary">
                  {todayStatusText}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* ================= Monthly Present ================= */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Card sx={cardSx}>
          <CardContent sx={cardContentSx}>
            <Box sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <StatIcon
                  bg="#FCE7F3"
                  icon={<BarChartIcon fontSize="small" color="error" />}
                />
                <Typography fontSize={13} color="text.secondary">
                  Monthly Present
                </Typography>
              </Stack>
              {isLoading ? (
                <Skeleton height={36} width={80} sx={{ mt: 2 }} />
              ) : (
                <Typography fontSize={26} fontWeight={700} mt={2}>
                  {totalPresent ?? "--"}
                </Typography>
              )}

              {!isLoading && (
                <Typography fontSize={12} color="success.main">
                  ↗ Excellent
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* ================= Monthly Absent ================= */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Card sx={cardSx}>
          <CardContent sx={cardContentSx}>
            <Box sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <StatIcon
                  bg="#FFF7ED"
                  icon={<TimelapseIcon fontSize="small" color="warning" />}
                />
                <Typography fontSize={13} color="text.secondary">
                  Monthly Absent
                </Typography>
              </Stack>

              {isLoading ? (
                <Skeleton height={36} width={80} sx={{ mt: 2 }} />
              ) : (
                <Typography fontSize={26} fontWeight={700} mt={2}>
                  {onTimeRatio ?? 0}
                </Typography>
              )}

              {!isLoading && (
                <Typography fontSize={12} color="text.secondary">
                  20 Days absent
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* ================= Actions ================= */}
      <Grid
        size={{ xs: 12, md: 3 }}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        {isLoading ? (
          <>
            <Skeleton height={48} />
            <Skeleton height={48} />
          </>
        ) : (
          <>
            <Button
              fullWidth
              variant="contained"
              startIcon={<LogoutIcon />}
              onClick={onCheckout}
              sx={{
                bgcolor: "#E11D48",
                py: 1.4,
                fontWeight: 600,
                borderRadius: "12px",
                "&:hover": { bgcolor: "#BE123C" },
              }}
            >
              Check Out
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<EventIcon />}
              onClick={onRequestLeave}
              sx={{
                py: 1.4,
                fontWeight: 600,
                borderRadius: "12px",
              }}
            >
              Request Leave
            </Button>
          </>
        )}
      </Grid>
    </Grid>
  );
};

export default AttendanceStatsActions;
