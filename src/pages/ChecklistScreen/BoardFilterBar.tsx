import React, { useState } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  IconButton,
  Button,
  Paper,
  Collapse,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import type { Assignee, FilterOptions } from "@types/checklist";

interface BoardFilterBarProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableAssignees: Assignee[];
  availableCategories: string[];
}

const BoardFilterBar: React.FC<BoardFilterBarProps> = ({
  filters,
  onFiltersChange,
  availableAssignees,
  availableCategories,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      search: e.target.value,
    });
  };

  const handleAssigneeChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onFiltersChange({
      ...filters,
      assignees: typeof value === "string" ? value.split(",") : value,
    });
  };

  const handleCategoryChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onFiltersChange({
      ...filters,
      categories: typeof value === "string" ? value.split(",") : value,
    });
  };

  const handleStartDateChange = (date: Dayjs | null) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        start: date ? date.format("YYYY-MM-DD") : null,
      },
    });
  };

  const handleEndDateChange = (date: Dayjs | null) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        end: date ? date.format("YYYY-MM-DD") : null,
      },
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: "",
      assignees: [],
      categories: [],
      dateRange: { start: null, end: null },
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.assignees.length > 0 ||
    filters.categories.length > 0 ||
    filters.dateRange.start ||
    filters.dateRange.end;

  return (
    <Paper elevation={0} sx={{ mb: 1.5, border: "1px solid #e5e7eb" }}>
      <Box sx={{ p: 1.25 }}>
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <TextField
            placeholder="Search tasks..."
            value={filters.search}
            onChange={handleSearchChange}
            size="small"
            sx={{
              flex: 1,
              minWidth: 250,
              maxWidth: 400,
              bgcolor: "white",
              "& .MuiInputBase-root": {
                height: 36,
              },
              "& .MuiInputBase-input": {
                fontSize: "0.875rem",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18 }} />
                </InputAdornment>
              ),
              endAdornment: filters.search && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() =>
                      onFiltersChange({ ...filters, search: "" })
                    }
                    sx={{ p: 0.5 }}
                  >
                    <ClearIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="outlined"
            startIcon={<FilterListIcon sx={{ fontSize: 18 }} />}
            endIcon={showAdvanced ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
            onClick={() => setShowAdvanced(!showAdvanced)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderColor: hasActiveFilters ? "#3b82f6" : undefined,
              color: hasActiveFilters ? "#3b82f6" : undefined,
              fontSize: "0.875rem",
              py: 0.75,
              px: 1.5,
              height: 36,
            }}
          >
            Filters
            {hasActiveFilters && (
              <Chip
                label={
                  [
                    filters.assignees.length,
                    filters.categories.length,
                    filters.dateRange.start || filters.dateRange.end ? 1 : 0,
                  ].reduce((a, b) => a + b, 0)
                }
                size="small"
                sx={{
                  ml: 0.75,
                  height: 16,
                  fontSize: "0.65rem",
                  bgcolor: "#3b82f6",
                  color: "white",
                }}
              />
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="text"
              startIcon={<ClearIcon sx={{ fontSize: 16 }} />}
              onClick={handleClearFilters}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
                py: 0.75,
                px: 1.5,
                height: 36,
              }}
            >
              Clear All
            </Button>
          )}
        </Box>

        <Collapse in={showAdvanced}>
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              mt: 1.25,
              pt: 1.25,
              borderTop: "1px solid #e5e7eb",
              flexWrap: "wrap",
            }}
          >
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel sx={{ fontSize: "0.875rem" }}>Assignees</InputLabel>
              <Select
                multiple
                value={filters.assignees}
                onChange={handleAssigneeChange}
                input={<OutlinedInput label="Assignees" sx={{ fontSize: "0.875rem" }} />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => {
                      const assignee = availableAssignees.find(
                        (a) => a.id === value
                      );
                      return (
                        <Chip
                          key={value}
                          label={assignee?.name || value}
                          size="small"
                          sx={{ height: 20, fontSize: "0.7rem" }}
                        />
                      );
                    })}
                  </Box>
                )}
                sx={{ height: 36 }}
              >
                {availableAssignees.map((assignee) => (
                  <MenuItem key={assignee.id} value={assignee.id} sx={{ fontSize: "0.875rem" }}>
                    {assignee.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel sx={{ fontSize: "0.875rem" }}>Categories</InputLabel>
              <Select
                multiple
                value={filters.categories}
                onChange={handleCategoryChange}
                input={<OutlinedInput label="Categories" sx={{ fontSize: "0.875rem" }} />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={value}
                        size="small"
                        sx={{ height: 20, fontSize: "0.7rem" }}
                      />
                    ))}
                  </Box>
                )}
                sx={{ height: 36 }}
              >
                {availableCategories.map((category) => (
                  <MenuItem key={category} value={category} sx={{ fontSize: "0.875rem" }}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start Date"
                value={filters.dateRange.start ? dayjs(filters.dateRange.start) : null}
                onChange={handleStartDateChange}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      minWidth: 140,
                      "& .MuiInputBase-root": {
                        height: 36,
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "0.875rem",
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: "0.875rem",
                      },
                    }
                  },
                }}
              />
              <DatePicker
                label="End Date"
                value={filters.dateRange.end ? dayjs(filters.dateRange.end) : null}
                onChange={handleEndDateChange}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      minWidth: 140,
                      "& .MuiInputBase-root": {
                        height: 36,
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "0.875rem",
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: "0.875rem",
                      },
                    }
                  },
                }}
              />
            </LocalizationProvider>
          </Box>
        </Collapse>
      </Box>
    </Paper>
  );
};

export default BoardFilterBar;
