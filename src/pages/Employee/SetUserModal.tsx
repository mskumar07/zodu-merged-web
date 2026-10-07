import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert, Box, Button, CircularProgress, Dialog, FormControl, FormHelperText,
  IconButton, InputAdornment, MenuItem, Select, TextField, Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { closeFromControlsOnly } from "@utils/dialog";
import SuccessToast from "@components/Common/SuccessToast";
import { useRoles } from "@pages/auth/Role/useRoleApi";
import { useSetLoginDetails } from "./useEmployeeApi";
import { PWD_HINT, PWD_RULES } from "./LoginDetailsSection";


export interface SetUserTarget {
  id: string;
  name: string;
  hasRole: boolean;
  hasPassword: boolean;
}

interface Props {
  open: boolean;
  employee: SetUserTarget | null;
  onClose: () => void;
}

interface FormState { roleId: string; password: string; confirm: string }
const EMPTY: FormState = { roleId: "", password: "", confirm: "" };

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5, fontSize: 14,
    "& fieldset": { borderColor: "#E5E7EB" },
    "&:hover fieldset": { borderColor: "#E11D48" },
    "&.Mui-focused fieldset": { borderColor: "#E11D48", borderWidth: 2 },
    "&.Mui-error fieldset": { borderColor: "#E11D48" },
  },
};

const Label = ({ children }: { children: string }) => (
  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0F172A", mb: 0.75 }}>
    {children} <Box component="span" sx={{ color: "#E11D48" }}>*</Box>
  </Typography>
);

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5, color: "#E11D48" }}>
      <ErrorOutlineIcon sx={{ fontSize: 14 }} />
      <Typography sx={{ fontSize: 11.5 }}>{message}</Typography>
    </Box>
  ) : null;

function PasswordField({ value, onChange, placeholder, error }: {
  value: string; onChange: (v: string) => void; placeholder: string; error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <>
      <TextField
        fullWidth size="small" autoComplete="new-password"
        type={show ? "text" : "password"}
        placeholder={placeholder} value={value} error={!!error}
        onChange={(e) => onChange(e.target.value)}
        sx={fieldSx}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" edge="end" onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Hide password" : "Show password"}>
                  {show ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} /> : <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      <FieldError message={error} />
    </>
  );
}

function SetUserModal({ open, employee, onClose }: Props) {
  const { data: roles = [] } = useRoles();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: "success" | "error" }>({ message: "", severity: "success" });

  const update = useCallback((patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch })), []);

  // Fresh form every time the dialog opens
  useEffect(() => {
    if (open) { setForm(EMPTY); setSubmitted(false); }
  }, [open, employee?.id]);

  const save = useSetLoginDetails({
    onSuccess: () => {
      setToast({ message: "Login details saved successfully!", severity: "success" });
      onClose();
    },
    onError: (message) => setToast({ message, severity: "error" }),
  });

  // Only collect what the employee doesn't have yet
  const needsRole = !!employee && !employee.hasRole;
  const needsPassword = !!employee && !employee.hasPassword;
  const nothingToSet = !!employee && !needsRole && !needsPassword;

  const errors = useMemo(() => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (needsRole && !form.roleId) e.roleId = "Role is required";
    if (needsPassword) {
      if (!form.password) e.password = "Password is required";
      else if (!PWD_RULES.test(form.password)) e.password = PWD_HINT;
      if (!form.confirm) e.confirm = "Please confirm the password";
      else if (form.confirm !== form.password) e.confirm = "Passwords do not match";
    }
    return e;
  }, [form, needsRole, needsPassword]);

  const shown = submitted ? errors : {};

  const handleSubmit = () => {
    setSubmitted(true);
    if (!employee || Object.keys(errors).length > 0) return;
    save.mutate({
      employeeId: employee.id,
      payload: {
        ...(needsRole && { role_id: form.roleId }),
        ...(needsPassword && { password: form.password, confirm_password: form.confirm }),
      },
      // Saving here is what switches the login on.
      loginUser: true,
    });
  };

  return (
    <>
    <Dialog
      open={open} onClose={closeFromControlsOnly(onClose)} maxWidth="xs" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, px: 3, pt: 2.5, pb: 2, borderBottom: "1px solid #F1F5F9" }}>
        <Box sx={{ width: 44, height: 44, borderRadius: "50%", bgcolor: "#FFF1F2", color: "#E11D48",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <ManageAccountsOutlinedIcon />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 17, fontWeight: 700, color: "#0F172A" }}>Set User / Login Details</Typography>
          <Typography sx={{ fontSize: 12.5, color: "#6B7280" }} noWrap>
            Create login credentials for {employee?.name ? <b>{employee.name}</b> : "this employee"} to access the system.
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} disabled={save.isPending} aria-label="Close">
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* Body */}
      <Box component="form" noValidate onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
        sx={{ px: 3, py: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
        {nothingToSet && (
          <Alert severity="info" sx={{ fontSize: 13 }}>
            This employee already has a role and password. Enable the login to let them sign in. Use Edit to change the role or password.
          </Alert>
        )}

        {needsRole && (
        <FormControl fullWidth error={!!shown.roleId}>
          <Label>Role</Label>
          <Select
            size="small" displayEmpty value={form.roleId}
            onChange={(e) => update({ roleId: e.target.value })}
            renderValue={(v) => roles.find((r) => r.role_id === v)?.role_name
              ?? <span style={{ color: "#9CA3AF" }}>Select Role</span>}
            sx={{ ...fieldSx["& .MuiOutlinedInput-root"], fontSize: 14,
              "& fieldset": { borderColor: shown.roleId ? "#E11D48" : "#E5E7EB" },
              "&:hover fieldset": { borderColor: "#E11D48" },
              "&.Mui-focused fieldset": { borderColor: "#E11D48", borderWidth: 2 } }}
          >
            {roles.map((r) => (
              <MenuItem key={r.role_id} value={r.role_id} sx={{ fontSize: 13 }}>{r.role_name}</MenuItem>
            ))}
          </Select>
          {shown.roleId && <FormHelperText component="div" sx={{ m: 0 }}><FieldError message={shown.roleId} /></FormHelperText>}
        </FormControl>
        )}

        {needsPassword && (<>
        <Box>
          <Label>Password</Label>
          <PasswordField value={form.password} placeholder="Enter password"
            onChange={(v) => update({ password: v })} error={shown.password} />
        </Box>

        <Box>
          <Label>Confirm Password</Label>
          <PasswordField value={form.confirm} placeholder="Confirm password"
            onChange={(v) => update({ confirm: v })} error={shown.confirm} />
        </Box>
        </>)}

        {/* Actions */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, pt: 1 }}>
          <Button variant="outlined" onClick={onClose} disabled={save.isPending}
            sx={{ borderColor: "#E5E7EB", color: "#374151", fontWeight: 600, "&:hover": { borderColor: "#9CA3AF" } }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disableElevation disabled={save.isPending}
            startIcon={save.isPending ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <PersonAddAlt1OutlinedIcon sx={{ fontSize: 18 }} />}
            sx={{ bgcolor: "#E11D48", color: "#fff", fontWeight: 700, "&:hover": { bgcolor: "#BE123C" } }}>
            {nothingToSet ? "Enable Login" : "Save & Set User"}
          </Button>
        </Box>
      </Box>
    </Dialog>
      <SuccessToast message={toast.message} severity={toast.severity} onClose={() => setToast((t) => ({ ...t, message: "" }))} />
    </>
  );
}

export default memo(SetUserModal);
