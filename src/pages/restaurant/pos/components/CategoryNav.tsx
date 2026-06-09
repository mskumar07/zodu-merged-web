import React from "react";
import { Box, Typography } from "@mui/material";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import type { RestaurantCategory } from "../api/restaurantPosApi";

const COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981",
  "#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6",
  "#f97316", "#06b6d4", "#84cc16", "#f43f5e",
];

interface Props {
  categories: RestaurantCategory[];
  activeCategory: string;
  onSelect: (name: string) => void;
  totalItems: number;
}

interface ItemProps {
  label: string;
  count: number;
  color: string;
  isActive: boolean;
  icon?: React.ReactNode;
  initial?: string;
  onClick: () => void;
}

const NavItem: React.FC<ItemProps> = ({
  label, count, color, isActive, icon, initial, onClick,
}) => (
  <Box
    onClick={onClick}
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.2,
      px: 1.5,
      py: 1,
      cursor: "pointer",
      borderLeft: isActive ? `3px solid ${color}` : "3px solid transparent",
      bgcolor: isActive ? `${color}14` : "transparent",
      transition: "all 0.15s",
      "&:hover": { bgcolor: isActive ? `${color}14` : "#f9fafb" },
      userSelect: "none",
    }}
  >
    {/* Icon box */}
    <Box
      sx={{
        width: 30,
        height: 30,
        borderRadius: "8px",
        bgcolor: isActive ? color : `${color}20`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: isActive ? "#fff" : color,
        fontSize: "0.75rem",
        fontWeight: 700,
        transition: "all 0.15s",
      }}
    >
      {icon ?? initial}
    </Box>

    {/* Label */}
    <Typography
      sx={{
        flex: 1,
        fontSize: "0.78rem",
        fontWeight: isActive ? 600 : 400,
        color: isActive ? "#111827" : "#4b5563",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "normal",
        lineHeight: 1.3,
        textTransform: "uppercase",
      }}
    >
      {label}
    </Typography>

    {/* Count badge */}
    <Box
      sx={{
        minWidth: 20,
        height: 18,
        px: 0.6,
        borderRadius: "9px",
        bgcolor: isActive ? color : "#e5e7eb",
        color: isActive ? "#fff" : "#6b7280",
        fontSize: "0.62rem",
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "all 0.15s",
      }}
    >
      {count}
    </Box>
  </Box>
);

const CategoryNav: React.FC<Props> = ({
  categories, activeCategory, onSelect, totalItems,
}) => (
  <Box
    sx={{
      width: 220,
      minWidth: 220,
      height: "100%",
      overflowY: "auto",
      overflowX: "hidden",
      flexWrap: "wrap",
      bgcolor: "#fff",
      borderRight: "1px solid #e5e7eb",
      display: "flex",
      flexDirection: "column",
      py: 0.5,
      "&::-webkit-scrollbar": { width: 4 },
      "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
      "&::-webkit-scrollbar-thumb": { bgcolor: "#e5e7eb", borderRadius: 2 },
    }}
  >
    <Typography
      sx={{
        px: 2,
        pt: 1,
        pb: 0.8,
        fontSize: "0.62rem",
        fontWeight: 700,
        color: "#9ca3af",
        textTransform: "uppercase",
        letterSpacing: "0.07em",
      }}
    >
      Categories
    </Typography>

    {/* All Items */}
    <NavItem
      label="All Items"
      count={totalItems}
      color="#d32f2f"
      isActive={activeCategory === "All"}
      icon={<RestaurantMenuIcon sx={{ fontSize: 15 }} />}
      onClick={() => onSelect("All")}
    />

    {/* Per-category */}
    {categories.map((cat, idx) => (
      <NavItem
        key={cat.name}
        label={cat.name}
        count={cat.items.length}
        color={COLORS[idx % COLORS.length]}
        isActive={activeCategory === cat.name}
        initial={cat.name.charAt(0).toUpperCase()}
        onClick={() => onSelect(cat.name)}
      />
    ))}
  </Box>
);

export default CategoryNav;
