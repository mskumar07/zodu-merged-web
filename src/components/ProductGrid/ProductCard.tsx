import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
  IconButton,
  useTheme, // Import useTheme
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CircleIcon from "@mui/icons-material/Circle";
import QuantityBox from "./QuantityBox";

const IMAGE =
  "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2025/2/18/953d43de-b44e-4791-8c8a-8d4726cdb9c9_0d6920ce-55d4-4503-b6d7-fd7a5ff6ddce.jpg";

interface ProductCardProps {
  productName: string;
  productImage: string;
  productPrice: string; // need to discuss in feature
  isVeg: string;
  isSelected: boolean;
  onSelect: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onBulkUpdate: (qty: number) => void;
  quantity: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  productName,
  productImage,
  productPrice,
  isVeg,
  isSelected,
  onSelect,
  onIncrement,
  onDecrement,
  onBulkUpdate,
  quantity,
}) => {
  const theme = useTheme(); // Use the useTheme hook
  // when click on add it select the product
  const handleOnAdd = (e: React.MouseEvent) => {
    onSelect();
    e.stopPropagation();
    onIncrement();
  };

  return (
    <Card
      sx={{
        borderRadius: 2,
        border: "1px solid",
        borderColor: "grey.300",
        boxShadow: 1,
        height: "130px",
        p: 1,
        cursor: "pointer",
        bgcolor: "white", // Z-T76 Background changes
        color: "inherit", // Z-T76 Text color changes
      }}
      onClick={onSelect}
    >
      {/* Left side - Image with Veg/NonVeg badge */}
      <Box sx={{ display: "flex", alignItems: "center"}}> {/*Z-i30 */}
        <Box sx={{ position: "relative" }}>
          {productImage ? (
            <CardMedia
              component="img"
              image={productImage ? productImage : IMAGE}
              alt={productName}
              sx={{
                width: 80,
                height: 80,
                borderRadius: 1,
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 4,
                backgroundColor: theme.palette.background.productCard, //Z-T97 changed card background color 
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                color: theme.palette.customText.productCard, //Z-T97 changed text color
                fontSize: 24,
                textTransform: "uppercase",
              }}
            >
              {productName.slice(0, 2)}
            </div>
          )}
          <Box
            sx={{
              position: "absolute",
              top: 2,
              left: 2,
              bgcolor: "white",
              borderRadius: "4px",
              p: "1px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircleIcon sx={{ color: isVeg === "Veg" ? "green" : "red", fontSize: 15 }} />
          </Box>
        </Box>

        {/* Right side - Info */}
        <CardContent
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            p: "0 8px !important",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              maxWidth: "120px",
              textTransform: "uppercase",
              maxHeight: "79px", // limit height Z-i30
              whiteSpace: "wrap", // prevent wrapping
              overflow: "hidden", // cut off overflow
              textOverflow: "ellipsis", // show ...F
            }}
          >
            {productName}
          </Typography>
        </CardContent>
      </Box>
      {/* Rightmost - Add / Counter */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Typography
          variant="body2"
          sx={{ fontWeight: 600 }}
          color="text.secondary"
        >
          {/* Removed price conversion */}₹{productPrice}
        </Typography>
        {isSelected && quantity > 0 ? (
          <>
          {/* <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              border: "1px solid",
              bgcolor: isSelected ? "primary.main" : "white", // Z-T76 Background changes
              borderColor: isSelected ? "white" : "grey.400", //Z-T76
              borderRadius: 1,
              px: 2,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <IconButton size="small" onClick={onDecrement}>
              <RemoveIcon
                fontSize="small"
                sx={{ color: isSelected ? "white" : "inherit" }} // Z-T76
              />
            </IconButton>
            <Typography
              sx={{ color: isSelected ? "white" : "inherit" }}
              variant="body2"
            >
              {quantity}
            </Typography>
            <IconButton size="small" onClick={onIncrement}>
              <AddIcon
                fontSize="small"
                sx={{ color: isSelected ? "white" : "inherit" }} //Z-T76
              />
            </IconButton>
          </Box> */}
          <QuantityBox
            quantity={quantity}
            isSelected={isSelected}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            onBulkUpdate={onBulkUpdate}
          />
          </>
        ):(
    <Box sx={{ width: 64, height: 32 }} /> // ✅ placeholder space
  )}
      </Box>
    </Card>
  );
};

export default ProductCard;
