import React, { useMemo, useState } from "react";
import {
  Box,
  Chip,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Typography,
  IconButton,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Skeleton,
  Card,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import SearchIcon from "@mui/icons-material/Search";

import {
  useGetLeaveRequestsQuery,
  useApproveOrRejectLeaveMutation,
} from "@store/services/attendanceApi";
import { useAppSelector } from "@store/store";
import { BranchId } from "@store/slices/userSlice";

/* ---------- Types ---------- */

type Status = "Pending" | "Approved" | "Rejected";

interface LeaveRequest {
  leave_id: string;
  employee_id: string;
  zodu_id: string;
  name: string;
  role: string;
  leave_type: string;
  start_date_fmt: string;
  end_date_fmt: string;
  duration_days: number;
  applied_on: string;
  reason: string;
  status: Status;
}

/* ---------- Skeleton Rows ---------- */

const SkeletonRows = ({ count = 5 }: { count?: number }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <TableRow key={i}>
        <TableCell>
          <Box display="flex" gap={1} alignItems="center">
            <Skeleton variant="circular" width={32} height={32} />
            <Box>
              <Skeleton width={120} height={16} />
              <Skeleton width={80} height={14} />
            </Box>
          </Box>
        </TableCell>
        <TableCell><Skeleton width={90} /></TableCell>
        <TableCell><Skeleton width={140} /></TableCell>
        <TableCell><Skeleton width={220} /></TableCell>
        <TableCell><Skeleton width={80} /></TableCell>
        <TableCell><Skeleton width={60} /></TableCell>
      </TableRow>
    ))}
  </>
);

/* ---------- Component ---------- */

const CreateLeaveRequest: React.FC = () => {
  const [filter, setFilter] = useState<"ALL" | Status>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [confirm, setConfirm] = useState<{
    open: boolean;
    id?: string;
    action?: "APPROVE" | "REJECT";
  }>({ open: false });

  const branchId = useAppSelector(BranchId);

  const {
    data: leaveRequestData,
    isLoading,
    isFetching,
  } = useGetLeaveRequestsQuery({
    branchId,
    status: filter === "ALL" ? undefined : filter,
    limit,
    offset: (page - 1) * limit,
  });

  const [approveOrRejectLeave, { isLoading: isUpdating }] =
    useApproveOrRejectLeaveMutation();

  const rows: LeaveRequest[] = leaveRequestData || [];
  const total = leaveRequestData?.total || 0;

  const filteredData = useMemo(() => {
    return rows.filter(row =>
      row.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [rows, search]);

  const handleConfirmAction = async () => {
    if (!confirm.id || !confirm.action) return;

    await approveOrRejectLeave({
      leave_id: confirm.id,
      status: confirm.action === "APPROVE" ? "Approved" : "Rejected",
    }).unwrap();

    setConfirm({ open: false });
  };

  return (
    <Card
      sx={{
        backgroundColor: "#fff",
        borderRadius: "16px",
        boxShadow: "0px 8px 24px rgba(0,0,0,0.06)",
        p: 3,
      }}
      elevation={2}
    >
      {/* Header */}
      <Typography fontSize={18} fontWeight={700} mb={2}>
        Leave Requests
      </Typography>

      {/* Filters & Search */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Box display="flex" gap={1}>
          {["ALL", "Pending", "Approved", "Rejected"].map(item => (
            <Chip
              key={item}
              label={item === "ALL" ? "All Requests" : item}
              clickable
              color={filter === item ? "primary" : "default"}
              onClick={() => {
                setFilter(item as any);
                setPage(1);
              }}
            />
          ))}
        </Box>

        <TextField
          size="small"
          placeholder="Search employees..."
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
            ),
          }}
          onChange={e => setSearch(e.target.value)}
        />
      </Box>

      {/* Table */}
      <Box sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>EMPLOYEE</TableCell>
              <TableCell>LEAVE TYPE</TableCell>
              <TableCell>DURATION</TableCell>
              <TableCell>REASON</TableCell>
              <TableCell>STATUS</TableCell>
              <TableCell align="center">ACTIONS</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {(isLoading || isFetching) && <SkeletonRows count={limit} />}

            {!isLoading &&
              filteredData.map(row => (
                <TableRow key={row.leave_id} hover>
                  <TableCell>
                    <Box display="flex" gap={1} alignItems="center">
                      <Avatar>{row.name[0]}</Avatar>
                      <Box>
                        <Typography fontWeight={600}>{row.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.role}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>{row.leave_type}</TableCell>

                  <TableCell>
                    <Typography>
                      {row.start_date_fmt} – {row.end_date_fmt}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.duration_days} DAY{row.duration_days > 1 ? "S" : ""}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      "{row.reason}"
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={row.status}
                      size="small"
                      color={
                        row.status === "Approved"
                          ? "success"
                          : row.status === "Rejected"
                          ? "error"
                          : "warning"
                      }
                    />
                  </TableCell>

                  <TableCell align="center">
                    {row.status === "Pending" && (
                      <>
                        <IconButton
                          color="success"
                          onClick={() =>
                            setConfirm({
                              open: true,
                              id: row.leave_id,
                              action: "APPROVE",
                            })
                          }
                        >
                          <CheckCircleIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() =>
                            setConfirm({
                              open: true,
                              id: row.leave_id,
                              action: "REJECT",
                            })
                          }
                        >
                          <CancelIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary">
                    No leave requests found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Pagination */}
      <Box display="flex" justifyContent="space-between" mt={2}>
        <Typography variant="caption">
          Showing {filteredData.length} of {total} requests
        </Typography>
        <Pagination
          count={Math.ceil(total / limit)}
          page={page}
          size="small"
          onChange={(_, value) => setPage(value)}
        />
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={confirm.open} onClose={() => setConfirm({ open: false })}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          Are you sure you want to{" "}
          {confirm.action?.toLowerCase()} this leave request?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm({ open: false })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={isUpdating}
            color={confirm.action === "APPROVE" ? "success" : "error"}
            onClick={handleConfirmAction}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default CreateLeaveRequest;
