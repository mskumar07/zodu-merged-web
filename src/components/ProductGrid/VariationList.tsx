import React, { useState } from "react";
import { Card, CardContent, Typography, Grid, Box } from "@mui/material";
import QuantityControl from "../QuantityControl"; // Import the QuantityControl component

export interface Variation {
  id: string;
  price: string;
  variant_name: string;
}

export interface VariationListProps {
  variants: Variation[];
  quantities: { [key: string]: number };
  setQuantities: (quantities: { [key: string]: number }) => void;
}

const VariationList: React.FC<VariationListProps> = ({
  variants,
  quantities,
  setQuantities,
}) => {

  const handleQuantityChange = (variantId: string, newQuantity: number) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [variantId]: newQuantity,
    }));
    // Optionally call onSelect here if quantity change should trigger selection
    // const selectedVariant = variants.find(v => v.id === variantId);
    // if (onSelect && selectedVariant) {
    //   onSelect(selectedVariant.variant_name, selectedVariant.price, newQuantity);
    // }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={1}>
        {variants.map((variantGroup: Variation) => (
          <Grid  size={{xs:12}} key={variantGroup.id} component="div"> {/* Added component="div" */}
            <Card
              variant="outlined"
              sx={{
                borderRadius: 1,
                width: "80%",
                margin: "auto",
                borderColor: "grey.300",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 1.5, // Adjust padding to accommodate QuantityControl
              }}
            >
              <CardContent sx={{ py: 0, px: 0, flexGrow: 1 }}>
                <Typography variant="subtitle1" fontWeight={500}>
                  {variantGroup.variant_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ₹{variantGroup.price}
                </Typography>
              </CardContent>
              <QuantityControl
                value={quantities[variantGroup.id] || 0}
                onChange={(newQuantity) =>
                  handleQuantityChange(variantGroup.id, newQuantity)
                }
              />
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default VariationList;
