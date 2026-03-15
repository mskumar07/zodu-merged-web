import React, { useState } from "react";
import {
  Modal,
  Box,
  TextField,
  Typography,
  Button,
  IconButton,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface AddAssigneeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (assignee: { name: string; email?: string; role?: string }) => void;
}

const AddAssigneeModal: React.FC<AddAssigneeModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Staff");

  const handleSubmit = () => {
    if (!name.trim()) {
      alert("Please enter assignee name");
      return;
    }

    onSubmit({
      name,
      email,
      role,
    });

    // Reset form
    setName("");
    setEmail("");
    setRole("Staff");
    onClose();
  };

  const handleClose = () => {
    setName("");
    setEmail("");
    setRole("Staff");
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
          width: { xs: "95%", sm: "400px" },
          bgcolor: "background.paper",
          borderRadius: "12px",
          boxShadow: 24,
          p: 3,
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
            Add Assignee
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Form */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter assignee name"
          />

          <TextField
            label="Email (Optional)"
            fullWidth
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
          />

          <TextField
            select
            label="Role"
            fullWidth
            value={role}
            onChange={(e) => setRole(e.target.value)}>
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Manager">Manager</MenuItem>
            <MenuItem value="Staff">Staff</MenuItem>
            <MenuItem value="Technician">Technician</MenuItem>
            <MenuItem value="Cleaner">Cleaner</MenuItem>
          </TextField>

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
              Add Assignee
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddAssigneeModal;
