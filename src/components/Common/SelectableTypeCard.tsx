import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

const redTint = "#ca0022";
const headingText = "#1d2533";
const subtleText = "#8e95a3";
const cardBorder = "#ececf2";

export interface SelectableTypeCardProps {
  /** Glyph shown in the tile on the left — one per type reads faster than text alone. */
  icon: ReactNode;
  label: string;
  /** Optional second line under the label. */
  caption?: string;
  /** Small marker after the label, e.g. "DEFAULT" on the type POS opens on. */
  badge?: string;
  selected: boolean;
  /**
   * Locked on: the card still reads as selected but can't be clicked off —
   * used for the last remaining choice in a multi-select the server requires
   * to be non-empty.
   */
  disabled?: boolean;
  onSelect: () => void;
}

/**
 * A bordered card with an icon, a label and a checkbox at its right edge —
 * the settings screens' picker for a small, fixed set of choices (paper size,
 * invoice copy types, POS sale types). Used for both single- and multi-select;
 * the caller owns the selection rules.
 */
export default function SelectableTypeCard({
  icon, label, caption, badge, selected, disabled = false, onSelect,
}: SelectableTypeCardProps) {
  return (
    <Box
      onClick={disabled ? undefined : onSelect}
      role="button"
      aria-pressed={selected}
      aria-disabled={disabled || undefined}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        cursor: disabled ? "default" : "pointer",
        border: "2px solid",
        borderColor: selected ? redTint : cardBorder,
        borderRadius: 1.5,
        px: 1.5,
        py: 1.25,
        bgcolor: selected ? "#fdf1f2" : "#fff",
        opacity: disabled ? 0.75 : 1,
        transition: "border-color 0.15s ease, background-color 0.15s ease",
        "&:hover": { borderColor: selected ? redTint : disabled ? cardBorder : "#c5c8d2" },
      }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          flexShrink: 0,
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: selected ? "#fff" : "#f5f6fa",
          color: selected ? redTint : subtleText,
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: headingText, lineHeight: 1.3 }}>
          {label}
          {badge && (
            <Box
              component="span"
              sx={{ ml: 0.75, fontSize: 10, fontWeight: 800, color: subtleText, letterSpacing: 0.4 }}
            >
              {badge}
            </Box>
          )}
        </Typography>
        {caption && (
          <Typography sx={{ fontSize: 11.5, color: subtleText, mt: 0.2 }}>
            {caption}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          width: 18,
          height: 18,
          flexShrink: 0,
          borderRadius: 0.6,
          border: "1.5px solid",
          borderColor: selected ? redTint : "#cfd2db",
          bgcolor: selected ? redTint : "#fff",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selected && <CheckRoundedIcon sx={{ fontSize: 13 }} />}
      </Box>
    </Box>
  );
}
