import { Paper, Typography, Box } from "@mui/material";

const ReportSummaryCard = ({
  label,
  value,
  amount = false,
}: {
  label: string;
  value: any;
  amount?: boolean;
}) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6" fontWeight="bold">
        {amount ? `₹ ${value ?? 0}` : value ?? 0}
      </Typography>
    </Paper>
  );
};

export default ReportSummaryCard;
