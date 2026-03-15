// LabelValueDisplay.tsx
import { Typography, Box } from "@mui/material";

interface LabelValueProps {
  label: string;
  value?: React.ReactNode;
}

const LabelValueDisplay: React.FC<LabelValueProps> = ({ label, value }) => (
  <Box>
    <Typography
      variant="subtitle1"
      sx={{ fontWeight: 800 }}
      color="text.secondary"
    >
      {label}
    </Typography>
    <Typography>{value ?? "-"}</Typography>
  </Box>
);

export default LabelValueDisplay;
