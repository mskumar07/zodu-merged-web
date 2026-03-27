import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import { createTheme, ThemeProvider, alpha } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import StoreIcon from "@mui/icons-material/Store";
import PersonIcon from "@mui/icons-material/Person";
import CallIcon from "@mui/icons-material/Call";
import MailIcon from "@mui/icons-material/Mail";
import DescriptionIcon from "@mui/icons-material/Description";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SaveIcon from "@mui/icons-material/Save";

// ─── MUI Theme (matches Zodu color tokens) ───────────────────────────────────
const theme = createTheme({
  palette: {
    primary: {
      main: "#af101a",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#9f3f39",
    },
    background: {
      default: "#f9f9fc",
      paper: "#ffffff",
    },
    text: {
      primary: "#1a1c1e",
      secondary: "#5b403d",
    },
    divider: "#e4beba",
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h6: {
      fontFamily: "'Manrope', sans-serif",
      fontWeight: 700,
      letterSpacing: "-0.3px",
    },
    subtitle2: {
      fontFamily: "'Inter', sans-serif",
      fontWeight: 600,
      fontSize: "0.8125rem",
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
          maxWidth: 680,
          width: "100%",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: "20px 28px",
          borderBottom: "1px solid #e4beba",
          backgroundColor: "#ffffff",
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: "28px",
          backgroundColor: "#f9f9fc",
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "16px 28px 22px",
          backgroundColor: "#f9f9fc",
          borderTop: "1px solid #e4beba",
          gap: "12px",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#ffffff",
            borderRadius: 8,
            fontSize: "0.9rem",
            "& fieldset": {
              borderColor: "#e4beba",
            },
            "&:hover fieldset": {
              borderColor: "#8f6f6c",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#af101a",
              borderWidth: "2px",
            },
          },
          "& .MuiInputBase-input::placeholder": {
            color: "#aaa",
            opacity: 1,
          },
          "& .MuiInputAdornment-root .MuiSvgIcon-root": {
            color: "#8f6f6c",
            fontSize: "1.2rem",
          },
          "& .MuiInputLabel-root": {
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: "0.8125rem",
            color: "#5b403d",
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#af101a",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.875rem",
          borderRadius: 8,
          paddingLeft: 20,
          paddingRight: 20,
        },
      },
    },
  },
});

// ─── Form State Type ──────────────────────────────────────────────────────────
interface VendorFormState {
  vendorName: string;
  contactPerson: string;
  mobileNumber: string;
  email: string;
  gstin: string;
  address: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
interface AddVendorModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: VendorFormState) => void;
}

const AddVendorModal: React.FC<AddVendorModalProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState<VendorFormState>({
    vendorName: "",
    contactPerson: "",
    mobileNumber: "",
    email: "",
    gstin: "",
    address: "",
  });

  const handleChange =
    (field: keyof VendorFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.(form);
    onClose();
  };

  const handleCancel = () => {
    setForm({
      vendorName: "",
      contactPerson: "",
      mobileNumber: "",
      email: "",
      gstin: "",
      address: "",
    });
    onClose();
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        {/* ── Header ── */}
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" color="text.primary">
              Add New Vendor / Supplier
            </Typography>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                color: "text.secondary",
                "&:hover": {
                  backgroundColor: alpha("#5b403d", 0.08),
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>

        {/* ── Form Body ── */}
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2.5}>
              {/* Vendor Name — full width */}
              <TextField
                id="vendor_name"
                label="Vendor Name"
                placeholder="Enter company or individual name"
                value={form.vendorName}
                onChange={handleChange("vendorName")}
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <StoreIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* 2-column grid */}
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    id="contact_person"
                    label="Contact Person"
                    placeholder="Full name"
                    value={form.contactPerson}
                    onChange={handleChange("contactPerson")}
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    id="mobile_number"
                    label="Mobile Number"
                    placeholder="+91 98765 43210"
                    type="tel"
                    value={form.mobileNumber}
                    onChange={handleChange("mobileNumber")}
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CallIcon />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    id="email"
                    label="Email Address"
                    placeholder="vendor@example.com"
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <MailIcon />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    id="gstin"
                    label="GSTIN"
                    placeholder="22AAAAA0000A1Z5"
                    value={form.gstin}
                    onChange={handleChange("gstin")}
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <DescriptionIcon />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
              </Grid>

              {/* Address — full width textarea */}
              <TextField
                id="address"
                label="Address"
                placeholder="Full business address, street, city, state, zip"
                value={form.address}
                onChange={handleChange("address")}
                fullWidth
                multiline
                rows={3}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{ alignSelf: "flex-start", mt: 1.5 }}
                      >
                        <LocationOnIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>
          </DialogContent>

          {/* ── Actions ── */}
          <DialogActions>
            <Button
              variant="text"
              onClick={handleCancel}
              sx={{
                color: "text.secondary",
                "&:hover": {
                  backgroundColor: alpha("#5b403d", 0.06),
                },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{
                backgroundColor: "#d32f2f",
                "&:hover": {
                  backgroundColor: "#af101a",
                },
                paddingX: 3,
                fontWeight: 700,
                boxShadow: "0 2px 8px rgba(175,16,26,0.35)",
              }}
            >
              Save Vendor
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </ThemeProvider>
  );
};

// ─── Demo wrapper (remove in production) ─────────────────────────────────────
export default AddVendorModal