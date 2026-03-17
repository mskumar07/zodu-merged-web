import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  InputAdornment,
  Divider,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CloseIcon from "@mui/icons-material/Close";

// ─── Theme ────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: { main: "#ec5b13" },
    background: { default: "#f8f6f6", paper: "#ffffff" },
    text: { primary: "#0f172a", secondary: "#6b7280" },
  },
  typography: {
    fontFamily: "'DM Sans', 'Public Sans', 'Segoe UI', sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", borderRadius: 8, fontWeight: 700 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16, maxWidth: 680 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: "#fff",
          fontSize: 13,
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#ec5b13" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ec5b13",
            borderWidth: 2,
          },
        },
        notchedOutline: { borderColor: "#e2e8f0" },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: 12,
          fontWeight: 700,
          color: "#374151",
          "&.Mui-focused": { color: "#ec5b13" },
        },
      },
    },
  },
});

// ─── Section Header ───────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.1em",
          color: "#9CA3AF",
          textTransform: "uppercase",
        }}
      >
        {children}
      </Typography>
      <Box sx={{ flex: 1, height: "1px", bgcolor: "#F3F4F6" }} />
    </Box>
  );
}

// ─── Field Label ──────────────────────────────────────────────
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <Typography
      component="label"
      sx={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", mb: 0.5 }}
    >
      {children}
      {required && <Box component="span" sx={{ color: "#ec5b13", ml: 0.3 }}>*</Box>}
    </Typography>
  );
}

// ─── Indian States ────────────────────────────────────────────
const STATES = [
  { value: "MH", label: "Maharashtra" },
  { value: "DL", label: "Delhi" },
  { value: "KA", label: "Karnataka" },
  { value: "TN", label: "Tamil Nadu" },
  { value: "TS", label: "Telangana" },
  { value: "GJ", label: "Gujarat" },
  { value: "UP", label: "Uttar Pradesh" },
  { value: "WB", label: "West Bengal" },
  { value: "HR", label: "Haryana" },
  { value: "PB", label: "Punjab" },
];

// ─── Form State ───────────────────────────────────────────────
interface CustomerForm {
  name: string;
  mobile: string;
  email: string;
  gstin: string;
  openingBalance: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  pincode: string;
  state: string;
  placeOfSupply: string;
}

const EMPTY_FORM: CustomerForm = {
  name: "",
  mobile: "",
  email: "",
  gstin: "",
  openingBalance: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  pincode: "",
  state: "",
  placeOfSupply: "intrastate",
};

// ─── Props ────────────────────────────────────────────────────
interface AddNewCustomerDialogProps {
  open: boolean;
  onClose: () => void;
  onSave?: (form: CustomerForm) => void;
}

// ─── Component ───────────────────────────────────────────────
export default function AddNewCustomerDialog({
  open,
  onClose,
  onSave,
}: AddNewCustomerDialogProps) {
  const [form, setForm] = useState<CustomerForm>(EMPTY_FORM);

  const set = (field: keyof CustomerForm) => (e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value as string }));

  const handleSave = () => {
    onSave?.(form);
    onClose();
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    onClose();
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "#F8FAFC",
      fontSize: 13,
      borderRadius: "8px",
      "& fieldset": { borderColor: "#E2E8F0" },
      "&:hover fieldset": { borderColor: "#ec5b13" },
      "&.Mui-focused fieldset": { borderColor: "#ec5b13", borderWidth: 2 },
    },
    "& input": { py: "8px", px: "12px" },
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={open}
        onClose={handleCancel}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 25px 60px rgba(15,23,42,0.18)",
          },
        }}
      >
        {/* ── Header ── */}
        <DialogTitle
          sx={{
            px: 3,
            py: 2,
            borderBottom: "1px solid #F1F5F9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                p: 1,
                bgcolor: "rgba(250, 55, 48, 0.1)",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PersonAddIcon sx={{ color: "#C8102E", fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>
              Add New Customer
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={handleCancel}
            sx={{
              color: "#6B7280",
              bgcolor: "#F9FAFB",
              "&:hover": { bgcolor: "#F3F4F6", color: "#374151" },
              borderRadius: "50%",
            }}
          >
            <CloseIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </DialogTitle>

        {/* ── Scrollable Body ── */}
        <DialogContent sx={{ px: 3, py: 3, overflowY: "auto", flex: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>

            {/* ── Section 1: Basic Info ── */}
            <Box>
              <SectionLabel>Basic Information</SectionLabel>
              <Grid container spacing={2}>
                {/* Full-width name */}
                <Grid item xs={12}>
                  <FieldLabel required>Customer / Business Name</FieldLabel>
                  <TextField
                    value={form.name}
                    onChange={set("name")}
                    placeholder="e.g. Rajesh Kumar or Acme Corp"
                    size="small"
                    fullWidth
                    sx={inputSx}
                  />
                </Grid>

                {/* Mobile */}
                <Grid item xs={12} sm={6}>
                  <FieldLabel required>Mobile Number</FieldLabel>
                  <TextField
                    value={form.mobile}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                      }))
                    }
                    placeholder="9876543210"
                    size="small"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#9CA3AF" }}>
                            +91
                          </Typography>
                          <Box sx={{ width: 1, height: 16, bgcolor: "#E5E7EB", mx: 1 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={inputSx}
                  />
                </Grid>

                {/* Email */}
                <Grid item xs={12} sm={6}>
                  <FieldLabel>Email Address</FieldLabel>
                  <TextField
                    value={form.email}
                    onChange={set("email")}
                    placeholder="customer@email.com"
                    type="email"
                    size="small"
                    fullWidth
                    sx={inputSx}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ borderColor: "#F3F4F6" }} />

            {/* ── Section 2: Tax & Billing ── */}
            <Box>
              <SectionLabel>Tax &amp; Billing</SectionLabel>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FieldLabel>GSTIN (GST Number)</FieldLabel>
                  <TextField
                    value={form.gstin}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        gstin: e.target.value.toUpperCase().slice(0, 15),
                      }))
                    }
                    placeholder="22AAAAA0000A1Z5"
                    size="small"
                    fullWidth
                    inputProps={{ style: { fontFamily: "monospace", letterSpacing: "0.06em" } }}
                    sx={inputSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FieldLabel>Opening Balance (₹)</FieldLabel>
                  <TextField
                    value={form.openingBalance}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        openingBalance: e.target.value.replace(/[^0-9.]/g, ""),
                      }))
                    }
                    placeholder="0.00"
                    size="small"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#9CA3AF" }}>₹</Typography>
                        </InputAdornment>
                      ),
                    }}
                    sx={inputSx}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ borderColor: "#F3F4F6" }} />

            {/* ── Section 3: Address ── */}
            <Box>
              <SectionLabel>Address Details</SectionLabel>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FieldLabel>Address Line 1</FieldLabel>
                  <TextField
                    value={form.addressLine1}
                    onChange={set("addressLine1")}
                    placeholder="Building, Street name"
                    size="small"
                    fullWidth
                    sx={inputSx}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FieldLabel>Address Line 2</FieldLabel>
                  <TextField
                    value={form.addressLine2}
                    onChange={set("addressLine2")}
                    placeholder="Locality, Landmark"
                    size="small"
                    fullWidth
                    sx={inputSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FieldLabel>City</FieldLabel>
                  <TextField
                    value={form.city}
                    onChange={set("city")}
                    placeholder="e.g. Mumbai"
                    size="small"
                    fullWidth
                    sx={inputSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FieldLabel>Pincode</FieldLabel>
                  <TextField
                    value={form.pincode}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                      }))
                    }
                    placeholder="400001"
                    size="small"
                    fullWidth
                    inputProps={{ style: { fontFamily: "monospace", letterSpacing: "0.1em" } }}
                    sx={inputSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FieldLabel>State</FieldLabel>
                  <FormControl size="small" fullWidth sx={inputSx}>
                    <Select
                      value={form.state}
                      onChange={e => setForm(prev => ({ ...prev, state: e.target.value }))}
                      displayEmpty
                      renderValue={v => (v ? STATES.find(s => s.value === v)?.label : <Typography sx={{ color: "#9CA3AF", fontSize: 13 }}>Select State</Typography>)}
                      sx={{ bgcolor: "#F8FAFC", fontSize: 13, borderRadius: "8px" }}
                    >
                      {STATES.map(s => (
                        <MenuItem key={s.value} value={s.value} sx={{ fontSize: 13 }}>
                          {s.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FieldLabel>Place of Supply</FieldLabel>
                  <FormControl size="small" fullWidth sx={inputSx}>
                    <Select
                      value={form.placeOfSupply}
                      onChange={e => setForm(prev => ({ ...prev, placeOfSupply: e.target.value }))}
                      sx={{ bgcolor: "#F8FAFC", fontSize: 13, borderRadius: "8px" }}
                    >
                      <MenuItem value="intrastate" sx={{ fontSize: 13 }}>
                        Intrastate (Within State)
                      </MenuItem>
                      <MenuItem value="interstate" sx={{ fontSize: 13 }}>
                        Interstate (Other State)
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </DialogContent>

        {/* ── Footer ── */}
        <DialogActions
          sx={{
            px: 3,
            py: 2.5,
            bgcolor: "#F8FAFC",
            borderTop: "1px solid #F1F5F9",
            gap: 1.5,
            flexShrink: 0,
          }}
        >
          <Button
            variant="outlined"
            onClick={handleCancel}
            sx={{
              borderColor: "#D1D5DB",
              color: "#374151",
              fontWeight: 700,
              px: 3,
              py: 1,
              fontSize: 13,
              borderRadius: 2,
              "&:hover": { borderColor: "#9CA3AF", bgcolor: "#F9FAFB" },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disableElevation
            sx={{
              bgcolor: "#C8102E",
              color: "#fff",
              fontWeight: 700,
              px: 4,
              py: 1,
              fontSize: 13,
              borderRadius: 2,
              boxShadow: "0 4px 16px rgba(236, 26, 19, 0.28)",
              "&:hover": { bgcolor: "#C8102E", boxShadow: "0 6px 20px rgba(236, 52, 19, 0.38)" },
              "&:active": { transform: "scale(0.97)" },
              transition: "all 0.15s",
            }}
          >
            Save Customer
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}