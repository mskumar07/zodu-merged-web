import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  AvatarGroup,
  Avatar,
  LinearProgress,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import type { ChecklistItem } from "./types/checklist";

interface ChecklistTableProps {
  data: ChecklistItem[];
  onChecklistClick: (checklist: ChecklistItem) => void;
  onEditClick: (checklist: ChecklistItem) => void;
  onDeleteClick: (checklist: ChecklistItem) => void;
  canManage?: boolean;
}

const ChecklistTable: React.FC<ChecklistTableProps> = ({
  data,
  onChecklistClick,
  onEditClick,
  onDeleteClick,
  canManage = true,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] =
    useState<ChecklistItem | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return { bg: "#fef2f2", text: "#dc2626" };
      case "medium":
        return { bg: "#fefce8", text: "#d97706" };
      case "low":
        return { bg: "#f0f9ff", text: "#0369a1" };
      default:
        return { bg: "#f3f4f6", text: "#6b7280" };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return { bg: "#dbeafe", text: "#1d4ed8" };
      case "in_progress":
        return { bg: "#fef3c7", text: "#d97706" };
      case "completed":
        return { bg: "#d1fae5", text: "#047857" };
      case "pending":
        return { bg: "#f3f4f6", text: "#6b7280" };
      default:
        return { bg: "#f3f4f6", text: "#6b7280" };
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const checkDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );

      if (checkDate.getTime() === today.getTime()) {
        return `Today ${date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}`;
      }

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (checkDate.getTime() === tomorrow.getTime()) {
        return `Tomorrow ${date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}`;
      }

      return (
        date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
        " " +
        date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleEditClick = (e: React.MouseEvent, checklist: ChecklistItem) => {
    e.stopPropagation(); // Prevent table row click
    onEditClick(checklist);
  };

  const handleDeleteClick = (e: React.MouseEvent, checklist: ChecklistItem) => {
    e.stopPropagation(); // Prevent table row click
    setSelectedChecklist(checklist);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedChecklist) {
      onDeleteClick(selectedChecklist);
      setDeleteDialogOpen(false);
      setSelectedChecklist(null);
    }
  };

  return (
    <>
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: "#f9fafb" }}>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  py: 1.5,
                }}>
                TITLE
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  py: 1.5,
                }}>
                STATUS
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  py: 1.5,
                }}>
                PRIORITY
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  py: 1.5,
                }}>
                PROGRESS
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  py: 1.5,
                }}>
                DUE DATE
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  py: 1.5,
                }}>
                ASSIGNEES
              </TableCell>
              {canManage && (
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    color: "#6b7280",
                    py: 1.5,
                    width: "100px",
                  }}>
                  ACTIONS
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((checklist) => {
              const priorityColors = getPriorityColor(
                checklist.priority || "medium",
              );
              const statusColors = getStatusColor(checklist.status);

              return (
                <TableRow
                  key={checklist.id}
                  hover
                  sx={{ cursor: "pointer", "&:hover": { bgcolor: "#fafafa" } }}
                  onClick={() => onChecklistClick(checklist)}>
                  <TableCell sx={{ py: 1.5 }}>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                        {checklist.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#9ca3af", display: "block" }}>
                        {checklist.description}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mt: 0.5,
                        }}>
                        <Chip
                          label={checklist.category}
                          size="small"
                          sx={{
                            fontSize: "0.7rem",
                            height: "20px",
                            bgcolor: "#f3f4f6",
                            color: "#6b7280",
                          }}
                        />
                        <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                          {checklist.checklist_id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ py: 1.5 }}>
                    <Chip
                      label={checklist.status.replace("_", " ").toUpperCase()}
                      size="small"
                      sx={{
                        fontSize: "0.7rem",
                        height: "20px",
                        bgcolor: statusColors.bg,
                        color: statusColors.text,
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>

                  <TableCell sx={{ py: 1.5 }}>
                    <Chip
                      label={checklist.priority?.toUpperCase() || "MEDIUM"}
                      size="small"
                      sx={{
                        fontSize: "0.7rem",
                        height: "20px",
                        bgcolor: priorityColors.bg,
                        color: priorityColors.text,
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>

                  <TableCell sx={{ py: 1.5, width: 140 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={checklist.progress || 0}
                        sx={{
                          flex: 1,
                          height: 6,
                          borderRadius: 3,
                          bgcolor: "#e5e7eb",
                          "& .MuiLinearProgress-bar": {
                            bgcolor:
                              checklist.progress === 100
                                ? "#10b981"
                                : "#3b82f6",
                            borderRadius: 3,
                          },
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          minWidth: 35,
                          fontSize: "0.75rem",
                        }}>
                        {checklist.progress || 0}%
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ color: "#9ca3af", fontSize: "0.7rem" }}>
                      {checklist.completed_tasks || 0}/
                      {checklist.total_tasks || 0} tasks
                    </Typography>
                  </TableCell>

                  <TableCell sx={{ py: 1.5 }}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <AccessTimeIcon sx={{ fontSize: 14, color: "#9ca3af" }} />
                      <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                        {formatDate(checklist.due_date)}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ py: 1.5 }}>
                    <AvatarGroup
                      max={3}
                      sx={{
                        justifyContent: "flex-start",
                        "& .MuiAvatar-root": {
                          width: 24,
                          height: 24,
                          fontSize: "0.7rem",
                        },
                      }}>
                      {checklist.assignees.map((assignee) => (
                        <Avatar
                          key={assignee.id}
                          sx={{ bgcolor: assignee.color }}>
                          {assignee.initials}
                        </Avatar>
                      ))}
                    </AvatarGroup>
                  </TableCell>

                  {canManage && (
                    <TableCell sx={{ py: 1.5 }}>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => handleEditClick(e, checklist)}
                          sx={{
                            color: "#3b82f6",
                            "&:hover": {
                              backgroundColor: "#eff6ff",
                              color: "#1d4ed8",
                            },
                          }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => handleDeleteClick(e, checklist)}
                          sx={{
                            color: "#dc2626",
                            "&:hover": {
                              backgroundColor: "#fef2f2",
                              color: "#b91c1c",
                            },
                          }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onClick={(e) => e.stopPropagation()}>
        <DialogTitle>Delete Checklist</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "
            {selectedChecklist && selectedChecklist?.title}"? This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChecklistTable;
