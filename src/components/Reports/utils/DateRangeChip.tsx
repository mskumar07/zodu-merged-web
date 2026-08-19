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
  width: 147,
  "& .MuiInputBase-root": { fontSize: 10.5, fontWeight: 700 },
  "& .MuiInputBase-input": { p: 0, cursor: "pointer", whiteSpace: "nowrap" },
  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
  "& .MuiInputAdornment-root": { ml: 0.25 },
};

// Day grid is forced to always render 6 week rows (via fixedWeekNumber={6}
// below) so every month occupies exactly the same height — 6 rows * 30px
// (28px day + 1px margin top/bottom) = 180px, plus the 22px weekday-label
// row = 202px of grid content. That number drives every height below so the
// popper never resizes when the month changes or when the month/year picker
// view is opened.
const CALENDAR_WIDTH = 252;
const HEADER_HEIGHT = 34; // 28px content + 6px top padding
const GRID_HEIGHT = 202; // weekday labels (22px) + 6 fixed week rows (180px)
const CALENDAR_HEIGHT = HEADER_HEIGHT + GRID_HEIGHT;

const popperSx = {
  "& .MuiPaper-root": { fontSize: 12 },
  "& .MuiPickersLayout-root": { minWidth: 0 },
  "& .MuiPickersLayout-contentWrapper": { minWidth: 0 },
  "& .MuiDayCalendar-slideTransition": { minHeight: 0 },
  "& .MuiPickersCalendarHeader-labelContainer": { fontSize: 12.5 },
  // Fixed height covers day / month / year views alike so switching between
  // them (e.g. clicking the header label to jump to month/year picker), or
  // changing the visible month, never resizes the popper.
  "& .MuiDateCalendar-root": {
    width: CALENDAR_WIDTH,
    height: CALENDAR_HEIGHT,
    maxHeight: CALENDAR_HEIGHT,
    overflow: "hidden",
  },
  "& .MuiPickersCalendarHeader-root": { minHeight: HEADER_HEIGHT, height: HEADER_HEIGHT, pl: 1, pr: 0.5, pt: 0.75, m: 0 },
  "& .MuiPickersCalendarHeader-label": { fontSize: 12.5 },
  "& .MuiPickersArrowSwitcher-root button": { padding: 3 },
  "& .MuiPickersArrowSwitcher-root svg": { fontSize: 16 },
  "& .MuiDayCalendar-header": { p: 0 },
  "& .MuiDayCalendar-weekDayLabel": { width: 28, height: 22, fontSize: 10.5 },
  "& .MuiDayCalendar-weekContainer": { margin: "1px 0" },
  "& .MuiPickersDay-root": { width: 28, height: 28, fontSize: 11.5, margin: "0 1px" },
  "& .MuiPickersYear-yearButton, & .MuiPickersMonth-monthButton": { fontSize: 12 },
  "& .MuiDayCalendar-monthContainer": { position: "relative" },
  "& .MuiPickersSlideTransition-root": { minHeight: GRID_HEIGHT, height: GRID_HEIGHT },
  "& .MuiYearCalendar-root, & .MuiMonthCalendar-root": {
    width: CALENDAR_WIDTH,
    height: GRID_HEIGHT,
    overflowY: "auto",
  },
};

const boxSx = {
  display: "flex",
  alignItems: "center",
  gap: 0.5,
  px: 0.85,
  py: 0.35,
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
          fixedWeekNumber={6}
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
          fixedWeekNumber={6}
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
