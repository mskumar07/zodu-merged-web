import AddIcon from "@mui/icons-material/Add";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Skeleton,
  Snackbar,
  Typography
} from "@mui/material";
import React, { useState } from "react";

import PaidIcon from "@mui/icons-material/AttachMoney";
import CasualIcon from "@mui/icons-material/BeachAccess";
import SickIcon from "@mui/icons-material/LocalHospital";
import UnpaidIcon from "@mui/icons-material/MoneyOff";
import {useAppSelector} from "@store/store.ts"
import {BranchId, ZoduId} from "@store/slices/userSlice"

import {
  useGetLeaveHistoryQuery,
  useRequestLeaveMutation,
} from "@services/attendanceApi";
import RequestLeaveDialog from "../components/RequestLeaveDialog";
/* =====================
   Types
===================== */
type LeaveStatus = "Approved" | "Pending" | "Rejected";

type LeaveType = "Sick Leave" | "Paid Leave" | "Unpaid Leave" | "Casual Leave";

interface Leave {
  leave_id: number;
  leave_type: LeaveType;
  date_range: string;
  duration_days: number;
  reason: string;
  applied_on: string;
  status: LeaveStatus;
}

/* =====================
   Mappings
===================== */
const statusColor: Record<LeaveStatus, "success" | "warning" | "error"> = {
  Approved: "success",
  Pending: "warning",
  Rejected: "error",
};

const leaveTypeIcon: Record<LeaveType, React.ReactNode> = {
  "Sick Leave": <SickIcon color="error" />,
  "Paid Leave": <PaidIcon color="success" />,
  "Unpaid Leave": <UnpaidIcon color="warning" />,
  "Casual Leave": <CasualIcon color="primary" />,
};

/* =====================
   Component
===================== */
const LeaveHistory: React.FC = () => {
  const [filter, setFilter] = useState<"ALL" | LeaveStatus>("ALL");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    msg: string;
    type: "success" | "error";
  }>({
    open: false,
    msg: "",
    type: "success",
  });

  const {
    data: leaveHistory = [],
    isLoading: isLeaveHistory,
    isError,
  } = useGetLeaveHistoryQuery("3d821dcf-47b2-4178-b5f2-c549bbac2caf"); //TODO: Static data need to changes
  const branchId = useAppSelector(BranchId);
  const zoduId = useAppSelector(ZoduId)
  const [requestLeave] = useRequestLeaveMutation();

  const filteredLeaves =
    filter === "ALL"
      ? leaveHistory
      : leaveHistory.filter((l) => l.status === filter);

  const handleSubmit = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setOpen(false);
      setToast({
        open: true,
        msg: "Leave request submitted successfully",
        type: "success",
      });
    }, 1500);
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Box>
          <Typography variant="h6">Leave History</Typography>
          <Typography variant="body2" color="text.secondary">
            Track and manage your personal time-off records
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Request Leave
        </Button>
      </Box>

      {/* Filter Chips */}
      <Box display="flex" gap={1} mb={3}>
        {["ALL", "Pending", "Approved", "Rejected"].map((item) => (
          <Chip
            key={item}
            label={item}
            clickable
            color={filter === item ? "primary" : "default"}
            onClick={() => setFilter(item as any)}
          />
        ))}
      </Box>

      {/* Leave Cards */}
      <Grid container spacing={2}>
        {isLeaveHistory ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={index}>
              <LeaveCardSkeleton />
            </Grid>
          ))
        ) : filteredLeaves.length ? (
          filteredLeaves.map((leave) => (
            <Grid size={{ xs: 12, md: 6 }} key={leave.leave_id}>
              <Card variant="outlined">
                <CardContent sx={{ p: 2 }}>
                  {/* Header */}
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {leaveTypeIcon[leave.leave_type]}
                      <Typography fontWeight={600}>
                        {leave.leave_type}
                      </Typography>
                    </Box>

                    <Chip
                      label={leave.status}
                      size="small"
                      color={statusColor[leave.status]}
                    />
                  </Box>

                  {/* Date */}
                  <Typography variant="body2" color="text.secondary">
                    {leave.date_range}
                  </Typography>

                  {/* Reason */}
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, fontStyle: "italic" }}
                  >
                    “{leave.reason}”
                  </Typography>

                  {/* Footer */}
                  <Box display="flex" justifyContent="space-between" mt={1}>
                    <Typography variant="caption">
                      {leave.duration_days} Day(s)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Applied: {leave.applied_on}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid size={{ xs: 12 }}>
            <Typography align="center" color="text.secondary">
              No leave records found
            </Typography>
          </Grid>
        )}
      </Grid>

      {/* Request Leave Dialog */}
      <RequestLeaveDialog
        open={open}
        setOpen={setOpen}
        employee_id={"3d821dcf-47b2-4178-b5f2-c549bbac2caf"}
        zodu_id={zoduId}
        branch_id={branchId}
        requestLeaveApi={requestLeave}
      />

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert severity={toast.type}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

/* =====================
   Skeleton Card
===================== */
const LeaveCardSkeleton = () => (
  <Card variant="outlined">
    <CardContent sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Skeleton width={140} height={22} />
        <Skeleton variant="rounded" width={70} height={22} />
      </Box>

      <Skeleton width="70%" height={18} />
      <Skeleton width="90%" height={18} sx={{ mt: 1 }} />

      <Box display="flex" justifyContent="space-between" mt={1}>
        <Skeleton width={60} height={14} />
        <Skeleton width={100} height={14} />
      </Box>
    </CardContent>
  </Card>
);

export default LeaveHistory;
