import { useField } from "formik";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Box,
} from "@mui/material";

interface menuUnitOption {
  id: number,
  name:string,
  short_name:string
}


interface MenuUnitSelectProps {
  name: string;
  label?: string;
  menuUnitOptions: menuUnitOption[]|null; 
  isLoading?: boolean;
  isError?: boolean;
}

const MenuUnitSelect: React.FC<MenuUnitSelectProps> = ({
  name,
  label,
  menuUnitOptions,
  isLoading,
  isError,
}) => {
  const [field, meta, helpers] = useField(name);

  return (
    <FormControl
      fullWidth
      size="small"
      error={Boolean(meta.touched && meta.error)}
      disabled={isLoading}
    >
      <InputLabel>{label}</InputLabel>

      <Select
        {...field}
        label={label}
        value={field.value}
        onChange={(e) => helpers.setValue(e.target.value)}
      >
        {/* 🔹 Loading State */}
        {isLoading && (
          <MenuItem disabled>
            <Box display="flex" alignItems="center" gap={1}>
              <CircularProgress size={20} />
              Loading units...
            </Box>
          </MenuItem>
        )}

        {/* 🔹 Error State */}
        {isError && !isLoading && (
          <MenuItem disabled>Error loading units</MenuItem>
        )}

        {/* 🔹 Show Options Only If Not Loading or Error */}
        {!isLoading &&
          !isError &&
          menuUnitOptions?.map((unit:menuUnitOption) => (
            <MenuItem key={unit.id} value={unit.id}>
              {`${unit.name} (${unit.short_name})`}
            </MenuItem>
          ))}
      </Select>

      {/* 🔹 Formik Validation Error */}
      {meta.touched && meta.error && (
        <FormHelperText>{meta.error}</FormHelperText>
      )}
    </FormControl>
  );
};

export default MenuUnitSelect;
