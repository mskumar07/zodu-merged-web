import React, { useState } from "react";
import {
  Modal,
  Box,
  TextField,
  Typography,
  Button,
  IconButton,
  Chip,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (task: {
    name: string;
    description: string;
    attachments: any[];
  }) => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<
    Array<{ id: string; name: string; file: File }>
  >([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newAttachments = Array.from(files).map((file) => ({
        id: `file-${Date.now()}-${Math.random()}`,
        name: file.name,
        file: file,
      }));
      setAttachments([...attachments, ...newAttachments]);
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((att) => att.id !== id));
  };

  const handleSubmit = () => {
    if (!taskName.trim()) {
      alert("Please enter a task name");
      return;
    }

    onSubmit({
      name: taskName,
      description,
      attachments: attachments.map((att) => ({
        id: att.id,
        name: att.name,
      })),
    });

    // Reset form
    setTaskName("");
    setDescription("");
    setAttachments([]);
    onClose();
  };

  const handleClose = () => {
    setTaskName("");
    setDescription("");
    setAttachments([]);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "95%", sm: "500px" },
          bgcolor: "background.paper",
          borderRadius: "12px",
          boxShadow: 24,
          p: 2,
        }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Add Task
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Form */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField
            label="Task Name"
            fullWidth
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Enter task name"
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description..."
          />

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Attachments
            </Typography>

            {/* File upload area */}
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                textAlign: "center",
                border: "2px dashed #e0e0e0",
                bgcolor: "#fafafa",
                cursor: "pointer",
                "&:hover": { borderColor: "#dc2626" },
                mb: 2,
              }}
              onClick={() => document.getElementById("file-upload")?.click()}>
              <input
                id="file-upload"
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={handleFileUpload}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              />
              <CloudUploadIcon sx={{ fontSize: 48, color: "#666", mb: 1 }} />
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Click to upload files
              </Typography>
              <Typography variant="caption" color="text.secondary">
                JPG, PNG, PDF, DOC, XLS (max 10MB)
              </Typography>
            </Paper>

            {/* Attachments list */}
            {attachments.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {attachments.map((attachment) => (
                  <Chip
                    key={attachment.id}
                    label={attachment.name}
                    onDelete={() => handleRemoveAttachment(attachment.id)}
                    deleteIcon={<DeleteIcon />}
                    variant="outlined"
                    sx={{ fontSize: "0.75rem" }}
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* Action buttons */}
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
            <Button variant="outlined" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{ bgcolor: "#dc2626", "&:hover": { bgcolor: "#b91c1c" } }}>
              Add Task
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddTaskModal;
