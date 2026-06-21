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
import DomainAddRoundedIcon from "@mui/icons-material/DomainAddRounded";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SearchIcon from "@mui/icons-material/Search";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import StorefrontIcon from "@mui/icons-material/Storefront";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import type { CompanyDetails, CompanyWithBranches } from "@pages/auth/Authapi";

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

export interface BusinessFormData {
  type: string;
  restaurant_name: string;
  owner_admin_name: string;
  phone_number: string;
  email: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  gst_no: string;
  bank_name: string;
  bank_branch: string;
  holder_name: string;
  account_number: string;
  account_type: string;
  ifsc_code: string;
  can_use_for_branch: boolean;
}

export type CompanyFormInitialData = Partial<
  CompanyWithBranches &
    CompanyDetails & {
      phone_number?: string;
      email?: string;
    }
>;

const EMPTY_FORM: BusinessFormData = {
  type: "Retail",
  restaurant_name: "",
  owner_admin_name: "",
  phone_number: "",
  email: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  district: "",
  state: "",
  pincode: "",
  gst_no: "",
  bank_name: "",
  bank_branch: "",
  holder_name: "",
  account_number: "",
  account_type: "",
  ifsc_code: "",
  can_use_for_branch: true,
};

interface Props {
  open: boolean;
  onClose: () => void;
  business?: CompanyFormInitialData | null;
  onSubmit: (data: BusinessFormData, isEdit: boolean) => void;
  submitting?: boolean;
}

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
    "& .MuiInputAdornment-root .MuiSvgIcon-root": {
      color: "#9CA3AF",
      fontSize: "1rem",
    },
  },
  "& .MuiInputBase-input::placeholder": { color: "#9CA3AF", opacity: 1 },
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#374151", mb: 0.5 }}>
      {children}
    </Typography>
  );
}

export default function BusinessFormModal({
  open,
  onClose,
  business,
  onSubmit,
  submitting = false,
}: Props) {
  const isEdit = Boolean(business);
  const [form, setForm] = useState<BusinessFormData>(EMPTY_FORM);
  const [stateSearch, setStateSearch] = useState("");

  useEffect(() => {
    if (!open) return;

    if (business) {
      setForm({
        type: (business as any).type ?? "Retail",
        restaurant_name: business.restaurant_name ?? "",
        owner_admin_name: business.owner_admin_name ?? "",
        phone_number: business.phone_number ?? business.mobile_no ?? "",
        email: business.email ?? business.mail_id ?? "",
        address_line_1: business.address_line_1 ?? business.area_street_name ?? "",
        address_line_2: business.address_line_2 ?? business.building_no ?? "",
        city: business.city ?? "",
        district: business.district ?? "",
        state: business.state ?? "",
        pincode: business.pincode ?? "",
        gst_no: business.gst_no ?? "",
        bank_name: business.bank_name ?? "",
        bank_branch: business.bank_branch ?? "",
        holder_name: business.holder_name ?? "",
        account_number: business.account_number ?? "",
        account_type: business.account_type ?? "",
        ifsc_code: business.ifsc_code ?? "",
        can_use_for_branch: true,
      });
    } else {
      setForm(EMPTY_FORM);
    }

    setStateSearch("");
  }, [open, business]);

  const set =
    (key: keyof BusinessFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const filteredStates = INDIAN_STATES.filter((state) =>
    state.toLowerCase().includes(stateSearch.trim().toLowerCase())
  );

  const handleClose = () => {
    setStateSearch("");
    onClose();
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
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
              <DomainAddRoundedIcon sx={{ color: "#af101a", fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 17, fontWeight: 800, color: "#0F172A" }}>
                {isEdit ? "Edit Business" : "Add New Business"}
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#6B7280" }}>
                {isEdit ? "Update business details" : "Register a new business entity"}
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

        <DialogContent sx={{ px: 3, py: 3, bgcolor: "#fff", maxHeight: "70vh", overflowY: "auto" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* BASIC DETAILS SECTION */}
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#1F2937", mb: 2 }}>
                Basic Details
              </Typography>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel>Business Type *</FieldLabel>
                  <FormControl size="small" sx={{ ...inputSx, width: 220 }}>
                    <Select
                      value={form.type}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, type: e.target.value }))
                      }
                      renderValue={(value) => (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {value === "Retail" ? (
                            <StorefrontIcon sx={{ fontSize: 16, color: "#af101a" }} />
                          ) : (
                            <RestaurantMenuIcon sx={{ fontSize: 16, color: "#6B7280" }} />
                          )}
                          <Typography sx={{ fontSize: 13, color: "#0F172A" }}>{value}</Typography>
                        </Box>
                      )}
                      sx={{ bgcolor: "#F8FAFC", fontSize: 13, borderRadius: "8px" }}
                    >
                      <MenuItem value="Retail" sx={{ fontSize: 13 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <StorefrontIcon sx={{ fontSize: 16, color: "#af101a" }} />
                          Retail
                        </Box>
                      </MenuItem>
                      <MenuItem value="Restaurant" sx={{ fontSize: 13 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <RestaurantMenuIcon sx={{ fontSize: 16, color: "#6B7280" }} />
                          Restaurant
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FieldLabel>Restaurant / Business Name *</FieldLabel>
                  <TextField
                    fullWidth
                    placeholder="e.g. Zodu Retail Private Limited"
                    value={form.restaurant_name}
                    onChange={set("restaurant_name")}
                    sx={inputSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel>Owner / Admin Name</FieldLabel>
                  <TextField
                    fullWidth
                    placeholder="Full legal name"
                    value={form.owner_admin_name}
                    onChange={set("owner_admin_name")}
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
                  <FieldLabel>GSTIN</FieldLabel>
                  <TextField
                    fullWidth
                    placeholder="22AAAAA0000A1Z5"
                    value={form.gst_no}
                    onChange={set("gst_no")}
                    inputProps={{ style: { textTransform: "uppercase" } }}
                    sx={inputSx}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ borderColor: "#F1F5F9" }} />

            {/* CONTACT INFORMATION SECTION */}
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#1F2937", mb: 2 }}>
                Contact Information
              </Typography>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel>Phone Number *</FieldLabel>
                  <TextField
                    fullWidth
                    placeholder="9876543210"
                    type="tel"
                    value={form.phone_number}
                    onChange={set("phone_number")}
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
                  <FieldLabel>Email ID *</FieldLabel>
                  <TextField
                    fullWidth
                    placeholder="business@zodu.com"
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon sx={{ fontSize: 17, color: "#9CA3AF" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={inputSx}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ borderColor: "#F1F5F9" }} />

            {/* LOCATION DETAILS SECTION */}
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#1F2937", mb: 2 }}>
                Location Details
              </Typography>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel>Address Line 1</FieldLabel>
                  <TextField
                    fullWidth
                    placeholder="Street Address, Area"
                    value={form.address_line_1}
                    onChange={set("address_line_1")}
                    sx={inputSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel>Address Line 2</FieldLabel>
                  <TextField
                    fullWidth
                    placeholder="Building, Floor (optional)"
                    value={form.address_line_2}
                    onChange={set("address_line_2")}
                    sx={inputSx}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FieldLabel>City</FieldLabel>
                  <TextField
                    fullWidth
                    placeholder="Enter city"
                    value={form.city}
                    onChange={set("city")}
                    sx={inputSx}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <FieldLabel>District</FieldLabel>
                  <TextField
                    fullWidth
                    placeholder="Enter district"
                    value={form.district}
                    onChange={set("district")}
                    sx={inputSx}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <FieldLabel>State</FieldLabel>
                  <FormControl fullWidth size="small" sx={inputSx}>
                    <Select
                      value={form.state}
                      displayEmpty
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, state: e.target.value }))
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
              </Grid>

              <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel>PIN Code</FieldLabel>
                  <TextField
                    fullWidth
                    placeholder="600001"
                    value={form.pincode}
                    onChange={set("pincode")}
                    sx={inputSx}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ borderColor: "#F1F5F9" }} />

            {/* BANK DETAILS SECTION */}
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#1F2937", mb: 2 }}>
                Bank Details
              </Typography>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel>Bank Name</FieldLabel>
                  <TextField
                    fullWidth
                    placeholder="e.g. HDFC Bank"
                    value={form.bank_name}
                    onChange={set("bank_name")}
                    sx={inputSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel>Bank Branch</FieldLabel>
                  <TextField
                    fullWidth
                    placeholder="Branch name"
                    value={form.bank_branch}
                    onChange={set("bank_branch")}
                    sx={inputSx}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel>Account Holder Name</FieldLabel>
                  <TextField
                    fullWidth
                    placeholder="Name as per bank records"
                    value={form.holder_name}
                    onChange={set("holder_name")}
                    sx={inputSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel>Account Type</FieldLabel>
                  <FormControl fullWidth size="small" sx={inputSx}>
                    <Select
                      value={form.account_type}
                      displayEmpty
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, account_type: e.target.value }))
                      }
                      renderValue={(value) =>
                        value ? (
                          value
                        ) : (
                          <Typography sx={{ color: "#9CA3AF", fontSize: 13 }}>
                            Select account type
                          </Typography>
                        )
                      }
                    >
                      <MenuItem value="Savings Account" sx={{ fontSize: 13 }}>
                        Savings Account
                      </MenuItem>
                      <MenuItem value="Current Account" sx={{ fontSize: 13 }}>
                        Current Account
                      </MenuItem>
                      <MenuItem value="Business Account" sx={{ fontSize: 13 }}>
                        Business Account
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel>Account Number</FieldLabel>
                  <TextField
                    fullWidth
                    placeholder="Bank account number"
                    value={form.account_number}
                    onChange={set("account_number")}
                    sx={inputSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel>IFSC Code</FieldLabel>
                  <TextField
                    fullWidth
                    placeholder="e.g. HDFC0000123"
                    value={form.ifsc_code}
                    onChange={set("ifsc_code")}
                    inputProps={{ style: { textTransform: "uppercase" } }}
                    sx={inputSx}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ borderColor: "#F1F5F9" }} />

            {/* BRANCH USAGE SECTION */}
            <Box
              sx={{
                px: 1.5,
                py: 1.25,
                borderRadius: 2,
                bgcolor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                display: isEdit ? "none" : "block",
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.can_use_for_branch}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        can_use_for_branch: e.target.checked,
                      }))
                    }
                    sx={{
                      color: "#D1D5DB",
                      "&.Mui-checked": { color: "#af101a" },
                      p: 0.4,
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>
                      Use for default branch
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "#6B7280" }}>
                      Create the default branch using these business details.
                    </Typography>
                  </Box>
                }
                sx={{ m: 0, alignItems: "flex-start", gap: 1 }}
              />
            </Box>
          </Box>
        </DialogContent>

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
            onClick={() => {
              console.log("=== Submit button clicked ===");
              console.log("form:", form);
              console.log("isEdit:", isEdit);
              onSubmit(form, isEdit);
            }}
            disabled={submitting}
            sx={{
              bgcolor: "#af101a",
              "&:hover": { bgcolor: "#8e0c14" },
              px: 3,
              fontWeight: 700,
              boxShadow: "0 4px 16px rgba(175,16,26,0.28)",
              "&.Mui-disabled": {
                bgcolor: "#E5E7EB",
                color: "#9CA3AF",
                boxShadow: "none",
              },
            }}
          >
            {submitting ? "Saving..." : isEdit ? "Save Changes" : "Save Business"}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
