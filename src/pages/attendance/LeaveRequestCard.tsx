import {
  Card,
  Box,
  Avatar,
  Typography,
  Chip,
  Button
} from "@mui/material";

type Status = "Pending" | "Approved" | "Rejected";

interface Props {
  leave: any;
  onApprove: () => void;
  onReject: () => void;
}

const formatDateOnly = (dateString: string) => {
  if (!dateString) return "No Date";

  const parsed = Date.parse(dateString);
  if (isNaN(parsed)) return dateString;

  const date = new Date(parsed);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    weekday: "short",
  });
};


const LeaveRequestCard: React.FC<Props> = ({ leave, onApprove, onReject }) => {
  return (
    <Card
      sx={{
        p: 2,
        mb: 2,
        borderRadius: "12px",
        border: "1px solid #eee",
        boxShadow: "none",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Avatar>{leave.name[0]}</Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              {leave.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {leave.role}
            </Typography>
          </Box>
        </Box>

        <Chip
          label={leave.leave_type}
          size="small"
          sx={{
            bgcolor: "#F3E5F5",
            color: "#7B1FA2",
            fontWeight: "bold",
            fontSize: "0.65rem",
          }}
        />
      </Box>

      {/* Date */}
      <Box
        sx={{
          bgcolor: "#F8F9FA",
          p: 1,
          borderRadius: "6px",
          my: 1,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="caption" fontWeight="bold">
          📅 {formatDateOnly(leave.start_date_fmt)} – {formatDateOnly(leave.end_date_fmt)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          ({leave.duration_days} days)
        </Typography>
      </Box>

      {/* Reason */}
      <Typography
        variant="body2"
        sx={{ color: "#666", fontSize: "0.8rem", mb: 2 }}
      >
        <strong>Reason:</strong> "{leave.reason}"
      </Typography>

      {/* Actions */}
      {leave.status === "Pending" ? (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            onClick={onReject}
          >
            Reject
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="success"
            onClick={onApprove}
          >
            Approve
          </Button>
        </Box>
      ) : (
        <Chip
          label={leave.status}
          color={
            leave.status === "Approved"
              ? "success"
              : leave.status === "Rejected"
              ? "error"
              : "warning"
          }
        />
      )}
    </Card>
  );
};

export default LeaveRequestCard;
