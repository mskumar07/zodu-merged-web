// components/dashboard/MainCalendar.tsx
import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  IconButton,
  Box,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const MainCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const renderCalendarDays = () => {
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<Box key={`empty-${i}`} sx={{ p: 1 }} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        new Date().getDate() === day &&
        new Date().getMonth() === month &&
        new Date().getFullYear() === year;

      days.push(
        <Box
          key={day}
          sx={{
            p: 1,
            textAlign: "center",
            backgroundColor: isToday ? "primary.main" : "transparent",
            color: isToday ? "white" : "text.primary",
            borderRadius: 1,
            cursor: "pointer",
            "&:hover": {
              backgroundColor: isToday ? "primary.dark" : "action.hover",
            },
          }}>
          <Typography variant="body2">{day}</Typography>
        </Box>
      );
    }

    return days;
  };

  return (
    <Card>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}>
          <Typography variant="h6" fontWeight="bold">
            {monthNames[month]} {year}
          </Typography>
          <Box>
            <IconButton size="small" onClick={handlePrevMonth}>
              <ChevronLeftIcon />
            </IconButton>
            <IconButton size="small" onClick={handleNextMonth}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Box>

        <Grid container sx={{ display: "flex" }} spacing={1}>
          {/* Day headers */}
          {daysOfWeek.map((day) => (
            <Grid key={day}>
              <Box sx={{ p: 1, textAlign: "center" }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="bold">
                  {day}
                </Typography>
              </Box>
            </Grid>
          ))}

          {/* Calendar days */}
          {renderCalendarDays().map((day, index) => (
            <Grid key={index}>{day}</Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default MainCalendar;
