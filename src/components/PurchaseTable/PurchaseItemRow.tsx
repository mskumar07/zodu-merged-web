import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  EditOutlined as EditIcon,
  DeleteOutlined as DeleteIcon,
  Check as CheckIcon,
} from "@mui/icons-material";

export interface PurchaseItem {
  id: string;
  count: number;
  price: number;
  productName: string;
  total: number;
}

interface PurchaseItemRowProps {
  item: PurchaseItem;
  onUpdate: (updatedItem: PurchaseItem) => void;
  onDelete: (id: string) => void;
}

const PurchaseItemRow: React.FC<PurchaseItemRowProps> = ({
  item,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editPrice, setEditPrice] = useState(item.price.toString());
  const [editQty, setEditQty] = useState(item.count.toString());

  // Ensure state updates if item changes from parent
  useEffect(() => {
    setEditPrice(item.price.toString());
    setEditQty(item.count.toString());
  }, [item]);

  // Increment/decrement quantity
  const handleUpdateCount = (delta: number) => {
    const currentCount = parseFloat(String(item.count)) || 1;
    const newCount = Math.max(1, currentCount + delta);

    const currentPrice = parseFloat(String(item.price)) || 0;

    onUpdate({
      ...item,
      count: newCount,
      total: parseFloat((newCount * currentPrice).toFixed(2)),
    });
  };

  // Save edits
  const handleSaveEdit = () => {
    const newPrice = parseFloat(editPrice);
    const newQty = parseFloat(editQty);

    const safePrice = isNaN(newPrice) ? 0 : newPrice;
    const safeQty = isNaN(newQty) || newQty < 1 ? 1 : newQty;

    onUpdate({
      ...item,
      price: safePrice,
      count: safeQty,
      total: parseFloat((safePrice * safeQty).toFixed(2)),
    });

    setIsEditing(false);
  };

  return (
    <Box
      sx={{
        background: "#f6f6f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 8px",
        borderRadius: "6px",
        mb: 1,
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography fontWeight={600}>{item.productName}</Typography>

        {!isEditing ? (
          <>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {`${parseFloat(String(item.count))} × $${parseFloat(
                String(item.price)
              ).toFixed(2)}`}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                bgcolor: "#de2828",
                borderRadius: 1,
                px: 2,
                mt: 0.5,
                width: "fit-content",
              }}
            >
              <IconButton size="small" onClick={() => handleUpdateCount(-1)}>
                <RemoveIcon fontSize="small" sx={{ color: "white" }} />
              </IconButton>
              <Typography sx={{ color: "white" }}>
                {Math.floor(parseFloat(String(item.count)))}
              </Typography>
              <IconButton size="small" onClick={() => handleUpdateCount(+1)}>
                <AddIcon fontSize="small" sx={{ color: "white" }} />
              </IconButton>
            </Box>
          </>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                size="small"
                label="Price"
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                sx={{ width: 100 }}
              />
              <TextField
                size="small"
                label="Quantity"
                type="number"
                inputProps={{ min: 1 }}
                value={editQty}
                onChange={(e) => setEditQty(e.target.value)}
                sx={{ width: 100 }}
              />
            </Box>
          </Box>
        )}
      </Box>

      {/* Action buttons */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography sx={{ mr: 1 }}>${item.total.toFixed(2)}</Typography>
        {isEditing ? (
          <IconButton color="success" onClick={handleSaveEdit}>
            <CheckIcon />
          </IconButton>
        ) : (
          <IconButton color="primary" onClick={() => setIsEditing(true)}>
            <EditIcon />
          </IconButton>
        )}
        <IconButton color="error" onClick={() => onDelete(item.id)}>
          <DeleteIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default PurchaseItemRow;
