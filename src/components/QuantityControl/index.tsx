import React, { useState } from "react";
import { IconButton, Box, Typography, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

interface Props {
  value: number;
  onChange: (newValue: number) => void;
}

const QuantityControl: React.FC<Props> = ({ value, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(value));

  const handleIncrement = () => onChange(value + 1);
  const handleDecrement = () => value > 1 && onChange(value - 1);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setInputValue(String(value));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleInputBlur = () => {
    // const numValue = parseInt(inputValue, 10);
    const numValue = Number(inputValue);
    if (!isNaN(numValue) && numValue > 0) {
      onChange(numValue);
    }
    setIsEditing(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleInputBlur();
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <IconButton onClick={handleDecrement} size="small">
        <RemoveIcon fontSize="small" />
      </IconButton>
      {isEditing ? (
        <TextField
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyPress={handleKeyPress}
          type="number"
          size="small"
          sx={{ width: 50, mx: 1 }}
          inputProps={{ style: { textAlign: "center", padding: "4px 0" } }}
          autoFocus
        />
      ) : (
        <Typography variant="body2" sx={{ mx: 1 }} onDoubleClick={handleDoubleClick}>
          {value}
        </Typography>
      )}
      <IconButton onClick={handleIncrement} size="small">
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default QuantityControl;
