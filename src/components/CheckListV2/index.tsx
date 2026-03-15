import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import { toast } from "react-toastify";
import ChecklistTable from "./ChecklistTable";
import {
  transformApiChecklistToUi,
  type ChecklistItem,
  DEFAULT_PARAMS,
  CHECKLIST_USERS,
  CHECKLIST_USER_STORAGE_KEY,
  getSelectedChecklistUserId,
} from "./types/checklist";
import {
  useGetChecklistDashboardQuery,
  useDeleteChecklistMutation,
} from "@store/services/checklistApi";
import ChecklistFilters from "./CheckListFilter";
import ChecklistDetailsModal from "./CheckListDetails";

const summaryData = [
  {
    title: "Total Tasks",
    count: 0,
    color: "#3b82f6",
    bgColor: "#3b82f6",
    value: "total",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    title: "Overdue",
    count: 0,
    color: "#ef4444",
    bgColor: "#ef4444",
    value: "overdue",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
  {
    title: "Pending",
    count: 0,
    color: "#f59e0b",
    bgColor: "#f59e0b",
    value: "pending",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    title: "Completed",
    count: 0,
    color: "#10b981",
    bgColor: "#10b981",
    value: "completed",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
  },
];

const ChecklistPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedUserId, setSelectedUserId] = useState<string>(
    getSelectedChecklistUserId(),
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("");
  const [taskFilter, setTaskFilter] = useState<string>("my-tasks");
  const isEmployeeView =
    selectedUserId === "1ecd4f70-67ed-4e4c-9de7-6e0a53797908";
  const apiParams = useMemo(
    () => ({
      zodu_id: DEFAULT_PARAMS.zoduId,
      branch_id: DEFAULT_PARAMS.branchId,
      user_id:
        !isEmployeeView && taskFilter === "team-tasks"
          ? undefined
          : selectedUserId,
      limit: DEFAULT_PARAMS.limit,
      offset: DEFAULT_PARAMS.offset,
    }),
    [selectedUserId, isEmployeeView, taskFilter],
  );

  const {
    data: apiData,
    isLoading,
    error,
    refetch,
  } = useGetChecklistDashboardQuery(apiParams);

  const [deleteChecklist, { isLoading: isDeleting }] =
    useDeleteChecklistMutation();

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] =
    useState<ChecklistItem | null>(null);
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  useEffect(() => {
    window.localStorage.setItem(CHECKLIST_USER_STORAGE_KEY, selectedUserId);
    if (isEmployeeView) {
      setTaskFilter("team-tasks");
    }
  }, [selectedUserId, isEmployeeView]);

  useEffect(() => {
    if (apiData?.Data?.checklists) {
      const transformedChecklists = apiData.Data.checklists.map(
        transformApiChecklistToUi,
      );
      setChecklists(transformedChecklists);
    }
  }, [apiData]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to load checklists. Please try again.");
      console.error("API Error:", error);
    }
  }, [error]);

  const calculatedSummary = useMemo(() => {
    if (apiData?.Data?.overall) {
      const { total_tasks, overdue_tasks, pending_tasks, completed_tasks } =
        apiData.Data.overall;
      return [
        { ...summaryData[0], count: total_tasks },
        { ...summaryData[1], count: overdue_tasks },
        { ...summaryData[2], count: pending_tasks },
        { ...summaryData[3], count: completed_tasks },
      ];
    }
    return summaryData;
  }, [apiData]);

  const handleChecklistClick = (checklist: ChecklistItem) => {
    setSelectedChecklist(checklist);
    setDetailsModalOpen(true);
  };

  const handleEditChecklist = (checklist: ChecklistItem) => {
    navigate(`/checklist/edit/${checklist.id}`);
  };

  const handleDeleteChecklist = async (checklist: ChecklistItem) => {
    if (!checklist) return;

    try {
      console.log("Attempting to delete checklist with ID:", checklist.id);
      console.log("Checklist title:", checklist.title);

      toast.info(`Deleting "${checklist.title}"...`, {
        isLoading: true,
        autoClose: false,
      });

      const result = await deleteChecklist(checklist.id).unwrap();
      console.log("Delete API response:", result);

      toast.dismiss();
      toast.success(`Checklist "${checklist.title}" deleted successfully!`);

      // Update local state immediately
      setChecklists((prev) => prev.filter((c) => c.id !== checklist.id));

      // Also close details modal if it's open for this checklist
      if (selectedChecklist?.id === checklist.id) {
        setDetailsModalOpen(false);
        setSelectedChecklist(null);
      }

      // Still refetch to ensure consistency with server
      await refetch();
    } catch (err: any) {
      toast.dismiss();

      const errorMessage =
        err?.data?.message ||
        err?.error ||
        "Failed to delete checklist. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleTaskUpdate = async (
    checklistId: string,
    updatedTasks: ChecklistItem["tasks"],
    completedCount: number,
    totalCount: number,
  ) => {
    try {
      setChecklists((prev) =>
        prev.map((checklist) => {
          if (checklist.id === checklistId) {
            const progress =
              totalCount > 0
                ? Math.round((completedCount / totalCount) * 100)
                : 0;
            let status: ChecklistItem["status"] = "pending";

            if (progress === 100) {
              status = "completed";
            } else if (progress > 0) {
              const hasInProgress = updatedTasks.some(
                (task) => task.status === "in_progress",
              );
              status = hasInProgress ? "in_progress" : "pending";
            } else {
              status = checklist.status;
            }

            const updatedChecklist = {
              ...checklist,
              tasks: updatedTasks,
              completed_tasks: completedCount,
              total_tasks: totalCount,
              progress,
              status,
            };

            if (selectedChecklist?.id === checklistId) {
              setSelectedChecklist(updatedChecklist);
            }

            return updatedChecklist;
          }
          return checklist;
        }),
      );
    } catch (err: any) {
      console.error("Error updating tasks:", err);
      toast.error("Failed to update task status. Please try again.");
    }
  };

  const filteredChecklists = useMemo(() => {
    return checklists.filter((checklist) => {
      if (isEmployeeView) {
        const isAssignedToSelectedUser = checklist.assignees.some(
          (assignee) => assignee.id === selectedUserId,
        );
        if (!isAssignedToSelectedUser) return false;
      }

      // Status filter (multi-select)
      if (selectedStatuses.length > 0) {
        if (!selectedStatuses.includes(checklist.status)) {
          return false;
        }
      }

      // Task assignment filter
      if (!isEmployeeView && taskFilter === "my-tasks") {
        const isCreatedByCurrentUser = checklist.created_by === selectedUserId;
        const isAssignedToCurrentUser = checklist.assignees.some(
          (assignee) => assignee.id === selectedUserId,
        );
        if (!isCreatedByCurrentUser && !isAssignedToCurrentUser) return false;
      } else if (!isEmployeeView && taskFilter === "team-tasks") {
        // Show all checklists in Team Tasks view
      }

      // Category filter
      if (categoryFilter && checklist.category !== categoryFilter) {
        return false;
      }

      // Assignee filter
      if (assigneeFilter) {
        const isAssignedToSelectedUser = checklist.assignees.some(
          (assignee) => assignee.id === assigneeFilter,
        );
        if (!isAssignedToSelectedUser) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        return (
          checklist.title.toLowerCase().includes(query) ||
          checklist.description.toLowerCase().includes(query) ||
          checklist.category.toLowerCase().includes(query) ||
          checklist.checklist_id.toLowerCase().includes(query) ||
          checklist.assignees.some((a) => a.name.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [
    checklists,
    searchQuery,
    selectedStatuses,
    taskFilter,
    categoryFilter,
    assigneeFilter,
    selectedUserId,
    isEmployeeView,
  ]);

  const clearAllFilters = () => {
    setSelectedStatuses([]);
    setTaskFilter(isEmployeeView ? "team-tasks" : "all");
    setCategoryFilter("");
    setAssigneeFilter("");
    setSearchQuery("");
  };

  return (
    <Box sx={{ p: 2, bgcolor: "#f9fafb", minHeight: "100vh" }}>
      {/* Summary Cards */}
      <Box sx={{ mb: 3 }}>
        <div style={{ display: "flex", gap: 10 }}>
          {calculatedSummary.map((card) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.title}>
              <Box
                sx={{
                  paddingInline: 2,
                  paddingBlock: 1,
                  height: "100%",
                  borderRadius: 2,
                  width: 200,
                  bgcolor: "#ffffff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                  }}>
               <Box
  sx={{
    width: 44,
    height: 44,
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    p: 1,
    bgcolor: `${card.bgColor}22`,
    backdropFilter: "blur(8px)",
    border: `1px solid ${card.bgColor}44`,
    boxShadow: `0 2px 8px ${card.bgColor}33`,
  }}>
  {/* Shrink SVG icons to 18px */}
  {React.cloneElement(card.icon, { width: 18, height: 18 })}
</Box>
                  <Box>
                    <Typography
                      variant="body2"
                      color="black"
                      sx={{ mt: 1, fontWeight: "bold" }}>
                      {card.title}
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      color={card.color}>
                      {card.count}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </div>
      </Box>

      {/* Controls Bar with Task Filter Tabs */}
      <Paper
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          bgcolor: "#ffffff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
          {/* Left side: Task Filter Tabs and Search */}
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", flex: 1 }}>
            {/* Task Filter Tabs */}
            {!isEmployeeView && (
              <Box
                sx={{
                  display: "flex",
                  border: "1px solid #e5e7eb",
                  borderRadius: 1,
                  overflow: "hidden",
                }}>
                <Button
                  onClick={() => setTaskFilter("my-tasks")}
                  sx={{
                    px: 3,
                    py: 0.75,
                    borderRadius: 0,
                    bgcolor:
                      taskFilter === "my-tasks" ? "#dc2626" : "transparent",
                    color: taskFilter === "my-tasks" ? "white" : "#6b7280",
                    textTransform: "none",
                    fontWeight: taskFilter === "my-tasks" ? 600 : 400,
                    borderRight: "1px solid #e5e7eb",
                    "&:hover": {
                      bgcolor:
                        taskFilter === "my-tasks" ? "#b91c1c" : "#f9fafb",
                    },
                  }}>
                  My Tasks
                </Button>
                <Button
                  onClick={() => setTaskFilter("team-tasks")}
                  sx={{
                    px: 3,
                    py: 0.75,
                    borderRadius: 0,
                    bgcolor:
                      taskFilter === "team-tasks" ? "#dc2626" : "transparent",
                    color: taskFilter === "team-tasks" ? "white" : "#6b7280",
                    textTransform: "none",
                    fontWeight: taskFilter === "team-tasks" ? 600 : 400,
                    "&:hover": {
                      bgcolor:
                        taskFilter === "team-tasks" ? "#b91c1c" : "#f9fafb",
                    },
                  }}>
                  Team Tasks
                </Button>
              </Box>
            )}

            {/* Search */}
            <TextField
              size="small"
              placeholder="Search checklists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: "#9ca3af" }} />
                  </InputAdornment>
                ),
                sx: {
                  fontSize: "0.875rem",
                  height: "36px",
                  width: { xs: "200px", sm: "300px" },
                },
              }}
            />

            {/* Filter Icon */}
            <IconButton
              size="small"
              onClick={() => setFilterOpen(!filterOpen)}
              sx={{
                border: "1px solid #e5e7eb",
                width: 36,
                height: 36,
                color: filterOpen ? "#3b82f6" : "#6b7280",
                "&:hover": { bgcolor: "#f3f4f6" },
              }}>
              <FilterListIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Right side: Add Checklist Button */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <Select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                sx={{ height: 36 }}>
                {CHECKLIST_USERS.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.label} - {user.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {taskFilter === "team-tasks" && !isEmployeeView && (
              <Button
                variant="contained"
                startIcon={
                  isLoading || isDeleting ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <AddIcon />
                  )
                }
                onClick={() => {
                  navigate("/checklist/create/new");
                }}
                disabled={isLoading || isDeleting}
                sx={{
                  bgcolor: "#dc2626",
                  "&:hover": { bgcolor: "#b91c1c" },
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  minWidth: 150,
                  height: 36,
                }}>
                Add Checklist
              </Button>
            )}
          </Box>
        </Box>

        {/* Advanced Filters */}
        {filterOpen && (
          <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e5e7eb" }}>
            <ChecklistFilters
              onClose={() => {
                setFilterOpen(false);
              }}
              selectedStatuses={selectedStatuses}
              onStatusChange={setSelectedStatuses}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              assigneeFilter={assigneeFilter}
              onAssigneeFilterChange={setAssigneeFilter}
              onClearAllFilters={clearAllFilters}
            />
          </Box>
        )}
      </Paper>

      {/* Loading State */}
      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 8,
          }}>
          <CircularProgress />
        </Box>
      ) : (
        /* Table Section */
        <Paper
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "#ffffff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}>
          {filteredChecklists.length === 0 ? (
            <Box sx={{ p: 8, textAlign: "center" }}>
              <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
                {searchQuery
                  ? `No checklists found for "${searchQuery}"`
                  : "No checklists found"}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {!searchQuery &&
                  checklists.length === 0 &&
                  "Click 'Add Checklist' to create your first checklist"}
              </Typography>
            </Box>
          ) : (
            <ChecklistTable
              data={filteredChecklists}
              onChecklistClick={handleChecklistClick}
              onEditClick={handleEditChecklist}
              onDeleteClick={handleDeleteChecklist}
              canManage={!isEmployeeView}
            />
          )}
        </Paper>
      )}

      {/* Checklist Details Modal */}
      {selectedChecklist && (
        <ChecklistDetailsModal
          open={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedChecklist(null);
          }}
          checklist={selectedChecklist}
          onTaskUpdate={handleTaskUpdate}
          currentUserId={selectedUserId}
          apiData={apiData}
          refetchChecklists={refetch}
        />
      )}
    </Box>
  );
};

export default ChecklistPage;
