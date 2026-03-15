import React from "react";
import { FieldArray, useFormikContext } from "formik";
import { Box, Button, Typography, IconButton, Card } from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
// import FormikTextInput from "@components/FormikTextInput/index.tsx";
import FormikTextInput from "@components/FormikTextInput/index.tsx"; // Adjust the path as needed
import styles from "../index.module.css";

// The order and labels for days.
const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export interface Slot {
  open: string;
  close: string;
}

export interface OpeningHours {
  [day: string]: Slot[];
}

export const defaultSlot: Slot = { open: "", close: "" };

const OpeningHoursFieldArray: React.FC = () => {
  const { values } = useFormikContext<{ openingHours: OpeningHours }>();

  return (
    <Box className={styles.openingHoursSection}>
      <Typography variant="h5" ml={1} mb={1}>
        Opening Hours
      </Typography>
      {weekDays.map((day) => (
        <FieldArray key={day} name={`openingHours.${day}`}>
          {({ remove, push }) => (
            <Card className={styles.dayCard}>
              <Box className={styles.dayHeader}>
                <Typography variant="subtitle1" sx={{ color: "#073EA3" }}>
                  {day}
                </Typography>
                <Button
                  onClick={() => push(defaultSlot)}
                  variant="text"
                  size="small"
                  className={styles.addBtn}
                  startIcon={<Add />}
                  sx={{ color: "#13C247" }}
                >
                  Add Time Slot
                </Button>
              </Box>

              {(values.openingHours[day] || []).map((idx : any) => (
                <Box
                  key={idx}
                  className={styles.slotsRow}
                  sx={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      width: "15%",
                      textAlign: "center",
                      marginTop: "15px",
                    }}
                  >
                    Slot {idx + 1}
                  </Typography>
                  <Box sx={{ width: "35%" }}>
                    <FormikTextInput
                      name={`openingHours.${day}.${idx}.open`}
                      label="From"
                      type="time"
                      required
                    />
                  </Box>
                  <Box sx={{ width: "35%" }}>
                    <FormikTextInput
                      name={`openingHours.${day}.${idx}.close`}
                      label="To"
                      type="time"
                      required
                    />
                  </Box>
                  <Box
                    sx={{
                      width: "15%",
                      display: "flex",
                      flex: 1,
                      justifyContent: "flex-end",
                      alignItems: "flex-end",
                      marginTop: "15px",
                    }}
                  >
                    <IconButton
                      color="error"
                      aria-label="delete-slot"
                      className={styles.removeBtn}
                      onClick={() => remove(idx)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Card>
          )}
        </FieldArray>
      ))}
    </Box>
  );
};

export default OpeningHoursFieldArray;
