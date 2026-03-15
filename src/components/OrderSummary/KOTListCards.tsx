import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Avatar,
  CircularProgress,
} from "@mui/material";

interface Product {
  menu_name: string;
  menu_image?: string;
  sell_price: string;
  food_type?: string;
  category?: string;
}

interface Item {
  product: Product;
  quantity: number;
}

interface KOT {
  kotId: string;
  items: Item[];
  time: string;
  status?: string;
}

interface Props {
  kotList: KOT[];
  isLoading?: boolean;
}

const KOTListCards: React.FC<Props> = ({ kotList, isLoading }) => {
  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {kotList.map((kot) => (
        <Card
          key={kot.kotId}
          sx={{
            borderRadius: 2,
            boxShadow: "none", // removed elevation
            border: "1px solid #e0e0e0",
            backgroundColor: "#fff",
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                {kot.kotId}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {kot.time}
              </Typography>
            </Box>

            <Divider sx={{ mb: 1 }} />

            {kot.items.map((item, idx) => (
              <>
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                
                     <Typography variant="body2" color="text.secondary">
                {item.quantity} x
                </Typography>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {item.product.menu_name}
                    </Typography>
                  </Box>
                </Box>
              </Box>
                     <Divider sx={{ mb: 1 }} />
                     </>

            ))}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default KOTListCards;
