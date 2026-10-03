import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, TextField, InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { RestaurantMenuItem } from "../../api/restaurantPosApi";
import { getItemPrice } from "../../api/restaurantPosApi";

const QUICK_WEIGHTS = [0.25, 0.5, 0.75, 1];

interface Props {
  open: boolean;
  product: RestaurantMenuItem | null;
  /** Weight already on the order for this item, prefilled so it can be edited. */
  initialQty?: number;
  onConfirm: (product: RestaurantMenuItem, qty: number) => void;
  onClose: () => void;
}

/** Weight entry for kg-sold items — type any value or tap a quick-pick chip. */
const WeightModal: React.FC<Props> = ({ open, product, initialQty, onConfirm, onClose }) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (open) setValue(initialQty && initialQty > 0 ? String(initialQty) : "");
  }, [open, initialQty]);

  if (!product) return null;

  const weight  = parseFloat(value);
  const isValid = Number.isFinite(weight) && weight > 0;
  const price   = getItemPrice(product);
  const isExisting = !!initialQty && initialQty > 0;

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm(product, weight);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: "14px" } }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>{product.menu_name}</Typography>
          <Typography variant="caption" color="text.secondary">
            ₹{price.toFixed(2)} / kg · Enter weight (in kg)
          </Typography>
        </Box>
        <Box
          onClick={onClose}
          sx={{ cursor: "pointer", color: "#9ca3af", "&:hover": { color: "#374151" }, mt: 0.3 }}
        >
          <CloseIcon fontSize="small" />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: "4px !important" }}>
        <TextField
          autoFocus
          fullWidth
          size="small"
          placeholder="e.g. 1.5"
          value={value}
          onChange={(e) => {
            // Digits and a single decimal point only.
            const v = e.target.value.replace(/[^0-9.]/g, "");
            if ((v.match(/\./g) ?? []).length <= 1) setValue(v);
          }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleConfirm(); } }}
          inputProps={{ inputMode: "decimal", style: { fontWeight: 700, fontSize: "1rem" } }}
          InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              "&:hover fieldset": { borderColor: "#d32f2f" },
              "&.Mui-focused fieldset": { borderColor: "#d32f2f" },
            },
          }}
        />

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
          {QUICK_WEIGHTS.map((w) => {
            const isActive = isValid && weight === w;
            return (
              <Box
                key={w}
                onClick={() => setValue(String(w))}
                sx={{
                  px: 1.6,
                  py: 0.6,
                  borderRadius: "999px",
                  border: isActive ? "2px solid #d32f2f" : "1.5px solid #e5e7eb",
                  bgcolor: isActive ? "#fff5f5" : "#fff",
                  color: isActive ? "#d32f2f" : "#374151",
                  fontSize: "0.82rem",
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "all 0.15s",
                  "&:hover": { borderColor: "#fca5a5", bgcolor: "#fef2f2" },
                }}
              >
                {w} kg
              </Box>
            );
          })}
        </Box>

        {isValid && (
          <Typography sx={{ mt: 1.5, fontSize: "0.82rem", color: "#6b7280" }}>
            Amount: <Box component="span" sx={{ fontWeight: 700, color: "#d32f2f" }}>₹{(price * weight).toFixed(2)}</Box>
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderColor: "#e5e7eb", color: "#374151", textTransform: "none", borderRadius: "8px" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!isValid}
          variant="contained"
          sx={{
            flex: 1,
            bgcolor: "#d32f2f",
            "&:hover": { bgcolor: "#b71c1c" },
            "&:disabled": { bgcolor: "#fca5a5", color: "#fff" },
            textTransform: "none",
            borderRadius: "8px",
            fontWeight: 700,
          }}
        >
          {isExisting ? "Update Weight" : "Add to Order"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WeightModal;
