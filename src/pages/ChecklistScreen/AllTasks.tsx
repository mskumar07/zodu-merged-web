import React, { useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Avatar,
  AvatarGroup,
  Link,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import type { ChecklistItem } from "@types/checklist";

interface AllTasksProps {
  data: ChecklistItem[];
  isLoading: boolean;
}

interface TaskCardProps {
  task: ChecklistItem;
  getStatusColor: (status: string) => string;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, getStatusColor }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const descriptionLimit = 120;

  return (
    <Card
      sx={{
        height: "100%",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          transform: "translateY(-2px)",
        },
      }}
    >
      {task.tasks && task.tasks.length > 0 && task.tasks[0].reference_image_url.length > 0 && (
        <CardMedia
          component="img"
          height="160"
          image={task.tasks[0].reference_image_url[0].url}
          alt={task.title}
          sx={{ objectFit: "cover" }}
        />
      )}
      <CardContent>
        <Box sx={{ mb: 2 }}>
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
              }}
            >
              {task.checklist_id}
            </Typography>
            <Chip
              label={task.status.toUpperCase()}
              size="small"
              sx={{
                bgcolor: `${getStatusColor(task.status)}15`,
                color: getStatusColor(task.status),
                fontWeight: 600,
                fontSize: "10px",
                height: "20px",
              }}
            />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            {task.title}
          </Typography>
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: task.description.length > descriptionLimit ? 0.5 : 2,
                display: "-webkit-box",
                WebkitLineClamp: isExpanded ? "unset" : 3,
                WebkitBoxOrient: "vertical",
                overflow: isExpanded ? "visible" : "hidden",
              }}
            >
              {task.description}
            </Typography>
            {task.description.length > descriptionLimit && (
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
                  mb: 2,
                  display: "block",
                  color: "primary.main",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                {isExpanded ? "Show less" : "Read more"}
              </Link>
            )}
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
            Progress: {task.completed_tasks}/{task.total_tasks} tasks
          </Typography>
          <Box
            sx={{
              height: 6,
              bgcolor: "#f3f4f6",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                height: "100%",
                width: `${task.total_tasks > 0 ? (task.completed_tasks / task.total_tasks) * 100 : 0}%`,
                bgcolor: getStatusColor(task.status),
                transition: "width 0.3s ease",
              }}
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <CalendarTodayIcon sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">
              {task.due_date}
            </Typography>
          </Box>
          <AvatarGroup max={3} sx={{ "& .MuiAvatar-root": { width: 24, height: 24, fontSize: "0.65rem" } }}>
            {task.assignees.map((assignee) => (
              <Avatar
                key={assignee.id}
                sx={{
                  bgcolor: assignee.color,
                  fontSize: "0.65rem",
                }}
                title={assignee.name}
              >
                {assignee.initials}
              </Avatar>
            ))}
          </AvatarGroup>
        </Box>
      </CardContent>
    </Card>
  );
};

const AllTasks: React.FC<AllTasksProps> = ({ data, isLoading }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = (data || []).filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.checklist_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

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

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search tasks by title, description, or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ bgcolor: "white", maxWidth: 500 }}
        />
      </Box>

      {filteredTasks.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No tasks found
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredTasks.map((task) => (
            <Grid item xs={12} md={6} lg={4} key={task.id}>
              <TaskCard task={task} getStatusColor={getStatusColor} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AllTasks;
