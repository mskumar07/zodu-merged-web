import React from "react";
import { Box, TextField , Grid} from "@mui/material";

interface Props {
  cashReceived: number;
  setCashReceived: (v: number) => void;
  grandTotal: number;
}

const CashInputSection: React.FC<Props> = ({
  cashReceived,
  setCashReceived,
  grandTotal,
}) => {
  const cashGiven = cashReceived > grandTotal ? cashReceived - grandTotal : 0;

  return (
    <Box sx={{ mt: 1, mb: 1 }}>
  <Grid container spacing={2}>
    <Grid size={{ xs: 12, sm: 6 }}>
      <TextField
        label="Received ₹"
        type="number"
        size="small"
        fullWidth
        value={cashReceived > 0 ? cashReceived : ""}
        onChange={(e) => setCashReceived(Number(e.target.value))}
      />
    </Grid>
    <Grid size={{ xs: 12, sm: 6 }}>
      <TextField
        label="Balance ₹"
        type="number"
        size="small"
        fullWidth
        value={cashGiven > 0 ? cashGiven : ""}
        InputProps={{ readOnly: true }}
      />
    </Grid>
  </Grid>
</Box>

  );
};

export default CashInputSection;
