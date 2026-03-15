import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  AvatarGroup,
  LinearProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AssignmentIcon from "@mui/icons-material/Assignment";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import type { ChecklistItem } from "@types/checklist";

interface KanbanCardProps {
  item: ChecklistItem;
  onDragStart: (e: React.DragEvent, item: ChecklistItem) => void;
  onCardClick?: (item: ChecklistItem) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({
  item,
  onDragStart,
  onCardClick,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#3b82f6";
      case "pending":
        return "#f59e0b";
      case "testing":
        return "#8b5cf6";
      case "closed":
        return "#10b981";
      case "overdue":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getPriorityColor = () => {
    if (item.status === "overdue") return "#ef4444";
    if (item.overdue_tasks && item.overdue_tasks > 0) return "#f59e0b";
    return "#6b7280";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    if (diffDays <= 7) return `Due in ${diffDays}d`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      onClick={() => onCardClick?.(item)}
      sx={{
        mb: 2,
        cursor: "grab",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          transform: "translateY(-2px)",
        },
        "&:active": {
          cursor: "grabbing",
          opacity: 0.8,
        },
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontFamily: "monospace",
                bgcolor: "#f3f4f6",
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: "0.7rem",
              }}
            >
              {item.checklist_id}
            </Typography>
            {item.category && (
              <Chip
                label={item.category}
                size="small"
                sx={{
                  height: "20px",
                  fontSize: "0.7rem",
                  bgcolor: "#e0e7ff",
                  color: "#4f46e5",
                }}
              />
            )}
          </Box>
          <IconButton size="small" sx={{ p: 0.5 }}>
            <MoreVertIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            mb: 1,
            fontSize: "0.95rem",
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.title}
        </Typography>

        {item.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: "0.8rem",
              mb: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.description}
          </Typography>
        )}

        <Box sx={{ mb: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 0.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <AssignmentIcon sx={{ fontSize: 14, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                {item.completed_tasks}/{item.total_tasks} tasks
              </Typography>
            </Box>
            <Typography
              variant="caption"
              sx={{
                color: getStatusColor(item.status),
                fontWeight: 600,
              }}
            >
              {Math.round(item.progress)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={item.progress}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: "#f3f4f6",
              "& .MuiLinearProgress-bar": {
                bgcolor: getStatusColor(item.status),
                borderRadius: 3,
              },
            }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <CalendarTodayIcon
              sx={{
                fontSize: 13,
                color: getPriorityColor(),
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: getPriorityColor(),
                fontWeight: item.status === "overdue" ? 600 : 400,
              }}
            >
              {formatDate(item.due_date)}
            </Typography>
          </Box>

          {item.assignees && item.assignees.length > 0 && (
            <AvatarGroup
              max={3}
              sx={{
                "& .MuiAvatar-root": {
                  width: 24,
                  height: 24,
                  fontSize: "0.65rem",
                  border: "2px solid white",
                },
              }}
            >
              {item.assignees.map((assignee) => (
                <Tooltip key={assignee.id} title={assignee.name} arrow>
                  <Avatar
                    sx={{
                      bgcolor: assignee.color,
                      fontSize: "0.65rem",
                    }}
                  >
                    {assignee.initials}
                  </Avatar>
                </Tooltip>
              ))}
            </AvatarGroup>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default KanbanCard;
