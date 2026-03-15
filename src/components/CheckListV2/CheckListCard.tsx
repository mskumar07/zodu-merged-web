// CheckListCard.tsx
import React from "react";
import { Paper, Typography, Box } from "@mui/material";

interface ChecklistCardProps {
  title: string;
  count: number;
  icon: string;
  value: string;
}

const ChecklistCard: React.FC<ChecklistCardProps> = ({
  title,
  count,
  icon,
}) => {
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        gap:5,
        bgcolor: "#ffffff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        width: 200,
      }}>
      {" "}
      <Box sx={{ fontSize: "24px" }}>{icon}</Box>
      <Box>
        <Typography
          variant="caption"
          sx={{ color: "#000000", fontWeight: 600, fontSize: "1rem" }}>
          {title}
        </Typography>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, mt: 0.5, fontSize: "1.5rem" }}>
          {count}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ChecklistCard;
