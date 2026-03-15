import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Chip,
  Button,
  LinearProgress,
  Divider,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import CategoryIcon from "@mui/icons-material/Category";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { toast } from "react-toastify";
import {
  useCompleteTaskMutation,
  useChangeInprogressTaskMutation,
  useAddTaskNoteMutation,
} from "@store/services/checklistApi";
import type { ChecklistItem, ApiTaskNote } from "./types/checklist";
import TaskItem from "./TaskItem";

interface ChecklistDetailsModalProps {
  open: boolean;
  onClose: () => void;
  checklist: ChecklistItem | null;
  onTaskUpdate?: (
    checklistId: string,
    tasks: ChecklistItem["tasks"],
    completedCount: number,
    totalCount: number,
  ) => void;
  currentUserId?: string;
  apiData?: any;
  refetchChecklists: () => Promise<any>;
}

const ChecklistDetailsModal: React.FC<ChecklistDetailsModalProps> = ({
  open,
  onClose,
  checklist,
  onTaskUpdate,
  currentUserId = "8f0d9c7e-6a8b-4f6d-b7e1-4b9bdfc11234",
  apiData,
  refetchChecklists,
}) => {
  const [tasks, setTasks] = useState<ChecklistItem["tasks"]>([]);
  const [temperatureValue, setTemperatureValue] = useState("");
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(
    null,
  );
  const [selectedTaskApiId, setSelectedTaskApiId] = useState<string | null>(
    null,
  );
  const [taskNote, setTaskNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checklistCompleted, setChecklistCompleted] = useState(false);
  const [localNotes, setLocalNotes] = useState<Record<string, ApiTaskNote[]>>(
    {},
  );

  const [completeTask] = useCompleteTaskMutation();
  const [changeInprogressTask] = useChangeInprogressTaskMutation();
  const [addTaskNote] = useAddTaskNoteMutation();

  useEffect(() => {
    if (checklist && checklist.tasks) {
      const initialTasks: ChecklistItem["tasks"] = checklist.tasks.map(
        (task, index) => {
          let apiTask = null;
          if (apiData?.Data?.checklists) {
            const apiChecklist = apiData.Data.checklists.find(
              (c: any) => c.id === checklist.id,
            );
            if (apiChecklist && apiChecklist.tasks[index]) {
              apiTask = apiChecklist.tasks[index];
            }
          }

          return {
            ...task,
            noteField:
              task.title.toLowerCase().includes("temperature") ||
              task.title.toLowerCase().includes("fridge") ||
              task.title.toLowerCase().includes("temp"),
            reference_image_url: apiTask?.reference_image_url || [],
            apiId: apiTask?.id || task.apiId,
            notes: apiTask?.notes || task.notes || [],
          };
        },
      );

      setTasks(initialTasks);
      setTemperatureValue("");

      const notesMap: Record<string, ApiTaskNote[]> = {};
      initialTasks.forEach((task) => {
        if (task.apiId && task.notes) {
          notesMap[task.apiId] = task.notes || [];
        }
      });
      setLocalNotes(notesMap);

      const allCompleted = initialTasks.every((task) => task.completed);
      setChecklistCompleted(allCompleted);
    }
  }, [checklist, apiData]);

  const handleNoteUpdated = useCallback(
    (taskApiId: string, updatedNotes: ApiTaskNote[]) => {
      setLocalNotes((prev) => ({
        ...prev,
        [taskApiId]: updatedNotes,
      }));

      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.apiId === taskApiId) {
            return {
              ...task,
              notesCount: updatedNotes.length,
              notes: updatedNotes,
            };
          }
          return task;
        }),
      );
    },
    [],
  );

  useEffect(() => {
    const allCompleted =
      tasks.length > 0 && tasks.every((task) => task.completed);
    if (allCompleted && !checklistCompleted) {
      handleChecklistAutoComplete();
    }
    setChecklistCompleted(allCompleted);
  }, [tasks, checklistCompleted]);

  const formatTimeForDisplay = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getApiTaskId = (localTaskIndex: number): string | null => {
    if (!checklist || !apiData?.Data?.checklists)
      return tasks[localTaskIndex]?.apiId || null;

    const apiChecklist = apiData.Data.checklists.find(
      (c: any) => c.id === checklist.id,
    );
    if (!apiChecklist || !apiChecklist.tasks[localTaskIndex]) {
      return tasks[localTaskIndex]?.apiId || null;
    }
    return apiChecklist.tasks[localTaskIndex].id;
  };

  const handleStatusChange = async (
    taskIndex: number,
    newStatus: "pending" | "in_progress" | "completed",
  ) => {
    if (!checklist) return;

    const apiTaskId = getApiTaskId(taskIndex);
    if (!apiTaskId) {
      toast.error("Cannot update task: No API task ID found");
      return;
    }

    try {
      setIsSubmitting(true);

      if (newStatus === "completed") {
        await completeTask({
          taskId: apiTaskId,
          completed_by: currentUserId,
          status: "completed",
        }).unwrap();
      } else if (newStatus === "in_progress") {
        await changeInprogressTask({
          taskId: apiTaskId,
          completed_by: currentUserId,
          status: "in_progress",
        }).unwrap();
      }

      await refetchChecklists();

      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((task, idx) => {
          if (idx === taskIndex) {
            const updatedTask = {
              ...task,
              status: newStatus,
            };

            if (newStatus === "completed") {
              updatedTask.completed = true;
              updatedTask.verified = `${checklist.assignees[0]?.name || "Staff"} at ${formatTimeForDisplay(new Date())}`;
            } else {
              updatedTask.completed = false;
              updatedTask.verified = undefined;
            }

            return updatedTask;
          }
          return task;
        });

        const completedCount = updatedTasks.filter((t) => t.completed).length;
        const totalCount = updatedTasks.length;

        if (onTaskUpdate) {
          onTaskUpdate(checklist.id, updatedTasks, completedCount, totalCount);
        }

        return updatedTasks;
      });

      toast.success(`Task marked as ${newStatus.replace("_", " ")}!`);
    } catch (err: any) {
      console.error("Error updating task status:", err);
      toast.error(
        err?.data?.message || "Failed to update task status. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTemperatureChange = (value: string) => {
    setTemperatureValue(value);
    if (value.trim() !== "" && checklist) {
      const tempTaskIndex = tasks.findIndex(
        (task) => task.noteField && !task.completed,
      );
      if (tempTaskIndex !== -1) {
        handleStatusChange(tempTaskIndex, "completed");
      }
    }
  };

  const handleAddNoteClick = async (
    taskIndex: number,
    taskId: string,
    noteText: string,
  ) => {
    const apiTaskId = getApiTaskId(taskIndex);
    if (!apiTaskId) {
      toast.error("Cannot add note: Task not found in API");
      return;
    }

    try {
      setIsSubmitting(true);

      const optimisticNote: ApiTaskNote = {
        id: `temp-${Date.now()}`,
        note: noteText.trim(),
        created_by: currentUserId,
        created_by_name: "You",
        created_at: new Date().toISOString(),
      };

      const updatedNotes = [...(localNotes[apiTaskId] || []), optimisticNote];

      handleNoteUpdated(apiTaskId, updatedNotes);

      toast.success("Note added successfully!");

      try {
        const result = await addTaskNote({
          task_id: apiTaskId,
          note: noteText.trim(),
          created_by: currentUserId,
        }).unwrap();

        if (result?.id) {
          const finalNotes = updatedNotes.map((note) =>
            note.id === optimisticNote.id ? { ...note, id: result.id } : note,
          );
          handleNoteUpdated(apiTaskId, finalNotes);
        }

        setTimeout(() => {
          refetchChecklists().catch(console.error);
        }, 500);
      } catch (apiError: any) {
        console.error("API error adding note:", apiError);
        toast.error("Note added locally but failed to sync with server.");
      }
    } catch (err: any) {
      console.error("Error adding note:", err);
      toast.error(
        err?.data?.message || "Failed to add note. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitNote = async () => {
    if (!selectedTaskApiId || !taskNote.trim() || selectedTaskIndex === null)
      return;

    try {
      setIsSubmitting(true);

      const optimisticNote: ApiTaskNote = {
        id: `temp-${Date.now()}`,
        note: taskNote.trim(),
        created_by: currentUserId,
        created_by_name: "You",
        created_at: new Date().toISOString(),
      };

      const updatedNotes = [
        ...(localNotes[selectedTaskApiId] || []),
        optimisticNote,
      ];

      handleNoteUpdated(selectedTaskApiId, updatedNotes);

      setNoteDialogOpen(false);
      setTaskNote("");
      setSelectedTaskIndex(null);
      setSelectedTaskApiId(null);

      toast.success("Note added successfully!");

      try {
        const result = await addTaskNote({
          task_id: selectedTaskApiId,
          note: taskNote.trim(),
          created_by: currentUserId,
        }).unwrap();

        if (result?.id) {
          const finalNotes = updatedNotes.map((note) =>
            note.id === optimisticNote.id ? { ...note, id: result.id } : note,
          );
          handleNoteUpdated(selectedTaskApiId, finalNotes);
        }

        setTimeout(() => {
          refetchChecklists().catch(console.error);
        }, 500);
      } catch (apiError: any) {
        console.error("API error adding note:", apiError);
        toast.error("Note added locally but failed to sync with server.");
      }
    } catch (err: any) {
      console.error("Error adding note:", err);
      toast.error(
        err?.data?.message || "Failed to add note. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNotesForTask = (taskApiId?: string): ApiTaskNote[] => {
    if (!taskApiId) return [];
    const notes = localNotes[taskApiId] || [];
    return [...notes].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  };

  const handleChecklistAutoComplete = async () => {
    if (!checklist || checklistCompleted) return;

    try {
      setIsSubmitting(true);

      for (let i = 0; i < tasks.length; i++) {
        if (!tasks[i].completed) {
          const apiTaskId = getApiTaskId(i);
          if (apiTaskId) {
            await completeTask({
              taskId: apiTaskId,
              completed_by: currentUserId,
              status: "completed",
            }).unwrap();
          }
        }
      }

      await refetchChecklists();

      const allCompletedTasks = tasks.map((task) => ({
        ...task,
        completed: true,
        status: "completed" as const,
        verified: `${checklist.assignees[0]?.name} at ${formatTimeForDisplay(new Date())}`,
      }));

      setTasks(allCompletedTasks);

      const totalTasks = allCompletedTasks.length;
      if (onTaskUpdate) {
        onTaskUpdate(checklist.id, allCompletedTasks, totalTasks, totalTasks);
      }

      setChecklistCompleted(true);
      toast.success("Checklist completed!");
    } catch (err: any) {
      console.error("Error completing checklist:", err);
      toast.error("Failed to complete some tasks. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCompletedCount = () => tasks.filter((task) => task.completed).length;
  const getTotalCount = () => tasks.length;
  const getProgressPercentage = () => {
    const total = getTotalCount();
    if (total === 0) return 0;
    return Math.round((getCompletedCount() / total) * 100);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();

      if (isToday) {
        return `Today ${date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}`;
      }

      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const standardTasks = tasks.filter((task) => !task.noteField);
  const temperatureTasks = tasks.filter((task) => task.noteField);

  if (!checklist) return null;

  const isChecklistLoading = isSubmitting;

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95%", sm: "90%", md: "600px" },
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
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 1.5,
              }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  color: "#000000",
                  fontSize: "1.1rem",
                  lineHeight: 1.3,
                }}>
                {checklist.title}
              </Typography>
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

            {/* Metadata */}
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
                  <strong>Due:</strong> {formatDate(checklist.due_date)}
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
                  <strong>Assignee:</strong>{" "}
                  {checklist.assignees[0]?.name || "Unassigned"}
                </Typography>
              </Box>

              <Chip
                label={checklist.priority?.toUpperCase() || "MEDIUM"}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  height: "20px",
                  bgcolor:
                    checklist.priority === "high" ? "#dc2626" : "#f59e0b",
                  color: "#ffffff",
                  borderRadius: "4px",
                  ml: "auto",
                }}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                paddingBottom: 2,
              }}>
              <CategoryIcon sx={{ fontSize: 14, color: "#666" }} />
              <Typography
                sx={{
                  color: "#666",
                  fontWeight: 500,
                  fontSize: "0.8rem",
                }}>
                {checklist.category}
              </Typography>
            </Box>

            {/* Progress */}
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
                    bgcolor: checklistCompleted ? "#10b981" : "#dc2626",
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, overflow: "auto", p: 2, pt: 0 }}>
            <Stack spacing={2}>
              {/* Standard Tasks */}
              {standardTasks.length > 0 && (
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: "#000",
                      fontSize: "0.85rem",
                      mb: 1.5,
                      textTransform: "uppercase",
                      letterSpacing: "0.3px",
                    }}>
                    TASKS
                  </Typography>
                  <Stack spacing={1.5}>
                    {standardTasks.map((task) => {
                      const taskIndex = tasks.findIndex(
                        (t) => t.id === task.id,
                      );
                      return (
                        <TaskItem
                          key={task.id}
                          task={task}
                          taskIndex={taskIndex}
                          isChecklistLoading={isChecklistLoading}
                          onStatusChange={handleStatusChange}
                          onAddNoteClick={handleAddNoteClick}
                          notes={getNotesForTask(task.apiId)}
                          formatDateForDisplay={formatDateForDisplay}
                          currentUserId={currentUserId}
                          showImages={true}
                          onNoteUpdated={handleNoteUpdated}
                          refetchChecklists={refetchChecklists}
                        />
                      );
                    })}
                  </Stack>
                </Box>
              )}

              {/* Temperature Tasks */}
              {temperatureTasks.length > 0 && (
                <>
                  {standardTasks.length > 0 && <Divider sx={{ my: 1 }} />}
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: "#000",
                        fontSize: "0.85rem",
                        mb: 1.5,
                        textTransform: "uppercase",
                        letterSpacing: "0.3px",
                      }}>
                      MEASUREMENTS
                    </Typography>
                    <Stack spacing={1.5}>
                      {temperatureTasks.map((task) => {
                        const taskIndex = tasks.findIndex(
                          (t) => t.id === task.id,
                        );
                        return (
                          <TaskItem
                            key={task.id}
                            task={task}
                            taskIndex={taskIndex}
                            isChecklistLoading={isChecklistLoading}
                            isTemperatureTask={true}
                            temperatureValue={temperatureValue}
                            onTemperatureChange={handleTemperatureChange}
                            onStatusChange={handleStatusChange}
                            onAddNoteClick={handleAddNoteClick}
                            onNoteUpdated={handleNoteUpdated}
                            notes={getNotesForTask(task.apiId)}
                            formatDateForDisplay={formatDateForDisplay}
                            currentUserId={currentUserId}
                            refetchChecklists={refetchChecklists}
                          />
                        );
                      })}
                    </Stack>
                  </Box>
                </>
              )}
            </Stack>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              p: 1.5,
              borderTop: "1px solid #f0f0f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {checklistCompleted ? (
                <>
                  <CheckCircleIcon sx={{ color: "#10b981", fontSize: 18 }} />
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: "#10b981",
                      fontSize: "0.8rem",
                    }}>
                    Checklist Completed
                  </Typography>
                </>
              ) : (
                <Typography sx={{ color: "#6b7280", fontSize: "0.8rem" }}>
                  {getCompletedCount()}/{getTotalCount()} tasks completed
                </Typography>
              )}
            </Box>
            <Button
              variant="outlined"
              onClick={onClose}
              size="small"
              sx={{
                textTransform: "none",
                fontSize: "0.75rem",
                borderColor: "#d1d5db",
                color: "#6b7280",
                "&:hover": {
                  borderColor: "#9ca3af",
                  bgcolor: "#f9fafb",
                },
              }}>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Add Note Dialog */}
      <Dialog
        open={noteDialogOpen}
        onClose={() => !isSubmitting && setNoteDialogOpen(false)}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>Add Note to Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Note"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={taskNote}
            onChange={(e) => setTaskNote(e.target.value)}
            disabled={isSubmitting}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setNoteDialogOpen(false)}
            disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitNote}
            disabled={!taskNote.trim() || isSubmitting}
            variant="contained">
            {isSubmitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Add Note"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChecklistDetailsModal;
