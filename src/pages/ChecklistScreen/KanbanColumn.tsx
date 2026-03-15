import React from "react";
import { Box, Typography, Paper, Badge } from "@mui/material";
import KanbanCard from "./KanbanCard";
import type { ChecklistItem, BoardStatus } from "@types/checklist";

interface KanbanColumnProps {
  id: BoardStatus;
  title: string;
  items: ChecklistItem[];
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetStatus: BoardStatus) => void;
  onDragStart: (e: React.DragEvent, item: ChecklistItem) => void;
  onCardClick?: (item: ChecklistItem) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  items,
  onDragOver,
  onDrop,
  onDragStart,
  onCardClick,
}) => {
  const getColumnColor = (columnId: BoardStatus) => {
    switch (columnId) {
      case "pending":
        return {
          bg: "#fef3c7",
          border: "#f59e0b",
          text: "#92400e",
        };
      case "active":
        return {
          bg: "#dbeafe",
          border: "#3b82f6",
          text: "#1e3a8a",
        };
      case "testing":
        return {
          bg: "#ede9fe",
          border: "#8b5cf6",
          text: "#5b21b6",
        };
      case "closed":
        return {
          bg: "#d1fae5",
          border: "#10b981",
          text: "#065f46",
        };
      default:
        return {
          bg: "#f3f4f6",
          border: "#6b7280",
          text: "#374151",
        };
    }
  };

  const colors = getColumnColor(id);

  return (
    <Box
      sx={{
        minWidth: { xs: 280, sm: 290, md: 300 },
        maxWidth: { xs: 280, sm: 290, md: 300 },
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          mb: 1.5,
          bgcolor: colors.bg,
          borderLeft: `4px solid ${colors.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            color: colors.text,
            textTransform: "uppercase",
            fontSize: "0.85rem",
            letterSpacing: "0.5px",
          }}
        >
          {title}
        </Typography>
        <Badge
          badgeContent={items.length}
          sx={{
            "& .MuiBadge-badge": {
              bgcolor: colors.border,
              color: "white",
              fontWeight: 700,
            },
          }}
        />
      </Paper>

      <Box
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, id)}
        sx={{
          flex: 1,
          minHeight: 200,
          p: 1,
          bgcolor: "#f9fafb",
          borderRadius: 2,
          border: "2px dashed #e5e7eb",
          "&:hover": {
            borderColor: colors.border,
            bgcolor: `${colors.bg}40`,
          },
          transition: "all 0.2s ease",
        }}
      >
        {items.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              minHeight: 150,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", px: 2 }}
            >
              Drop tasks here
            </Typography>
          </Box>
        ) : (
          items.map((item) => (
            <KanbanCard
              key={item.id}
              item={item}
              onDragStart={onDragStart}
              onCardClick={onCardClick}
            />
          ))
        )}
      </Box>
    </Box>
  );
};

export default KanbanColumn;
