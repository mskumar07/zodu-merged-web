import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, Button, IconButton, InputAdornment, Select, MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

interface Props {
  open: boolean;
  onClose: () => void;
  discountPct: string;
  discount: string;
  modeAccent: string;
  gstMode: "after" | "before";
  onApply: (discountPct: string, discount: string, gstMode: "after" | "before") => void;
}

export default function DiscountModal({
  open, onClose, discountPct, discount, modeAccent, gstMode: initialGstMode, onApply,
}: Props) {
  const [localPct, setLocalPct] = useState(discountPct);
  const [localAmt, setLocalAmt] = useState(discount);
  const [gstMode, setGstMode] = useState<"after" | "before">(initialGstMode);

  useEffect(() => {
    if (open) {
      setLocalPct(discountPct);
      setLocalAmt(discount);
      setGstMode(initialGstMode);
    }
  }, [open, discountPct, discount, initialGstMode]);

  const hasPct = parseFloat(localPct) > 0;
  const hasAmt = parseFloat(localAmt) > 0;

  const handleApply = () => {
    onApply(localPct, localAmt, gstMode);
    onClose();
  };

  const handleClear = () => {
    setLocalPct("0");
    setLocalAmt("0");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            px: 3,
            pt: 2.5,
            pb: 2,
            borderBottom: "1px solid #F3F4F6",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1.5,
                bgcolor: `${modeAccent}14`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LocalOfferOutlinedIcon sx={{ fontSize: 18, color: modeAccent }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>
                Apply Discount
              </Typography>
              <Typography sx={{ fontSize: 10, color: "#9CA3AF", fontWeight: 500 }}>
                Set percentage or flat amount off
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: "#9CA3AF", "&:hover": { bgcolor: "#F3F4F6" } }}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 2 }}>
          <Box>
            <Typography
              sx={{
                fontSize: 10,
                color: "#9CA3AF",
                fontWeight: 700,
                letterSpacing: "0.08em",
                mb: 0.75,
                textTransform: "uppercase",
              }}
            >
              Discount %
            </Typography>
            <TextField
              value={localPct}
               onChange={e => setLocalPct(e.target.value.replace(/[^0-9.]/g, ""))}
  onFocus={() => {
    if (localPct === "0") setLocalPct("");
  }}
  onBlur={() => {
    if (!localPct) setLocalPct("0");
  }}

              placeholder="0"
              size="small"
              fullWidth
              autoFocus
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: hasPct ? modeAccent : "#9CA3AF", lineHeight: 1 }}>
                      %
                    </Typography>
                  </InputAdornment>
                ),
              }}
              inputProps={{ style: { fontSize: 15, fontWeight: 600, padding: "10px 12px" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: hasPct ? `${modeAccent}08` : "#FAFAFA",
                  "& fieldset": {
                    borderColor: hasPct ? modeAccent : "#E5E7EB",
                    borderWidth: hasPct ? 1.5 : 1,
                  },
                  "&:hover fieldset": { borderColor: modeAccent },
                  "&.Mui-focused fieldset": { borderColor: modeAccent, borderWidth: 1.5 },
                },
              }}
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 10,
                color: "#9CA3AF",
                fontWeight: 700,
                letterSpacing: "0.08em",
                mb: 0.75,
                textTransform: "uppercase",
              }}
            >
              Amount
            </Typography>
            <TextField
              value={localAmt}
             onChange={e => setLocalAmt(e.target.value.replace(/[^0-9.]/g, ""))}
  onFocus={() => {
    if (localAmt === "0") setLocalAmt("");
  }}
  onBlur={() => {
    if (!localAmt) setLocalAmt("0");
  }}
              placeholder="0.00"
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: hasAmt ? modeAccent : "#9CA3AF", lineHeight: 1 }}>
                      Rs
                    </Typography>
                  </InputAdornment>
                ),
              }}
              inputProps={{ style: { fontSize: 15, fontWeight: 600, padding: "10px 8px" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: hasAmt ? `${modeAccent}08` : "#FAFAFA",
                  "& fieldset": {
                    borderColor: hasAmt ? modeAccent : "#E5E7EB",
                    borderWidth: hasAmt ? 1.5 : 1,
                  },
                  "&:hover fieldset": { borderColor: modeAccent },
                  "&.Mui-focused fieldset": { borderColor: modeAccent, borderWidth: 1.5 },
                },
              }}
            />
          </Box>
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <Typography
            sx={{
              fontSize: 10,
              color: "#9CA3AF",
              fontWeight: 700,
              letterSpacing: "0.08em",
              mb: 0.75,
              textTransform: "uppercase",
            }}
          >
            GST Mode
          </Typography>
          <Select
            value={gstMode}
            onChange={e => setGstMode(e.target.value as "after" | "before")}
            size="small"
            fullWidth
            sx={{
              borderRadius: 2,
              bgcolor: "#FAFAFA",
              fontSize: 14,
              fontWeight: 600,
              "& .MuiSelect-select": { py: 1.25 },
              "& fieldset": { borderColor: "#E5E7EB" },
              "&:hover fieldset": { borderColor: modeAccent },
              "&.Mui-focused fieldset": { borderColor: modeAccent, borderWidth: 1.5 },
            }}
          >
            <MenuItem value="after" sx={{ fontSize: 14, fontWeight: 600 }}>Discount After GST</MenuItem>
            <MenuItem value="before" sx={{ fontSize: 14, fontWeight: 600 }}>Discount Before GST</MenuItem>
          </Select>
        </Box>

        {hasPct && hasAmt && (
          <Box sx={{ px: 1.5, py: 0.9, bgcolor: "#FEF3C7", borderRadius: 1.5, border: "1px solid #FDE68A", mb: 1 }}>
            <Typography sx={{ fontSize: 11, color: "#92400E", fontWeight: 600 }}>
              Both discounts will be applied together
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, gap: 1, borderTop: "1px solid #F3F4F6" }}>
        <Button
          onClick={handleClear}
          sx={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", borderRadius: 2, "&:hover": { bgcolor: "#F9FAFB" } }}
        >
          Clear
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ fontSize: 13, fontWeight: 600, borderRadius: 2, borderColor: "#E5E7EB", color: "#374151", "&:hover": { bgcolor: "#F9FAFB" } }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleApply}
          variant="contained"
          startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
          sx={{
            fontSize: 13,
            fontWeight: 700,
            borderRadius: 2,
            bgcolor: modeAccent,
            "&:hover": { filter: "brightness(0.9)" },
            boxShadow: "none",
            textTransform: "none",
          }}
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
}
