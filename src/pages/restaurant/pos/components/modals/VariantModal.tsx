import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { RestaurantMenuItem, RestaurantVariant } from "../../api/restaurantPosApi";

interface Props {
  open: boolean;
  product: RestaurantMenuItem | null;
  onSelect: (product: RestaurantMenuItem, variant: RestaurantVariant) => void;
  onClose: () => void;
}

const VariantModal: React.FC<Props> = ({ open, product, onSelect, onClose }) => {
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setSelected(null);
  }, [open]);

  if (!product) return null;
  const variants = product.variants ?? [];

  const handleConfirm = () => {
    const variant = variants.find(
      (v) => (v.variant_id ?? v.id ?? v.variant_name) === selected
    );
    if (variant) {
      onSelect(product, variant);
      onClose();
    }
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
            Select a variant to continue
          </Typography>
        </Box>
        <Box
          onClick={onClose}
          sx={{ cursor: "pointer", color: "#9ca3af", "&:hover": { color: "#374151" }, mt: 0.3 }}
        >
          <CloseIcon fontSize="small" />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {variants.map((v) => {
            const id = v.variant_id ?? v.id ?? v.variant_name;
            const isActive = selected === id;
            return (
              <Box
                key={id}
                onClick={() => setSelected(id ?? null)}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 1.5,
                  borderRadius: "10px",
                  border: isActive ? "2px solid #d32f2f" : "1.5px solid #e5e7eb",
                  bgcolor: isActive ? "#fff5f5" : "#fff",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  "&:hover": { border: "1.5px solid #fca5a5", bgcolor: "#fef2f2" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      border: isActive ? "5px solid #d32f2f" : "2px solid #d1d5db",
                      transition: "border 0.15s",
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "0.88rem",
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? "#111827" : "#374151",
                    }}
                  >
                    {v.variant_name}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "#d32f2f" }}>
                  ₹{parseFloat(v.price).toFixed(2)}
                </Typography>
              </Box>
            );
          })}
        </Box>
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
          disabled={!selected}
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
          Add to Order
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VariantModal;
