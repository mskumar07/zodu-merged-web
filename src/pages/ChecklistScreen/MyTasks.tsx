import React, { useState } from "react";
import { Box, Typography, CircularProgress, Tabs, Tab } from "@mui/material";
import ChecklistTaskCard from "@components/ChecklistTaskCard";
import type { ChecklistItem } from "@types/checklist";

interface MyTasksProps {
  data: ChecklistItem[];
  isLoading: boolean;
  onChecklistClick?: (checklist: ChecklistItem) => void;
}

const MyTasks: React.FC<MyTasksProps> = ({
  data,
  isLoading,
  onChecklistClick,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleChecklistClick = (checklist: ChecklistItem) => {
    if (onChecklistClick) {
      onChecklistClick(checklist);
    }
  };

  const safeData = data || [];

  const filteredTasks = safeData.filter((task) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return task.status === "active";
    if (statusFilter === "pending") return task.status === "pending";
    if (statusFilter === "completed") return task.status === "closed";
    if (statusFilter === "overdue") return task.status === "overdue";
    return true;
  });

  const taskCounts = {
    all: safeData.length,
    active: safeData.filter((t) => t.status === "active").length,
    pending: safeData.filter((t) => t.status === "pending").length,
    completed: safeData.filter((t) => t.status === "closed").length,
    overdue: safeData.filter((t) => t.status === "overdue").length,
  };

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

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={statusFilter}
          onChange={(_, newValue) => setStatusFilter(newValue)}
          variant="scrollable"
          scrollButtons="auto">
          <Tab
            label={`All (${taskCounts.all})`}
            value="all"
            sx={{ textTransform: "none", fontWeight: 600 }}
          />
          <Tab
            label={`Active (${taskCounts.active})`}
            value="active"
            sx={{ textTransform: "none", fontWeight: 600 }}
          />
          <Tab
            label={`Pending (${taskCounts.pending})`}
            value="pending"
            sx={{ textTransform: "none", fontWeight: 600 }}
          />
          <Tab
            label={`Completed (${taskCounts.completed})`}
            value="completed"
            sx={{ textTransform: "none", fontWeight: 600 }}
          />
          <Tab
            label={`Overdue (${taskCounts.overdue})`}
            value="overdue"
            sx={{ textTransform: "none", fontWeight: 600 }}
          />
        </Tabs>
      </Box>

      {filteredTasks.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No tasks assigned to you
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {statusFilter !== "all" &&
              "Try changing the filter to see more tasks"}
          </Typography>
        </Box>
      ) : (
        <Box>
          {filteredTasks.map((task) => (
            <ChecklistTaskCard
              key={task.id}
              item={task}
              onClick={handleChecklistClick}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default MyTasks;
