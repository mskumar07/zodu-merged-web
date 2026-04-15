import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  ListSubheader,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SearchIcon from "@mui/icons-material/Search";
import type { Branch } from "@pages/auth/Authapi";

// ── Theme ─────────────────────────────────────────────────────────────────────

const theme = createTheme({
  palette: {
    primary: { main: "#af101a", contrastText: "#ffffff" },
    background: { default: "#f8f6f6", paper: "#ffffff" },
    text: { primary: "#0F172A", secondary: "#6B7280" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", borderRadius: 8, fontWeight: 700 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: "0 25px 60px rgba(15,23,42,0.2)",
          maxWidth: 640,
          width: "100%",
        },
      },
    },
  },
});

// ── Indian states list ─────────────────────────────────────────────────────────

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BranchFormData {
  branch_name: string;
  branch_id: string;
  branch_mobile_no: string;
  branch_mail_id: string;
  branch_area_street_name: string;
  branch_floor_building_no: string;
  branch_city: string;
  branch_district: string;
  branch_state: string;
  branch_pincode: string;
  branch_manager_or_admin: string;
  branch_account_no: string;
  branch_ifsc: string;
  branch_account_type: string;
  branch_image: string;
}

const EMPTY_FORM: BranchFormData = {
  branch_name: "",
  branch_id: "",
  branch_mobile_no: "",
  branch_mail_id: "",
  branch_area_street_name: "",
  branch_floor_building_no: "",
  branch_city: "",
  branch_district: "",
  branch_state: "",
  branch_pincode: "",
  branch_manager_or_admin: "",
  branch_account_no: "",
  branch_ifsc: "",
  branch_account_type: "current",
  branch_image: "",
};

// Update Props interface
interface Props {
  open: boolean;
  onClose: () => void;
  branch?: Branch | null;
  onSubmit: (data: BranchFormData, isEdit: boolean) => void;
  submitting?: boolean;
  companyPhone?: string;   // ✅ add
  companyEmail?: string;   // ✅ add
}


// ── Shared inputSx ─────────────────────────────────────────────────────────────

const inputSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#F8FAFC",
    fontSize: 13,
    borderRadius: "8px",
    "& .MuiInputBase-input": { padding: "8px 12px" },
    "& .MuiInputBase-input.MuiSelect-select": { padding: "8px 12px" },
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#af101a" },
    "&.Mui-focused fieldset": { borderColor: "#af101a", borderWidth: 2 },
    "&.Mui-disabled": { bgcolor: "#F1F5F9" },
  },
  "& .MuiInputAdornment-root .MuiSvgIcon-root": {
    color: "#9CA3AF",
    fontSize: "1rem",
  },
  "& .MuiInputBase-input::placeholder": { color: "#9CA3AF", opacity: 1 },
};

// ── FieldLabel ─────────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#374151", mb: 0.5 }}>
      {children}
    </Typography>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

// Update destructure
export default function BranchFormModal({
  open,
  onClose,
  branch,
  onSubmit,
  submitting = false,
  companyPhone = "",       // ✅ add
  companyEmail = "",       // ✅ add
}: Props) {
  const isEdit = Boolean(branch);

  const [form, setForm] = useState<BranchFormData>(EMPTY_FORM);
  const [sameMobile, setSameMobile] = useState(false);
  const [sameEmail, setSameEmail] = useState(false);
  const [sameGstin, setSameGstin] = useState(false);
  const [stateSearch, setStateSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    if (branch) {
      setForm({
        branch_name: branch.branch_name ?? "",
        branch_id: branch.branch_id ?? "",
        branch_mobile_no: branch.branch_mobile_no ?? "",
        branch_mail_id: branch.branch_mail_id ?? "",
        branch_area_street_name: branch.branch_area_street_name ?? "",
        branch_floor_building_no: branch.branch_floor_building_no ?? "",
        branch_city: branch.branch_city ?? "",
        branch_district: branch.branch_district ?? "",
        branch_state: branch.branch_state ?? "",
        branch_pincode: branch.branch_pincode ?? "",
        branch_manager_or_admin: branch.branch_manager_or_admin ?? "",
        branch_account_no: branch.branch_account_no ?? "",
        branch_ifsc: branch.branch_ifsc ?? "",
        branch_account_type: branch.branch_account_type ?? "current",
        branch_image: branch.branch_image ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setSameMobile(false);
    setSameEmail(false);
    setSameGstin(false);
    setStateSearch("");
  }, [open, branch]);

  const set =
    (key: keyof BranchFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const filteredStates = INDIAN_STATES.filter((s) =>
    s.toLowerCase().includes(stateSearch.trim().toLowerCase())
  );

  const handleClose = () => {
    setStateSearch("");
    onClose();
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <DialogTitle
          sx={{
            px: 3,
            py: 2,
            borderBottom: "1px solid #F1F5F9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                p: 0.8,
                bgcolor: "rgba(175,16,26,0.08)",
                borderRadius: 2,
                display: "flex",
              }}
            >
              <AccountTreeOutlinedIcon sx={{ color: "#af101a", fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 17, fontWeight: 800, color: "#0F172A" }}>
                {isEdit ? "Edit Branch" : "Add New Branch"}
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#6B7280" }}>
                {isEdit ? "Update branch details" : "Configure a new branch location"}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{
              color: "#6B7280",
              bgcolor: "#F9FAFB",
              "&:hover": { bgcolor: "#F3F4F6" },
              borderRadius: "50%",
            }}
          >
            <CloseIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </DialogTitle>

        {/* ── Body ───────────────────────────────────────────────────────────── */}
        <DialogContent sx={{ px: 3, py: 3, bgcolor: "#fff" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

            {/* Branch Name + Branch Code */}
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 12 }}>
                <FieldLabel>Branch Name</FieldLabel>
                <TextField
                  fullWidth
                  placeholder="e.g. South Region Hub"
                  value={form.branch_name}
                  onChange={set("branch_name")}
                  sx={inputSx}
                />
              </Grid>
              {/* <Grid size={{ xs: 12, sm: 6 }}>
                <FieldLabel>Branch Code</FieldLabel>
                <TextField
                  fullWidth
                  placeholder="e.g. ZD-SO-01"
                  value={form.branch_id}
                  onChange={set("branch_id")}
                  disabled={isEdit}
                  sx={inputSx}
                />
              </Grid> */}
            </Grid>

            {/* Mobile Number + Email ID */}
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                  <FieldLabel>Mobile Number</FieldLabel>
                 <SameAsCheckbox
  label="Same as Company"
  checked={sameMobile}
  onChange={(checked) => {
    setSameMobile(checked);
    setForm((prev) => ({
      ...prev,
      branch_mobile_no: checked ? companyPhone : "",
    }));
  }}
/>
                </Box>
                <TextField
                  fullWidth
                  placeholder="9876543210"
                  type="tel"
                  value={form.branch_mobile_no}
                  onChange={set("branch_mobile_no")}
                  disabled={sameMobile}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: "#6B7280",
                            borderRight: "1px solid #E2E8F0",
                            pr: 1,
                            mr: 0.5,
                            lineHeight: 1,
                          }}
                        >
                          +91
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                  <FieldLabel>Email ID</FieldLabel>
                <SameAsCheckbox
  label="Same as Company"
  checked={sameEmail}
  onChange={(checked) => {
    setSameEmail(checked);
    setForm((prev) => ({
      ...prev,
      branch_mail_id: checked ? companyEmail : "",
    }));
  }}
/>
                </Box>
                <TextField
                  fullWidth
                  placeholder="branch@zodu.com"
                  type="email"
                  value={form.branch_mail_id}
                  onChange={set("branch_mail_id")}
                  disabled={sameEmail}
                  sx={inputSx}
                />
              </Grid>
            </Grid>

            {/* ── Address section ─────────────────────────────────────────── */}
            <Divider sx={{ borderColor: "#F1F5F9" }} />

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldLabel>Address Line 1</FieldLabel>
                <TextField
                  fullWidth
                  placeholder="Street Address, Area"
                  value={form.branch_area_street_name}
                  onChange={set("branch_area_street_name")}
                  sx={inputSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldLabel>Address Line 2</FieldLabel>
                <TextField
                  fullWidth
                  placeholder="Building, Floor (optional)"
                  value={form.branch_floor_building_no}
                  onChange={set("branch_floor_building_no")}
                  sx={inputSx}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FieldLabel>City</FieldLabel>
                <TextField
                  fullWidth
                  placeholder="Enter city"
                  value={form.branch_city}
                  onChange={set("branch_city")}
                  sx={inputSx}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <FieldLabel>District</FieldLabel>
                <TextField
                  fullWidth
                  placeholder="Enter district"
                  value={form.branch_district}
                  onChange={set("branch_district")}
                  sx={inputSx}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <FieldLabel>State</FieldLabel>
                <FormControl fullWidth size="small" sx={inputSx}>
                  <Select
                    value={form.branch_state}
                    displayEmpty
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, branch_state: e.target.value }))
                    }
                    onOpen={() => setStateSearch("")}
                    renderValue={(value) =>
                      value ? (
                        value
                      ) : (
                        <Typography sx={{ color: "#9CA3AF", fontSize: 13 }}>
                          Select state
                        </Typography>
                      )
                    }
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          mt: 0.5,
                          maxHeight: 320,
                          borderRadius: 2,
                          boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
                        },
                      },
                    }}
                    sx={{ bgcolor: "#F8FAFC", fontSize: 13, borderRadius: "8px" }}
                  >
                    <ListSubheader
                      sx={{
                        bgcolor: "#fff",
                        py: 1,
                        px: 1,
                        borderBottom: "1px solid #F1F5F9",
                      }}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <TextField
                        autoFocus
                        size="small"
                        fullWidth
                        placeholder="Search state..."
                        value={stateSearch}
                        onChange={(e) => setStateSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "#F8FAFC",
                            fontSize: 12.5,
                            borderRadius: 1.5,
                          },
                        }}
                      />
                    </ListSubheader>
                    {filteredStates.length === 0 ? (
                      <MenuItem disabled sx={{ fontSize: 13 }}>
                        No states found
                      </MenuItem>
                    ) : (
                      filteredStates.map((state) => (
                        <MenuItem key={state} value={state} sx={{ fontSize: 13 }}>
                          {state}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 12 }}>
                <FieldLabel>PIN Code</FieldLabel>
                <TextField
                  fullWidth
                  placeholder="600001"
                  value={form.branch_pincode}
                  onChange={set("branch_pincode")}
                  sx={inputSx}
                />
              </Grid>
            </Grid>

            {/* ── Manager + GSTIN ─────────────────────────────────────────── */}
            <Divider sx={{ borderColor: "#F1F5F9" }} />

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldLabel>Manager Name</FieldLabel>
                <TextField
                  fullWidth
                  placeholder="Full legal name"
                  value={form.branch_manager_or_admin}
                  onChange={set("branch_manager_or_admin")}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineIcon sx={{ fontSize: 17, color: "#9CA3AF" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldLabel>Account Number</FieldLabel>
                <TextField
                  fullWidth
                  placeholder="1234567890"
                  value={form.branch_account_no}
                  onChange={set("branch_account_no")}
                  sx={inputSx}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldLabel>IFSC Code</FieldLabel>
                <TextField
                  fullWidth
                  placeholder="HDFC0001234"
                  value={form.branch_ifsc}
                  onChange={set("branch_ifsc")}
                  inputProps={{ style: { textTransform: "uppercase" } }}
                  sx={inputSx}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldLabel>Account Type</FieldLabel>
                <FormControl fullWidth size="small" sx={inputSx}>
                  <Select
                    value={form.branch_account_type}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        branch_account_type: e.target.value,
                      }))
                    }
                    sx={{ bgcolor: "#F8FAFC", fontSize: 13, borderRadius: "8px" }}
                  >
                    <MenuItem value="current" sx={{ fontSize: 13 }}>
                      Current
                    </MenuItem>
                    <MenuItem value="savings" sx={{ fontSize: 13 }}>
                      Savings
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

          </Box>
        </DialogContent>

        {/* ── Footer ─────────────────────────────────────────────────────────── */}
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            bgcolor: "#F8FAFC",
            borderTop: "1px solid #F1F5F9",
            gap: 1.5,
          }}
        >
          <Button
            variant="text"
            onClick={handleClose}
            sx={{ color: "#374151", "&:hover": { bgcolor: "#F3F4F6" } }}
          >
            Discard
          </Button>
          <Button
            variant="contained"
            onClick={() => onSubmit(form, isEdit)}
            disabled={submitting}
            sx={{
              bgcolor: "#af101a",
              "&:hover": { bgcolor: "#8e0c14" },
              px: 3,
              fontWeight: 700,
              boxShadow: "0 4px 16px rgba(175,16,26,0.28)",
              "&.Mui-disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF", boxShadow: "none" },
            }}
          >
            {submitting ? "Saving..." : isEdit ? "Save Changes" : "Save Branch"}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

// ── Helper ─────────────────────────────────────────────────────────────────────

function SameAsCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <FormControlLabel
      control={
        <Checkbox
          size="small"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          sx={{
            color: "#D1D5DB",
            "&.Mui-checked": { color: "#af101a" },
            p: 0.4,
          }}
        />
      }
      label={
        <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#6B7280" }}>
          {label}
        </Typography>
      }
      sx={{ m: 0, gap: 0.5 }}
    />
  );
}
