import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Grid,
} from "@mui/material";
import { toast } from "react-toastify";
import KanbanColumn from "./KanbanColumn";
import BoardFilterBar from "./BoardFilterBar";
import type {
  ChecklistItem,
  BoardStatus,
  BoardColumn,
  FilterOptions,
  Assignee,
} from "@types/checklist";

interface DashboardStats {
  total: number;
  pending: number;
  active: number;
  testing: number;
  closed: number;
}

interface KanbanBoardProps {
  data: ChecklistItem[];
  isLoading: boolean;
  onStatusUpdate?: (
    itemId: string,
    newStatus: BoardStatus,
    oldStatus: BoardStatus
  ) => Promise<void>;
  onCardClick?: (item: ChecklistItem) => void;
  stats?: DashboardStats;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  data,
  isLoading,
  onStatusUpdate,
  onCardClick,
  stats,
}) => {
  const [draggedItem, setDraggedItem] = useState<ChecklistItem | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    item: ChecklistItem | null;
    newStatus: BoardStatus | null;
  }>({
    open: false,
    item: null,
    newStatus: null,
  });

  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    assignees: [],
    categories: [],
    dateRange: { start: null, end: null },
  });

  const mapStatusToBoardStatus = (
    status: ChecklistItem["status"]
  ): BoardStatus => {
    if (status === "overdue") return "pending";
    return status as BoardStatus;
  };

  const getAvailableAssignees = useMemo((): Assignee[] => {
    const assigneeMap = new Map<string, Assignee>();
    data.forEach((item) => {
      item.assignees?.forEach((assignee) => {
        if (!assigneeMap.has(assignee.id)) {
          assigneeMap.set(assignee.id, assignee);
        }
      });
    });
    return Array.from(assigneeMap.values());
  }, [data]);

  const getAvailableCategories = useMemo((): string[] => {
    const categories = new Set<string>();
    data.forEach((item) => {
      if (item.category) {
        categories.add(item.category);
      }
    });
    return Array.from(categories).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    let filtered = [...data];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower) ||
          item.checklist_id.toLowerCase().includes(searchLower)
      );
    }

    if (filters.assignees.length > 0) {
      filtered = filtered.filter((item) =>
        item.assignees?.some((assignee) =>
          filters.assignees.includes(assignee.id)
        )
      );
    }

    if (filters.categories.length > 0) {
      filtered = filtered.filter((item) =>
        filters.categories.includes(item.category)
      );
    }

    if (filters.dateRange.start) {
      filtered = filtered.filter(
        (item) => item.due_date >= filters.dateRange.start!
      );
    }

    if (filters.dateRange.end) {
      filtered = filtered.filter(
        (item) => item.due_date <= filters.dateRange.end!
      );
    }

    return filtered;
  }, [data, filters]);

  const columns: BoardColumn[] = useMemo(() => {
    const columnData: BoardColumn[] = [
      { id: "pending", title: "To Do", items: [] },
      { id: "active", title: "In Progress", items: [] },
      { id: "testing", title: "Testing", items: [] },
      { id: "closed", title: "Done", items: [] },
    ];

    filteredData.forEach((item) => {
      const boardStatus = mapStatusToBoardStatus(item.status);
      const column = columnData.find((col) => col.id === boardStatus);
      if (column) {
        column.items.push(item);
      }
    });

    return columnData;
  }, [filteredData]);

  const handleDragStart = (e: React.DragEvent, item: ChecklistItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: BoardStatus) => {
    e.preventDefault();

    if (!draggedItem) return;

    const currentStatus = mapStatusToBoardStatus(draggedItem.status);

    if (currentStatus === targetStatus) {
      setDraggedItem(null);
      return;
    }

    setConfirmDialog({
      open: true,
      item: draggedItem,
      newStatus: targetStatus,
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!confirmDialog.item || !confirmDialog.newStatus) return;

    const item = confirmDialog.item;
    const newStatus = confirmDialog.newStatus;
    const oldStatus = mapStatusToBoardStatus(item.status);

    try {
      if (onStatusUpdate) {
        await onStatusUpdate(item.id, newStatus, oldStatus);
      }

      const statusLabels: Record<BoardStatus, string> = {
        pending: "To Do",
        active: "In Progress",
        testing: "Testing",
        closed: "Done",
      };

      toast.success(
        `Task "${item.title}" moved to ${statusLabels[newStatus]}`,
        {
          position: "bottom-right",
          autoClose: 3000,
        }
      );
    } catch (error) {
      toast.error("Failed to update task status. Please try again.", {
        position: "bottom-right",
      });
      console.error("Status update error:", error);
    } finally {
      setDraggedItem(null);
      setConfirmDialog({ open: false, item: null, newStatus: null });
    }
  };

  const handleCancelStatusChange = () => {
    setDraggedItem(null);
    setConfirmDialog({ open: false, item: null, newStatus: null });
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const statusLabels: Record<BoardStatus, string> = {
    pending: "To Do",
    active: "In Progress",
    testing: "Testing",
    closed: "Done",
  };

  return (
    <Box>
      {stats && (
        <Paper
          elevation={0}
          sx={{
            mb: 1.5,
            p: 1.25,
            bgcolor: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, mb: 0.75, color: "#1e293b", fontSize: "0.8rem" }}
          >
            Task Summary
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Box
                sx={{
                  p: 1,
                  bgcolor: "white",
                  borderRadius: 1,
                  border: "2px solid #e2e8f0",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#1e293b", mb: 0.1, fontSize: "1.5rem", lineHeight: 1 }}
                >
                  {stats.total}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                  Total Tasks
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Box
                sx={{
                  p: 1,
                  bgcolor: "white",
                  borderRadius: 1,
                  border: "2px solid #fbbf24",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#f59e0b", mb: 0.1, fontSize: "1.5rem", lineHeight: 1 }}
                >
                  {stats.pending}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                  To Do
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Box
                sx={{
                  p: 1,
                  bgcolor: "white",
                  borderRadius: 1,
                  border: "2px solid #3b82f6",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#3b82f6", mb: 0.1, fontSize: "1.5rem", lineHeight: 1 }}
                >
                  {stats.active}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                  In Progress
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Box
                sx={{
                  p: 1,
                  bgcolor: "white",
                  borderRadius: 1,
                  border: "2px solid #8b5cf6",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#8b5cf6", mb: 0.1, fontSize: "1.5rem", lineHeight: 1 }}
                >
                  {stats.testing}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                  Testing
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Box
                sx={{
                  p: 1,
                  bgcolor: "white",
                  borderRadius: 1,
                  border: "2px solid #10b981",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#10b981", mb: 0.1, fontSize: "1.5rem", lineHeight: 1 }}
                >
                  {stats.closed}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                  Done
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      <BoardFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        availableAssignees={getAvailableAssignees}
        availableCategories={getAvailableCategories}
      />

      {filteredData.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No tasks found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {filters.search ||
            filters.assignees.length > 0 ||
            filters.categories.length > 0
              ? "Try adjusting your filters"
              : "Create your first checklist to get started"}
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            gap: { xs: 2, sm: 2.5, md: 3 },
            overflowX: "auto",
            pb: 2,
            "&::-webkit-scrollbar": {
              height: 8,
            },
            "&::-webkit-scrollbar-track": {
              bgcolor: "#f1f5f9",
              borderRadius: 4,
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "#cbd5e1",
              borderRadius: 4,
              "&:hover": {
                bgcolor: "#94a3b8",
              },
            },
          }}
        >
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              items={column.items}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
              onCardClick={onCardClick}
            />
          ))}
        </Box>
      )}

      <Dialog
        open={confirmDialog.open}
        onClose={handleCancelStatusChange}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to move{" "}
            <strong>"{confirmDialog.item?.title}"</strong> to{" "}
            <strong>
              {confirmDialog.newStatus
                ? statusLabels[confirmDialog.newStatus]
                : ""}
            </strong>
            ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelStatusChange}>Cancel</Button>
          <Button
            onClick={handleConfirmStatusChange}
            variant="contained"
            sx={{
              bgcolor: "#3b82f6",
              "&:hover": { bgcolor: "#2563eb" },
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KanbanBoard;
