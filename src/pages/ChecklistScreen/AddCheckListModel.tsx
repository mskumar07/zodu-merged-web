import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Grid,
  TextField,
  Typography,
  MenuItem,
  Button,
  IconButton,
  Card,
  CardContent,
  FormControlLabel,
  Radio,
  RadioGroup,
  Chip,
  Stack,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AddIcon from "@mui/icons-material/Add";
import {
  useGetChecklistCategoryQuery,
  useGetChecklistAssigneesQuery,
  useCreateChecklistMutation,
} from "@store/services/checklistApi";
import type { ChecklistFormData } from "@types/checklist";
import AddTaskModal from "./AddTaskModal";
import AddAssigneeModal from "./AddAssigneeModal";
import { toast } from "react-toastify";

interface AddChecklistModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ChecklistFormData) => void;
  branchId: string;
  zoduId: string;
  userId: string;
}

interface TaskItem {
  id: string;
  name: string;
  description: string;
  attachments: Array<{
    id: string;
    name: string;
    type: "image" | "pdf" | "other";
  }>;
}

interface AssigneeItem {
  id: string;
  name: string;
  role: string;
  selected: boolean;
}

const AddChecklistModal: React.FC<AddChecklistModalProps> = ({
  open,
  onClose,
  onSubmit,
  branchId,
  zoduId,
  userId,
}) => {
  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [recurrence, setRecurrence] = useState("No Recurrence");

  // Tasks state
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [assignees, setAssignees] = useState<AssigneeItem[]>([]);

  // Modal states
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [addAssigneeModalOpen, setAddAssigneeModalOpen] = useState(false);

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API queries
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useGetChecklistCategoryQuery({
      zoduId,
      branchId,
    });

  const { data: assigneesData, isLoading: isLoadingAssignees } =
    useGetChecklistAssigneesQuery({
      zoduId,
      branchId,
    });

  const [createChecklist] = useCreateChecklistMutation();

  // Initialize assignees from API
  useEffect(() => {
    if (assigneesData?.Data) {
      const apiAssignees: AssigneeItem[] = assigneesData.Data.map(
        (assignee: any) => ({
          id: assignee.id || assignee.user_id,
          name: assignee.name,
          role: assignee.role || "Staff",
          selected: false,
        })
      );
      setAssignees(apiAssignees);
    }
  }, [assigneesData]);

  // Handle adding a new task
  const handleAddTask = (task: {
    name: string;
    description: string;
    attachments: any[];
  }) => {
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      name: task.name,
      description: task.description,
      attachments: task.attachments.map((att) => ({
        id: att.id || `att-${Date.now()}`,
        name: att.name,
        type: "other",
      })),
    };
    setTasks([...tasks, newTask]);
    setAddTaskModalOpen(false);
  };

  // Handle removing a task
  const handleRemoveTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  // Handle adding a new assignee
  const handleAddAssignee = (assignee: {
    name: string;
    email?: string;
    role?: string;
  }) => {
    const newAssignee: AssigneeItem = {
      id: `assignee-${Date.now()}`,
      name: assignee.name,
      role: assignee.role || "Staff",
      selected: false,
    };
    setAssignees([...assignees, newAssignee]);
    setAddAssigneeModalOpen(false);
  };

  // Handle assignee selection
  const handleAssigneeSelect = (assigneeId: string) => {
    setAssignees(
      assignees.map((assignee) =>
        assignee.id === assigneeId
          ? { ...assignee, selected: !assignee.selected }
          : assignee
      )
    );
  };

  // Handle select all assignees
  const handleSelectAll = () => {
    const allSelected = assignees.every((a) => a.selected);
    setAssignees(
      assignees.map((assignee) => ({
        ...assignee,
        selected: !allSelected,
      }))
    );
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Please enter a checklist title");
      return;
    }

    if (!category) {
      toast.error("Please select a category");
      return;
    }

    if (tasks.length === 0) {
      toast.error("Please add at least one task");
      return;
    }

    const selectedAssignees = assignees.filter((a) => a.selected);
    if (selectedAssignees.length === 0) {
      toast.error("Please select at least one assignee");
      return;
    }

    try {
      setIsSubmitting(true);

      const checklistData: ChecklistFormData = {
        zoduId,
        branchId,
        userId,
        name: title,
        description,
        category_id: parseInt(category),
        tasks: tasks.map((task) => ({
          title: task.name,
          description: task.description,
        })),
        assignees: selectedAssignees.map((a) => ({
          name: a.name,
          id: a.id,
        })),
        schedule: {
          start_date: dueDate || new Date().toISOString().split("T")[0],
          due_at: dueTime || "09:00:00",
          recurrence_rrule:
            recurrence === "No Recurrence"
              ? ""
              : `FREQ=${recurrence.toUpperCase()}`,
        },
      };
      console.log("Checklist Data: ", checklistData);

      // Call the API
      const response = await createChecklist(checklistData).unwrap();

      // Call the parent onSubmit callback
      onSubmit(checklistData);

      // Reset form
      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to create checklist:", error);
      toast.error("Failed to create checklist. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setTitle("");
    setCategory("");
    setDescription("");
    setDueDate("");
    setDueTime("");
    setRecurrence("No Recurrence");
    setTasks([]);
    setAssignees(assignees.map((a) => ({ ...a, selected: false })));
  };

  // Handle modal close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95%", sm: "90%", md: "900px" },
            maxHeight: "90vh",
            bgcolor: "background.paper",
            borderRadius: "12px",
            boxShadow: 24,
            p: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}>
          {/* Header */}
          <Box
            sx={{
              p: 3,
              borderBottom: "1px solid #e0e0e0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              bgcolor: "#f8f9fa",
            }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Create New Checklist
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
            <Grid container spacing={3}>
              {/* First Row */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 2 }}>
                    General Information
                  </Typography>

                  <TextField
                    label="Checklist Title"
                    fullWidth
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter checklist name"
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    select
                    label="Category"
                    fullWidth
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    sx={{ mb: 2 }}
                    disabled={isLoadingCategories}>
                    <MenuItem value="">Select Category</MenuItem>
                    {categoriesData?.Data?.map((cat: any) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add details..."
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 2 }}>
                    Schedule
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Due Date"
                        type="date"
                        fullWidth
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarTodayIcon
                                sx={{ color: "text.secondary" }}
                              />
                            </InputAdornment>
                          ),
                        }}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Due Time"
                        type="time"
                        fullWidth
                        value={dueTime}
                        onChange={(e) => setDueTime(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccessTimeIcon
                                sx={{ color: "text.secondary" }}
                              />
                            </InputAdornment>
                          ),
                        }}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <TextField
                        select
                        label="Recurrence"
                        fullWidth
                        value={recurrence}
                        onChange={(e) => setRecurrence(e.target.value)}>
                        <MenuItem value="No Recurrence">No Recurrence</MenuItem>
                        <MenuItem value="Daily">Daily</MenuItem>
                        <MenuItem value="Weekly">Weekly</MenuItem>
                        <MenuItem value="Monthly">Monthly</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* Second Row */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Checklist Tasks ({tasks.length})
                    </Typography>
                  </Box>

                  {tasks.length === 0 ? (
                    <toast.error severity="info" sx={{ mb: 2 }}>
                      No tasks existed yet. Start by adding your first task
                      below.
                    </toast.error>
                  ) : (
                    <Stack spacing={2} sx={{ mb: 2 }}>
                      {tasks.map((task) => (
                        <Card key={task.id} variant="outlined">
                          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                              }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="subtitle2"
                                  sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {task.name}
                                </Typography>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveTask(task.id)}
                                sx={{ ml: 1 }}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  )}

                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setAddTaskModalOpen(true)}
                    fullWidth
                    sx={{ py: 1.5 }}>
                    + Add New Task
                  </Button>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Assign To
                    </Typography>
                    <Button
                      size="small"
                      onClick={handleSelectAll}
                      sx={{ textTransform: "none", fontSize: "0.75rem" }}>
                      {assignees.every((a) => a.selected)
                        ? "Deselect All"
                        : "Select All"}
                    </Button>
                  </Box>

                  {assignees.length === 0 && !isLoadingAssignees ? (
                    <toast.error severity="info" sx={{ mb: 2 }}>
                      No assignees found. Add assignees to assign tasks.
                    </toast.error>
                  ) : (
                    <RadioGroup
                      sx={{ maxHeight: "300px", overflow: "auto", pr: 1 }}>
                      {assignees.map((assignee) => (
                        <Box
                          key={assignee.id}
                          sx={{
                            p: 1.5,
                            border: "1px solid #e0e0e0",
                            borderRadius: "6px",
                            mb: 1,
                            display: "flex",
                            alignItems: "center",
                            bgcolor: assignee.selected
                              ? "#f0f7ff"
                              : "transparent",
                          }}>
                          <FormControlLabel
                            control={
                              <Radio
                                checked={assignee.selected}
                                onChange={() =>
                                  handleAssigneeSelect(assignee.id)
                                }
                                size="small"
                              />
                            }
                            label={
                              <Box sx={{ ml: 1 }}>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 500 }}>
                                  {assignee.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary">
                                  {assignee.role}
                                </Typography>
                              </Box>
                            }
                            sx={{ flex: 1, m: 0 }}
                          />
                        </Box>
                      ))}
                    </RadioGroup>
                  )}

                  <Button
                    variant="outlined"
                    startIcon={<PersonAddIcon />}
                    onClick={() => setAddAssigneeModalOpen(true)}
                    fullWidth
                    sx={{ mt: 2, py: 1.5 }}>
                    + Add Assignee
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              p: 2,
              borderTop: "1px solid #e0e0e0",
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              bgcolor: "#f8f9fa",
            }}>
            <Button
              variant="outlined"
              onClick={handleClose}
              disabled={isSubmitting}
              sx={{ minWidth: "100px" }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting}
              sx={{
                minWidth: "150px",
                bgcolor: "#dc2626",
                "&:hover": { bgcolor: "#b91c1c" },
              }}>
              {isSubmitting ? "Creating..." : "Save Checklist"}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Add Task Modal */}
      <AddTaskModal
        open={addTaskModalOpen}
        onClose={() => setAddTaskModalOpen(false)}
        onSubmit={handleAddTask}
      />

      {/* Add Assignee Modal */}
      <AddAssigneeModal
        open={addAssigneeModalOpen}
        onClose={() => setAddAssigneeModalOpen(false)}
        onSubmit={handleAddAssignee}
      />
    </>
  );
};

export default AddChecklistModal;
