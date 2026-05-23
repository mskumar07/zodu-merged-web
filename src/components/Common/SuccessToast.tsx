import { Snackbar, Alert } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

interface SuccessToastProps {
  message: string;
  onClose: () => void;
}

export default function SuccessToast({ message, onClose }: SuccessToastProps) {
  return (
    <Snackbar
      open={!!message}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={onClose}
        severity="success"
        variant="filled"
        icon={<CheckCircleOutlineIcon sx={{ fontSize: 20 }} />}
        sx={{
          fontWeight: 700,
          fontSize: 14,
          borderRadius: 2,
          bgcolor: "#16A34A",
          color: "#fff",
          boxShadow: "0 8px 24px rgba(22,163,74,0.35)",
          "& .MuiAlert-icon": { color: "#fff" },
          "& .MuiAlert-action .MuiIconButton-root": { color: "#fff" },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
