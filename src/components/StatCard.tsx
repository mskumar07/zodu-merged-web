import { Box, Skeleton, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  valuePrefix?: string;
  sub?: ReactNode;
  radius?: number | string;
  loading?: boolean;
}

const StatCard = ({
  label,
  value,
  icon,
  iconBgColor = "rgba(211,47,47,0.07)",
  iconColor = "#D32F2F",
  valuePrefix = "₹",
  sub,
  loading = false,
}: StatCardProps) => {
  const displayValue =
    valuePrefix === ""
      ? value
      : typeof value === "number" || !isNaN(Number(value))
      ? `${valuePrefix}${value}`
      : value;

  // auto min-width: estimate based on label/value length
  const valueStr = String(displayValue ?? "");
  const labelLen = label.length;
  const valueLen = valueStr.length;
  const computed = Math.max(valueLen * 9, labelLen * 7) + 80;
  const minW = Math.min(Math.max(computed, 150), 260);

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        border: "1px solid #F1F5F9",
        borderRadius: "8px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        px: 2,
        py: 1.5,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        minWidth: minW,
        flex: `1 1 ${minW}px`,
        width: "fit-content",
      }}
    >
      {/* Icon box — square with rounded corners, matches Dashboard */}
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "8px",
          bgcolor: iconBgColor,
          color: iconColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        {/* Label — same as Dashboard "11px / 500 / #64748B" */}
        <Typography
          sx={{
            fontSize: "11px",
            fontWeight: 500,
            color: "#64748B",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </Typography>

        {/* Value */}
        {loading ? (
          <Skeleton width={80} height={24} sx={{ borderRadius: 1, mt: 0.5 }} />
        ) : displayValue != null && displayValue !== "" ? (
          <Typography
            sx={{
              fontSize: "1.05rem",
              fontWeight: 800,
              color: "#0F172A",
              lineHeight: 1.3,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {displayValue}
          </Typography>
        ) : (
          <Typography
            sx={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#CBD5E1",
              lineHeight: 1.3,
              letterSpacing: "0.05em",
            }}
          >
            —
          </Typography>
        )}

        {sub && <Box sx={{ mt: 0.35 }}>{sub}</Box>}
      </Box>
    </Box>
  );
};

export default StatCard;
