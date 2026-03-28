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
  FormControl,
  Select,
  MenuItem,
  ListSubheader,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import StoreIcon from "@mui/icons-material/Store";
import PersonIcon from "@mui/icons-material/Person";
import CallIcon from "@mui/icons-material/Call";
import MailIcon from "@mui/icons-material/Mail";
import DescriptionIcon from "@mui/icons-material/Description";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import CircularProgress from "@mui/material/CircularProgress";
import { BRANCH_ID, useCreateVendor, ZODU_ID } from "./useVendorApi";

const theme = createTheme({
  palette: {
    primary: { main: "#D21F3C", contrastText: "#ffffff" },
    background: { default: "#f8f6f6", paper: "#ffffff" },
    text: { primary: "#0F172A", secondary: "#6B7280" },
  },
  typography: { fontFamily: '"Poppins", sans-serif' },
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
          maxWidth: 680,
          width: "100%",
        },
      },
    },
  },
});

interface VendorFormState {
  vendorName: string;
  contactPerson: string;
  mobileNumber: string;
  email: string;
  gstin: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pinCode: string;
}

interface AddVendorModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: VendorFormState) => void;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#374151", mb: 0.5 }}>
      {children}
    </Typography>
  );
}

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

const emptyForm = (): VendorFormState => ({
  vendorName: "",
  contactPerson: "",
  mobileNumber: "",
  email: "",
  gstin: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pinCode: "",
});

const AddVendorModal: React.FC<AddVendorModalProps> = ({ open, onClose, onSave }) => {
  const [form, setForm] = useState<VendorFormState>(emptyForm);
  const [stateSearch, setStateSearch] = useState("");
  const [saveError, setSaveError] = useState("");
  const createVendor = useCreateVendor();

  const handleChange =
    (field: keyof VendorFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const filteredStates = INDIAN_STATES.filter((state) =>
    state.toLowerCase().includes(stateSearch.trim().toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleCancel = () => {
    setForm(emptyForm());
    setStateSearch("");
    setSaveError("");
    onClose();
  };

  const handleSave = async () => {
    try {
      setSaveError("");
      const payload = {
        zodu_id: "ZODU035",
        branch_id: "ZODU035B1",
        vendor_name: form.contactPerson,
        company_name: form.vendorName || null,
        gst: form.gstin || null,
        vendor_phone: form.mobileNumber || null,
        vendor_email: form.email || null,
        vendor_address_1: form.addressLine1 || null,
        vendor_address_2: form.addressLine2 || null,
        city: form.city || null,
        state: form.state || null,
        pincode: form.pinCode || null,
      };

      const result = await createVendor.mutateAsync(payload);
      onSave?.(form);
      setForm(emptyForm());
      setStateSearch("");
      onClose();
      return result;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setSaveError(err?.response?.data?.message ?? err?.message ?? "Failed to save vendor.");
      return null;
    }
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "#F8FAFC",
      fontSize: 13,
      borderRadius: "8px",
      "& .MuiInputBase-input": {
        padding: "8px 12px",
      },
      "& .MuiInputBase-input.MuiSelect-select": {
        padding: "8px 12px",
      },
      "& textarea.MuiInputBase-input": {
        padding: "8px 12px",
      },
      "& fieldset": { borderColor: "#E2E8F0" },
      "&:hover fieldset": { borderColor: "#D21F3C" },
      "&.Mui-focused fieldset": { borderColor: "#D21F3C", borderWidth: 2 },
    },
    "& .MuiInputAdornment-positionStart": {
      marginRight: 4,
      minWidth: 0,
    },
    "& .MuiInputBase-input::placeholder": {
      color: "#9CA3AF",
      opacity: 1,
    },
    "& .MuiInputAdornment-root .MuiSvgIcon-root": {
      color: "#9CA3AF",
      fontSize: "1rem",
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
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
            <Box sx={{ p: 0.8, bgcolor: "rgba(210,31,60,0.08)", borderRadius: 2, display: "flex" }}>
              <StoreIcon sx={{ color: "#D21F3C", fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 17, fontWeight: 800, color: "#0F172A" }}>
                Add New Vendor / Supplier
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#6B7280" }}>
                Create a supplier profile for purchase entries
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleCancel}
            size="small"
            sx={{ color: "#6B7280", bgcolor: "#F9FAFB", "&:hover": { bgcolor: "#F3F4F6" }, borderRadius: "50%" }}
          >
            <CloseIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ px: 3, py: 3, bgcolor: "#fff" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box>
                <FieldLabel>Company Name</FieldLabel>
                <TextField
                  id="vendor_name"
                  placeholder="Enter company or individual name"
                  value={form.vendorName}
                  onChange={handleChange("vendorName")}
                  fullWidth
                  sx={inputSx}
                  // slotProps={{
                  //   input: {
                  //     startAdornment: (
                  //       <InputAdornment position="start">
                  //         <StoreIcon />
                  //       </InputAdornment>
                  //     ),
                  //   },
                  // }}
                />
              </Box>

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel>Contact Person</FieldLabel>
                  <TextField
                    id="contact_person"
                    placeholder="Full name"
                    value={form.contactPerson}
                    onChange={handleChange("contactPerson")}
                    fullWidth
                    sx={inputSx}
                    // slotProps={{
                    //   input: {
                    //     startAdornment: (
                    //       <InputAdornment position="start">
                    //         <PersonIcon />
                    //       </InputAdornment>
                    //     ),
                    //   },
                    // }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel>Mobile Number</FieldLabel>
                  <TextField
                    id="mobile_number"
                    placeholder="+91 98765 43210"
                    type="tel"
                    value={form.mobileNumber}
                    onChange={handleChange("mobileNumber")}
                    fullWidth
                    sx={inputSx}
                    // slotProps={{
                    //   input: {
                    //     startAdornment: (
                    //       <InputAdornment position="start">
                    //         <CallIcon />
                    //       </InputAdornment>
                    //     ),
                    //   },
                    // }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel>Email Address</FieldLabel>
                  <TextField
                    id="email"
                    placeholder="vendor@example.com"
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    fullWidth
                    sx={inputSx}
                    // slotProps={{
                    //   input: {
                    //     startAdornment: (
                    //       <InputAdornment position="start">
                    //         <MailIcon />
                    //       </InputAdornment>
                    //     ),
                    //   },
                    // }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel>GSTIN</FieldLabel>
                  <TextField
                    id="gstin"
                    placeholder="22AAAAA0000A1Z5"
                    value={form.gstin}
                    onChange={handleChange("gstin")}
                    fullWidth
                    sx={inputSx}
                    // slotProps={{
                    //   input: {
                    //     startAdornment: (
                    //       <InputAdornment position="start">
                    //         <DescriptionIcon />
                    //       </InputAdornment>
                    //     ),
                    //   },
                    // }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FieldLabel>Address Line 1</FieldLabel>
                    <TextField
                      id="address_line_1"
                      placeholder="Building, street, area"
                      value={form.addressLine1}
                      onChange={handleChange("addressLine1")}
                      fullWidth
                      sx={inputSx}
                      // slotProps={{
                      //   input: {
                      //     startAdornment: (
                      //       <InputAdornment position="start">
                      //         <LocationOnIcon />
                      //       </InputAdornment>
                      //     ),
                      //   },
                      // }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FieldLabel>Address Line 2</FieldLabel>
                    <TextField
                      id="address_line_2"
                      placeholder="Landmark, suite, optional details"
                      value={form.addressLine2}
                      onChange={handleChange("addressLine2")}
                      fullWidth
                      sx={inputSx}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FieldLabel>City</FieldLabel>
                    <TextField
                      id="city"
                      placeholder="Enter city"
                      value={form.city}
                      onChange={handleChange("city")}
                      fullWidth
                      sx={inputSx}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FieldLabel>State</FieldLabel>
                    <FormControl fullWidth size="small" sx={inputSx}>
                      <Select
                        value={form.state}
                        displayEmpty
                        onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                        onOpen={() => setStateSearch("")}
                        renderValue={(value) =>
                          value ? value : <Typography sx={{ color: "#9CA3AF", fontSize: 13 }}>Select state</Typography>
                        }
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              mt: 0.5,
                              maxHeight: 340,
                              borderRadius: 2,
                              boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
                            },
                          },
                        }}
                        sx={{ bgcolor: "#F8FAFC", fontSize: 13, borderRadius: "8px" }}
                      >
                        <ListSubheader sx={{ bgcolor: "#fff", py: 1, px: 1, borderBottom: "1px solid #F1F5F9" }} onKeyDown={(e) => e.stopPropagation()}>
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
                        {filteredStates.length === 0
                          ? <MenuItem disabled sx={{ fontSize: 13 }}>No states found</MenuItem>
                          : filteredStates.map((state) => (
                              <MenuItem key={state} value={state} sx={{ fontSize: 13 }}>
                                {state}
                              </MenuItem>
                            ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FieldLabel>Pin Code</FieldLabel>
                    <TextField
                      id="pin_code"
                      placeholder="600001"
                      value={form.pinCode}
                      onChange={handleChange("pinCode")}
                      fullWidth
                      sx={inputSx}
                    />
                  </Grid>
                </Grid>
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
            {saveError && (
              <Typography sx={{ flex: 1, fontSize: 12, color: "#DC2626", fontWeight: 600 }}>
                {saveError}
              </Typography>
            )}
            <Button
              variant="text"
              onClick={handleCancel}
              sx={{ color: "#374151", "&:hover": { backgroundColor: "#F3F4F6" } }}
            >
              Discard
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              variant="contained"
              startIcon={createVendor.isPending ? <CircularProgress size={15} sx={{ color: "#fff" }} /> : <SaveIcon />}
              disabled={createVendor.isPending}
              sx={{
                bgcolor: "#D21F3C",
                "&:hover": { bgcolor: "#B71C1C" },
                px: 3,
                fontWeight: 700,
                boxShadow: "0 4px 16px rgba(210,31,60,0.28)",
                "&.Mui-disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF", boxShadow: "none" },
              }}
            >
              {createVendor.isPending ? "Saving..." : "Save Vendor"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </ThemeProvider>
  );
};

export default AddVendorModal;
