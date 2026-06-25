import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Box, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, Grid, IconButton, InputAdornment,
  ListSubheader, MenuItem, Select, TextField, Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import AddIcon from "@mui/icons-material/Add";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SearchIcon from "@mui/icons-material/Search";
import {
  useEmployeeDetail, useCreateEmployee, useUpdateEmployee,
  useActiveEmployees,
  buildEmployeePayload, uploadEmployeeDocument, deleteEmployeeDocument,
  INDIA_STATES, EMPLOYMENT_TYPES,
  PAYMENT_TYPES, GENDERS, ACCESS_LEVELS,
} from "./useEmployeeApi";
import { useRoles } from "@pages/auth/Role/useRoleApi";
import LottieLoader from "@components/LottieLoader";

// ─── Theme ───────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: { main: "#E11D48", contrastText: "#ffffff" },
    background: { default: "#F8FAFC", paper: "#ffffff" },
    text: { primary: "#0F172A", secondary: "#6B7280" },
  },
  components: {
    MuiButton: {
      styleOverrides: { root: { textTransform: "none", borderRadius: 8, fontWeight: 700 } },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16, boxShadow: "0 25px 60px rgba(15,23,42,0.2)", maxWidth: 780, width: "100%" },
      },
    },
  },
});

// ─── Input styles ─────────────────────────────────────────────
const inputSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#F8FAFC", fontSize: 13, borderRadius: "8px",
    "& .MuiInputBase-input": { padding: "8px 12px" },
    "& .MuiInputBase-input.MuiSelect-select": { padding: "8px 12px" },
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#E11D48" },
    "&.Mui-focused fieldset": { borderColor: "#E11D48", borderWidth: 2 },
  },
  "& .MuiInputBase-input::placeholder": { color: "#9CA3AF", opacity: 1 },
};

const selectSx = {
  bgcolor: "#F8FAFC", fontSize: 13, borderRadius: "8px",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#E11D48" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#E11D48", borderWidth: 2 },
  "& .MuiInputBase-input": { padding: "8px 12px" },
};

function FL({ children, req }: { children: React.ReactNode; req?: boolean }) {
  return (
    <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#374151", mb: 0.5 }}>
      {children}
      {req && <Box component="span" sx={{ color: "#E11D48", ml: 0.3 }}>*</Box>}
    </Typography>
  );
}

function SH({ icon, title, iconBg, iconColor }: {
  icon: React.ReactNode; title: string; iconBg: string; iconColor: string;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      <Box sx={{ width: 28, height: 28, bgcolor: iconBg, borderRadius: 1.5,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: iconColor }}>
        {icon}
      </Box>
      <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#1F2937" }}>{title}</Typography>
    </Box>
  );
}

// ─── Document row type ────────────────────────────────────────
interface DocRow {
  docType: string;
  file: File | null;
  uploading: boolean;
  uploaded: boolean;
  error: string;
  // set after successful upload — used for delete in edit mode
  uploadedDocId: string | null;
}

const emptyDocRow = (): DocRow => ({
  docType: "", file: null, uploading: false, uploaded: false, error: "", uploadedDocId: null,
});

// ─── Types ────────────────────────────────────────────────────
type FormData = Record<string, string | number | null>;

const PWD_RULES = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,20}$/;

const EMPTY: FormData = {
  name: "", phone: "", email: "", password: "", status: "active",
  date_of_birth: "", gender: "", address_line1: "", address_line2: "",
  city: "", state: "", pincode: "",
  employment_type: "", date_of_joining: "",
  reporting_manager_id: "", reporting_manager_name: "",
  emergency_contact_name: "", emergency_relationship: "", emergency_mobile: "",
  basic_salary: "", allowances: "", payment_type: "",
  bank_account_number: "", bank_name: "", ifsc_code: "",
  role_id: "", access_level: "", notes: "",
};

interface Props {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  employeeId?: string | null;
}

export default function EmployeeFormModal({ open, onClose, mode, employeeId }: Props) {
  const isEdit   = mode === "edit";
  const readOnly = false;

  const [form, setForm]               = useState<FormData>({ ...EMPTY });
  const [errors, setErrors]           = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");
  const [stateSearch, setStateSearch] = useState("");

  // ── Profile photo state ──
  const [avatarUrl, setAvatarUrl]             = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError]         = useState("");
  // doc id returned by server after upload — used for delete
  const [avatarDocId, setAvatarDocId]         = useState<string | null>(null);
  const fileRef         = useRef<HTMLInputElement>(null);
  const pendingPhotoRef = useRef<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  // snapshot of form when edit detail loads — used to diff changed fields
  const initialFormRef = useRef<FormData>({});

  // ── Document rows ──
  const [docRows, setDocRows] = useState<DocRow[]>([emptyDocRow()]);
  // one hidden file input per row — keyed by row index
  const docFileRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { data: detail, isLoading: detailLoading } = useEmployeeDetail(
    isEdit && open ? (employeeId ?? null) : null
  );
  const { data: roles = [] }           = useRoles();
  const { data: activeEmployees = [] } = useActiveEmployees(open);

  // Patch form from detail
  useEffect(() => {
    if (!isEdit || !detail) return;

    // ISO date → YYYY-MM-DD for <input type="date">
    const toDate = (v: string | null | undefined) =>
      v ? v.slice(0, 10) : "";

    // API nests role_info and salary under { success, data }
    const role = detail.role_info?.data ?? (detail.role_info as any);
    const sal  = detail.salary?.data    ?? (detail.salary    as any);

    setForm({
      name: detail.name ?? "",
      phone: detail.phone ?? "",
      email: detail.email ?? "",
      status: detail.status ?? "active",
      date_of_birth: toDate(detail.date_of_birth),
      gender: detail.gender ?? "",
      address_line1: detail.address_line1 ?? "",
      address_line2: detail.address_line2 ?? "",
      city: detail.city ?? "",
      state: detail.state ?? "",
      pincode: detail.pincode ?? "",
      country: detail.country ?? "India",

      employment_type: detail.employment_type ?? "",
      date_of_joining: toDate(detail.date_of_joining),
      reporting_manager_id:   detail.reporting_manager_id   ?? "",
      reporting_manager_name: detail.reporting_manager_name ?? "",
      emergency_contact_name: detail.emergency_contact_name ?? "",
      emergency_relationship: detail.emergency_relationship ?? "",
      emergency_mobile: detail.emergency_mobile ?? "",
      basic_salary:        sal?.basic_salary        ?? "",
      allowances:          sal?.allowances          ?? "",
      payment_type:        sal?.payment_type        ?? "",
      bank_account_number: sal?.bank_account_number ?? "",
      bank_name:           sal?.bank_name           ?? "",
      ifsc_code:           sal?.ifsc_code           ?? "",
      role_id:      role?.role_id      ?? "",
      access_level: role?.access_level ?? "",
      notes: detail.notes ?? "",
    });

    // snapshot for dirty-field diffing on save
    initialFormRef.current = {
      name: detail.name ?? "",
      phone: detail.phone ?? "",
      email: detail.email ?? "",
      status: detail.status ?? "active",
      date_of_birth: detail.date_of_birth ? detail.date_of_birth.slice(0, 10) : "",
      gender: detail.gender ?? "",
      address_line1: detail.address_line1 ?? "",
      address_line2: detail.address_line2 ?? "",
      city: detail.city ?? "",
      state: detail.state ?? "",
      pincode: detail.pincode ?? "",
      country: detail.country ?? "India",
      employment_type: detail.employment_type ?? "",
      date_of_joining: detail.date_of_joining ? detail.date_of_joining.slice(0, 10) : "",
      reporting_manager_id:   detail.reporting_manager_id   ?? "",
      reporting_manager_name: detail.reporting_manager_name ?? "",
      emergency_contact_name: detail.emergency_contact_name ?? "",
      emergency_relationship: detail.emergency_relationship ?? "",
      emergency_mobile: detail.emergency_mobile ?? "",
      basic_salary:        sal?.basic_salary        ?? "",
      allowances:          sal?.allowances          ?? "",
      payment_type:        sal?.payment_type        ?? "",
      bank_account_number: sal?.bank_account_number ?? "",
      bank_name:           sal?.bank_name           ?? "",
      ifsc_code:           sal?.ifsc_code           ?? "",
      role_id:      role?.role_id      ?? "",
      access_level: role?.access_level ?? "",
      notes: detail.notes ?? "",
      password: "",
    };

    // Profile Photo document → show in photo box, not in doc list
    const photoDocs = (detail.documents ?? []).filter(
      (d) => d.document_type === "Profile Photo"
    );
    const otherDocs = (detail.documents ?? []).filter(
      (d) => d.document_type !== "Profile Photo"
    );

    if (photoDocs.length) {
      setAvatarUrl(photoDocs[0].file_url);
      setAvatarDocId(photoDocs[0].id);
    } else if (detail.avatar_url) {
      setAvatarUrl(detail.avatar_url);
    }

    setDocRows(
      otherDocs.length
        ? otherDocs.map((d) => ({
            docType: d.document_type,
            file: null,
            uploading: false,
            uploaded: true,
            error: "",
            uploadedDocId: d.id,
          }))
        : [emptyDocRow()]
    );
  }, [detail, isEdit]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setForm({ ...EMPTY });
      setErrors({});
      setGlobalError("");
      setStateSearch("");
      setAvatarUrl(null);
      setAvatarUploading(false);
      setAvatarError("");
      setAvatarDocId(null);
      setDocRows([emptyDocRow()]);
      pendingPhotoRef.current = null;
      initialFormRef.current = {};
      setShowPassword(false);
    }
  }, [open]);

  const set = useCallback((key: string, value: string | number | null) => {
    if (readOnly) return;
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => { const n = { ...p }; delete n[key]; return n; });
  }, [readOnly]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!String(form.name ?? "").trim())            e.name            = "Required";
    if (!String(form.phone ?? "").trim())           e.phone           = "Required";
    if (!String(form.email ?? "").trim())           e.email           = "Required";
    if (!String(form.date_of_birth ?? "").trim())   e.date_of_birth   = "Required";
    if (!String(form.gender ?? "").trim())          e.gender          = "Required";
    if (!String(form.employment_type ?? "").trim()) e.employment_type = "Required";
    if (!String(form.date_of_joining ?? "").trim()) e.date_of_joining = "Required";
    // password required on add; optional on edit (only validate if filled)
    const pwd = String(form.password ?? "").trim();
    if (!isEdit && !pwd) {
      e.password = "Required";
    } else if (pwd && !PWD_RULES.test(pwd)) {
      e.password = "8–20 chars, at least 1 uppercase, 1 number, 1 special character";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const createEmp = useCreateEmployee({ onError: setGlobalError });
  const updateEmp = useUpdateEmployee({ onSuccess: onClose, onError: setGlobalError });
  const isSaving  = createEmp.isPending || updateEmp.isPending;

  const handleSubmit = async () => {
    if (!validate()) return;
    setGlobalError("");
    const payload = buildEmployeePayload(form);
    if (isEdit && employeeId) {
      // only send fields that changed, plus required zodu_id & branch_id
      const { zoduId, branchId } = (await import("@store/tenantContext")).getTenantContext();
      const initial = initialFormRef.current;
      const changed: Record<string, unknown> = { zodu_id: zoduId ?? "", branch_id: branchId ?? "" };
      (Object.keys(form) as (keyof FormData)[]).forEach((k) => {
        const cur = String(form[k] ?? "");
        const ini = String(initial[k] ?? "");
        if (cur !== ini && !(k === "password" && !cur)) {
          (changed as any)[k] = (payload as any)[k] ?? cur;
        }
      });
      // if role changed, always include access_level too (and vice versa)
      if ("role_id" in changed && !("access_level" in changed)) {
        changed.access_level = String(form.access_level ?? "");
      }
      if ("access_level" in changed && !("role_id" in changed)) {
        changed.role_id = String(form.role_id ?? "");
      }
      // always include password if filled
      if (String(form.password ?? "").trim()) changed.password = String(form.password);
      updateEmp.mutate({ employeeId, payload: changed as any });
    } else {
      try {
        const result = await createEmp.mutateAsync(payload);
        // API returns { success, data: { employee_id } } or { success, employee_id }
        const newId: string =
          result?.data?.employee_id ??
          result?.data?.id ??
          result?.employee_id ??
          result?.id ?? "";
        if (newId) {
          const uploads: Promise<unknown>[] = [];
          if (pendingPhotoRef.current) {
            uploads.push(uploadEmployeeDocument(newId, pendingPhotoRef.current, "Profile Photo").catch(() => null));
          }
          docRows.forEach(({ file, docType }) => {
            if (file) {
              uploads.push(uploadEmployeeDocument(newId, file, docType || "Document").catch(() => null));
            }
          });
          if (uploads.length) await Promise.all(uploads);
        }
        onClose();
      } catch {
        // error already handled by onError
      }
    }
  };

  // ── Photo handlers ────────────────────────────────────────────
  const handlePhotoSelect = async (file: File) => {
    // preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarUrl(ev.target?.result as string);
    reader.readAsDataURL(file);

    // always store for add-mode chaining
    pendingPhotoRef.current = file;

    if (isEdit && employeeId) {
      setAvatarUploading(true);
      setAvatarError("");
      try {
        const uploaded = await uploadEmployeeDocument(employeeId, file, "Profile Photo");
        setAvatarDocId(uploaded.id);
      } catch (err: any) {
        setAvatarError(err?.message ?? "Upload failed");
      } finally {
        setAvatarUploading(false);
      }
    }
    // add mode: file is held in pendingPhotoRef and uploaded after employee creation in handleSubmit
  };

  const handlePhotoRemove = async () => {
    if (isEdit && employeeId && avatarDocId) {
      try {
        await deleteEmployeeDocument(employeeId, avatarDocId);
      } catch {
        // best-effort
      }
    }
    setAvatarUrl(null);
    setAvatarDocId(null);
    setAvatarError("");
    pendingPhotoRef.current = null;
    if (fileRef.current) fileRef.current.value = "";
  };

  // ── Document row handlers ─────────────────────────────────────
  const handleDocFileSelect = async (rowIdx: number, file: File) => {
    const docType = docRows[rowIdx]?.docType || "Document";
    setDocRows((prev) =>
      prev.map((r, i) => i === rowIdx ? { ...r, file, uploading: isEdit && !!employeeId, error: "", uploaded: false } : r)
    );
    if (isEdit && employeeId) {
      try {
        const uploaded = await uploadEmployeeDocument(employeeId, file, docType);
        setDocRows((prev) =>
          prev.map((r, i) => i === rowIdx ? { ...r, uploading: false, uploaded: true, uploadedDocId: uploaded.id } : r)
        );
      } catch (err: any) {
        setDocRows((prev) =>
          prev.map((r, i) => i === rowIdx ? { ...r, uploading: false, error: err?.message ?? "Upload failed" } : r)
        );
      }
    }
  };

  const handleDocRowRemove = async (rowIdx: number) => {
    const row = docRows[rowIdx];
    if (isEdit && employeeId && row.uploadedDocId) {
      try {
        await deleteEmployeeDocument(employeeId, row.uploadedDocId);
      } catch {
        // best-effort
      }
    }
    setDocRows((prev) => {
      const next = prev.filter((_, i) => i !== rowIdx);
      return next.length ? next : [emptyDocRow()];
    });
  };

  const filteredStates = INDIA_STATES.filter((s) =>
    s.toLowerCase().includes(stateSearch.trim().toLowerCase())
  );

  const title    = isEdit ? "Edit Employee" : "Add Employee";
  const subtitle = isEdit ? "Update employee information" : "Enter employee information to create a new employee";

  const tf = (key: string, placeholder = "", type = "text") => (
    <TextField fullWidth size="small" type={type} placeholder={placeholder}
      value={String(form[key] ?? "")}
      onChange={(e) => set(key, e.target.value)}
      error={!!errors[key]}
      helperText={errors[key]}
      slotProps={{ input: { readOnly } }}
      sx={inputSx}
    />
  );

  const sel = (key: string, options: string[], placeholder = "") => (
    <Select fullWidth size="small" displayEmpty
      value={String(form[key] ?? "")}
      onChange={(e) => set(key, e.target.value)}
      inputProps={{ readOnly }}
      sx={selectSx}
      renderValue={(v) => v ? String(v) : <span style={{ color: "#9CA3AF" }}>{placeholder}</span>}
    >
      {options.map((o) => <MenuItem key={o} value={o} sx={{ fontSize: 13 }}>{o}</MenuItem>)}
    </Select>
  );

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>

        {/* ── Header ── */}
        <DialogTitle sx={{ px: 3, py: 2, borderBottom: "1px solid #F1F5F9",
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ p: 0.8, bgcolor: "rgba(225,29,72,0.08)", borderRadius: 2, display: "flex" }}>
              <BadgeOutlinedIcon sx={{ color: "#E11D48", fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 17, fontWeight: 800, color: "#0F172A" }}>{title}</Typography>
              <Typography sx={{ fontSize: 11, color: "#6B7280" }}>{subtitle}</Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small"
            sx={{ color: "#6B7280", bgcolor: "#F9FAFB", "&:hover": { bgcolor: "#F3F4F6" }, borderRadius: "50%" }}>
            <CloseIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </DialogTitle>

        {/* ── Content ── */}
        <DialogContent sx={{ px: 3, py: 3, bgcolor: "#fff", maxHeight: "72vh", overflowY: "auto" }}>
          {isEdit && detailLoading ? (
            <LottieLoader />
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

              {globalError && (
                <Box sx={{ bgcolor: "#FFF1F2", border: "1px solid #FECDD3", borderRadius: 1.5, px: 2, py: 1 }}>
                  <Typography sx={{ color: "#E11D48", fontSize: 13 }}>{globalError}</Typography>
                </Box>
              )}

              {/* ── Basic Information ── */}
              <Box>
                <SH icon={<PersonOutlineIcon sx={{ fontSize: 15 }} />}
                  title="Basic Information" iconBg="#FFF1F2" iconColor="#E11D48" />

                <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>

                  {/* Left: form fields */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>
                      {/* Row 1: Full Name | Mobile Number */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FL req>Full Name</FL>
                        {tf("name", "Enter full name")}
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FL req>Mobile Number</FL>
                        {tf("phone", "Enter mobile number")}
                      </Grid>

                      {/* Row 2: Email | (empty) */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FL req>Email Address</FL>
                        {tf("email", "Enter email address", "email")}
                      </Grid>

                      {/* Row 3: Role | Access Level */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FL>Role</FL>
                        <Select fullWidth size="small" displayEmpty
                          value={String(form.role_id ?? "")}
                          onChange={(e) => set("role_id", e.target.value)}
                          inputProps={{ readOnly }} sx={selectSx}
                          renderValue={(v) => {
                            const r = roles.find((r) => r.role_id === v);
                            return r ? r.role_name : <span style={{ color: "#9CA3AF" }}>Select role</span>;
                          }}
                        >
                          {roles.map((r) => (
                            <MenuItem key={r.role_id} value={r.role_id} sx={{ fontSize: 13 }}>{r.role_name}</MenuItem>
                          ))}
                        </Select>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FL>Access Level</FL>
                        {sel("access_level", ACCESS_LEVELS, "Select access level")}
                      </Grid>

                      {/* Row 4: Status | Password */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FL>Status</FL>
                        {sel("status", ["active", "inactive"], "Select status")}
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FL req={!isEdit}>
                          Password
                          {isEdit && (
                            <Box component="span" sx={{ fontWeight: 400, color: "#9CA3AF", ml: 0.5, fontSize: 11 }}>
                              (leave blank to keep)
                            </Box>
                          )}
                        </FL>
                        <TextField
                          fullWidth size="small"
                          type={showPassword ? "text" : "password"}
                          placeholder={isEdit ? "Enter new password (optional)" : "Enter password"}
                          value={String(form.password ?? "")}
                          onChange={(e) => set("password", e.target.value)}
                          error={!!errors.password}
                          helperText={
                            errors.password
                              ? errors.password
                              : <Box component="span" sx={{ fontSize: 10.5, color: "#9CA3AF" }}>
                                  8–20 chars · 1 uppercase · 1 number · 1 special char
                                </Box>
                          }
                          slotProps={{
                            input: {
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton size="small" onClick={() => setShowPassword((v) => !v)} edge="end"
                                    sx={{ color: "#9CA3AF", "&:hover": { color: "#374151" } }}>
                                    {showPassword
                                      ? <VisibilityOffOutlinedIcon sx={{ fontSize: 17 }} />
                                      : <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            },
                          }}
                          sx={inputSx}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Right: square profile photo */}
                  <Box sx={{ flexShrink: 0, width: 130 }}>
                    <FL>Profile Photo</FL>
                    <Box sx={{ position: "relative", width: 130, height: 130 }}>
                      <Box
                        onClick={() => !readOnly && !avatarUploading && fileRef.current?.click()}
                        sx={{
                          width: 130, height: 130,
                          border: "2px dashed #E2E8F0", borderRadius: 2,
                          display: "flex", flexDirection: "column",
                          alignItems: "center", justifyContent: "center", gap: 0.75,
                          cursor: readOnly || avatarUploading ? "default" : "pointer",
                          bgcolor: "#F8FAFC", overflow: "hidden",
                          "&:hover": !readOnly && !avatarUploading ? { borderColor: "#E11D48", bgcolor: "#FFF9F9" } : {},
                          transition: "all 0.12s",
                        }}
                      >
                        {avatarUploading ? (
                          <CircularProgress size={24} sx={{ color: "#E11D48" }} />
                        ) : avatarUrl ? (
                          <Box component="img" src={avatarUrl} alt="avatar"
                            sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <>
                            <Box sx={{ width: 44, height: 44, borderRadius: "50%", bgcolor: "#E5E7EB",
                              display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <PersonOutlineIcon sx={{ fontSize: 24, color: "#9CA3AF" }} />
                            </Box>
                            <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#374151", textAlign: "center", px: 1 }}>
                              Upload Photo
                            </Typography>
                            <Typography sx={{ fontSize: 10, color: "#9CA3AF", textAlign: "center", px: 1 }}>
                              JPG, PNG · Max 2MB
                            </Typography>
                          </>
                        )}
                      </Box>

                      {/* X cancel button — shown when photo is selected */}
                      {avatarUrl && !readOnly && !avatarUploading && (
                        <Box
                          onClick={handlePhotoRemove}
                          sx={{
                            position: "absolute", top: -8, right: -8,
                            width: 22, height: 22, borderRadius: "50%",
                            bgcolor: "#E11D48", display: "flex",
                            alignItems: "center", justifyContent: "center",
                            cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                            "&:hover": { bgcolor: "#BE123C" },
                          }}
                        >
                          <CloseIcon sx={{ fontSize: 13, color: "#fff" }} />
                        </Box>
                      )}
                    </Box>

                    {avatarError && (
                      <Typography sx={{ fontSize: 10.5, color: "#E11D48", textAlign: "center", mt: 0.5 }}>
                        {avatarError}
                      </Typography>
                    )}
                    {/* add mode: photo queued, will upload after employee is created */}
                    {!isEdit && avatarUrl && !avatarError && (
                      <Typography sx={{ fontSize: 10, color: "#9CA3AF", textAlign: "center", mt: 0.5 }}>
                        Uploads on save
                      </Typography>
                    )}

                    <input ref={fileRef} type="file" accept="image/*" hidden
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        e.target.value = "";
                        await handlePhotoSelect(file);
                      }} />
                  </Box>

                </Box>
              </Box>

              <Divider sx={{ borderColor: "#F1F5F9" }} />

              {/* ── Personal Details ── */}
              <Box>
                <SH icon={<PersonOutlineIcon sx={{ fontSize: 15 }} />}
                  title="Personal Details" iconBg="#FFF1F2" iconColor="#E11D48" />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FL req>Date of Birth</FL>
                    {tf("date_of_birth", "", "date")}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FL req>Gender</FL>
                    {sel("gender", GENDERS, "Select gender")}
                  </Grid>
                  <Grid size={12}>
                    <FL>Address Line 1</FL>
                    {tf("address_line1", "Enter street / area / locality")}
                  </Grid>
                  <Grid size={12}>
                    <FL>Address Line 2</FL>
                    {tf("address_line2", "Apartment, suite, landmark (optional)")}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FL>City</FL>
                    {tf("city", "Enter city")}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FL>State</FL>
                    <Select fullWidth size="small" displayEmpty
                      value={String(form.state ?? "")}
                      onChange={(e) => set("state", e.target.value)}
                      inputProps={{ readOnly }} sx={selectSx}
                      renderValue={(v) => v || <span style={{ color: "#9CA3AF" }}>Select state</span>}
                      MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
                    >
                      <ListSubheader sx={{ bgcolor: "#fff", pb: 0 }}>
                        <TextField size="small" fullWidth placeholder="Search state..."
                          value={stateSearch}
                          onChange={(e) => { e.stopPropagation(); setStateSearch(e.target.value); }}
                          onKeyDown={(e) => e.stopPropagation()}
                          sx={{ ...inputSx, mt: 0.5, mb: 0.5 }}
                          slotProps={{ input: { startAdornment: <SearchIcon sx={{ fontSize: 15, color: "#9CA3AF", mr: 0.5 }} /> } }}
                        />
                      </ListSubheader>
                      {filteredStates.map((s) => (
                        <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>{s}</MenuItem>
                      ))}
                    </Select>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FL>Pincode</FL>
                    {tf("pincode", "Enter pincode")}
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ borderColor: "#F1F5F9" }} />

              {/* ── Employment Information ── */}
              <Box>
                <SH icon={<WorkOutlineIcon sx={{ fontSize: 15 }} />}
                  title="Employment Information" iconBg="#EFF6FF" iconColor="#2563EB" />
                <Grid container spacing={2}>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FL>Reporting Manager</FL>
                    <Select fullWidth size="small" displayEmpty
                      value={String(form.reporting_manager_id ?? "")}
                      onChange={(e) => {
                        const emp = activeEmployees.find((em) => em.employee_id === e.target.value);
                        set("reporting_manager_id", e.target.value);
                        set("reporting_manager_name", emp?.name ?? "");
                      }}
                      inputProps={{ readOnly }} sx={selectSx}
                      renderValue={(v) => {
                        const emp = activeEmployees.find((em) => em.employee_id === v);
                        return emp ? emp.name : <span style={{ color: "#9CA3AF" }}>Select reporting manager</span>;
                      }}
                    >
                      {activeEmployees.map((emp) => (
                        <MenuItem key={emp.employee_id} value={emp.employee_id} sx={{ fontSize: 13 }}>
                          {emp.name}
                        </MenuItem>
                      ))}
                      {activeEmployees.length === 0 && (
                        <MenuItem disabled sx={{ fontSize: 13, color: "#9CA3AF" }}>No employees found</MenuItem>
                      )}
                    </Select>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FL req>Employment Type</FL>
                    {sel("employment_type", EMPLOYMENT_TYPES, "Select employment type")}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FL req>Date of Joining</FL>
                    {tf("date_of_joining", "", "date")}
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ borderColor: "#F1F5F9" }} />

              {/* ── Emergency Contact ── */}
              <Box>
                <SH icon={<PhoneInTalkOutlinedIcon sx={{ fontSize: 15 }} />}
                  title="Emergency Contact" iconBg="#F0FDF4" iconColor="#16A34A" />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FL>Contact Name</FL>
                    {tf("emergency_contact_name", "Enter contact name")}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FL>Mobile Number</FL>
                    {tf("emergency_mobile", "Enter mobile number")}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FL>Relationship</FL>
                    {tf("emergency_relationship", "e.g. Brother")}
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ borderColor: "#F1F5F9" }} />

              {/* ── Salary Information ── */}
              <Box>
                <SH icon={<AccountBalanceOutlinedIcon sx={{ fontSize: 15 }} />}
                  title="Salary Information" iconBg="#FFFBEB" iconColor="#D97706" />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FL>Basic Salary (₹)</FL>
                    {tf("basic_salary", "Enter basic salary", "number")}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FL>Allowances (₹)</FL>
                    {tf("allowances", "Enter allowances", "number")}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FL>Payment Type</FL>
                    {sel("payment_type", PAYMENT_TYPES, "Select payment type")}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FL>Bank Account Number</FL>
                    {tf("bank_account_number", "Enter bank account number")}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FL>Bank Name</FL>
                    {tf("bank_name", "e.g. SBI")}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FL>IFSC Code</FL>
                    {tf("ifsc_code", "e.g. SBIN0001234")}
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ borderColor: "#F1F5F9" }} />

              {/* ── Documents ── */}
              <Box>
                <SH icon={<FolderOutlinedIcon sx={{ fontSize: 15 }} />}
                  title="Documents" iconBg="#EFF6FF" iconColor="#2563EB" />

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {/* Column headers */}
                  <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                    <Typography sx={{ flex: 1, fontSize: 12, fontWeight: 700, color: "#374151" }}>
                      Document Type
                    </Typography>
                    <Typography sx={{ width: 160, fontSize: 12, fontWeight: 700, color: "#374151" }}>
                      File
                    </Typography>
                    {/* spacer for remove button */}
                    <Box sx={{ width: 28 }} />
                  </Box>

                  {docRows.map((row, idx) => (
                    <Box key={idx} sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                      {/* Document type input */}
                      <TextField
                        size="small" placeholder="e.g. Aadhar Card, PAN Card"
                        value={row.docType}
                        onChange={(e) =>
                          setDocRows((prev) =>
                            prev.map((r, i) => i === idx ? { ...r, docType: e.target.value } : r)
                          )
                        }
                        slotProps={{ input: { readOnly: readOnly || row.uploaded } }}
                        sx={{ flex: 1, ...inputSx }}
                      />

                      {/* File upload button */}
                      <Box
                        onClick={() => !readOnly && !row.uploading && !row.uploaded && docFileRefs.current[idx]?.click()}
                        sx={{
                          width: 160, height: 36,
                          border: `1.5px ${(row.file || row.uploaded) ? "solid" : "dashed"} ${
                            row.error ? "#FECDD3" : row.uploaded ? "#BBF7D0" : row.file ? "#CBD5E1" : "#E2E8F0"
                          }`,
                          borderRadius: "8px",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75,
                          bgcolor: row.error ? "#FFF1F2" : row.uploaded ? "#F0FDF4" : row.file ? "#F1F5F9" : "#F8FAFC",
                          cursor: readOnly || row.uploading || row.uploaded ? "default" : "pointer",
                          "&:hover": !readOnly && !row.uploading && !row.uploaded
                            ? { borderColor: "#E11D48", bgcolor: "#FFF9F9" } : {},
                          transition: "all 0.12s", overflow: "hidden", px: 1,
                        }}
                      >
                        {row.uploading ? (
                          <CircularProgress size={14} sx={{ color: "#6366F1" }} />
                        ) : (
                          <AttachFileIcon sx={{
                            fontSize: 14,
                            color: row.error ? "#E11D48" : row.uploaded ? "#16A34A" : "#9CA3AF",
                            flexShrink: 0,
                          }} />
                        )}
                        <Typography sx={{
                          fontSize: 12,
                          color: row.error ? "#E11D48" : row.uploaded ? "#15803D" : row.file ? "#374151" : "#9CA3AF",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {row.uploading
                            ? "Uploading…"
                            : row.error
                            ? `${row.file?.name ?? "File"} — Failed`
                            : row.file
                            ? row.file.name
                            : row.uploaded
                            ? (row.docType ?? "Uploaded")
                            : "Choose file"}
                        </Typography>
                      </Box>

                      {/* Hidden file input per row */}
                      <input
                        type="file" hidden
                        accept=".jpg,.jpeg,.png,.pdf"
                        ref={(el) => { docFileRefs.current[idx] = el; }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          e.target.value = "";
                          await handleDocFileSelect(idx, file);
                        }}
                      />

                      {/* Remove row button */}
                      {!readOnly && (
                        <IconButton
                          size="small"
                          onClick={() => handleDocRowRemove(idx)}
                          sx={{
                            width: 28, height: 28, color: "#9CA3AF",
                            "&:hover": { color: "#E11D48", bgcolor: "#FFF1F2" },
                          }}
                        >
                          <CloseIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      )}
                    </Box>
                  ))}

                  {/* Add row button */}
                  {!readOnly && (
                    <Box>
                      <Button
                        size="small"
                        startIcon={<AddIcon sx={{ fontSize: 15 }} />}
                        onClick={() => setDocRows((prev) => [...prev, emptyDocRow()])}
                        sx={{
                          fontSize: 12, fontWeight: 600, color: "#E11D48",
                          border: "1px dashed #FECDD3", borderRadius: "8px",
                          px: 1.5, py: 0.5, bgcolor: "#FFF1F2",
                          "&:hover": { bgcolor: "#FFE4E6", borderColor: "#E11D48" },
                        }}
                      >
                        Add Document
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>

            </Box>
          )}
        </DialogContent>

        {/* ── Footer ── */}
        <DialogActions sx={{ px: 3, py: 2, bgcolor: "#F8FAFC", borderTop: "1px solid #F1F5F9", gap: 1.5 }}>
          <Typography sx={{ fontSize: 11.5, color: "#9CA3AF", flex: 1 }}>
            Fields marked with <Box component="span" sx={{ color: "#E11D48", fontWeight: 700 }}>*</Box> are mandatory
          </Typography>
          <Button variant="text" onClick={onClose}
            sx={{ color: "#6B7280", fontWeight: 600, "&:hover": { bgcolor: "#F3F4F6" } }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={isSaving} disableElevation
            sx={{ bgcolor: "#E11D48", color: "#fff", px: 3, "&:hover": { bgcolor: "#BE123C" } }}>
            {isSaving
              ? <CircularProgress size={16} sx={{ color: "#fff" }} />
              : isEdit ? "Save Changes" : "Save Employee"
            }
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
