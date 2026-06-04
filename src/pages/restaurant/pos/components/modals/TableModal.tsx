import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, Box, Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TableBarIcon from "@mui/icons-material/TableBar";

interface Props {
  open: boolean;
  activeTableNumbers: number[];
  selectedTable: number | null;
  onSelect: (tableNo: number) => void;
  onClose: () => void;
  tableCount?: number;
}

const TableModal: React.FC<Props> = ({
  open,
  activeTableNumbers,
  selectedTable,
  onSelect,
  onClose,
  tableCount = 20,
}) => {
  const [hovered, setHovered] = useState<number | null>(null);

  type Status = "selected" | "running" | "empty";

  const getStatus = (n: number): Status => {
    if (selectedTable === n) return "selected";
    if (activeTableNumbers.includes(n)) return "running";
    return "empty";
  };

  const STATUS: Record<Status, { bg: string; border: string; color: string; label: string }> = {
    empty:    { bg: "#f0fdf4", border: "#86efac", color: "#16a34a", label: "Empty" },
    running:  { bg: "#fef3c7", border: "#fcd34d", color: "#d97706", label: "Running" },
    selected: { bg: "#fee2e2", border: "#d32f2f",  color: "#d32f2f",  label: "Selected" },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "14px" } }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "#fff5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TableBarIcon sx={{ color: "#d32f2f", fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} lineHeight={1.2}>Select Table</Typography>
            <Typography variant="caption" color="text.secondary">
              {activeTableNumbers.length} of {tableCount} tables occupied
            </Typography>
          </Box>
        </Box>
        <Box
          onClick={onClose}
          sx={{ cursor: "pointer", color: "#9ca3af", "&:hover": { color: "#374151" }, p: 0.5 }}
        >
          <CloseIcon fontSize="small" />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pb: 3 }}>
        {/* Legend */}
        <Box sx={{ display: "flex", gap: 3, mb: 2.5 }}>
          {(Object.entries(STATUS) as [Status, typeof STATUS[Status]][]).map(([key, s]) => (
            <Box key={key} sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: "3px", bgcolor: s.color }} />
              <Typography variant="caption" color="text.secondary">{s.label}</Typography>
            </Box>
          ))}
        </Box>

        {/* Table grid */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1.5 }}>
          {Array.from({ length: tableCount }, (_, i) => i + 1).map((n) => {
            const status = getStatus(n);
            const s = STATUS[status];
            const isRunning = status === "running";
            return (
              <Box
                key={n}
                onClick={() => !isRunning && onSelect(n)}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(null)}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 74,
                  borderRadius: "12px",
                  border: `2px solid ${hovered === n && !isRunning ? s.color : s.border}`,
                  bgcolor: hovered === n && !isRunning ? `${s.color}15` : s.bg,
                  cursor: isRunning ? "not-allowed" : "pointer",
                  transition: "all 0.15s ease",
                  gap: 0.4,
                }}
              >
                <TableBarIcon sx={{ fontSize: 18, color: s.color, opacity: 0.7 }} />
                <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: s.color, lineHeight: 1 }}>
                  {n}
                </Typography>
                {isRunning && (
                  <Typography sx={{ fontSize: "0.58rem", color: s.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.03em" }}>
                    Occupied
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TableModal;
