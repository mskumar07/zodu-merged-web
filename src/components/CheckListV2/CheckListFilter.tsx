import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Stack,
  IconButton,
  Typography,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import {
  useGetAssignableUsersQuery,
  useGetCategoriesQuery,
} from "@store/services/checklistApi";
import { DEFAULT_PARAMS } from "./types/checklist";

interface ChecklistFiltersProps {
  onClose: () => void;
  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  assigneeFilter: string;
  onAssigneeFilterChange: (assignee: string) => void;
  onClearAllFilters: () => void;
}

const ChecklistFilters: React.FC<ChecklistFiltersProps> = ({
  onClose,
  selectedStatuses,
  onStatusChange,
  categoryFilter,
  onCategoryFilterChange,
  assigneeFilter,
  onAssigneeFilterChange,
  onClearAllFilters,
}) => {
  // Use the same API params as in the main component
  const { data: categoriesResponse } = useGetCategoriesQuery({
    zodu_id: DEFAULT_PARAMS.zoduId,
    branch_id: DEFAULT_PARAMS.branchId,
  });

  const { data: assignableUsersResponse } = useGetAssignableUsersQuery({
    zodu_id: DEFAULT_PARAMS.zoduId,
    branch_id: DEFAULT_PARAMS.branchId,
  });

  // Get data from API responses
  const categories = categoriesResponse?.Data || [];
  const assignableUsers = assignableUsersResponse?.Data || [];

  // Local state to track filter changes before applying
  const [localSelectedStatuses, setLocalSelectedStatuses] =
    useState<string[]>(selectedStatuses);
  const [localCategoryFilter, setLocalCategoryFilter] =
    useState<string>(categoryFilter);
  const [localAssigneeFilter, setLocalAssigneeFilter] =
    useState<string>(assigneeFilter);

  // Update local state when props change (when filters are applied from outside)
  useEffect(() => {
    setLocalSelectedStatuses(selectedStatuses);
    setLocalCategoryFilter(categoryFilter);
    setLocalAssigneeFilter(assigneeFilter);
  }, [selectedStatuses, categoryFilter, assigneeFilter]);

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "active", label: "Active" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
  ];

  const handleStatusChange = (event: any) => {
    const {
      target: { value },
    } = event;
    setLocalSelectedStatuses(
      typeof value === "string" ? value.split(",") : value,
    );
  };

  const handleCategoryFilterChange = (event: any) => {
    setLocalCategoryFilter(event.target.value);
  };

  const handleAssigneeFilterChange = (event: any) => {
    setLocalAssigneeFilter(event.target.value);
  };

  const handleClearFilters = () => {
    // Clear local filters
    setLocalSelectedStatuses([]);
    setLocalCategoryFilter("");
    setLocalAssigneeFilter("");

    // Apply cleared filters immediately
    onStatusChange([]);
    onCategoryFilterChange("");
    onAssigneeFilterChange("");
    onClearAllFilters();
  };

  const handleCancel = () => {
    // Reset local state to current applied filters (discard changes)
    setLocalSelectedStatuses(selectedStatuses);
    setLocalCategoryFilter(categoryFilter);
    setLocalAssigneeFilter(assigneeFilter);

    // Close the filter panel
    onClose();
  };

  const handleApplyFilters = () => {
    // Apply all local filters to the parent component
    onStatusChange(localSelectedStatuses);
    onCategoryFilterChange(localCategoryFilter);
    onAssigneeFilterChange(localAssigneeFilter);

    // Close the filter panel
    onClose();
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, color: "#374151" }}>
          Advanced Filters
        </Typography>
        <IconButton size="small" onClick={handleCancel}>
          <ClearIcon fontSize="small" />
        </IconButton>
      </Box>

      <Grid container spacing={2}>
        {/* Status Filter with Checkboxes */}
        <Grid size={{ xs: 6 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Filter by Status</InputLabel>
            <Select
              multiple
              value={localSelectedStatuses}
              onChange={handleStatusChange}
              input={<OutlinedInput label="Filter by Status" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={
                        statusOptions?.find((opt) => opt.value === value)
                          ?.label || value
                      }
                      size="small"
                    />
                  ))}
                </Box>
              )}>
              {statusOptions.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  <Checkbox
                    size="small"
                    checked={localSelectedStatuses?.includes(status.value)}
                  />
                  <ListItemText primary={status.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={localCategoryFilter}
              label="Category"
              onChange={handleCategoryFilterChange}>
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category: any) => (
                <MenuItem key={category.id} value={category.name}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Assignee</InputLabel>
            <Select
              value={localAssigneeFilter}
              label="Assignee"
              onChange={handleAssigneeFilterChange}>
              <MenuItem value="">All Assignees</MenuItem>
              {assignableUsers.map((user: any) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
          pt: 2,
          borderTop: "1px solid #e5e7eb",
        }}>
        <Box>
          <Chip
            label="Clear All"
            size="small"
            onClick={handleClearFilters}
            sx={{ mr: 1, cursor: "pointer" }}
          />
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            onClick={handleCancel}
            sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleApplyFilters}
            sx={{ textTransform: "none", bgcolor: "#3b82f6" }}>
            Apply Filters
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default ChecklistFilters;
