import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Chip,
  Stack,
  Button,
  LinearProgress,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import ChecklistSection from "./ChecklistSection";
import type { ChecklistItem } from "@types/checklist";
import { toast } from "react-toastify";
import { useEditChecklistMutation } from "@store/services/checklistApi";

interface ChecklistDetailsModalProps {
  open: boolean;
  onClose: () => void;
  checklist: ChecklistItem | null;
  onTaskUpdate?: (
    checklistId: string,
    completedTasks: number,
    totalTasks: number
  ) => void;
}

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  verified?: string;
  noteField?: boolean;
  status: string;
  custom_id: string;
  notes: any[];
  voice_url: string | null;
  reference_image_url: Array<{
    id: string;
    url: string;
    name: string;
  }>;
}

interface Section {
  title: string;
  tasks: TaskItem[];
}

const ChecklistDetailsModal: React.FC<ChecklistDetailsModalProps> = ({
  open,
  onClose,
  checklist,
  onTaskUpdate,
}) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [temperatureValue, setTemperatureValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  console.log("selcted checklist: ", checklist);

  // Use the edit checklist mutation
  const [editChecklist] = useEditChecklistMutation();

  useEffect(() => {
    if (checklist) {
      // Transform the actual checklist data into sections
      const initialSections: Section[] = [];

      // Create a section for each checklist (you can group by category if needed)
      if (checklist.tasks && checklist.tasks.length > 0) {
        const sectionTitle = checklist.category || "TASKS";
        const tasks: any = checklist.tasks.map((task: any, index: number) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          completed: task.status === "completed",
          status: task.status,
          custom_id: task?.custom_id,
          notes: task.notes || [],
          voice_url: task.voice_url,
          reference_image_url: task.reference_image_url || [],
          verified:
            task.status === "completed"
              ? `Completed at ${new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : undefined,
          noteField: index === 2, // Example: make the 3rd task have a note field
        }));

        initialSections.push({
          title: sectionTitle,
          tasks: tasks,
        });
      }

      setSections(initialSections);
      setTemperatureValue("");
    }
  }, [checklist]);

  const handleTaskToggle = (taskId: string) => {
    if (!checklist) return;

    setSections((prevSections) => {
      const newSections = prevSections.map((section) => ({
        ...section,
        tasks: section.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                completed: !task.completed,
                status: !task.completed ? "completed" : "pending",
                verified: !task.completed
                  ? `Completed at ${new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : undefined,
              }
            : task
        ),
      }));

      // Calculate totals
      let totalCompleted = 0;
      let totalTasks = 0;

      newSections.forEach((section) => {
        section.tasks.forEach((task) => {
          totalTasks++;
          if (task.completed) totalCompleted++;
        });
      });

      if (onTaskUpdate) {
        onTaskUpdate(checklist.id, totalCompleted, totalTasks);
      }

      return newSections;
    });
  };

  const handleTemperatureChange = (value: string) => {
    setTemperatureValue(value);

    if (value.trim() !== "" && checklist) {
      setSections((prevSections) => {
        const newSections = prevSections.map((section) => ({
          ...section,
          tasks: section.tasks.map((task) =>
            task.id === "3"
              ? {
                  ...task,
                  completed: true,
                  status: "completed",
                  verified: `Completed at ${new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`,
                }
              : task
          ),
        }));

        let totalCompleted = 0;
        let totalTasks = 0;

        newSections.forEach((section) => {
          section.tasks.forEach((task) => {
            totalTasks++;
            if (task.completed) totalCompleted++;
          });
        });

        if (onTaskUpdate) {
          onTaskUpdate(checklist.id, totalCompleted, totalTasks);
        }

        return newSections;
      });
    }
  };

  const handleCompleteChecklist = async () => {
    if (!checklist) return;

    try {
      setIsLoading(true);

      // Prepare the updated tasks data for the API
      const updatedTasks = sections.flatMap((section) =>
        section.tasks.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description || "",
          status: task.completed ? "completed" : "pending",
          notes: task.notes,
          voice_url: task.voice_url,
          reference_image_url: task.reference_image_url,
        }))
      );

      // Calculate completed tasks
      const totalCompleted = updatedTasks.filter(
        (task) => task.status === "completed"
      ).length;
      const totalTasks = updatedTasks.length;

      // Prepare the API request body based on your example
      const requestBody = {
        checklist: {
          title: checklist.title,
          description: checklist.description,
          category_id: checklist.category_id || 1,
        },
        schedule: {
          due_date: checklist.due_date,
          due_time:
            checklist.schedule?.due_at?.split(":").slice(0, 2).join(":") ||
            "09:00",
          repeat:
            checklist.schedule?.recurrence_rrule?.split("=")[1] || "DAILY",
        },
        tasks: updatedTasks.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          reference_image_url: task.reference_image_url,
          voice_note_url: task.voice_url,
        })),
        assignees: checklist.assignees?.map((assignee) => assignee.id) || [],
      };

      console.log("Sending update request:", requestBody);

      // Call the edit checklist API
      const response = await editChecklist({
        checklistId: checklist.id,
        data: requestBody,
      }).unwrap();

      toast.success("Checklist updated successfully!");

      if (onTaskUpdate) {
        onTaskUpdate(checklist.id, totalCompleted, totalTasks);
      }

      onClose();
    } catch (error) {
      console.error("Failed to update checklist:", error);
      toast.error("Failed to update checklist. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getCompletedCount = () => {
    let count = 0;
    sections.forEach((section) => {
      section.tasks.forEach((task) => {
        if (task.completed) count++;
      });
    });
    return count;
  };

  const getTotalCount = () => {
    let count = 0;
    sections.forEach((section) => {
      count += section.tasks.length;
    });
    return count;
  };

  const getProgressPercentage = () => {
    const total = getTotalCount();
    if (total === 0) return 0;
    return Math.round((getCompletedCount() / total) * 100);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "No due date";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    try {
      const [hours, minutes] = timeString.split(":");
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return timeString;
    }
  };

  if (!checklist) return null;

  // Get assignee names
  const assigneeNames =
    checklist.assignees?.map((a) => a.name).join(", ") || "No assignees";
  const dueTime = checklist.schedule?.due_at
    ? formatTime(checklist.schedule.due_at)
    : "";

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "95%", sm: "90%", md: "650px" },
          maxHeight: "85vh",
          bgcolor: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          p: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          border: "1px solid #e0e0e0",
        }}>
        {/* Header */}
        <Box sx={{ p: 2 }}>
          {/* Row 1: Title and Close */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 1,
            }}>
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                flex: 1,
              }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  color: "#000000",
                  fontSize: "1.1rem",
                  lineHeight: 1.3,
                  flex: 1,
                }}>
                {checklist.title || "Untitled Checklist"}
              </Typography>
              <Chip
                label={checklist.status === "closed" ? "Completed" : "Active"}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  height: "20px",
                  bgcolor:
                    checklist.status === "closed" ? "#10b981" : "#dc2626",
                  color: "#ffffff",
                  borderRadius: "4px",
                }}
              />
            </div>

            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                color: "#666",
                "&:hover": { bgcolor: "#f5f5f5" },
                p: 0.5,
              }}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          {/* Row 2: Description */}
          {checklist.description && (
            <Typography
              sx={{
                color: "#666",
                fontSize: "0.85rem",
                mb: 1.5,
                lineHeight: 1.4,
              }}>
              {checklist.description}
            </Typography>
          )}

          {/* Row 3: Due, Assignee, ID */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 1.5,
              flexWrap: "wrap",
            }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 14, color: "#666" }} />
              <Typography
                sx={{
                  color: "#666",
                  fontWeight: 500,
                  fontSize: "0.8rem",
                }}>
                <strong>Due:</strong> {formatDate(checklist.due_date)}{" "}
                {dueTime && `at ${dueTime}`}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <PersonIcon sx={{ fontSize: 14, color: "#666" }} />
              <Typography
                sx={{
                  color: "#666",
                  fontWeight: 500,
                  fontSize: "0.8rem",
                }}>
                <strong>Assignees:</strong> {assigneeNames}
              </Typography>
            </Box>
            <Typography
              sx={{
                color: "#666",
                fontWeight: 500,
                fontSize: "0.8rem",
                fontFamily: "monospace",
              }}>
              <strong>ID:</strong> {checklist.checklist_id}
            </Typography>
          </Box>

          {/* Row 4: Progress */}
          <Box sx={{ mb: 0.5 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 0.5,
              }}>
              <Typography
                sx={{ fontWeight: 600, color: "#333", fontSize: "0.8rem" }}>
                Progress
              </Typography>
              <Typography
                sx={{ fontWeight: 700, color: "#000", fontSize: "0.8rem" }}>
                {getCompletedCount()}/{getTotalCount()} (
                {getProgressPercentage()}%)
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={getProgressPercentage()}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: "#f0f0f0",
                "& .MuiLinearProgress-bar": {
                  bgcolor: "#dc2626",
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        </Box>

        {/* Content - Tasks */}
        <Box sx={{ flex: 1, overflow: "auto", p: 2, pt: 0 }}>
          {sections.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No tasks found in this checklist.
            </Alert>
          ) : (
            <Stack spacing={2}>
              {sections.map((section, sectionIndex) => (
                <ChecklistSection
                  key={`${section.title}-${sectionIndex}`}
                  title={section.title}
                  tasks={section.tasks}
                  temperatureValue={temperatureValue}
                  onTaskToggle={handleTaskToggle}
                  onTemperatureChange={handleTemperatureChange}
                />
              ))}
            </Stack>
          )}
        </Box>

        {/* Footer - Complete Button */}
        <Box
          sx={{
            p: 1.5,
            borderTop: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "flex-end",
          }}>
          <Button
            variant="contained"
            onClick={handleCompleteChecklist}
            disabled={isLoading || getCompletedCount() === 0}
            sx={{
              bgcolor: "#dc2626",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "0.75rem",
              textTransform: "none",
              borderRadius: "4px",
              py: 0.5,
              px: 1.5,
              minWidth: "auto",
              height: "32px",
              "&:hover": {
                bgcolor: "#b91c1c",
              },
              "&:disabled": {
                bgcolor: "#cccccc",
                color: "#666666",
              },
            }}>
            {isLoading ? "Updating..." : "Complete"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ChecklistDetailsModal;
