import React from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Avatar,
  Chip,
  IconButton,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { styled } from "@mui/material/styles";
import { toast } from "react-toastify";

import MyAttendanceTable from "./MyattendanceTable";
import {
  useGetTeamEmployeeListQuery,
  useGetAttendanceHistoryQuery,
  useMarkAttendanceMutation,
} from "@services/attendanceApi";
import { useAppSelector } from "@store/store";
import { BranchId } from "@store/slices/userSlice";

/* ======================= Utils ======================= */

const calculateWorkingHours = (
  checkIn?: string,
  checkOut?: string
): string => {
  if (!checkIn || !checkOut) return "--";
  const parseTime = (time: string) => {
    const [t, modifier] = time.split(" ");
    let [hours, minutes] = t.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const start = parseTime(checkIn);
  const end = parseTime(checkOut);

  if (end <= start) return "--";

  const diff = end - start;
  const hrs = Math.floor(diff / 60);
  const mins = diff % 60;
  console.log(`${hrs}h ${mins}m`)
  return `${hrs}h ${mins}m`;
};

/* ======================= Styled Components ======================= */

const WrapperCard = styled(Card)({
  borderRadius: 16,
  padding: 20,
  boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
});

const HeaderRow = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16,
});

const StatusChip = styled(Chip)<{ status: string }>(({ status }) => ({
  height: 22,
  fontSize: "0.65rem",
  fontWeight: 700,
  borderRadius: 6,
  backgroundColor:
    status === "PRESENT"
      ? "#E8F5E9"
      : status === "ABSENT"
      ? "#FDECEA"
      : "#E3F2FD",
  color:
    status === "PRESENT"
      ? "#2E7D32"
      : status === "ABSENT"
      ? "#C62828"
      : "#1565C0",
}));

const HeadCell = {
  fontSize: "0.7rem",
  fontWeight: 600,
  color: "#94A3B8",
};

/* ======================= Skeleton ======================= */

const TableRowSkeleton = () => (
  <TableRow>
    <TableCell>
      <Box display="flex" alignItems="center" gap={1.5}>
        <Skeleton variant="circular" width={32} height={32} />
        <Box>
          <Skeleton width={100} height={14} />
          <Skeleton width={80} height={12} />
        </Box>
      </Box>
    </TableCell>
    <TableCell>
      <Skeleton variant="rounded" width={60} height={20} />
    </TableCell>
    <TableCell>
      <Skeleton width={60} />
    </TableCell>
    <TableCell>
      <Skeleton width={60} />
    </TableCell>
    <TableCell align="right">
      <Skeleton variant="rounded" width={160} height={28} />
    </TableCell>
  </TableRow>
);

/* ======================= Component ======================= */

const MyTeamOverview: React.FC = () => {
  const branch_id = useAppSelector(BranchId);
  const [filterDate] = React.useState<Date>(new Date());
  const [search, setSearch] = React.useState("");

  const { data = [], isLoading } = useGetTeamEmployeeListQuery({
    branch_id,
    date: filterDate.toISOString().split("T")[0],
    page: 1,
    limit: 5,
  });

  const [open, setOpen] = React.useState(false);
  const [employeeId, setEmployeeId] = React.useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = React.useState<any>(null);

  const {
    data: attendanceHistoryData,
    isLoading: isAttendanceHistoryLoading,
  } = useGetAttendanceHistoryQuery(employeeId!, {
    skip: !employeeId,
  });

  const records = attendanceHistoryData?.records ?? [];
  const [markAttendance] = useMarkAttendanceMutation();

  const [loadingAction, setLoadingAction] = React.useState<{
    employeeId: string;
    type: "in" | "out";
  } | null>(null);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [actionMember, setActionMember] = React.useState<any>(null);
  const menuOpen = Boolean(anchorEl);

  const filteredMembers = React.useMemo(() => {
    if (!search) return data;
    return data.filter(
      (member: any) =>
        member.name?.toLowerCase().includes(search.toLowerCase()) ||
        member.role?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const handleRowClick = (member: any) => {
    setSelectedEmployee(member);
    setEmployeeId(member.employee_id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedEmployee(null);
    setEmployeeId(null);
  };

  const handleActionClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    member: any
  ) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setActionMember(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActionMember(null);
  };

  const handleMarkAttendance = async (
    type: "in" | "out",
    member: any
  ) => {
    try {
      setLoadingAction({ employeeId: member.employee_id, type });
      await markAttendance({
        employee_id: member.employee_id,
        department_id: member.department_id,
        branch_id,
        type,
      }).unwrap();

      toast.success(
        `Attendance ${type === "in" ? "Check-In" : "Check-Out"} marked`
      );
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to mark attendance");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <WrapperCard>
      <HeaderRow>
        <Typography fontWeight={700}>My Team Overview</Typography>
        <TextField
          size="small"
          placeholder="Filter team member..."
          sx={{ width: 220 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </HeaderRow>

      <TableContainer
        sx={{
          maxHeight: 320,
          overflowY: "auto",
         "&::-webkit-scrollbar": {
            width: "8px", // scrollbar width
            display: "block"
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#aaa", // scrollbar color
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f1f1f1", // track color
          },
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={HeadCell}>EMPLOYEE</TableCell>
              <TableCell sx={HeadCell}>STATUS</TableCell>
              <TableCell sx={HeadCell}>CLOCK IN</TableCell>
              <TableCell sx={HeadCell}>WORKING HOURS</TableCell>
              <TableCell sx={HeadCell} align="right">
                ACTION
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRowSkeleton key={i} />
              ))
            ) : filteredMembers.length ? (
              filteredMembers.map((member: any, index: number) => {
                const hasCheckedIn = Boolean(member.check_in);
                const hasCheckedOut = Boolean(member.check_out);

                const isCheckInLoading =
                  loadingAction?.employeeId === member.employee_id &&
                  loadingAction?.type === "in";

                const isCheckOutLoading =
                  loadingAction?.employeeId === member.employee_id &&
                  loadingAction?.type === "out";

                return (
                  <TableRow
                    key={index}
                    hover
                    onClick={() => handleRowClick(member)}
                  >
                    <TableCell>
                      <Box display="flex" gap={1.5}>
                        <Avatar>{member.name?.charAt(0)}</Avatar>
                        <Box>
                          <Typography fontSize="0.8rem" fontWeight={600}>
                            {member.name}
                          </Typography>
                          <Typography fontSize="0.7rem" color="text.secondary">
                            {member.role}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <StatusChip
                        label={member.status}
                        status={member.status}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      <Typography fontSize="0.8rem">
                        {member.check_in ?? "-- : --"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontSize="0.8rem">
                        {calculateWorkingHours(
                          member.check_in,
                          member.check_out
                        )}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Box display="flex" gap={1} justifyContent="flex-end">
                        {!(hasCheckedIn && hasCheckedOut) ? (
                          <>
                            <Button
                              size="small"
                              variant="outlined"
                              disabled={hasCheckedIn || isCheckInLoading}
                              startIcon={
                                isCheckInLoading ? (
                                  <CircularProgress size={14} />
                                ) : null
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAttendance("in", member);
                              }}
                            >
                              Check-In
                            </Button>

                            <Button
                              size="small"
                              variant="contained"
                              disabled={!hasCheckedIn || isCheckOutLoading}
                              startIcon={
                                isCheckOutLoading ? (
                                  <CircularProgress
                                    size={14}
                                    color="inherit"
                                  />
                                ) : null
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAttendance("out", member);
                              }}
                            >
                              Check-Out
                            </Button>
                          </>
                        ) : (
                          <Chip label="Completed" size="small" color="success" />
                        )}

                        <IconButton
                          size="small"
                          onClick={(e) => handleActionClick(e, member)}
                        >
                          <ChatBubbleOutlineIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography fontSize="0.8rem" color="text.secondary">
                    No team members found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle fontWeight={700}>
          Attendance History — {selectedEmployee?.name}
        </DialogTitle>
        <DialogContent dividers>
          <MyAttendanceTable
            records={records}
            isLoading={isAttendanceHistoryLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose}>
        <MenuItem onClick={handleMenuClose}>View Profile</MenuItem>
        <MenuItem onClick={handleMenuClose}>Send Message</MenuItem>
      </Menu>
    </WrapperCard>
  );
};

export default MyTeamOverview;
