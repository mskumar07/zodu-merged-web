import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Badge,
  Button,
  TextField,
  Stack,
  Collapse,
  type SelectChangeEvent,
  Card,
  CardMedia,
  Grid,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  CircularProgress,
} from "@mui/material";
import NotesIcon from "@mui/icons-material/Notes";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import type { ApiTaskNote } from "./types/checklist";
import {
  useUpdateTaskNoteMutation,
  useDeleteTaskNoteMutation,
} from "@store/services/checklistApi";

interface TaskItemProps {
  task: {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
    verified?: string;
    notes?: ApiTaskNote[];
    notesCount?: number;
    apiId?: string;
    reference_image_url?: Array<{ id: string; url: string; name: string }>;
    status: "completed" | "pending" | "in_progress";
  };
  taskIndex: number;
  isChecklistLoading: boolean;
  isTemperatureTask?: boolean;
  temperatureValue?: string;
  onTemperatureChange?: (value: string) => void;
  onStatusChange: (
    taskIndex: number,
    newStatus: "pending" | "in_progress" | "completed",
  ) => void;
  onAddNoteClick: (taskIndex: number, taskId: string, note: string) => void;
  notes?: ApiTaskNote[];
  formatDateForDisplay: (dateString: string) => string;
  currentUserId?: string;
  showImages?: boolean;
  onNoteUpdated?: (taskApiId: string, updatedNotes: ApiTaskNote[]) => void;
  refetchChecklists?: () => Promise<any>;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  taskIndex,
  isChecklistLoading,
  isTemperatureTask = false,
  temperatureValue = "",
  onTemperatureChange,
  onStatusChange,
  onAddNoteClick,
  notes = [],
  formatDateForDisplay,
  currentUserId = "",
  showImages = false,
  onNoteUpdated,
  refetchChecklists,
}) => {
  const [showNotes, setShowNotes] = useState(false);
  const [showImagesDialog, setShowImagesDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<ApiTaskNote | null>(null);
  const [editNoteText, setEditNoteText] = useState("");
  const [deleteNoteDialog, setDeleteNoteDialog] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<ApiTaskNote | null>(null);
  const [localNotes, setLocalNotes] = useState<ApiTaskNote[]>(notes);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  const [updateTaskNote] = useUpdateTaskNoteMutation();
  const [deleteTaskNote] = useDeleteTaskNoteMutation();

  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;

    setIsAddingNote(true);
    try {
      onAddNoteClick(
        taskIndex,
        task.apiId || task.id.toString(),
        newNoteText.trim(),
      );
      setNewNoteText("");
    } catch (error) {
      console.error("Error adding note:", error);
    } finally {
      setIsAddingNote(false);
    }
  };

  const toggleNotes = () => {
    setShowNotes(!showNotes);
  };

  const toggleImagesDialog = () => {
    setShowImagesDialog(!showImagesDialog);
  };

  const handleEditNote = (note: ApiTaskNote) => {
    setEditingNote(note);
    setEditNoteText(note.note);
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setEditNoteText("");
  };

  const handleUpdateNote = async () => {
    if (!editingNote || !editNoteText.trim() || !task.apiId) return;

    try {
      setIsProcessing(true);

      const updatedNote: ApiTaskNote = {
        ...editingNote,
        note: editNoteText.trim(),
        created_at: new Date().toISOString(),
      };

      const updatedNotes = localNotes.map((note) =>
        note.id === editingNote.id ? updatedNote : note,
      );

      setLocalNotes(updatedNotes);
      setEditingNote(null);
      setEditNoteText("");

      if (onNoteUpdated && task.apiId) {
        onNoteUpdated(task.apiId, updatedNotes);
      }

      await updateTaskNote({
        id: editingNote.id,
        notes: { note: editNoteText.trim() },
      }).unwrap();

      toast.success("Note updated successfully!");

      if (refetchChecklists) {
        setTimeout(() => {
          refetchChecklists().catch(console.error);
        }, 100);
      }
    } catch (error: any) {
      console.error("Error updating note:", error);
      toast.error(error?.data?.message || "Failed to update note");

      setLocalNotes(notes);
      if (onNoteUpdated && task.apiId) {
        onNoteUpdated(task.apiId, notes);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteNoteClick = (note: ApiTaskNote) => {
    setNoteToDelete(note);
    setDeleteNoteDialog(true);
  };

  const handleDeleteNoteConfirm = async () => {
    if (!noteToDelete || !task.apiId) return;

    try {
      setIsProcessing(true);
      const noteIdToDelete = noteToDelete.id;

      const updatedNotes = localNotes.filter(
        (note) => note.id !== noteIdToDelete,
      );

      setLocalNotes(updatedNotes);
      setDeleteNoteDialog(false);
      setNoteToDelete(null);

      if (onNoteUpdated && task.apiId) {
        onNoteUpdated(task.apiId, updatedNotes);
      }

      await deleteTaskNote(noteIdToDelete).unwrap();

      toast.success("Note deleted successfully!");

      if (refetchChecklists) {
        setTimeout(() => {
          refetchChecklists().catch(console.error);
        }, 100);
      }
    } catch (error: any) {
      console.error("Error deleting note:", error);
      toast.error(error?.data?.message || "Failed to delete note");

      setLocalNotes(notes);
      if (onNoteUpdated && task.apiId) {
        onNoteUpdated(task.apiId, notes);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getCurrentStatus = () => {
    if (task.completed) return "completed";
    if (task.status === "in_progress") return "in_progress";
    return "pending";
  };

  const taskImages = task.reference_image_url || [];

  const canModifyNote = (note: ApiTaskNote) => {
    return note.created_by === currentUserId;
  };

  const isTemperatureField =
    isTemperatureTask ||
    task.title.toLowerCase().includes("temperature") ||
    task.title.toLowerCase().includes("fridge") ||
    task.title.toLowerCase().includes("temp");

  return (
    <>
      <Box
        sx={{
          border: "1px solid #e5e7eb",
          borderRadius: "6px",
          p: 2,
          bgcolor: "#ffffff",
          mb: 2,
        }}>
        {/* Task Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography
            sx={{
              fontWeight: 600,
              color: task.completed ? "#999" : "#000",
              fontSize: "0.95rem",
              textDecoration: task.completed ? "line-through" : "none",
              flex: 1,
            }}>
            {task.title}
          </Typography>

          {taskImages.length > 0 && showImages && (
            <IconButton
              size="small"
              onClick={toggleImagesDialog}
              sx={{ ml: 1, color: "#3b82f6" }}>
              <ImageIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* Task Description */}
        {task.description && (
          <Typography
            sx={{
              color: "#666",
              fontSize: "0.8rem",
              lineHeight: 1.4,
              mb: 1.5,
            }}>
            {task.description}
          </Typography>
        )}

        {/* Temperature Input Field */}
        {isTemperatureField && !task.completed && onTemperatureChange && (
          <Box sx={{ mb: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter temperature..."
              value={temperatureValue}
              onChange={(e) => onTemperatureChange(e.target.value)}
              disabled={isChecklistLoading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "0.875rem",
                  height: "36px",
                  "& fieldset": { borderColor: "#d1d5db" },
                  "&:hover fieldset": { borderColor: "#9ca3af" },
                },
              }}
            />
          </Box>
        )}

        {/* Images Preview */}
        {taskImages.length > 0 && showImages && !showImagesDialog && (
          <Box sx={{ mt: 1, mb: 1.5 }}>
            <Grid container spacing={1}>
              {taskImages.slice(0, 3).map((img) => (
                <Grid size={{ xs: 4 }} key={img.id}>
                  <Card
                    sx={{
                      height: 80,
                      cursor: "pointer",
                      "&:hover": { opacity: 0.9 },
                    }}
                    onClick={toggleImagesDialog}>
                    <CardMedia
                      component="img"
                      height="80"
                      image={img.url}
                      alt={img.name}
                      sx={{ objectFit: "cover" }}
                    />
                  </Card>
                </Grid>
              ))}
              {taskImages.length > 3 && (
                <Grid size={{ xs: 4 }}>
                  <Card
                    sx={{
                      height: 80,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "#f3f4f6",
                      cursor: "pointer",
                    }}
                    onClick={toggleImagesDialog}>
                    <Typography sx={{ fontSize: "0.75rem", color: "#6b7280" }}>
                      +{taskImages.length - 3} more
                    </Typography>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* Status Dropdown and Notes */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 1.5,
            pt: 1.5,
            borderTop: "1px solid #f3f4f6",
          }}>
          {/* Notes toggle */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              size="small"
              onClick={toggleNotes}
              disabled={isChecklistLoading}
              sx={{
                p: 0.5,
                color: "#6b7280",
                "&:hover": { color: "#3b82f6" },
              }}>
              <Badge
                color="primary"
                sx={{
                  "& .MuiBadge-badge": {
                    fontSize: "0.6rem",
                    height: "16px",
                    minWidth: "16px",
                    top: -2,
                    right: -2,
                  },
                }}>
                {showNotes ? (
                  <ExpandLessIcon sx={{ fontSize: 18 }} />
                ) : (
                  <ExpandMoreIcon sx={{ fontSize: 18 }} />
                )}
              </Badge>
            </IconButton>
            <Typography
              sx={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 500 }}>
              Notes
            </Typography>
          </Box>

          {/* Status dropdown */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={getCurrentStatus()}
              onChange={(e: SelectChangeEvent) =>
                onStatusChange(
                  taskIndex,
                  e.target.value as "pending" | "in_progress" | "completed",
                )
              }
              disabled={
                isChecklistLoading || (isTemperatureField && task.completed)
              }
              sx={{
                fontSize: "0.75rem",
                height: "32px",
                "& .MuiSelect-select": {
                  padding: "6px 32px 6px 12px",
                  display: "flex",
                  alignItems: "center",
                },
              }}>
              <MenuItem value="pending">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "#9ca3af",
                    }}
                  />
                  <span>Pending</span>
                </Box>
              </MenuItem>
              <MenuItem value="in_progress">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "#f59e0b",
                    }}
                  />
                  <span>In Progress</span>
                </Box>
              </MenuItem>
              <MenuItem value="completed">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "#10b981",
                    }}
                  />
                  <span>Completed</span>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Verified Status */}
        {task.verified && task.completed && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              color: "#10b981",
              fontWeight: 500,
              fontSize: "0.75rem",
              mt: 1,
              pt: 1,
              borderTop: "1px solid #f3f4f6",
            }}>
            <CheckCircleIcon sx={{ fontSize: 14 }} />
            <span>Verified by {task.verified}</span>
          </Box>
        )}

        {/* Notes Section */}
        <Collapse in={showNotes}>
          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: "1px solid #f3f4f6",
            }}>
            {/* Add Note Input - Inline */}
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <TextField
                  multiline
                  rows={1}
                  placeholder="Add a note..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  fullWidth
                  size="small"
                  disabled={isAddingNote || task.completed}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "0.85rem",
                    },
                  }}
                />
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleAddNote}
                  disabled={
                    !newNoteText.trim() || isAddingNote || task.completed
                  }
                  sx={{
                    textTransform: "none",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    height: "40px",
                    minWidth: "80px",
                  }}>
                  {isAddingNote ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    "Add"
                  )}
                </Button>
              </Stack>
            </Box>

            {/* Notes List Header */}
            {localNotes.length > 0 && (
              <Typography
                sx={{
                  fontWeight: 600,
                  color: "#374151",
                  fontSize: "0.85rem",
                  mb: 1.5,
                }}>
                Notes ({localNotes.length})
              </Typography>
            )}

            {/* Notes List */}
            {localNotes.length > 0 ? (
              <Stack spacing={1.5}>
                {localNotes.map((note) => (
                  <Box
                    key={`note-${note.id}`}
                    sx={{
                      p: 1.5,
                      bgcolor: "#f9fafb",
                      borderRadius: "6px",
                      borderLeft: "3px solid #3b82f6",
                      position: "relative",
                      "&:hover": { bgcolor: "#f3f4f6" },
                    }}>
                    {/* Edit/Delete buttons */}
                    {canModifyNote(note) && editingNote?.id !== note.id && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          display: "flex",
                          gap: 0.5,
                          zIndex: 1,
                        }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditNote(note)}
                          disabled={isProcessing}
                          sx={{
                            color: "#3b82f6",
                            width: 24,
                            height: 24,
                          }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteNoteClick(note)}
                          disabled={isProcessing}
                          sx={{
                            color: "#dc2626",
                            width: 24,
                            height: 24,
                          }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}

                    {/* Edit Mode */}
                    {editingNote?.id === note.id ? (
                      <Stack spacing={1}>
                        <TextField
                          multiline
                          rows={3}
                          value={editNoteText}
                          onChange={(e) => setEditNoteText(e.target.value)}
                          fullWidth
                          size="small"
                          disabled={isProcessing}
                          autoFocus
                        />
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 1,
                          }}>
                          <Button
                            size="small"
                            onClick={handleCancelEdit}
                            disabled={isProcessing}
                            variant="outlined">
                            Cancel
                          </Button>
                          <Button
                            size="small"
                            onClick={handleUpdateNote}
                            disabled={!editNoteText.trim() || isProcessing}
                            variant="contained">
                            {isProcessing ? (
                              <CircularProgress size={16} />
                            ) : (
                              "Update"
                            )}
                          </Button>
                        </Box>
                      </Stack>
                    ) : (
                      /* View Mode */
                      <>
                        <Typography
                          sx={{
                            fontSize: "0.85rem",
                            color: "#374151",
                            mb: 1,
                            lineHeight: 1.5,
                            pr: canModifyNote(note) ? 6 : 0,
                          }}>
                          {note.note}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}>
                          <Typography
                            sx={{
                              fontSize: "0.7rem",
                              color: "#6b7280",
                              fontWeight: 500,
                            }}>
                            {note.created_by_name || "You"}
                          </Typography>
                          <Typography
                            sx={{ fontSize: "0.7rem", color: "#9ca3af" }}>
                            {formatDateForDisplay(note.created_at)}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                ))}
              </Stack>
            ) : (
              <Box
                sx={{
                  textAlign: "center",
                  py: 3,
                  bgcolor: "#f9fafb",
                  borderRadius: "6px",
                  border: "1px dashed #d1d5db",
                }}>
                <NotesIcon sx={{ fontSize: 24, color: "#9ca3af", mb: 1 }} />
                <Typography
                  sx={{
                    fontSize: "0.8rem",
                    color: "#9ca3af",
                    fontStyle: "italic",
                  }}>
                  No notes yet. Add a note above.
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      </Box>

      {/* Images Dialog */}
      <Dialog
        open={showImagesDialog}
        onClose={toggleImagesDialog}
        maxWidth="md"
        fullWidth>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Task Images ({taskImages.length})
            </Typography>
            <IconButton onClick={toggleImagesDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          <Grid container spacing={2}>
            {taskImages.map((img) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={img.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={img.url}
                    alt={img.name}
                    sx={{ objectFit: "cover" }}
                  />
                  <Box sx={{ p: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}>
                      {img.name}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleImagesDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Note Confirmation Dialog */}
      <Dialog
        open={deleteNoteDialog}
        onClose={() => setDeleteNoteDialog(false)}>
        <DialogTitle>Delete Note</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this note? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteNoteDialog(false)}
            disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteNoteConfirm}
            color="error"
            variant="contained"
            disabled={isProcessing}>
            {isProcessing ? <CircularProgress size={20} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TaskItem;
