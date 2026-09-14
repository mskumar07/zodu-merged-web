import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import type { Branch } from "@pages/auth/Authapi";

const theme = createTheme({
  palette: {
    primary: { main: "#af101a", contrastText: "#ffffff" },
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
          maxWidth: 480,
          width: "100%",
        },
      },
    },
  },
});

interface DeleteBranchDialogProps {
  open: boolean;
  branch: Branch | null;
  companyName?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteBranchDialog({
  open,
  branch,
  companyName,
  loading = false,
  onClose,
  onConfirm,
}: DeleteBranchDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const branchName = branch?.branch_name ?? "";
  const isMatch = confirmText.trim().toLowerCase() === branchName.trim().toLowerCase();

  useEffect(() => {
    if (open) setConfirmText("");
  }, [open, branch]);

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
        <Box sx={{ position: "relative", px: 3.5, pt: 3.5, pb: 3 }}>
          <IconButton
            onClick={onClose}
            disabled={loading}
            sx={{ position: "absolute", top: 14, right: 14, color: "#9aa1ac" }}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              bgcolor: "#FDECEC",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <WarningRoundedIcon sx={{ color: "#af101a", fontSize: 28 }} />
          </Box>

          <Typography sx={{ fontSize: 19, fontWeight: 800, color: "#0F172A", mb: 0.75 }}>
            Delete this branch?
          </Typography>

          <Typography sx={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6, mb: 1.5 }}>
            You're about to permanently delete{" "}
            <Box component="span" sx={{ fontWeight: 700, color: "#0F172A" }}>
              {branchName}
            </Box>
            {companyName ? (
              <>
                {" "}from{" "}
                <Box component="span" sx={{ fontWeight: 700, color: "#0F172A" }}>
                  {companyName}
                </Box>
              </>
            ) : null}
            . This removes all sales, customers, staff, payroll, and checklist
            data tied to this branch across every service.
          </Typography>

          <Box
            sx={{
              bgcolor: "#FDECEC",
              border: "1px solid #F8C9C9",
              borderRadius: 2,
              px: 1.75,
              py: 1.25,
              mb: 2.25,
            }}
          >
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#af101a" }}>
              This action cannot be undone. Deleted branch data cannot be restored.
            </Typography>
          </Box>

          <Typography sx={{ fontSize: 13, color: "#0F172A", mb: 1 }}>
            Type{" "}
            <Box component="span" sx={{ fontWeight: 800 }}>
              {branchName}
            </Box>{" "}
            to confirm.
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder={branchName}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={loading}
            autoFocus
            sx={{
              mb: 2.75,
              "& .MuiOutlinedInput-root": { borderRadius: 1.2, fontSize: 14 },
            }}
          />

          <Box sx={{ display: "flex", gap: 1.25, justifyContent: "flex-end" }}>
            <Button variant="outlined" color="inherit" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={onConfirm}
              disabled={!isMatch || loading}
              sx={{
                bgcolor: "#af101a",
                "&:hover": { bgcolor: "#8c0d15" },
                minWidth: 140,
              }}
            >
              {loading ? "Deleting…" : "Delete Branch"}
            </Button>
          </Box>
        </Box>
      </Dialog>
    </ThemeProvider>
  );
}
