import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import InventoryIcon from "@mui/icons-material/Inventory";

interface Summary {
  total_orders: number;
  total_amount: number;
  total_expense: number;
  low_stocks: number;
}

interface SummaryCardsProps {
  summary?: Summary;
  isLoading?: boolean;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, isLoading = false }) => {
  console.log("📊 SummaryCards received:", {
    summary,
    isLoading,
  });

  const formatCurrency = (amount: number) =>
    `₹ ${amount.toLocaleString("en-IN")}`;

  const metrics = [
    {
      title: "Total Sales",
      value: formatCurrency(summary?.total_sales || 0),
      icon: <AttachMoneyIcon />,
      color: "#4CAF50",
    },
    {
      title: "Total Orders",
      value: summary?.total_orders || 0,
      icon: <ReceiptIcon />,
      color: "#2196F3",
    },
    {
      title: "Total Expenses",
      value: formatCurrency(summary?.total_expense || 0),
      icon: <MoneyOffIcon />,
      color: "#FF9800",
    },
    {
      title: "Low Stock Items",
      value: summary?.low_stocks || 0,
      icon: <InventoryIcon />,
      color: "#F44336",
    },
  ];

  /* ================= LOADING STATE ================= */
  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {metrics.map((_, index) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
            <Card sx={{ height: 90, borderRadius: 2 }}>
              <CardContent
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                <CircularProgress size={28} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  /* ================= NORMAL STATE ================= */
  return (
    <Grid container spacing={2}>
      {metrics.map((metric, index) => (
        <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: 1,
              height: 90,
            }}>
            <CardContent
              sx={{
                p: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}>
              {/* ICON + TITLE */}
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <Box
                  sx={{
                    color: metric.color,
                    display: "flex",
                    alignItems: "center",
                  }}>
                  {metric.icon}
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={500}>
                  {metric.title}
                </Typography>
              </Box>

              {/* VALUE */}
              <Typography variant="h6" fontWeight="bold">
                {metric.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default SummaryCards;
