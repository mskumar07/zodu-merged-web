import React from "react";
import { Grid } from "@mui/material";
import SearchBarWithAutocomplete from "./SearchBarWithAutocomplete";
import CategoryToggleChipGroup from "./CategoryToggleChipGroup";
import type { Product } from "../../types/product";

interface CombinedFilterBarProps {
  products: Product[];
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (cats: string[]) => void;
  searchValue: Product[];
  // onSearchChange: (products: Product[]) => void;
}

const CombinedFilterBar: React.FC<CombinedFilterBarProps> = ({
  products,
  categories,
  selectedCategories,
  onCategoryChange,
  searchValue,
  // onSearchChange,
}) => {
  return (
    <Grid
      container
      spacing={2}
      alignItems="center"
      sx={{
        mb: 1,
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "#fafafa", // or theme.palette.background.paper
      }}>
      {/* Search Input - 8 columns */}
      <Grid size={{ xs: 12, md: 7.5 }}>
        <SearchBarWithAutocomplete
          options={products}
          value={searchValue}
          // onChange={onSearchChange}
        />
      </Grid>

      {/* Category Chips - 3 columns */}
      <Grid size={{ xs: 12, md: 4.5 }}>
        <CategoryToggleChipGroup
          categories={categories}
          selected={selectedCategories}
          onChange={onCategoryChange}
        />
      </Grid>
    </Grid>
  );
};

export default CombinedFilterBar;
