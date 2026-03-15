import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import ListAltIcon from "@mui/icons-material/ListAlt";
import WarningIcon from "@mui/icons-material/Warning";

interface ChecklistSummaryCardProps {
  title: string;
  count: number;
  subtitle: string;
  type: "completed" | "pending" | "inProgress" | "total" | "overdue";
}

const ChecklistSummaryCard: React.FC<ChecklistSummaryCardProps> = ({
  title,
  count,
  subtitle,
  type,
}) => {
  const getIcon = () => {
    switch (type) {
      case "completed":
        return <CheckCircleIcon sx={{ fontSize: 32, color: "#10b981" }} />;
      case "pending":
        return <WarningIcon sx={{ fontSize: 32, color: "#f59e0b" }} />;
      case "inProgress":
        return <PlayCircleOutlineIcon sx={{ fontSize: 32, color: "#3b82f6" }} />;
      case "total":
        return <ListAltIcon sx={{ fontSize: 32, color: "#8b5cf6" }} />;
      case "overdue":
        return <HourglassEmptyIcon sx={{ fontSize: 32, color: "#ef4444" }} />;
      default:
        return <ListAltIcon sx={{ fontSize: 32 }} />;
    }
  };

  const getColor = () => {
    switch (type) {
      case "completed":
        return "#10b981";
      case "pending":
        return "#f59e0b";
      case "inProgress":
        return "#3b82f6";
      case "total":
        return "#8b5cf6";
      case "overdue":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <Card
      sx={{
        height: "100%",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 500, mb: 1 }}
            >
              {title}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 0.5,
                color: "text.primary",
              }}
            >
              {count}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: getColor(),
                fontWeight: 600,
              }}
            >
              {subtitle}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: `${getColor()}15`,
              borderRadius: 2,
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {getIcon()}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ChecklistSummaryCard;
