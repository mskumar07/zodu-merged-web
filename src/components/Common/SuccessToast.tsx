import { Snackbar, Alert } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon       from "@mui/icons-material/ErrorOutline";

interface SuccessToastProps {
  message:   string;
  onClose:   () => void;
  /** "success" (default, green) | "error" (red) */
  severity?: "success" | "error";
}

export default function SuccessToast({ message, onClose, severity = "success" }: SuccessToastProps) {
  const isError = severity === "error";

  return (
    <Snackbar
      open={!!message}
      autoHideDuration={isError ? 4000 : 3000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        icon={
          isError
            ? <ErrorOutlineIcon       sx={{ fontSize: 20 }} />
            : <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />
        }
        sx={{
          fontWeight: 700,
          fontSize: 14,
          borderRadius: 2,
          bgcolor:isError ? "#D2122E" : "#16A34A",
          color: "#fff",
          boxShadow:  isError
            ? "0 8px 24px rgba(210,18,46,0.35)"
            : "0 8px 24px rgba(22,163,74,0.35)",
          "& .MuiAlert-icon":                           { color: "#fff" },
          "& .MuiAlert-action .MuiIconButton-root":     { color: "#fff" },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
