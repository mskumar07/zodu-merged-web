import React from "react";
import { Box, Typography, IconButton, Avatar } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import QuantityControl from "@components/QuantityControl/index.tsx";
import type { OrderItem } from "../../types/order.ts";

interface Props {
  item: OrderItem;
  onQuantityChange: (qty: number) => void;
  onRemove: () => void;
  isSummary?: boolean; //z-t97
}

const OrderProductListItem: React.FC<Props> = ({
  item,
  onQuantityChange,
  onRemove,
  isSummary = false, //z-t97
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        // justifyContent: "space-around",
        mb: 0.2,
        p: 0.3,
      }}
    >
      <Box sx={{ mr: 1 }}>
        {item.product.menu_image ? (
          <Avatar
            variant="square"
            src={item.product.menu_image}
            alt={item.product.menu_name}
            sx={{
              width: 50,
              height: 50,
              borderRadius: 1,
              backgroundColor: "#f0f0f0",
            }}
          />
        ) : (
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 3,
              backgroundColor: "#dae1e4", //Z-T97 changed card background color
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              // marginRight: 8,
              fontWeight: "bold",
              color: "#5e5e5e", //Z-T97 changed text color
              fontSize: 12,
              textTransform: "uppercase",
            }}
          >
            {item.product.menu_name.slice(0, 2)}
          </div>
        )}
      </Box>
      {/* Product Info */}
      <Box
        sx={{
          flex: "0 0 250px", // fixed width for alignment
          whiteSpace: "normal",      // allow wrapping
          wordBreak: "break-word",   // break long words if needed
        }}
        title={item.product.menu_name}
      >
        <Typography variant="body2" fontWeight={500}>
          {item.product.menu_name}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          ₹{item.product.sell_price}
        </Typography>
      </Box>

      <Box>
      <Box sx={{ display:"flex", justifyContent:"center", borderRadius:1, paddingX:1,  }}>
      {/*T-97*/}
      <Typography variant="subtitle2" color="text.secondary" sx={{
        fontWeight:"bold"
      }}>₹{isSummary ? item.product.productTotal: item.product.sell_price * item.quantity}</Typography>
      </Box>
      <Box sx={{
        display:"flex"
      }}>
      {/* Quantity Control */}
      <Box
        sx={{
          flex: "0 0 80px",
          display: "flex",
          justifyContent: "center"
        }}
      >
        <QuantityControl value={item.quantity} onChange={onQuantityChange} />
      </Box>

      {/* Delete Button */}
      <Box
        sx={{
          flex: "0 0 30px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <IconButton size="small" color="error" onClick={onRemove}>
          <DeleteIcon />
        </IconButton>
      </Box>
      </Box>
      </Box>
    </Box>
  );
};

export default OrderProductListItem;
