import React, { useState, useMemo } from "react";
import {
  Box,
  Grid,
  FormControl,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import ChecklistSummaryCard from "@components/ChecklistSummaryCard";
import ChecklistTaskCard from "@components/ChecklistTaskCard";
import type { ChecklistItem } from "@types/checklist";

interface DashboardProps {
  data: {
    stats: {
      in_progress: number;
      completed: number;
      overdue: number;
      pending: number;
      total: number;
    };
    tasks: ChecklistItem[];
  };
  isLoading: boolean;
  onChecklistClick?: (checklist: ChecklistItem) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  data,
  isLoading,
  onChecklistClick,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const handleChecklistClick = (checklist: ChecklistItem) => {

    console.log("selected checklist: " + checklist);
    
    if (onChecklistClick) {
      onChecklistClick(checklist);
    }
  };

  const filteredTasks = useMemo(() => {
    if (!data?.tasks) return [];
    if (filterStatus === "all") return data.tasks;

    const statusMap: Record<string, ChecklistItem["status"]> = {
      inProgress: "active",
      completed: "closed",
      overdue: "overdue",
      pending: "pending",
    };

    const targetStatus = statusMap[filterStatus];
    return data.tasks.filter((task) => task.status === targetStatus);
  }, [data?.tasks, filterStatus]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          No data available
        </Typography>
      </Box>
    );
  }

  // Check if we have any tasks data
  const hasTasks = data.tasks && data.tasks.length > 0;

  return (
    <Box>
      {/* Stats Cards - Always show even if no tasks */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <ChecklistSummaryCard
            title="My Tasks"
            count={data?.stats?.completed || 0}
            subtitle="Completed"
            type="completed"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ChecklistSummaryCard
            title="Pending"
            count={data?.stats?.overdue || 0}
            subtitle="Overdue"
            type="overdue"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ChecklistSummaryCard
            title="In Progress"
            count={data?.stats?.in_progress || 0}
            subtitle="Active"
            type="inProgress"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ChecklistSummaryCard
            title="Total Tasks"
            count={data?.stats?.total || 0}
            subtitle="All Time"
            type="total"
          />
        </Grid>
      </Grid>

      {/* Only show filter and task list if we have tasks */}
      {hasTasks ? (
        <>
          <Box
            sx={{
              mb: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                sx={{ bgcolor: "white" }}>
                <MenuItem value="all">All Tasks</MenuItem>
                <MenuItem value="inProgress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box>
            {filteredTasks.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                No tasks match the selected filter. Try a different status.
              </Alert>
            ) : (
              filteredTasks.map((task) => (
                <ChecklistTaskCard
                  key={task.id}
                  item={task}
                  onClick={handleChecklistClick}
                />
              ))
            )}
          </Box>
        </>
      ) : (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Alert severity="info">
            <Typography variant="h6" gutterBottom>
              No checklists found
            </Typography>
            <Typography variant="body2">
              Create your first checklist to get started.
            </Typography>
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
