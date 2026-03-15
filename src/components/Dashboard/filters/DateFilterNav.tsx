import React, { useState } from "react";
import {
  Select,
  MenuItem,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControl,
} from "@mui/material";

interface DateFilterNavProps {
  selectedType: string;
  startDate: string;
  endDate: string;
  onFilterChange: (filterType: string) => void;
  onCustomRangeApply: (startDate: string, endDate: string) => void;
}

const DateFilterNav: React.FC<DateFilterNavProps> = ({
  selectedType,
  startDate,
  endDate,
  onFilterChange,
  onCustomRangeApply,
}) => {
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const handleFilterChange = (value: string) => {
    if (value === "custom") {
      openCustomDialog();
    } else {
      onFilterChange(value);
    }
  };

  const openCustomDialog = () => {
    // Populate with existing dates if available, otherwise use default range
    if (startDate && endDate) {
      setCustomStart(startDate);
      setCustomEnd(endDate);
    } else {
      const today = new Date();
      const lastWeek = new Date();
      lastWeek.setDate(today.getDate() - 7);
      setCustomStart(lastWeek.toISOString().split("T")[0]);
      setCustomEnd(today.toISOString().split("T")[0]);
    }
    setCustomDialogOpen(true);
  };

  const handleApplyCustomDate = () => {
    if (customStart && customEnd) {
      const start = new Date(customStart);
      const end = new Date(customEnd);

      if (end < start) {
        alert("End date cannot be before start date");
        return;
      }

      onCustomRangeApply(customStart, customEnd);
      setCustomDialogOpen(false);
    }
  };

  const handleCloseDialog = () => {
    setCustomDialogOpen(false);
  };

  const getFilterLabel = () => {
    if (selectedType === "custom" && startDate && endDate) {
      return `Custom: ${startDate} to ${endDate}`;
    }

    const labels: Record<string, string> = {
      today: "Today",
      yesterday: "Yesterday",
      thisWeek: "This Week",
      last7Days: "Last 7 Days",
      last14Days: "Last 14 Days",
      last30Days: "Last 30 Days",
      thisMonth: "This Month",
      lastMonth: "Last Month",
      thisQuarter: "This Quarter",
      lastQuarter: "Last Quarter",
      week: "This Week",
      month: "This Month",
      year: "This Year",
      "30days": "Last 30 Days",
    };

    return labels[selectedType] || "Today";
  };

  return (
    <Box>
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <Select
          value={selectedType === "custom" ? "custom" : selectedType}
          onChange={(e) => handleFilterChange(e.target.value)}
          displayEmpty
          renderValue={() => getFilterLabel()}
        >
          <MenuItem value="today">Today</MenuItem>
          <MenuItem value="yesterday">Yesterday</MenuItem>
          <MenuItem value="thisWeek">This Week</MenuItem>
          <MenuItem value="last7Days">Last 7 Days</MenuItem>
          <MenuItem value="last14Days">Last 14 Days</MenuItem>
          <MenuItem value="last30Days">Last 30 Days</MenuItem>
          <MenuItem value="thisMonth">This Month</MenuItem>
          <MenuItem value="lastMonth">Last Month</MenuItem>
          <MenuItem value="thisQuarter">This Quarter</MenuItem>
          <MenuItem value="lastQuarter">Last Quarter</MenuItem>
          <MenuItem
            value="custom"
            onClick={() => {
              // Force dialog to open even if custom is already selected
              if (selectedType === "custom") {
                openCustomDialog();
              }
            }}
          >
            Custom Range
          </MenuItem>
        </Select>
      </FormControl>

      <Dialog open={customDialogOpen} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Select Custom Date Range</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Start Date"
              type="date"
              size="small"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <TextField
              label="End Date"
              type="date"
              size="small"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleApplyCustomDate}
            disabled={!customStart || !customEnd}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DateFilterNav;
