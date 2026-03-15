import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Avatar,
  AvatarGroup,
  IconButton,
  Link,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { ChecklistItem } from "@types/checklist";

interface ChecklistTaskCardProps {
  item: ChecklistItem;
  onClick?: (item: ChecklistItem) => void;
}

const ChecklistTaskCard: React.FC<ChecklistTaskCardProps> = ({
  item,
  onClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const descriptionLimit = 100;
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#3b82f6";
      case "pending":
        return "#f59e0b";
      case "closed":
        return "#10b981";
      case "overdue":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "pending":
        return "Pending";
      case "closed":
        return "Closed";
      case "overdue":
        return "Overdue";
      default:
        return status;
    }
  };

  const progressPercentage =
    item.total_tasks > 0 ? (item.completed_tasks / item.total_tasks) * 100 : 0;

  return (
    <Card
      sx={{
        mb: 2,
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          transform: "translateY(-1px)",
        },
      }}
      onClick={() => onClick?.(item)}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontFamily: "monospace",
                  bgcolor: "#f3f4f6",
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                }}>
                {item.checklist_id}
              </Typography>
              <Chip
                label={getStatusLabel(item.status)}
                size="small"
                sx={{
                  bgcolor: `${getStatusColor(item.status)}15`,
                  color: getStatusColor(item.status),
                  fontWeight: 600,
                  fontSize: "11px",
                  height: "22px",
                }}
              />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              {item.title}
            </Typography>
            {item.description && (
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}>
                  {isExpanded || item.description.length <= descriptionLimit
                    ? item.description
                    : `${item.description.substring(0, descriptionLimit)}...`}
                </Typography>
                {item.description.length > descriptionLimit && (
                  <Link
                    component="button"
                    variant="caption"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                    sx={{
                      cursor: "pointer",
                      fontWeight: 600,
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}>
                    {isExpanded ? "Show less" : "Read more"}
                  </Link>
                )}
              </Box>
            )}
          </Box>
          {item.status === "closed" && (
            <CheckCircleIcon sx={{ color: "#10b981", fontSize: 28 }} />
          )}
          {item.status !== "closed" && (
            <IconButton size="small">
              <ChevronRightIcon />
            </IconButton>
          )}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="caption" fontWeight={600}>
              {item.completed_tasks}/{item.total_tasks}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: "#f3f4f6",
              "& .MuiLinearProgress-bar": {
                bgcolor:
                  item.status === "closed"
                    ? "#10b981"
                    : getStatusColor(item.status),
                borderRadius: 4,
              },
            }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <CalendarTodayIcon sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">
              Due: {item.due_date}
            </Typography>
          </Box>
          <AvatarGroup
            max={3}
            sx={{
              "& .MuiAvatar-root": {
                width: 28,
                height: 28,
                fontSize: "0.75rem",
              },
            }}>
            {item.assignees.map((assignee) => (
              <Avatar
                key={assignee.id}
                sx={{
                  bgcolor: assignee.color,
                  fontSize: "0.75rem",
                }}
                title={assignee.name}>
                {assignee.initials}
              </Avatar>
            ))}
          </AvatarGroup>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ChecklistTaskCard;
