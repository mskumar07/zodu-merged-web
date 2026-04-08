import { Card, CardContent, Stack, Typography, Box } from "@mui/material";
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
}

const StatCard = ({
  label,
  value,
  icon,
  iconBgColor = "#E3F2FD",
  iconColor,
  valuePrefix = "₹",
  sub,
  radius,
}: StatCardProps) => {
  const displayValue =
    typeof value === "number" || !isNaN(Number(value))
      ? valuePrefix
        ? `${valuePrefix} ${value}`
        : value
      : value;

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #E5E7EB",
        borderRadius: radius ? radius : 1,
        minWidth: 220,
        boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
      }}
    >
      <CardContent sx={{ px: 2, py: 1.8, "&:last-child": { pb: 1.8 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              borderRadius: 1.2,
              backgroundColor: iconBgColor,
              color: iconColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>

          <Box sx={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
            <Typography
              sx={{
                color: "#64748B",
                fontSize: 13,
                fontWeight: 500,
                lineHeight: 1.2,
                mb: 0.5,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {label}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "#0F172A",
                fontWeight: 700,
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {displayValue}
            </Typography>
            {sub && <Box sx={{ mt: 0.35 }}>{sub}</Box>}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default StatCard;
