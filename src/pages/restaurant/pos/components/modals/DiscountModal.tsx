import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, TextField, InputAdornment,
} from "@mui/material";
import PercentIcon from "@mui/icons-material/Percent";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

interface Props {
  open: boolean;
  discountType: "Percent" | "Amount";
  discountValue: number;
  onApply: (type: "Percent" | "Amount", value: number) => void;
  onClose: () => void;
}

const DiscountModal: React.FC<Props> = ({
  open, discountType, discountValue, onApply, onClose,
}) => {
  const [type, setType] = useState<"Percent" | "Amount">(discountType);
  const [value, setValue] = useState(discountValue > 0 ? String(discountValue) : "");

  useEffect(() => {
    if (open) {
      setType(discountType);
      setValue(discountValue > 0 ? String(discountValue) : "");
    }
  }, [open, discountType, discountValue]);

  const handleApply = () => {
    onApply(type, parseFloat(value) || 0);
    onClose();
  };

  const handleClear = () => {
    onApply("Percent", 0);
    onClose();
  };

  const TYPES: Array<{ key: "Percent" | "Amount"; label: string; icon: React.ReactNode }> = [
    { key: "Percent", label: "Percent (%)", icon: <PercentIcon sx={{ fontSize: 18 }} /> },
    { key: "Amount", label: "Amount (₹)", icon: <CurrencyRupeeIcon sx={{ fontSize: 18 }} /> },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: "14px" } }}
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>Apply Discount</Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 0.5 }}>
        {/* Type toggle */}
        <Box sx={{ display: "flex", gap: 1, mb: 2.5 }}>
          {TYPES.map((t) => (
            <Box
              key={t.key}
              onClick={() => { setType(t.key); setValue(""); }}
              sx={{
                flex: 1,
                py: 1.2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.8,
                borderRadius: "10px",
                border: type === t.key ? "2px solid #d32f2f" : "1.5px solid #e5e7eb",
                bgcolor: type === t.key ? "#fff5f5" : "#fff",
                cursor: "pointer",
                transition: "all 0.15s",
                "&:hover": { border: "1.5px solid #fca5a5", bgcolor: "#fef2f2" },
              }}
            >
              <Box sx={{ color: type === t.key ? "#d32f2f" : "#9ca3af" }}>{t.icon}</Box>
              <Typography
                sx={{
                  fontSize: "0.82rem",
                  fontWeight: type === t.key ? 700 : 400,
                  color: type === t.key ? "#d32f2f" : "#374151",
                }}
              >
                {t.label}
              </Typography>
            </Box>
          ))}
        </Box>

        <TextField
          fullWidth
          type="number"
          size="small"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={type === "Percent" ? "Enter discount %" : "Enter discount amount"}
          autoFocus
          inputProps={{ min: 0, max: type === "Percent" ? 100 : undefined, step: "0.01" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {type === "Percent"
                  ? <PercentIcon sx={{ fontSize: 16, color: "#9ca3af" }} />
                  : <CurrencyRupeeIcon sx={{ fontSize: 16, color: "#9ca3af" }} />
                }
              </InputAdornment>
            ),
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          onClick={handleClear}
          sx={{ color: "#9ca3af", textTransform: "none", fontSize: "0.8rem" }}
        >
          Clear
        </Button>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderColor: "#e5e7eb", color: "#374151", textTransform: "none", borderRadius: "8px" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleApply}
          variant="contained"
          sx={{
            bgcolor: "#d32f2f",
            "&:hover": { bgcolor: "#b71c1c" },
            textTransform: "none",
            borderRadius: "8px",
            fontWeight: 700,
          }}
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DiscountModal;
