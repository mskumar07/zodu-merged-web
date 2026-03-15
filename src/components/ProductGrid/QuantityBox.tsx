import { useState } from "react";
import { Box, IconButton, Typography, TextField } from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";
import { toast } from "react-toastify";

interface QuantityBoxProps {
  quantity: number;
  isSelected: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onBulkUpdate: (newQuantity: number) => void;
}

export default function QuantityBox({
  quantity,
  isSelected,
  onIncrement,
  onDecrement,
  onBulkUpdate,
}: QuantityBoxProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempQuantity, setTempQuantity] = useState(quantity);
  const MAX_QTY_ITEM = 1000;
  const handleDoubleClick = () => {
    setTempQuantity(quantity);
    setIsEditing(true);
  };

  const handleBlurOrEnter = () => {
    const parsed = Number(tempQuantity);
    if(parsed > MAX_QTY_ITEM){
        toast.error(`Maximum quantity per item is ${MAX_QTY_ITEM}`); //Z-T97
        return;
    }
    if (!isNaN(parsed) && parsed >= 0) {
      onBulkUpdate(parsed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleBlurOrEnter();
    else if (e.key === "Escape") setIsEditing(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        border: "1px solid",
        bgcolor: isSelected ? "primary.main" : "white",
        borderColor: isSelected ? "white" : "grey.400",
        borderRadius: 1,
        px: 2,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <IconButton size="small" onClick={onDecrement}>
        <RemoveIcon
          fontSize="small"
          sx={{ color: isSelected ? "white" : "inherit" }}
        />
      </IconButton>

      {isEditing ? (
        <TextField
          variant="standard"
          size="small"
          autoFocus
          value={tempQuantity}
          onChange={(e) => setTempQuantity(e.target.value)}
          onBlur={handleBlurOrEnter}
          onKeyDown={handleKeyDown}
          inputProps={{
            style: {
              width: "32px",
              textAlign: "center",
              color: isSelected ? "white" : "inherit",
            },
          }}
        />
      ) : (
        <Typography
          sx={{ color: isSelected ? "white" : "inherit", cursor: "pointer" }}
          variant="body2"
          onDoubleClick={handleDoubleClick}
        >
          {quantity}
        </Typography>
      )}

      <IconButton size="small" onClick={onIncrement}>
        <AddIcon
          fontSize="small"
          sx={{ color: isSelected ? "white" : "inherit" }}
        />
      </IconButton>
    </Box>
  );
}
