import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, Button, IconButton, Chip,
} from "@mui/material";
import CloseIcon           from "@mui/icons-material/Close";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

interface Props {
  open: boolean;
  onClose: () => void;
  orderNote: string;
  onApply: (note: string) => void;
}

export default function NoteModal({ open, onClose, orderNote, onApply }: Props) {
  const [localNote, setLocalNote] = useState(orderNote);

  useEffect(() => {
    if (open) setLocalNote(orderNote);
  }, [open, orderNote]);

  const hasNote = localNote.trim().length > 0;
  const charCount = localNote.length;

  const handleApply = () => {
    onApply(localNote);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
    >
      {/* ── Header ── */}
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{
          px: 3, pt: 2.5, pb: 2,
          borderBottom: "1px solid #F3F4F6",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Box sx={{
              width: 34, height: 34, borderRadius: 1.5,
              bgcolor: "#F0FDF4",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <NoteAltOutlinedIcon sx={{ fontSize: 18, color: "#22C55E" }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>
                Order Note
              </Typography>
              <Typography sx={{ fontSize: 10, color: "#9CA3AF", fontWeight: 500 }}>
                Add instructions or remarks for this order
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {hasNote && (
              <Chip
                label="Added"
                size="small"
                sx={{ fontSize: 9, height: 18, bgcolor: "#DCFCE7", color: "#166534", fontWeight: 700 }}
              />
            )}
            <IconButton size="small" onClick={onClose} sx={{ color: "#9CA3AF", "&:hover": { bgcolor: "#F3F4F6" } }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      {/* ── Body ── */}
      <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
        <TextField
          value={localNote}
          onChange={e => setLocalNote(e.target.value)}
          placeholder="e.g. Handle with care · Gift wrap · Call before delivery…"
          size="small"
          fullWidth
          multiline
          rows={5}
          autoFocus
          inputProps={{ style: { fontSize: 14, lineHeight: 1.7 }, maxLength: 500 }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: hasNote ? "#F0FDF4" : "#FAFAFA",
              "& fieldset": {
                borderColor: hasNote ? "#86EFAC" : "#E5E7EB",
                borderWidth: hasNote ? 1.5 : 1,
              },
              "&:hover fieldset": { borderColor: "#6EE7B7" },
              "&.Mui-focused fieldset": { borderColor: "#22C55E", borderWidth: 2 },
              transition: "background 0.2s",
            },
          }}
        />
        {/* Character count */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.75 }}>
          <Typography sx={{ fontSize: 10, color: charCount > 450 ? "#F59E0B" : "#D1D5DB", fontWeight: 500 }}>
            {charCount} / 500
          </Typography>
        </Box>
      </DialogContent>

      {/* ── Footer ── */}
      <DialogActions sx={{ px: 3, py: 2.5, gap: 1, borderTop: "1px solid #F3F4F6" }}>
        <Button
          onClick={() => setLocalNote("")}
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
            fontSize: 13, fontWeight: 700, borderRadius: 2,
            bgcolor: "#22C55E", "&:hover": { bgcolor: "#16A34A" },
            boxShadow: "none", textTransform: "none",
          }}
        >
          Save Note
        </Button>
      </DialogActions>
    </Dialog>
  );
}
