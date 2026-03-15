// components/ChecklistTaskItem.tsx
import React from "react";
import { Box, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface ChecklistTaskItemProps {
  task: {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    verified?: string;
    noteField?: boolean;
  };
  temperatureValue: string;
  onToggle: () => void;
  onTemperatureChange: (value: string) => void;
}

const ChecklistTaskItem: React.FC<ChecklistTaskItemProps> = ({
  task,
  temperatureValue,
  onToggle,
  onTemperatureChange,
}) => {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
          cursor: "pointer",
        }}
        onClick={onToggle}>
        {/* Checkbox */}
        <Box
          sx={{
            width: 18,
            height: 18,
            border: `2px solid ${task.completed ? "#dc2626" : "#666"}`,
            borderRadius: "3px",
            bgcolor: task.completed ? "#dc2626" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mt: 0.25,
            flexShrink: 0,
          }}>
          {task.completed && (
            <Box
              sx={{
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: "bold",
              }}>
              ✓
            </Box>
          )}
        </Box>

        {/* Task Content */}
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontWeight: 500,
              color: task.completed ? "#999" : "#000",
              fontSize: "0.875rem",
              textDecoration: task.completed ? "line-through" : "none",
              lineHeight: 1.4,
            }}>
            {task.title}
          </Typography>

          {/* Verified Status */}
          {task.verified && (
            <Typography
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "#10b981",
                fontWeight: 500,
                fontSize: "0.75rem",
                mt: 0.25,
              }}>
              <CheckCircleIcon sx={{ fontSize: 12 }} />
              Verified by {task.verified}
            </Typography>
          )}

          {/* Task Description */}
          {task.description && (
            <Typography
              sx={{
                color: "#666",
                fontSize: "0.8rem",
                lineHeight: 1.4,
                mt: 0.5,
                mb: 1,
              }}>
              {task.description}
            </Typography>
          )}

          {/* Note Input Field */}
          {task.noteField && !task.completed && (
            <Box sx={{ mt: 0.5 }}>
              <input
                type="text"
                placeholder="Enter temperature..."
                value={temperatureValue}
                onChange={(e) => onTemperatureChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  fontSize: "0.875rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  outline: "none",
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ChecklistTaskItem;
