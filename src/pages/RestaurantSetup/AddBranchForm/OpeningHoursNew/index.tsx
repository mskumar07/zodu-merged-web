import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Grid,
  Checkbox,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import styles from "./index.module.css";

// Days of week
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Slot = {
  start: string; // "09:00"
  end: string; // "21:00"
  days: boolean[]; // length 7, each boolean toggles that weekday
  id: number;
};

const defaultSlot = (id: number): Slot => ({
  start: "09:00",
  end: "21:00",
  days: [false, false, false, false, false, false, false],
  id,
});

const OpeningHoursNew: React.FC = () => {
  const [slots, setSlots] = useState<Slot[]>([
    { ...defaultSlot(1), days: [true, false, true, true, false, true, false] }, // Example pattern
    { ...defaultSlot(2), days: [false, true, false, true, true, true, true] },
  ]);

  // Add new slot
  const handleAddSlot = () => {
    setSlots((prev) => [...prev, defaultSlot(Date.now())]);
  };

  // Remove slot
  const handleDeleteSlot = (id: number) => {
    setSlots((prev) => prev.filter((slot) => slot.id !== id));
  };

  // Change time (start/end)
  const handleTimeChange = (
    id: number,
    field: "start" | "end",
    value: string
  ) => {
    setSlots((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, [field]: value } : slot))
    );
  };

  // Toggle a day checkbox
  const handleDayToggle = (slotId: number, dayIdx: number) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId
          ? {
              ...slot,
              days: slot.days.map((checked, i) =>
                i === dayIdx ? !checked : checked
              ),
            }
          : slot
      )
    );
  };

  return (
    <Box>
      <Typography
        variant="body1"
        color="textSecondary"
        ml={1}
        padding={2}
        gutterBottom
      >
        Opening Hours
      </Typography>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid size={{ md: 0.5 }} />
        <Grid size={{ xs: 12, md: 3 }} sx={{ textAlign: "center" }}>
          Slots
        </Grid>
        {days.map((day) => (
          <Grid key={day} size={{ md: 1.2 }} sx={{ textAlign: "center" }}>
            <Typography variant="subtitle2">{day}</Typography>
          </Grid>
        ))}
      </Grid>
      {slots.map((slot) => (
        <Grid
          container
          spacing={2}
          alignItems="center"
          key={slot.id}
          sx={{ mb: 6 }}
        >
          <Grid size={{ md: 0.5 }} />
          <Grid
            size={{ md: 3 }}
            direction="column"
            className={styles.openingHoursContainer}
          >
            <Box>
              <IconButton
                aria-label="delete"
                onClick={() => handleDeleteSlot(slot.id)}
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
            <Box>
              <TextField
                type="time"
                size="small"
                label="Start Time"
                value={slot.start}
                onChange={(e) =>
                  handleTimeChange(slot.id, "start", e.target.value)
                }
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box>
              <Typography>to</Typography>
            </Box>
            <Box>
              <TextField
                type="time"
                size="small"
                label="End Time"
                value={slot.end}
                onChange={(e) =>
                  handleTimeChange(slot.id, "end", e.target.value)
                }
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Grid>
          {slot.days.map((checked, dIdx) => (
            <Grid
              key={dIdx}
              size={{ xs: 12, md: 1.2 }}
              sx={{ textAlign: "center" }}
            >
              <Checkbox
                checked={checked}
                onChange={() => handleDayToggle(slot.id, dIdx)}
                disableRipple
              />
            </Grid>
          ))}
        </Grid>
      ))}
      <Button variant="text" onClick={handleAddSlot} sx={{ ml: 5, mt: 1 }}>
        + Add Slot
      </Button>
    </Box>
  );
};

export default OpeningHoursNew;
