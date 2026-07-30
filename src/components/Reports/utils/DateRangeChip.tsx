import React from "react";
import { Box, Typography } from "@mui/material";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

interface DateRangeChipProps {
  fromDate: string; // YYYY-MM-DD
  toDate: string;   // YYYY-MM-DD
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
}

const fieldSx = {
  minWidth: 88,
  "& .MuiInputBase-root": { fontSize: 10.5, fontWeight: 700 },
  "& .MuiInputBase-input": { p: 0, cursor: "pointer" },
  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
  "& .MuiInputAdornment-root": { ml: 0.25 },
};

const popperSx = {
  "& .MuiPaper-root": { fontSize: 12 },
  "& .MuiPickersLayout-contentWrapper": { minWidth: 0 },
  "& .MuiDateCalendar-root": { width: 252, height: "auto", maxHeight: "none" },
  "& .MuiPickersCalendarHeader-root": { minHeight: 28, pl: 1, pr: 0.5, mt: 0.5, mb: 0 },
  "& .MuiPickersCalendarHeader-label": { fontSize: 12.5 },
  "& .MuiPickersArrowSwitcher-root button": { padding: 3 },
  "& .MuiPickersArrowSwitcher-root svg": { fontSize: 16 },
  "& .MuiDayCalendar-header": { pt: 0 },
  "& .MuiDayCalendar-weekDayLabel": { width: 28, height: 22, fontSize: 10.5 },
  "& .MuiDayCalendar-weekContainer": { margin: 0 },
  "& .MuiPickersDay-root": { width: 28, height: 28, fontSize: 11.5, margin: "1px" },
  "& .MuiPickersYear-yearButton, & .MuiPickersMonth-monthButton": { fontSize: 12 },
  "& .MuiDayCalendar-monthContainer": { position: "relative" },
  "& .MuiPickersSlideTransition-root": { minHeight: 190 },
};

const boxSx = {
  display: "flex",
  alignItems: "center",
  gap: 0.5,
  px: 1.1,
  py: 0.4,
  borderRadius: 1,
  border: "1px solid #eee",
  bgcolor: "#fff",
};

// MUI's default fieldMonthPlaceholder always shows "MMMM" for letter-month
// sections, regardless of the DD-MMM-YYYY format we render — override it so
// the empty-field placeholder matches the 3-letter month format we actually use.
const localeText = {
  fieldMonthPlaceholder: (params: { contentType: string }) =>
    params.contentType === "letter" ? "MMM" : "MM",
};

// Compact "DD-MMM-YYYY" date-range chip shared by all date-wise report screens.
export const DateRangeChip: React.FC<DateRangeChipProps> = ({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
}) => (
  <LocalizationProvider dateAdapter={AdapterDayjs} localeText={localeText}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={boxSx}>
        {/* <CalendarTodayOutlinedIcon sx={{ fontSize: 13, color: "#D92D20" }} /> */}
        <DatePicker
          value={fromDate ? dayjs(fromDate) : null}
          format="DD-MMM-YYYY"
          maxDate={toDate ? dayjs(toDate) : undefined}
          onChange={(newValue: Dayjs | null) =>
            onFromDateChange(newValue ? newValue.format("YYYY-MM-DD") : "")
          }
          slotProps={{
            textField: { variant: "standard", InputProps: { disableUnderline: true }, sx: fieldSx },
            popper: { sx: popperSx },
          }}
        />
      </Box>
      <Typography sx={{ fontSize: 12, color: "#9CA3AF", fontWeight: 700 }}>to</Typography>
      <Box sx={boxSx}>
        <DatePicker
          value={toDate ? dayjs(toDate) : null}
          format="DD-MMM-YYYY"
          minDate={fromDate ? dayjs(fromDate) : undefined}
          onChange={(newValue: Dayjs | null) =>
            onToDateChange(newValue ? newValue.format("YYYY-MM-DD") : "")
          }
          slotProps={{
            textField: { variant: "standard", InputProps: { disableUnderline: true }, sx: fieldSx },
            popper: { sx: popperSx },
          }}
        />
      </Box>
    </Box>
  </LocalizationProvider>
);
