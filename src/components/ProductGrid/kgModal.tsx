import React, { useMemo, useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Chip,
  Stack,
} from "@mui/material";

interface Props {
  open: boolean;
  productName?: string;
  onClose: () => void;
  price:string;
  onAdd: (price:string, qty:string)=>void;
  lastSelectedWeight?: string;
}

const KgModal: React.FC<Props> = ({ open, onClose, productName,onAdd,price, lastSelectedWeight }) => {
  const [selectedWeight, setSelectedWeight] = useState<string>("");
  console.log(selectedWeight, "selectedWeight");
  console.log(lastSelectedWeight, "lastSelectedWeight");

  // Chips display "kg", but store numeric value only
  const weightOptions = [
    { label: "0.25 kg", value: "0.25" },
    { label: "0.5 kg", value: "0.5" },
    { label: "0.75 kg", value: "0.75" },
    { label: "1 kg", value: "1" },
  ];

  const handleSelect = (value: string) => {
    setSelectedWeight(value);
  };

  useEffect(() => {
  if (open) {
    setSelectedWeight(lastSelectedWeight || "");
  }
}, [lastSelectedWeight, open]);

  const handleCustomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9.]/g, ""); // allow only numbers & decimal
    setSelectedWeight(value);
  };

   const totalPrice = useMemo(() => {
    const weightNum = parseFloat(selectedWeight);
    if (isNaN(weightNum)) return 0;
    return price * weightNum;
  }, [selectedWeight, price]);


  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select Variant for {productName}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Enter or Select Weight (kg)
          </Typography>
          <TextField
            fullWidth
            type="number"
            variant="outlined"
            placeholder="Enter custom weight (e.g. 1.5)"
            value={selectedWeight}
            onChange={handleCustomChange}
            inputProps={{ step: "0.25", min: "0" }}
          />

          <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mt: 2 }}>
            {weightOptions.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                clickable
                color={selectedWeight === opt.value ? "primary" : "default"}
                onClick={() => handleSelect(opt.value)}
              />
            ))}
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            
           onAdd(totalPrice.toFixed(2), selectedWeight);
           setSelectedWeight("");
          }}
          disabled={!selectedWeight}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default KgModal;
