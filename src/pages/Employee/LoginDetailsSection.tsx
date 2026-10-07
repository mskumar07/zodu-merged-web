import { memo, useState } from "react";
import {
  Box, Button, FormControlLabel, IconButton, InputAdornment,
  MenuItem, Select, Switch, TextField, Typography,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import type { RoleListItem } from "@pages/auth/Role/useRoleApi";
import type { LoginDetailsPayload } from "./useEmployeeApi";

export const PWD_RULES = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,20}$/;
export const PWD_HINT = "8–20 chars, at least 1 uppercase, 1 number, 1 special character";

// ─── State + pure helpers (kept out of the component so they're easy to reason about) ───

export interface LoginFormState {
  enabled: boolean;
  roleId: string;
  password: string;
  confirm: string;
  /** Only meaningful when a password already exists: reveals the password fields. */
  changePassword: boolean;
}

export const EMPTY_LOGIN: LoginFormState = {
  enabled: false, roleId: "", password: "", confirm: "", changePassword: false,
};

export type LoginErrors = Partial<Record<"roleId" | "password" | "confirm", string>>;

interface LoginContext {
  /** The employee already has a password on file (it can never be shown, only replaced). */
  passwordSet: boolean;
  /** The default Admin is the super admin and has no assignable role. */
  hideRole: boolean;
}

const passwordFieldsOpen = (s: LoginFormState, c: LoginContext) => !c.passwordSet || s.changePassword;

export function validateLogin(s: LoginFormState, c: LoginContext): LoginErrors {
  const e: LoginErrors = {};
  if (!s.enabled) return e;
  if (!c.hideRole && !s.roleId) e.roleId = "Role is required";
  if (passwordFieldsOpen(s, c)) {
    if (!s.password) e.password = "Password is required";
    else if (!PWD_RULES.test(s.password)) e.password = PWD_HINT;
    if (!s.confirm) e.confirm = "Please confirm the password";
    else if (s.confirm !== s.password) e.confirm = "Passwords do not match";
  }
  return e;
}

/** Only what actually changed. Returns null when there is nothing to send. */
export function buildLoginPayload(
  s: LoginFormState, c: LoginContext, initialRoleId: string,
): LoginDetailsPayload | null {
  if (!s.enabled) return null;
  const payload: LoginDetailsPayload = {};
  if (!c.hideRole && s.roleId && s.roleId !== initialRoleId) payload.role_id = s.roleId;
  if (passwordFieldsOpen(s, c) && s.password) {
    payload.password = s.password;
    payload.confirm_password = s.confirm;
  }
  return Object.keys(payload).length ? payload : null;
}

// ─── UI ───

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#F8FAFC", fontSize: 13, borderRadius: "8px",
    "& .MuiInputBase-input": { padding: "8px 12px" },
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#E11D48" },
    "&.Mui-focused fieldset": { borderColor: "#E11D48", borderWidth: 2 },
  },
};

const selectSx = {
  bgcolor: "#F8FAFC", fontSize: 13, borderRadius: "8px",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#E11D48" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#E11D48", borderWidth: 2 },
  "& .MuiInputBase-input": { padding: "8px 12px" },
};

const Label = ({ children, req }: { children: string; req?: boolean }) => (
  <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#374151", mb: 0.5 }}>
    {children}{req && <Box component="span" sx={{ color: "#E11D48", ml: 0.3 }}>*</Box>}
  </Typography>
);

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5, color: "#E11D48" }}>
      <ErrorOutlineIcon sx={{ fontSize: 13 }} />
      <Typography sx={{ fontSize: 11 }}>{message}</Typography>
    </Box>
  ) : null;

function PasswordInput({ value, onChange, placeholder, error }: {
  value: string; onChange: (v: string) => void; placeholder: string; error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <>
      <TextField
        fullWidth size="small" autoComplete="new-password" sx={fieldSx}
        type={show ? "text" : "password"} placeholder={placeholder}
        value={value} error={!!error} onChange={(e) => onChange(e.target.value)}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" edge="end" onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Hide password" : "Show password"}
                  sx={{ color: "#9CA3AF", "&:hover": { color: "#374151" } }}>
                  {show ? <VisibilityOffOutlinedIcon sx={{ fontSize: 17 }} /> : <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />}
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

interface Props extends LoginContext {
  value: LoginFormState;
  errors: LoginErrors;
  roles: RoleListItem[];
  onChange: (patch: Partial<LoginFormState>) => void;
}

function LoginDetailsSection({ value, errors, roles, passwordSet, hideRole, onChange }: Props) {
  const showPasswordFields = passwordFieldsOpen(value, { passwordSet, hideRole });

  return (
    <Box sx={{ gridColumn: "1 / -1" }}>
      <FormControlLabel
        label={<Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Set user / login</Typography>}
        labelPlacement="start"
        sx={{ ml: 0, gap: 1.5 }}
        control={
          <Switch size="small" checked={value.enabled}
            onChange={(e) => onChange({ enabled: e.target.checked })}
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": { color: "#E11D48" },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#E11D48" },
            }} />
        }
      />

      {value.enabled && (
        <Box sx={{
          mt: 0.5, p: 1.5, border: "1px solid #F1F5F9", borderRadius: 2, bgcolor: "#FCFCFD",
          display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        }}>
          {!hideRole && (
            <Box sx={{ gridColumn: "1 / -1" }}>
              <Label req>Role</Label>
              <Select fullWidth size="small" displayEmpty value={value.roleId}
                onChange={(e) => onChange({ roleId: e.target.value })} sx={selectSx}
                error={!!errors.roleId}
                renderValue={(v) => roles.find((r) => r.role_id === v)?.role_name
                  ?? <span style={{ color: "#9CA3AF" }}>Select role</span>}>
                {roles.map((r) => (
                  <MenuItem key={r.role_id} value={r.role_id} sx={{ fontSize: 13 }}>{r.role_name}</MenuItem>
                ))}
              </Select>
              <FieldError message={errors.roleId} />
            </Box>
          )}

          {showPasswordFields ? (
            <>
              <Box>
                <Label req>{passwordSet ? "New Password" : "Password"}</Label>
                <PasswordInput value={value.password} placeholder="Enter password"
                  onChange={(v) => onChange({ password: v })} error={errors.password} />
              </Box>
              <Box>
                <Label req>Confirm Password</Label>
                <PasswordInput value={value.confirm} placeholder="Confirm password"
                  onChange={(v) => onChange({ confirm: v })} error={errors.confirm} />
              </Box>
              {passwordSet && (
                <Button size="small" onClick={() => onChange({ changePassword: false, password: "", confirm: "" })}
                  sx={{ gridColumn: "1 / -1", justifySelf: "start", fontSize: 12, color: "#6B7280" }}>
                  Keep current password
                </Button>
              )}
            </>
          ) : (
            <Box sx={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", justifyContent: "space-between",
              p: 1, px: 1.5, bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px" }}>
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>Password</Typography>
                <Typography sx={{ fontSize: 13, letterSpacing: 2, color: "#6B7280" }}>••••••••</Typography>
              </Box>
              <Button size="small" onClick={() => onChange({ changePassword: true })}
                sx={{ fontSize: 12, fontWeight: 700, color: "#E11D48" }}>
                Change password
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

export default memo(LoginDetailsSection);
