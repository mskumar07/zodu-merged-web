// EditChecklistModal.tsx - Updated to match AddChecklistModal
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateChecklistMutation,
  useGetChecklistDashboardQuery,
  useGetAssignableUsersQuery,
} from "@store/services/checklistApi";
import axiosInstance from "@store/services/axiosInstance";
import { apiConfig } from "@config/api";
import { DEFAULT_PARAMS, transformApiChecklistToUi } from "./types/checklist";

interface AttachmentFile {
  id: string;
  filename: string;
  url: string;
}

interface TaskItem {
  id: number;
  title: string;
  description: string;
  images: File[];
  imageUrls: string[];
  existingImages: Array<{ id: string; url: string; name: string }>;
  apiId?: string;
}

const EditChecklistModal: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const apiParams = {
    zodu_id: DEFAULT_PARAMS.zoduId,
    branch_id: DEFAULT_PARAMS.branchId,
    user_id: DEFAULT_PARAMS.userId,
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: dayjs().add(1, "day"),
    dueTime: dayjs().set("hour", 10).set("minute", 30),
    repeat: "norepeat" as "norepeat" | "daily" | "weekly" | "monthly",
    assignees: [] as string[],
    category: "",
  });

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    images: [] as File[],
    imageUrls: [] as string[],
  });
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Get assignable users
  const { data: assignableUsersResponse } = useGetAssignableUsersQuery({
    zodu_id: apiParams.zodu_id,
    branch_id: apiParams.branch_id,
  });

  const { data: categoriesResponse, refetch: refetchCategories } =
    useGetCategoriesQuery({
      zodu_id: apiParams.zodu_id,
      branch_id: apiParams.branch_id,
    });

  const { data: apiData } = useGetChecklistDashboardQuery(apiParams);

  const [createCategory] = useCreateCategoryMutation();
  const [updateChecklist, { isLoading }] = useUpdateChecklistMutation();

  const fetchedCategories = categoriesResponse?.Data || [];
  const assignableUsers = assignableUsersResponse?.Data || [];

  // Get the checklist to edit
  const checklistToEdit = useMemo(() => {
    if (id && apiData?.Data?.checklists) {
      return apiData.Data.checklists
        .map(transformApiChecklistToUi)
        .find((c) => c.id === id);
    }
    return null;
  }, [id, apiData]);

  const uploadFiles = async (files: File[]): Promise<AttachmentFile[]> => {
    if (!files || files.length === 0) {
      return [];
    }

    setIsUploadingImages(true);

    try {
      const uploadedResults: AttachmentFile[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await axiosInstance.post(
            apiConfig.uploadImage(),
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            },
          );

          let fileUrl = "";

          if (response.data?.fileUrl) {
            fileUrl = response.data.fileUrl;
          } else if (response.data?.data?.fileUrl) {
            fileUrl = response.data.data.fileUrl;
          } else if (response.data?.url) {
            fileUrl = response.data.url;
          } else if (response.data?.path) {
            fileUrl = response.data.path;
          } else if (response.data?.location) {
            fileUrl = response.data.location;
          } else if (typeof response.data === "string") {
            fileUrl = response.data;
          }

          if (fileUrl) {
            uploadedResults.push({
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              filename: file.name,
              url: fileUrl,
            });
          } else {
            toast.error(`Failed to upload ${file.name}`);
          }
        } catch (fileError: any) {
          console.error("Failed to upload file:", file.name, fileError);
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      setIsUploadingImages(false);
      return uploadedResults;
    } catch (error: any) {
      console.error("File upload process failed:", error);
      toast.error("Failed to upload files. Please try again.");
      setIsUploadingImages(false);
      return [];
    }
  };

  useEffect(() => {
    if (checklistToEdit) {
      console.log("Loading edit mode data:", checklistToEdit);

      // Parse due date
      let dueDate = dayjs().add(1, "day");
      let dueTime = dayjs().set("hour", 10).set("minute", 30);

      if (checklistToEdit.due_date) {
        try {
          const dateObj = new Date(checklistToEdit.due_date);
          dueDate = dayjs(dateObj);
          dueTime = dayjs(dateObj);
        } catch (error) {
          console.error("Error parsing date:", error);
        }
      }

      // Get assignee IDs
      const assigneeIds = checklistToEdit.assignees?.map((a) => a.id) || [];

      setFormData({
        title: checklistToEdit.title || "",
        description: checklistToEdit.description || "",
        dueDate,
        dueTime,
        repeat: "norepeat",
        assignees: assigneeIds,
        category: checklistToEdit.category || "",
      });

      // Preserve task data properly with existing images
      const initialTasks: TaskItem[] =
        checklistToEdit.tasks?.map((task, index) => ({
          id: task.id,
          title: task.title || "",
          description: task.description || "",
          images: [],
          imageUrls: [],
          existingImages:
            task.reference_image_url?.map((img) => ({
              id: img.id,
              url: img.url,
              name: img.name,
            })) || [],
          apiId: task.apiId,
        })) || [];

      console.log("Initial tasks with apiId:", initialTasks);
      setTasks(initialTasks);
    }
  }, [checklistToEdit]);

  const handleChange = (field: string) => (e: any) => {
    setFormData({ ...formData, [field]: e.target?.value });
  };

  const handleAssigneeChange = (e: any) => {
    setFormData({ ...formData, assignees: e.target.value as string[] });
  };

  const removeAssignee = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      assignees: prev.assignees.filter((id) => id !== userId),
    }));
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    let uploadedImages: AttachmentFile[] = [];
    if (newTask.images.length > 0) {
      try {
        toast.info("Uploading images...");
        uploadedImages = await uploadFiles(newTask.images);

        if (uploadedImages.length === 0 && newTask.images.length > 0) {
          toast.warning("Image upload failed. Task added without images.");
        } else if (uploadedImages.length < newTask.images.length) {
          toast.warning(
            `Only ${uploadedImages.length} of ${newTask.images.length} images uploaded.`,
          );
        }
      } catch (error) {
        console.error("Error uploading images:", error);
        toast.error("Failed to upload images");
        return;
      }
    }

    if (editingTaskId !== null) {
      setTasks(
        tasks.map((task) =>
          task.id === editingTaskId
            ? {
                ...task,
                title: newTask.title.trim(),
                description: newTask.description.trim(),
                images: [],
                imageUrls: [],
                existingImages: [
                  ...task.existingImages,
                  ...uploadedImages.map((img) => ({
                    id: img.id,
                    url: img.url,
                    name: img.filename,
                  })),
                ],
              }
            : task,
        ),
      );
      toast.success("Task updated!");
    } else {
      setTasks([
        ...tasks,
        {
          id: tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1,
          title: newTask.title.trim(),
          description: newTask.description.trim(),
          images: [],
          imageUrls: [],
          existingImages: uploadedImages.map((img) => ({
            id: img.id,
            url: img.url,
            name: img.filename,
          })),
        },
      ]);
      toast.success("Task added!");
    }

    setNewTask({ title: "", description: "", images: [], imageUrls: [] });
    setEditingTaskId(null);
    setShowAddTaskModal(false);
  };

  const handleEditTask = (task: TaskItem) => {
    setNewTask({
      title: task.title,
      description: task.description,
      images: [],
      imageUrls: [],
    });
    setEditingTaskId(task.id);
    setShowAddTaskModal(true);
  };

  const handleRemoveTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
    toast.success("Task removed!");
  };

  const handleRemoveTaskImage = (taskId: number, imageId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              existingImages: task.existingImages.filter(
                (img) => img.id !== imageId,
              ),
            }
          : task,
      ),
    );
    toast.success("Image removed!");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files);
      const newImageUrls = newImages.map((file) => URL.createObjectURL(file));
      setNewTask((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
        imageUrls: [...prev.imageUrls, ...newImageUrls],
      }));
    }
  };

  const removeImage = (index: number) => {
    if (newTask.imageUrls[index]) {
      URL.revokeObjectURL(newTask.imageUrls[index]);
    }

    setNewTask((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      await createCategory({
        zodu_id: apiParams.zodu_id,
        branch_id: apiParams.branch_id,
        name: newCategoryName.trim(),
      }).unwrap();

      toast.success("Category added!");
      setNewCategoryName("");
      setShowAddCategory(false);
      refetchCategories();

      // Select the newly added category
      setFormData((prev) => ({
        ...prev,
        category: newCategoryName.trim(),
      }));
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add category");
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a checklist title");
      return;
    }
    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }
    if (tasks.length === 0) {
      toast.error("Please add at least one task");
      return;
    }
    if (formData.assignees.length === 0) {
      toast.error("Please assign at least one user");
      return;
    }
    if (!formData.dueDate.isValid()) {
      toast.error("Please select a valid due date");
      return;
    }
    if (!formData.dueTime.isValid()) {
      toast.error("Please select a valid due time");
      return;
    }

    try {
      const category = fetchedCategories.find(
        (cat) => cat.name === formData.category,
      );
      const categoryId = category?.id || checklistToEdit?.category_id || 5;

      const combinedDateTime = formData.dueDate
        .set("hour", formData.dueTime.hour())
        .set("minute", formData.dueTime.minute());

      // Prepare task data for API
      const taskData = tasks.map((task) => {
        const taskPayload: any = {
          title: task.title.trim(),
          description: task.description.trim(),
          reference_image_url: task.existingImages.map((img) => ({
            id: img.id,
            url: img.url,
            name: img.name,
          })),
          voice_note_url: null,
        };

        // For existing tasks, include task_id
        if (task.apiId) {
          taskPayload.task_id = task.apiId;
        }

        console.log("Task payload for API:", taskPayload);
        return taskPayload;
      });

      console.log("All tasks payload:", taskData);

      const submitData = {
        checklist: {
          title: formData.title.trim(),
          description: formData.description.trim(),
          category_id: categoryId,
          branch_id: apiParams.branch_id,
          zodu_id: apiParams.zodu_id,
          created_by: apiParams.user_id,
        },
        schedule: {
          due_date: combinedDateTime.format("YYYY-MM-DD"),
          due_time: combinedDateTime.format("HH:mm"),
          repeat: formData.repeat,
        },
        tasks: taskData,
        assignees: formData.assignees,
      };

      console.log("Submitting data to API:", submitData);

      if (checklistToEdit) {
        await updateChecklist({
          id: checklistToEdit.id,
          data: submitData,
        }).unwrap();

        toast.success(`Checklist "${formData.title}" updated successfully!`);
        navigate("/checklist");
      }
    } catch (err: any) {
      console.error("Failed to process form data:", err);
      toast.error(
        err?.data?.message || `Failed to update checklist. Please try again.`,
      );
    }
  };

  const handleCancel = () => {
    tasks.forEach((task) => {
      task.existingImages.forEach((img) => {
        if (img.url.startsWith("blob:")) {
          URL.revokeObjectURL(img.url);
        }
      });
    });

    newTask.imageUrls.forEach((url) => {
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });

    navigate("/checklist");
  };

  const renderTaskCard = (task: TaskItem) => (
    <Card
      key={`task-${task.id}-${task.apiId || "new"}`}
      variant="outlined"
      sx={{ mb: 1 }}>
      <CardContent sx={{ p: 1.5 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start">
          <Box flex={1}>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              fontSize="0.875rem"
              mb={0.5}>
              {task.title}
            </Typography>
            {task.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                fontSize="0.75rem"
                mb={0.5}>
                {task.description}
              </Typography>
            )}

            {/* Task ID for existing tasks */}
            {task.apiId && (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mb={1}
                fontSize="0.7rem">
                Task ID: {task.apiId}
              </Typography>
            )}

            {/* Images section */}
            {task.existingImages.length > 0 && (
              <Box mt={0.5}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mb={0.25}
                  fontSize="0.7rem">
                  Attached Images ({task.existingImages.length}):
                </Typography>
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{ maxHeight: 100, overflow: "auto" }}>
                  <Table size="small">
                    <TableBody>
                      {task.existingImages.map((img, index) => (
                        <TableRow key={img.id} hover>
                          <TableCell sx={{ py: 0.25 }}>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <ImageIcon
                                fontSize="small"
                                color="action"
                                sx={{ fontSize: 14 }}
                              />
                              <Typography variant="caption" fontSize="0.7rem">
                                {img.name.length > 15
                                  ? img.name.substring(0, 15) + "..."
                                  : img.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right" sx={{ py: 0.25 }}>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleRemoveTaskImage(task.id, img.id)
                              }
                              sx={{ color: "#dc2626", p: 0.25 }}>
                              <DeleteIcon
                                fontSize="small"
                                sx={{ fontSize: 14 }}
                              />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
          <Stack direction="row" spacing={0.25}>
            <IconButton
              size="small"
              onClick={() => handleEditTask(task)}
              sx={{ color: "#3b82f6", p: 0.5 }}>
              <EditIcon fontSize="small" sx={{ fontSize: 14 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleRemoveTask(task.id)}
              sx={{ color: "#dc2626", p: 0.5 }}>
              <DeleteIcon fontSize="small" sx={{ fontSize: 14 }} />
            </IconButton>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );

  if (!checklistToEdit) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          p: 2,
          bgcolor: "#f9fafb",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
        {/* Form Content */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}>
          <Grid
            container
            spacing={2}
            sx={{
              flex: 1,
              overflow: "hidden",
              marginBottom: 2,
            }}>
            {/* Left Column */}
            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}>
              <Paper
                sx={{
                  p: 2,
                  mb: 2,
                  flexShrink: 0,
                }}>
                <Typography
                  variant="subtitle2"
                  mb={2}
                  fontWeight={600}
                  color="#374151"
                  fontSize="0.875rem">
                  General Information
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Checklist Title *"
                    value={formData.title}
                    onChange={handleChange("title")}
                    fullWidth
                    disabled={isLoading}
                    size="small"
                  />

                  {/* Category Section */}
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      mb={0.5}
                      fontSize="0.7rem">
                      Category *
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={formData.category}
                        onChange={handleChange("category")}
                        disabled={isLoading}>
                        {fetchedCategories.map((cat) => (
                          <MenuItem key={cat.id} value={cat.name}>
                            {cat.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Add Category Button */}
                    <Box sx={{ mt: 0.5 }}>
                      <Button
                        size="small"
                        startIcon={<AddIcon fontSize="small" />}
                        onClick={() => setShowAddCategory(true)}
                        sx={{
                          fontSize: "0.7rem",
                          textTransform: "none",
                          p: 0.5,
                        }}>
                        Add New Category
                      </Button>
                    </Box>
                  </Box>

                  <TextField
                    label="Description"
                    value={formData.description}
                    onChange={handleChange("description")}
                    multiline
                    rows={2}
                    fullWidth
                    disabled={isLoading}
                    size="small"
                  />
                </Stack>
              </Paper>

              {/* Tasks Section */}
              <Paper
                sx={{
                  p: 2,
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                  flexShrink={0}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    color="#374151"
                    fontSize="0.875rem">
                    Checklist Tasks ({tasks.length})
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setShowAddTaskModal(true);
                      setEditingTaskId(null);
                      setNewTask({
                        title: "",
                        description: "",
                        images: [],
                        imageUrls: [],
                      });
                    }}
                    disabled={isLoading}
                    size="small">
                    Add Task
                  </Button>
                </Box>

                {/* Tasks List - Scrollable area */}
                <Box
                  sx={{
                    flex: 1,
                    overflow: "auto",
                    pr: 0.5,
                    maxHeight: "100%",
                    minHeight: 0,
                  }}>
                  {tasks.length === 0 ? (
                    <Box
                      textAlign="center"
                      py={4}
                      border="1px dashed #e5e7eb"
                      borderRadius={1}
                      bgcolor="#f9fafb">
                      <Typography
                        color="text.secondary"
                        mb={0.5}
                        fontSize="0.875rem">
                        No tasks added yet
                      </Typography>
                      <Typography
                        variant="caption"
                        color="#9ca3af"
                        fontSize="0.7rem">
                        Click "Add Task" to create your first task
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={1}>{tasks.map(renderTaskCard)}</Stack>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Right Column */}
            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}>
              <Paper
                sx={{
                  p: 2,
                  mb: 2,
                  flexShrink: 0,
                }}>
                <Typography
                  variant="subtitle2"
                  mb={2}
                  fontWeight={600}
                  color="#374151"
                  fontSize="0.875rem">
                  Schedule Information
                </Typography>
                <Stack spacing={2}>
                  {/* Due Date */}
                  <Box>
                    <Typography
                      variant="caption"
                      display="block"
                      mb={0.5}
                      color="text.secondary"
                      fontSize="0.7rem">
                      Due Date *
                    </Typography>
                    <DatePicker
                      value={formData.dueDate}
                      onChange={(newValue) => handleChange("dueDate")(newValue)}
                      disabled={isLoading}
                      minDate={dayjs()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !formData.dueDate.isValid(),
                          size: "small",
                        },
                      }}
                    />
                  </Box>

                  {/* Due Time */}
                  <Box>
                    <Typography
                      variant="caption"
                      display="block"
                      mb={0.5}
                      color="text.secondary"
                      fontSize="0.7rem">
                      Due Time *
                    </Typography>
                    <TimePicker
                      value={formData.dueTime}
                      onChange={(newValue) => handleChange("dueTime")(newValue)}
                      disabled={isLoading}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !formData.dueTime.isValid(),
                          size: "small",
                        },
                      }}
                    />
                  </Box>

                  {/* Repeat */}
                  <Box>
                    <Typography
                      variant="caption"
                      display="block"
                      mb={0.5}
                      color="text.secondary"
                      fontSize="0.7rem">
                      Repeat
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={formData.repeat}
                        onChange={handleChange("repeat")}
                        disabled={isLoading}>
                        <MenuItem value="norepeat">No Repeat</MenuItem>
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Stack>
              </Paper>

              <Paper
                sx={{
                  p: 2,
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}>
                <Typography
                  variant="subtitle2"
                  mb={2}
                  fontWeight={600}
                  color="#374151"
                  fontSize="0.875rem">
                  Assign To ({formData.assignees.length})
                </Typography>

                <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                  <InputLabel>Select Assignees</InputLabel>
                  <Select
                    multiple
                    value={formData.assignees}
                    onChange={handleAssigneeChange}
                    disabled={isLoading || assignableUsers.length === 0}
                    label="Select Assignees"
                    renderValue={(selected) => {
                      if (selected.length === 0) {
                        return (
                          <Typography color="text.disabled" fontSize="0.75rem">
                            Select assignees...
                          </Typography>
                        );
                      }
                      return (
                        <Box display="flex" flexWrap="wrap" gap={0.25}>
                          {selected.map((userId) => {
                            const assignee = assignableUsers.find(
                              (a) => a.id === userId || a.user_id === userId,
                            );
                            const assigneeName = assignee
                              ? assignee.name
                              : `User ${userId}`;
                            return assignee ? (
                              <Chip
                                key={userId}
                                label={assigneeName}
                                size="small"
                                onDelete={() => removeAssignee(userId)}
                                onMouseDown={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <Chip
                                key={userId}
                                label={`User ${userId}`}
                                size="small"
                                onDelete={() => removeAssignee(userId)}
                                onMouseDown={(e) => e.stopPropagation()}
                              />
                            );
                          })}
                        </Box>
                      );
                    }}>
                    {assignableUsers.length > 0 ? (
                      assignableUsers.map((assignee: any) => {
                        const assigneeId = assignee.id || assignee.user_id;
                        const assigneeName =
                          assignee.name || `User ${assigneeId}`;
                        return (
                          <MenuItem key={assigneeId} value={assigneeId}>
                            {assigneeName}
                          </MenuItem>
                        );
                      })
                    ) : (
                      <MenuItem disabled>Loading users...</MenuItem>
                    )}
                  </Select>
                </FormControl>

                <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                  Selected {formData.assignees.length} user(s)
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Paper
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: "#ffffff",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              flexShrink: 0,
            }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Button
                onClick={handleCancel}
                variant="outlined"
                disabled={isLoading || isUploadingImages}
                sx={{ minWidth: 100 }}
                size="small">
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isLoading || isUploadingImages || tasks.length === 0}
                sx={{
                  bgcolor: "#dc2626",
                  "&:hover": { bgcolor: "#b91c1c" },
                  minWidth: 100,
                }}
                size="small"
                startIcon={
                  isLoading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <SaveIcon sx={{ fontSize: 16 }} />
                  )
                }>
                Update
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Add/Edit Task Modal */}
      <Dialog
        open={showAddTaskModal}
        onClose={() => {
          setShowAddTaskModal(false);
          newTask.imageUrls.forEach((url) => {
            if (url.startsWith("blob:")) {
              URL.revokeObjectURL(url);
            }
          });
          setNewTask({
            title: "",
            description: "",
            images: [],
            imageUrls: [],
          });
          setEditingTaskId(null);
        }}
        maxWidth="md"
        fullWidth>
        <DialogTitle sx={{ p: 2, fontSize: "1rem" }}>
          {editingTaskId !== null ? "Edit Task" : "Add New Task"}
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <TextField
              label="Task Title *"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              fullWidth
              disabled={isUploadingImages}
              autoFocus
              size="small"
            />
            <TextField
              label="Description"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  description: e.target.value,
                })
              }
              multiline
              rows={2}
              fullWidth
              disabled={isUploadingImages}
              size="small"
            />

            {/* Image Upload Section */}
            <Box>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="task-image-upload-edit"
                type="file"
                multiple
                onChange={handleImageUpload}
                disabled={isUploadingImages}
              />
              <label htmlFor="task-image-upload-edit">
                <Button
                  component="span"
                  variant="outlined"
                  startIcon={<CloudUploadIcon sx={{ fontSize: 16 }} />}
                  disabled={isUploadingImages}
                  size="small">
                  {isUploadingImages ? "Uploading..." : "Upload Images"}
                </Button>
              </label>

              {/* Uploaded Images Preview */}
              {newTask.imageUrls.length > 0 && (
                <Box mt={1.5}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    mb={0.5}
                    fontSize="0.7rem">
                    Selected Images ({newTask.images.length}):
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {newTask.imageUrls.map((url, index) => (
                      <Box key={index} sx={{ position: "relative", mb: 0.5 }}>
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          style={{
                            width: 60,
                            height: 60,
                            objectFit: "cover",
                            borderRadius: 3,
                            border: "1px solid #e5e7eb",
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => removeImage(index)}
                          disabled={isUploadingImages}
                          sx={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            bgcolor: "white",
                            width: 16,
                            height: 16,
                            "&:hover": { bgcolor: "white" },
                            border: "1px solid #dc2626",
                          }}>
                          <CloseIcon sx={{ fontSize: 10, color: "#dc2626" }} />
                        </IconButton>
                        <Typography
                          variant="caption"
                          display="block"
                          textAlign="center"
                          mt={0.25}
                          fontSize="0.6rem">
                          {newTask.images[index]?.name?.substring(0, 8)}
                          ...
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 1.5 }}>
          <Button
            onClick={() => {
              setShowAddTaskModal(false);
              newTask.imageUrls.forEach((url) => {
                if (url.startsWith("blob:")) {
                  URL.revokeObjectURL(url);
                }
              });
              setNewTask({
                title: "",
                description: "",
                images: [],
                imageUrls: [],
              });
              setEditingTaskId(null);
            }}
            variant="outlined"
            disabled={isUploadingImages}
            size="small">
            Cancel
          </Button>
          <Button
            onClick={handleAddTask}
            variant="contained"
            disabled={!newTask.title.trim() || isUploadingImages}
            size="small">
            {isUploadingImages ? (
              <CircularProgress size={16} color="inherit" />
            ) : editingTaskId !== null ? (
              "Update Task"
            ) : (
              "Add Task"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Category Modal */}
      <Dialog
        open={showAddCategory}
        onClose={() => {
          setShowAddCategory(false);
          setNewCategoryName("");
        }}
        maxWidth="xs"
        fullWidth>
        <DialogTitle sx={{ p: 2, fontSize: "1rem" }}>
          Add New Category
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <TextField
              label="Category Name *"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              fullWidth
              autoFocus
              size="small"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAddCategory();
                }
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 1.5 }}>
          <Button
            onClick={() => {
              setShowAddCategory(false);
              setNewCategoryName("");
            }}
            variant="outlined"
            size="small">
            Cancel
          </Button>
          <Button
            onClick={handleAddCategory}
            variant="contained"
            disabled={!newCategoryName.trim()}
            size="small">
            Add Category
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default EditChecklistModal;