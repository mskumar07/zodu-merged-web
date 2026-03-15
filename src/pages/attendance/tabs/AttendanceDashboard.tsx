import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Stack,
  IconButton,
  Skeleton,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import {
  useCheckTodayAttendanceStatusQuery,
  useGetAttendanceHistoryQuery,
} from "@store/services/attendanceApi";

/* =======================
   Helpers
======================= */

const isValidTime = (time?: string) =>
  time && time !== "--" && time !== "-- : --";

const calculateHours = (checkIn: string, checkOut: string) => {
  try {
    const start = new Date(`1970-01-01 ${checkIn}`);
    const end = new Date(`1970-01-01 ${checkOut}`);
    const diffMs = end.getTime() - start.getTime();

    if (diffMs <= 0) return "-- : --";

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor(
      (diffMs % (1000 * 60 * 60)) / (1000 * 60)
    );

    return `${hours}h ${minutes}m`;
  } catch {
    return "-- : --";
  }
};

/* =======================
   Component
======================= */

const AttendanceDashboard: React.FC = () => {
  const employeeId = "fc04b765-2abc-447e-9319-d046dcc46ff7";

  /* ===== API Calls ===== */

  const {
    data: todayStatusResponse,
    isLoading: isTodayStatusLoading,
  } = useCheckTodayAttendanceStatusQuery(employeeId);

  const {
    data: attendanceHistoryData,
    isLoading: isAttendanceHistoryLoading,
  } = useGetAttendanceHistoryQuery(employeeId);

  const isSummaryLoading =
    isTodayStatusLoading || isAttendanceHistoryLoading;

  /* ===== Extracted Data ===== */

  const today = todayStatusResponse?.data;
  const summary = attendanceHistoryData?.summary;
  const records = attendanceHistoryData?.records ?? [];

  const todayStatusText = !today?.has_checked_in
    ? "Not checked in yet"
    : today.has_checked_in && !today.has_checked_out
    ? "Checked in"
    : "Checked out";

  const todayHours =
    isValidTime(today?.check_in) && isValidTime(today?.check_out)
      ? calculateHours(today.check_in, today.check_out)
      : "-- : --";

  return (
    <Box sx={{p:1}}>
      {/* ================= SUMMARY CARDS ================= */}
      <Grid container spacing={3} mb={1}>
        {/* ===== Today's Hours ===== */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" justifyContent="space-between">
                {isSummaryLoading ? (
                  <Skeleton width={120} />
                ) : (
                  <Typography color="text.secondary">
                    Today's Hours
                  </Typography>
                )}

                {isSummaryLoading ? (
                  <Skeleton width={60} height={24} />
                ) : (
                  <Chip
                    label={
                      today?.is_currently_active ? "Active" : "Inactive"
                    }
                    size="small"
                    color={
                      today?.is_currently_active
                        ? "success"
                        : "default"
                    }
                  />
                )}
              </Stack>

              {isSummaryLoading ? (
                <Skeleton width={140} height={40} sx={{ mt: 2 }} />
              ) : (
                <Typography variant="h5" mt={2}>
                  {todayHours}{" "}
                  <Typography component="span">hrs</Typography>
                </Typography>
              )}

              {isSummaryLoading ? (
                <Skeleton width={160} />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {todayStatusText}
                </Typography>
              )}

              <AccessTimeIcon
                sx={{
                  position: "absolute",
                  right: 24,
                  bottom: 24,
                  opacity: 0.1,
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* ===== Total Present ===== */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" justifyContent="space-between">
                {isSummaryLoading ? (
                  <Skeleton width={120} />
                ) : (
                  <Typography color="text.secondary">
                    Total Present
                  </Typography>
                )}

                {isSummaryLoading ? (
                  <Skeleton variant="circular" width={24} height={24} />
                ) : (
                  <CheckCircleIcon color="success" />
                )}
              </Stack>

              {isSummaryLoading ? (
                <Skeleton width={60} height={48} sx={{ mt: 2 }} />
              ) : (
                <Typography variant="h4" mt={2}>
                  {summary?.total_present_this_month ?? 0}
                </Typography>
              )}

              {isSummaryLoading ? (
                <Skeleton width={120} />
              ) : (
                <Typography variant="body2" color="success.main">
                  Current month
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ===== Total Absent ===== */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" justifyContent="space-between">
                {isSummaryLoading ? (
                  <Skeleton width={120} />
                ) : (
                  <Typography color="text.secondary">
                    Total Absent
                  </Typography>
                )}

                {isSummaryLoading ? (
                  <Skeleton variant="circular" width={24} height={24} />
                ) : (
                  <CancelIcon color="error" />
                )}
              </Stack>

              {isSummaryLoading ? (
                <Skeleton width={60} height={48} sx={{ mt: 2 }} />
              ) : (
                <Typography variant="h4" mt={2}>
                  {summary?.total_absent_this_month ?? 0}
                </Typography>
              )}

              {isSummaryLoading ? (
                <Skeleton width={140} />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Current month
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ================= DAILY ATTENDANCE TABLE ================= */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" mb={2}>
            Daily Attendance
          </Typography>

          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>DATE</TableCell>
                  <TableCell>CHECK-IN</TableCell>
                  <TableCell>CHECK-OUT</TableCell>
                  <TableCell>TOTAL HOURS</TableCell>
                  <TableCell>STATUS</TableCell>
                  <TableCell align="right">ACTION</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {/* ===== Skeleton Loading ===== */}
                {isAttendanceHistoryLoading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}

                {/* ===== Records ===== */}
                {!isAttendanceHistoryLoading &&
                  records.map((row: any, index: number) => {
                    const totalHours =
                      isValidTime(row.check_in) &&
                      isValidTime(row.check_out)
                        ? calculateHours(
                            row.check_in,
                            row.check_out
                          )
                        : "-- : --";

                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography fontWeight={500}>
                            {row.date ?? "--"}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {row.day ?? ""}
                          </Typography>
                        </TableCell>

                        <TableCell>{row.check_in ?? "--"}</TableCell>
                        <TableCell>{row.check_out ?? "--"}</TableCell>
                        <TableCell>{totalHours}</TableCell>

                        <TableCell>
                          <Chip
                            label={row.status}
                            size="small"
                            variant="outlined"
                            color={
                              row.status === "Present"
                                ? "success"
                                : "error"
                            }
                          />
                        </TableCell>

                        <TableCell align="right">
                          <IconButton size="small">
                            <InfoOutlinedIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                {/* ===== Empty State ===== */}
                {!isAttendanceHistoryLoading && records.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        No attendance records found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mt={2}
          >
            <Typography variant="body2" color="text.secondary">
              Showing {records.length} records
            </Typography>

            <Pagination count={1} page={1} color="primary" />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AttendanceDashboard;
