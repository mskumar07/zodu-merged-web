// components/reports/ReportDashboard.tsx
import React from "react";
import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import {
  Receipt,
  ShoppingCart,
  MoneyOff,
  Inventory2,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const reportCards = [
  {
    title: "Sales Report",
    description:
      "View sales trends, peak hours, and popular menu items performance over time.",
    icon: Receipt,
    path: "/reports/sales",
    category: "/reports/sales/category-item",
    datewise: "/reports/sales/datewise",
    color: "#f44336",
  },
  {
    title: "Purchase Report",
    description:
      "Monitor ingredient costs, supplier performance, and procurement history.",
    icon: ShoppingCart,
    path: "/reports/purchase",
    color: "#3f51b5",
  },
  {
    title: "Expenses Report",
    description:
      "Track operational costs including utilities, rent, and miscellaneous overheads.",
    icon: MoneyOff,
    path: "/reports/expenses",
    color: "#fbc02d",
  },
  {
    title: "Inventory Report",
    description:
      "Analyze stock levels, waste management, and inventory turnover ratios.",
    icon: Inventory2,
    path: "/reports/inventory",
    color: "#4caf50",
  },
];

const ReportDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      {/* Header */}
      <Typography fontSize={20} fontWeight={600} mb={0.5}>
        Report Categories
      </Typography>
      <Typography fontSize={13} color="text.secondary" mb={3}>
        Select a category to view detailed analytical reports.
      </Typography>

      {/* GRID */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(6, 1fr)", // 🔥 FORCE 4 PER ROW
          },
          gap: 2,
        }}
      >
        {reportCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card
              key={card.title}
              elevation={0}
              sx={{
                border: "1px solid #eee",
                borderRadius: 1,
                height: "100%",
                minHeight: "auto",
                transition: "0.2s",
                // "&:hover": {
                //   boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                //   transform: "translateY(-2px)",
                // },
              }}
            >
           
                <CardContent >
                  <Box display="flex" alignItems="center" >
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 1.5,
                         backgroundColor: `${card.color}20`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 1.5,
                        flexShrink: 0,
                      }}
                    >
                      <Icon sx={{ fontSize: 18, color: card.color }} />
                    </Box>

                    <Typography fontSize={18} fontWeight={600} noWrap>
                      {card.title}
                    </Typography>
                  
                  </Box>
                    <Divider sx={{my:1.5}} />
                    <Box sx={{ml:2}}>
                          {card.datewise && (
                      <Typography onClick={() => navigate(card.datewise!)} fontSize={14} fontWeight={400} sx={{cursor:"pointer", "&:hover": { color:"#1976d2" }}} color="#000" mt={1}>
                        • Date-wise Report
                      </Typography>
                    )}
                    <Typography onClick={() => navigate(card.path)} fontSize={14} fontWeight={400} sx={{cursor:"pointer", "&:hover": { color:"#1976d2" }}} color="#000" mt={1}>
                     • MonthWise Report
                    </Typography>
                    {card.category && (
                      <Typography onClick={() => navigate(card.category)} fontSize={14} fontWeight={400} sx={{cursor:"pointer", "&:hover": { color:"#1976d2" }}} color="#000" mt={1}>
                        • Category/Item-wise Report
                      </Typography>
                    )}
                
                    </Box>
{/* 
                  <Typography
                    fontSize={12}
                    color="text.secondary"
                    lineHeight={1.6}
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {card.description}
                  </Typography> */}
                </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

export default ReportDashboard;
