// components/ChecklistSection.tsx
import React from "react";
import { Box, Typography } from "@mui/material";
import ChecklistTaskItem from "./ChecklistTaskItem";

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  verified?: string;
  noteField?: boolean;
}

interface ChecklistSectionProps {
  title: string;
  tasks: TaskItem[];
  temperatureValue: string;
  onTaskToggle: (taskId: string) => void;  onTemperatureChange: (value: string) => void;
}

const ChecklistSection: React.FC<ChecklistSectionProps> = ({
  title,
  tasks,
  temperatureValue,
  onTaskToggle,
  onTemperatureChange,
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        sx={{
          fontWeight: 700,
          color: "#000",
          fontSize: "0.9rem",
          mb: 1,
          textTransform: "uppercase",
          letterSpacing: "0.3px",
          borderBottom: "1px solid #eee",
          pb: 0.5,
        }}>
        {title}
      </Typography>

      <Box>
        {tasks.map((task) => (
          <ChecklistTaskItem
            key={task.id}
            task={task}
            temperatureValue={temperatureValue}
            onToggle={() => onTaskToggle(task.id)}
            onTemperatureChange={onTemperatureChange}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ChecklistSection;
