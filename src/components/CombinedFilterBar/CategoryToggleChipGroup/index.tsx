import React from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

interface CategoryToggleChipGroupProps {
  categories: string[];
  selected: string[];
  onChange: (selectedCategories: string[]) => void;
}

const CategoryToggleChipGroup: React.FC<CategoryToggleChipGroupProps> = ({
  categories,
  selected,
  onChange,
}) => {
  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newSelected: string[]
  ) => {
    onChange(newSelected);
  };

  return (
    <ToggleButtonGroup
      value={selected}
      onChange={handleChange}
      aria-label="category filter"
      size="small"
      sx={{ width: "100%" }} // Make the group itself full width
    >
     {categories.map((cat) => (
        <ToggleButton
          key={cat}
          value={cat}
          sx={{
            flex: 1, // Each button takes up equal space
            textTransform: "none",
            borderRadius: "2px",
            "&.Mui-selected": {
              backgroundColor: "textSecondary.main",
            },
          }}
        >
          {cat}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default CategoryToggleChipGroup;
