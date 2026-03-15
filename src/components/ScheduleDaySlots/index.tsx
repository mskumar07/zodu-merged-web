import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import styles from "./index.module.css";

interface Slot {
  label?: string;
  start?: string;
  end?: string;
}

interface ScheduleDaySlotsProps {
  day: string;
  slots: Slot[];
}

const ScheduleDaySlots: React.FC<ScheduleDaySlotsProps> = ({ day, slots }) => (
  <Box className={styles.dayRow}>
    {/* Day Label */}
    <Typography
      variant="subtitle1"
      sx={{ color: "#073EA3" }}
      className={styles.dayLabel}
    >
      {day}
    </Typography>
    <Box className={styles.slotsColumn}>
      {slots.map((slot, idx) => (
        <Box key={slot.label ?? idx} className={styles.slotRow}>
          <Typography className={styles.slotLabel}>
            Slot {slot.label}:
          </Typography>
          <Paper elevation={0} className={styles.timeBox}>
            <Typography className={styles.timeValue}>{slot.start}</Typography>
          </Paper>
          <Typography className={styles.toText}>To</Typography>
          <Paper elevation={0} className={styles.timeBox}>
            <Typography className={styles.timeValue}>{slot.end}</Typography>
          </Paper>
        </Box>
      ))}
    </Box>
  </Box>
);

export default ScheduleDaySlots;
