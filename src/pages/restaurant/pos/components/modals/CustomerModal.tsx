import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

export interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface Props {
  open: boolean;
  onSave: (data: CustomerFormData) => void;
  onClose: () => void;
}

const EMPTY: CustomerFormData = { name: "", phone: "", email: "", address: "" };

const CustomerModal: React.FC<Props> = ({ open, onSave, onClose }) => {
  const [form, setForm] = useState<CustomerFormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<CustomerFormData>>({});

  const validate = (): Partial<CustomerFormData> => {
    const e: Partial<CustomerFormData> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    else if (!/^\d{10}$/.test(form.phone.trim())) e.phone = "Enter a valid 10-digit number";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form);
    handleClose();
  };

  const handleClose = () => {
    setForm(EMPTY);
    setErrors({});
    onClose();
  };

  const change =
    (field: keyof CustomerFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((p) => ({ ...p, [field]: e.target.value }));
      if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
    };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: "14px" } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: "10px",
            bgcolor: "#f5f3ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <PersonAddIcon sx={{ color: "#6366f1", fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
            Create Customer
          </Typography>
          <Typography variant="caption" color="text.secondary">
            For delivery or pick-up orders
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Name *"
            size="small"
            value={form.name}
            onChange={change("name")}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          />
          <TextField
            label="Phone *"
            size="small"
            value={form.phone}
            onChange={change("phone")}
            error={!!errors.phone}
            helperText={errors.phone}
            inputProps={{ maxLength: 10 }}
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          />
          <TextField
            label="Email (optional)"
            size="small"
            value={form.email}
            onChange={change("email")}
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          />
          <TextField
            label="Address (optional)"
            size="small"
            value={form.address}
            onChange={change("address")}
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            borderColor: "#e5e7eb",
            color: "#374151",
            textTransform: "none",
            borderRadius: "8px",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            flex: 1,
            bgcolor: "#d32f2f",
            "&:hover": { bgcolor: "#b71c1c" },
            textTransform: "none",
            borderRadius: "8px",
            fontWeight: 700,
          }}
        >
          Save Customer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerModal;
