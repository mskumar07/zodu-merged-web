// components/reports/SummaryCard.tsx
import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Receipt,
  Payment,
  MoneyOff,
  ShoppingCart,
  Inventory2,
} from "@mui/icons-material";

interface SummaryCardProps {
  title: string;
  value: string | number;
  change?: string;
  isCurrency?: boolean;
  icon?: React.ReactNode;
}

export const SummaryCard = React.memo<SummaryCardProps>(
  ({ title, value, change, isCurrency = false, icon }) => {
    console.log("SummaryCard re-rendered with props:", {
      title,
      value,
      change,
      isCurrency,
      icon,
    });
    const isPositive = change?.startsWith("~") || change?.startsWith("+");

    const getDefaultIcon = () => {
      if (title.includes("ORDER")) return <Receipt sx={{ color: "#1976d2" }} />;
      if (title.includes("AMOUNT") || title.includes("REVENUE"))
        return <AttachMoney sx={{ color: "#2e7d32" }} />;
      if (title.includes("EXPENSE") || title.includes("DUE"))
        return <MoneyOff sx={{ color: "#d32f2f" }} />;
      if (title.includes("PAID")) return <Payment sx={{ color: "#2e7d32" }} />;
      if (title.includes("PURCHASE"))
        return <ShoppingCart sx={{ color: "#1976d2" }} />;
      if (title.includes("INVENTORY") || title.includes("ITEMS"))
        return <Inventory2 sx={{ color: "#ed6c02" }} />;
      if (title.includes("BILLS")) return <Receipt sx={{ color: "#1976d2" }} />;
      return <Receipt sx={{ color: "#1976d2" }} />;
    };

    const cardIcon = icon || getDefaultIcon();
    const iconColor =
      title.includes("AMOUNT") || title.includes("REVENUE")
        ? "#2e7d32"
        : title.includes("EXPENSE") || title.includes("DUE")
          ? "#d32f2f"
          : title.includes("PURCHASE")
            ? "#1976d2"
            : title.includes("INVENTORY")
              ? "#ed6c02"
              : "#1976d2";

    return (
      <Card
        sx={{
          width: "100%", // 🔥 take full grid width
          height: "100%", // 🔥 uniform height
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",

          transition: "transform 0.2s",
          "&:hover": {
            transform: "translateY(-2px)",
          },
        }}
      >
        <CardContent sx={{ p: 1.5 }}>
          <Box display="flex" alignItems="center" gap={3}>
            <Box
              sx={{
                backgroundColor: `${iconColor}20`,
                borderRadius: "12px",
                padding: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {cardIcon}
            </Box>
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
                sx={{ fontSize: "12px", fontWeight: 500 }}
              >
                {title}
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {isCurrency && typeof value === "number"
                  ? `₹ ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : typeof value === "number"
                    ? value.toLocaleString()
                    : value}
              </Typography>
              {change && (
                <Box display="flex" alignItems="center">
                  {isPositive ? (
                    <TrendingUp
                      sx={{ fontSize: 16, color: "#2e7d32", mr: 0.5 }}
                    />
                  ) : (
                    <TrendingDown
                      sx={{ fontSize: 16, color: "#d32f2f", mr: 0.5 }}
                    />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      color: isPositive ? "#2e7d32" : "#d32f2f",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                  >
                    {change}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  },
);
