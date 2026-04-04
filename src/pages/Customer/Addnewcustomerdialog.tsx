import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, Button, IconButton,
  Select, MenuItem, FormControl, InputAdornment,
  Divider, CircularProgress, Alert,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CloseIcon     from "@mui/icons-material/Close";
import SaveIcon      from "@mui/icons-material/Save";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useAddCustomer, useUpdateCustomer, buildCustomerPayload, buildUpdateCustomerPayload } from "./useCustomerapi";
import type { AddCustomerResponse } from "./useCustomerapi";

const theme = createTheme({
  palette: {
    primary: { main: "#C8102E" },
    background: { default: "#f8f6f6", paper: "#ffffff" },
    text: { primary: "#0f172a", secondary: "#6b7280" },
  },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: "none", borderRadius: 8, fontWeight: 700 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 16, maxWidth: 880, width: "100%" } } },
  },
});

const STATES = [
  "Andhra Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jammu & Kashmir","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
];

interface CustomerForm {
  custName: string; cpyName: string; mobile: string; email: string;
  gstin: string; openingBalance: string;
  addressLine1: string; addressLine2: string; city: string; pincode: string; state: string;
}

const EMPTY: CustomerForm = {
  custName: "", cpyName: "", mobile: "", email: "", gstin: "",
  openingBalance: "", addressLine1: "", addressLine2: "", city: "", pincode: "", state: "",
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved?: (customer: AddCustomerResponse["customer"]) => void;
  editingCustomer?: {
    cust_uuid: string;
    cust_name: string | null;
    cpy_name: string | null;
    mobile_no: string[] | null;
    email_id: string[] | null;
    gst: string | null;
    address_line1: string | null;
    address_line2: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
  } | null;
}

// ── Reusable field wrapper ────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#374151", mb: 0.5 }}>
        {label}{required && <Box component="span" sx={{ color: "#C8102E", ml: 0.3 }}>*</Box>}
      </Typography>
      {children}
    </Box>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
      <Typography sx={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "#9CA3AF", textTransform: "uppercase", whiteSpace: "nowrap" }}>
        {children}
      </Typography>
      <Box sx={{ flex: 1, height: 1, bgcolor: "#F3F4F6" }} />
    </Box>
  );
}

const sx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#F8FAFC", fontSize: 13, borderRadius: "8px",
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#C8102E" },
    "&.Mui-focused fieldset": { borderColor: "#C8102E", borderWidth: 2 },
  },
};

export default function AddNewCustomerDialog({ open, onClose, onSaved, editingCustomer }: Props) {
  const isEditing = editingCustomer !== null && editingCustomer !== undefined;
  
  const [form, setForm]       = useState<CustomerForm>(EMPTY);
  const [error, setError]     = useState<string | null>(null);

  // Update form when editingCustomer changes
  useEffect(() => {
    if (isEditing && editingCustomer) {
      setForm({
        custName: editingCustomer.cust_name || "",
        cpyName: editingCustomer.cpy_name || "",
        mobile: editingCustomer.mobile_no?.[0] || "",
        email: editingCustomer.email_id?.[0] || "",
        gstin: editingCustomer.gst || "",
        addressLine1: editingCustomer.address_line1 || "",
        addressLine2: editingCustomer.address_line2 || "",
        city: editingCustomer.city || "",
        pincode: editingCustomer.pincode || "",
        state: editingCustomer.state || "",
        openingBalance: "",
      });
    } else {
      setForm(EMPTY);
    }
    setError(null);
  }, [isEditing, editingCustomer, open]);

  const { mutate: mutateAdd, isPending: isPendingAdd } = useAddCustomer({
    onSuccess: (customer) => { setForm(EMPTY); setError(null); onSaved?.(customer); onClose(); },
    onError:   (msg) => setError(msg),
  });

  const { mutate: mutateUpdate, isPending: isPendingUpdate } = useUpdateCustomer({
    onSuccess: (customer) => { setForm(EMPTY); setError(null); onSaved?.(customer); onClose(); },
    onError:   (msg) => setError(msg),
  });

  const isPending = isPendingAdd || isPendingUpdate;

  const set = (k: keyof CustomerForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    if (!form.custName.trim() && !form.cpyName.trim()) return "Enter at least a Customer Name or Company Name.";
    if (!form.mobile.trim())       return "Mobile number is required.";
    if (form.mobile.length !== 10) return "Mobile number must be 10 digits.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Enter a valid email address.";
    if (form.pincode && form.pincode.length !== 6) return "Pincode must be 6 digits.";
    return null;
  };

  const handleSave = () => {
    setError(null);
    const err = validate();
    if (err) { setError(err); return; }
    
    if (isEditing && editingCustomer) {
      mutateUpdate(buildUpdateCustomerPayload(form, editingCustomer.cust_uuid));
    } else {
      mutateAdd(buildCustomerPayload(form));
    }
  };

  const handleCancel = () => { setForm(EMPTY); setError(null); onClose(); };

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={open} onClose={isPending ? undefined : handleCancel} fullWidth maxWidth="md"
        PaperProps={{ sx: { borderRadius: 3, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 25px 60px rgba(15,23,42,0.18)" } }}>

        {/* Header */}
        <DialogTitle sx={{ px: 3, py: 2, borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ p: 1, bgcolor: "rgba(200,16,46,0.1)", borderRadius: 2, display: "flex" }}>
              {isEditing ? (
                <EditOutlinedIcon sx={{ color: "#C8102E", fontSize: 20 }} />
              ) : (
                <PersonAddIcon sx={{ color: "#C8102E", fontSize: 20 }} />
              )}
            </Box>
            <Typography sx={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>
              {isEditing ? "Edit Customer" : "Add New Customer"}
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleCancel} disabled={isPending}
            sx={{ color: "#6B7280", bgcolor: "#F9FAFB", "&:hover": { bgcolor: "#F3F4F6" }, borderRadius: "50%" }}>
            <CloseIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </DialogTitle>

        {/* Body */}
        <DialogContent sx={{ px: 3, py: 3, overflowY: "auto", flex: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>

            {error && (
              <Alert severity="error" onClose={() => setError(null)} sx={{ borderRadius: 2, fontSize: 13 }}>
                {error}
              </Alert>
            )}

            {/* ── Basic Information ── */}
            <Box>
              <SectionLabel>Basic Information</SectionLabel>

              {/* Row 1: Customer Name | Company Name */}
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
                <Field label="Customer Name">
                  <TextField value={form.custName} onChange={set("custName")}
                    placeholder="e.g. Rajesh Kumar" size="small" fullWidth sx={sx} />
                </Field>
                <Field label="Company / Business Name">
                  <TextField value={form.cpyName} onChange={set("cpyName")}
                    placeholder="e.g. Acme Pvt Ltd" size="small" fullWidth sx={sx} />
                </Field>
              </Box>

              {/* Row 2: Mobile | Email */}
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <Field label="Mobile Number" required>
                  <TextField
                    value={form.mobile}
                    onChange={e => setForm(p => ({ ...p, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                    placeholder="9876543210" size="small" fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#9CA3AF" }}>+91</Typography>
                          <Box sx={{ width: 1, height: 16, bgcolor: "#E5E7EB", mx: 1 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={sx}
                  />
                </Field>
                <Field label="Email Address">
                  <TextField value={form.email} onChange={set("email")}
                    placeholder="customer@email.com" type="email" size="small" fullWidth sx={sx} />
                </Field>
              </Box>
            </Box>

            <Divider sx={{ borderColor: "#F3F4F6" }} />

            {/* ── Tax & Billing ── */}
            <Box>
              <SectionLabel>Tax & Billing</SectionLabel>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <Field label="GSTIN (GST Number)">
                  <TextField
                    value={form.gstin}
                    onChange={e => setForm(p => ({ ...p, gstin: e.target.value.toUpperCase().slice(0, 15) }))}
                    placeholder="22AAAAA0000A1Z5" size="small" fullWidth
                    inputProps={{ style: { fontFamily: "monospace", letterSpacing: "0.06em" } }}
                    sx={sx}
                  />
                </Field>
                <Field label="Opening Balance (₹)">
                  <TextField
                    value={form.openingBalance}
                    onChange={e => setForm(p => ({ ...p, openingBalance: e.target.value.replace(/[^0-9.]/g, "") }))}
                    placeholder="0.00" size="small" fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#9CA3AF" }}>₹</Typography>
                        </InputAdornment>
                      ),
                    }}
                    sx={sx}
                  />
                </Field>
              </Box>
            </Box>

            <Divider sx={{ borderColor: "#F3F4F6" }} />

            {/* ── Address Details ── */}
            <Box>
              <SectionLabel>Address Details</SectionLabel>

              {/* Row 1: Addr1 | Addr2 | City | Pincode — 4 columns */}
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr ", gap: 2, mb: 2 }}>
                <Field label="Address Line 1">
                  <TextField value={form.addressLine1} onChange={set("addressLine1")}
                    placeholder="Building, Street name" size="small" fullWidth sx={sx} />
                </Field>
                <Field label="Address Line 2">
                  <TextField value={form.addressLine2} onChange={set("addressLine2")}
                    placeholder="Locality, Landmark" size="small" fullWidth sx={sx} />
                </Field>
               
              </Box>
<Box  sx={{ display: "grid", gridTemplateColumns: "1fr 1fr ", gap: 2, mb: 2 }}>
   <Field label="City">
                  <TextField value={form.city} onChange={set("city")}
                    placeholder="e.g. Chennai" size="small" fullWidth sx={sx} />
                </Field>
                <Field label="Pincode">
                  <TextField
                    value={form.pincode}
                    onChange={e => setForm(p => ({ ...p, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                    placeholder="600001" size="small" fullWidth
                    inputProps={{ style: { fontFamily: "monospace", letterSpacing: "0.1em" } }}
                    sx={sx}
                  />
                </Field>
</Box>

              {/* Row 2: State — single field below */}
              <Box sx={{ maxWidth: "50%" }}>
                <Field label="State">
                  <FormControl size="small" fullWidth sx={sx}>
                    <Select
                      value={form.state}
                      onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                      displayEmpty
                      renderValue={v =>
                        v || <Typography sx={{ color: "#9CA3AF", fontSize: 13 }}>Select State</Typography>
                      }
                      sx={{ bgcolor: "#F8FAFC", fontSize: 13, borderRadius: "8px" }}
                    >
                      {STATES.map(s => (
                        <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>{s}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Field>
              </Box>
            </Box>

          </Box>
        </DialogContent>

        {/* Footer */}
        <DialogActions sx={{ px: 3, py: 2.5, bgcolor: "#F8FAFC", borderTop: "1px solid #F1F5F9", gap: 1.5 }}>
          <Button variant="outlined" onClick={handleCancel} disabled={isPending}
            sx={{ borderColor: "#D1D5DB", color: "#374151", fontWeight: 700, px: 3, py: 1, fontSize: 13, borderRadius: 2, "&:hover": { borderColor: "#9CA3AF", bgcolor: "#F9FAFB" } }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={isPending} disableElevation
            startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : <SaveIcon sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: "#C8102E", color: "#fff", fontWeight: 700, px: 4, py: 1, fontSize: 13, borderRadius: 2,
              boxShadow: "0 4px 16px rgba(200,16,46,0.28)",
              "&:hover": { bgcolor: "#A50D26" }, "&:active": { transform: "scale(0.97)" },
              "&.Mui-disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF", boxShadow: "none" },
              transition: "all 0.15s",
            }}>
            {isPending ? (isEditing ? "Updating…" : "Saving…") : (isEditing ? "Update Customer" : "Save Customer")}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}