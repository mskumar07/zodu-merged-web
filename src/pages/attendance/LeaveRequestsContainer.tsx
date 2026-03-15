import {
  Grid,
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Card,
  CardContent,
} from "@mui/material";
import { useState, useMemo } from "react";

import {
  useGetLeaveRequestsQuery,
  useApproveOrRejectLeaveMutation,
} from "@store/services/attendanceApi";
import { useAppSelector } from "@store/store";
import { BranchId } from "@store/slices/userSlice";

import LeaveRequestCard from "./LeaveRequestCard";
import ConfirmLeaveDialog from "./components/ConfirmLeaveDialog";

type Status = "ALL" | "Pending" | "Approved" | "Rejected";

const LeaveRequestsContainer = () => {
  const branchId = useAppSelector(BranchId);

  const [filter, setFilter] = useState<Status>("ALL");
  const [confirm, setConfirm] = useState<{
    open: boolean;
    id?: string;
    action?: "APPROVE" | "REJECT";
  }>({ open: false });

  /* API */
  const { data = [], isLoading } = useGetLeaveRequestsQuery({
    branchId,
    status: filter === "ALL" ? undefined : filter,
  });

  const [approveOrRejectLeave, { isLoading: updating }] =
    useApproveOrRejectLeaveMutation();

  const filteredLeaves = useMemo(() => data, [data]);

  /* Confirm handler */
  const handleConfirm = async () => {
    if (!confirm.id || !confirm.action) return;

    await approveOrRejectLeave({
      leave_id: confirm.id,
      status: confirm.action === "APPROVE" ? "Approved" : "Rejected",
    }).unwrap();

    setConfirm({ open: false });
  };

  return (
    <Grid item xs={12} md={4}>
      {/* Card Wrapper */}
      <Card
        sx={{
          height: "100%",
          borderRadius: 2,
          boxShadow: "var(--Paper-shadow)", // 👈 elevation
          backgroundColor: "#fff",
          overflow: "hidden",
        }}
      >
        <CardContent
          sx={{
            p: 2,
            "&:last-child": {
              paddingBottom: 2,
            },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Leave Requests
            </Typography>

            <FormControl size="small">
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value as Status)}
              >
                <MenuItem value="ALL">All Status</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Scrollable Leave Cards */}
          <Box
            sx={{
              height: 320,
              overflowY: "auto",
              pr: 0.5,
          
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
            {!isLoading &&
              filteredLeaves.map((leave: any) => (
                <LeaveRequestCard
                  key={leave.leave_id}
                  leave={leave}
                  onApprove={() =>
                    setConfirm({
                      open: true,
                      id: leave.leave_id,
                      action: "APPROVE",
                    })
                  }
                  onReject={() =>
                    setConfirm({
                      open: true,
                      id: leave.leave_id,
                      action: "REJECT",
                    })
                  }
                />
              ))}
          </Box>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <ConfirmLeaveDialog
        open={confirm.open}
        action={confirm.action}
        loading={updating}
        onClose={() => setConfirm({ open: false })}
        onConfirm={handleConfirm}
      />
    </Grid>
  );
};

export default LeaveRequestsContainer;
