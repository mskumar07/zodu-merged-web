// components/StatCard.tsx
import { Card, CardContent, Stack, Typography, Box } from "@mui/material";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor?: string;
  valuePrefix?: string;
}

const StatCard = ({
  label,
  value,
  icon,
  iconBgColor = "#E3F2FD",
  valuePrefix = "₹",
}: StatCardProps) => {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #eee",
        borderRadius: 0.5,
        minWidth: 220,
      }}
    >
      <CardContent sx={{ px: 1.5, py: 1, "&:last-child": { pb: 1.25 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              backgroundColor: iconBgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {typeof value === "number" || !isNaN(Number(value))
                ? `${valuePrefix} ${value}`
                : value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default StatCard;
