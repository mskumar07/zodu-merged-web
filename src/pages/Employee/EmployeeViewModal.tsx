import React from "react";
import {
  Box, CircularProgress, Dialog, DialogContent, DialogTitle,
  Divider, IconButton, Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { useEmployeeDetail } from "./useEmployeeApi";
import LottieLoader from "@components/LottieLoader";

const theme = createTheme({
  palette: {
    primary: { main: "#E11D48", contrastText: "#ffffff" },
    background: { default: "#F8FAFC", paper: "#ffffff" },
    text: { primary: "#0F172A", secondary: "#6B7280" },
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: "0 25px 60px rgba(15,23,42,0.2)",
          maxWidth: 700,
          width: "100%",
        },
      },
    },
  },
});

function SH({ icon, title, iconBg, iconColor }: {
  icon: React.ReactNode; title: string; iconBg: string; iconColor: string;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
      <Box sx={{
        width: 26, height: 26, bgcolor: iconBg, borderRadius: 1.5,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, color: iconColor,
      }}>
        {icon}
      </Box>
      <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#1F2937", letterSpacing: 0.3 }}>
        {title}
      </Typography>
    </Box>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: "#9CA3AF", letterSpacing: 0.6, textTransform: "uppercase", mb: 0.3 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: value ? "#0F172A" : "#D1D5DB" }}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 1.2 }}>
      {children}
    </Box>
  );
}

function fmt(iso?: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

interface Props {
  open: boolean;
  onClose: () => void;
  employeeId?: string | null;
}

export default function EmployeeViewModal({ open, onClose, employeeId }: Props) {
  const { data: detail, isLoading } = useEmployeeDetail(open ? (employeeId ?? null) : null);

  const role = detail?.role_info?.data ?? (detail?.role_info as any);
  const sal  = detail?.salary?.data    ?? (detail?.salary    as any);

  const photoDocs  = (detail?.documents ?? []).filter((d) => d.document_type === "Profile Photo");
  const otherDocs  = (detail?.documents ?? []).filter((d) => d.document_type !== "Profile Photo");
  const avatarUrl  = photoDocs[0]?.file_url ?? detail?.avatar_url ?? null;

  const address = [detail?.address_line1, detail?.address_line2].filter(Boolean).join(", ");
  const location = [detail?.city, detail?.state, detail?.pincode].filter(Boolean).join(", ");

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>

        {/* Header */}
        <DialogTitle sx={{
          px: 3, py: 2, borderBottom: "1px solid #F1F5F9",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ p: 0.8, bgcolor: "rgba(225,29,72,0.08)", borderRadius: 2, display: "flex" }}>
              <BadgeOutlinedIcon sx={{ color: "#E11D48", fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 17, fontWeight: 800, color: "#0F172A" }}>Employee Details</Typography>
              <Typography sx={{ fontSize: 11, color: "#6B7280" }}>Employee information (read-only)</Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small"
            sx={{ color: "#6B7280", bgcolor: "#F9FAFB", "&:hover": { bgcolor: "#F3F4F6" }, borderRadius: "50%" }}>
            <CloseIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </DialogTitle>

        {/* Content */}
        <DialogContent sx={{ px: 3, py: 3, bgcolor: "#fff", maxHeight: "76vh", overflowY: "auto" }}>
          {isLoading ? (
            <LottieLoader />
          ) : !detail ? (
            <Typography sx={{ color: "#9CA3AF", fontSize: 13, textAlign: "center", py: 4 }}>
              No employee data found.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>

              {/* ── Basic Information ── */}
              <Box>
                <SH icon={<PersonOutlineIcon sx={{ fontSize: 14 }} />}
                  title="Basic Information" iconBg="#FFF1F2" iconColor="#E11D48" />

                {/* Profile photo + fields side-by-side */}
                <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>

                  {/* Fields */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Row>
                      <Field label="Full Name" value={detail.name} />
                      <Field label="Employee ID" value={detail.employee_code} />
                    </Row>
                    <Row>
                      <Field label="Mobile Number" value={detail.phone} />
                      <Field label="Email Address" value={detail.email} />
                    </Row>
                    <Row>
                      <Field label="Role" value={role?.role_name} />
                      <Field label="Access Level" value={role?.access_level} />
                    </Row>
                    <Row>
                      <Field label="Status" value={detail.status ? detail.status.charAt(0).toUpperCase() + detail.status.slice(1) : null} />
                    </Row>
                  </Box>

                  {/* Profile photo */}
                  <Box sx={{ flexShrink: 0, textAlign: "center" }}>
                    <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: "#9CA3AF", letterSpacing: 0.6, textTransform: "uppercase", mb: 0.5 }}>
                      Profile Photo
                    </Typography>
                    <Box sx={{
                      width: 110, height: 110, borderRadius: 2,
                      border: "2px solid #F1F5F9", overflow: "hidden",
                      bgcolor: "#F8FAFC",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {avatarUrl ? (
                        <Box component="img" src={avatarUrl} alt={detail.name}
                          sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <Box sx={{
                          width: 48, height: 48, borderRadius: "50%", bgcolor: "#E5E7EB",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <PersonOutlineIcon sx={{ fontSize: 26, color: "#9CA3AF" }} />
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ borderColor: "#F1F5F9" }} />

              {/* ── Personal Details ── */}
              <Box>
                <SH icon={<PersonOutlineIcon sx={{ fontSize: 14 }} />}
                  title="Personal Details" iconBg="#FFF1F2" iconColor="#E11D48" />
                <Row>
                  <Field label="Date of Birth" value={fmt(detail.date_of_birth)} />
                  <Field label="Gender" value={detail.gender} />
                </Row>
                {(address || location) && (
                  <>
                    {address && (
                      <Box sx={{ mb: 1.2 }}>
                        <Field label="Address" value={address} />
                      </Box>
                    )}
                    {location && (
                      <Box sx={{ mb: 1.2 }}>
                        <Field label="City / State / Pincode" value={location} />
                      </Box>
                    )}
                  </>
                )}
              </Box>

              <Divider sx={{ borderColor: "#F1F5F9" }} />

              {/* ── Employment Information ── */}
              <Box>
                <SH icon={<WorkOutlineIcon sx={{ fontSize: 14 }} />}
                  title="Employment Information" iconBg="#EFF6FF" iconColor="#2563EB" />
                <Row>
                  <Field label="Employment Type" value={detail.employment_type} />
                  <Field label="Date of Joining" value={fmt(detail.date_of_joining)} />
                </Row>
                <Row>
                  <Field label="Reporting Manager" value={detail.reporting_manager_name} />
                </Row>
              </Box>

              <Divider sx={{ borderColor: "#F1F5F9" }} />

              {/* ── Emergency Contact ── */}
              <Box>
                <SH icon={<PhoneInTalkOutlinedIcon sx={{ fontSize: 14 }} />}
                  title="Emergency Contact" iconBg="#F0FDF4" iconColor="#16A34A" />
                <Row>
                  <Field label="Contact Name" value={detail.emergency_contact_name} />
                  <Field label="Mobile Number" value={detail.emergency_mobile} />
                </Row>
                <Row>
                  <Field label="Relationship" value={detail.emergency_relationship} />
                </Row>
              </Box>

              {sal && (sal.basic_salary || sal.payment_type || sal.bank_name) && (
                <>
                  <Divider sx={{ borderColor: "#F1F5F9" }} />

                  {/* ── Salary Information ── */}
                  <Box>
                    <SH icon={<AccountBalanceOutlinedIcon sx={{ fontSize: 14 }} />}
                      title="Salary Information" iconBg="#FFFBEB" iconColor="#D97706" />
                    <Row>
                      <Field label="Basic Salary (₹)" value={sal.basic_salary} />
                      <Field label="Allowances (₹)" value={sal.allowances} />
                    </Row>
                    <Row>
                      <Field label="Payment Type" value={sal.payment_type} />
                      <Field label="Bank Name" value={sal.bank_name} />
                    </Row>
                    <Row>
                      <Field label="Account Number" value={sal.bank_account_number} />
                      <Field label="IFSC Code" value={sal.ifsc_code} />
                    </Row>
                  </Box>
                </>
              )}

              {otherDocs.length > 0 && (
                <>
                  <Divider sx={{ borderColor: "#F1F5F9" }} />

                  {/* ── Documents ── */}
                  <Box>
                    <SH icon={<FolderOutlinedIcon sx={{ fontSize: 14 }} />}
                      title="Documents" iconBg="#EFF6FF" iconColor="#2563EB" />
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {otherDocs.map((doc) => (
                        <Box key={doc.id} sx={{
                          display: "flex", alignItems: "center", gap: 1.5,
                          px: 1.5, py: 1, borderRadius: 1.5,
                          border: "1px solid #E2E8F0", bgcolor: "#F8FAFC",
                        }}>
                          <InsertDriveFileOutlinedIcon sx={{ fontSize: 18, color: "#6366F1", flexShrink: 0 }} />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
                              {doc.document_type}
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: "#9CA3AF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {doc.file_name}
                            </Typography>
                          </Box>
                          <Box
                            component="a"
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              fontSize: 11, fontWeight: 700, color: "#2563EB",
                              textDecoration: "none", flexShrink: 0,
                              "&:hover": { textDecoration: "underline" },
                            }}
                          >
                            View
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </>
              )}

            </Box>
          )}
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}
