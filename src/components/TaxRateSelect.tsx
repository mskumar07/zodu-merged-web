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

interface GstOption {
  id: number;
  gst_rate: string; // The example JSON shows gst_rate as a string
}

interface TaxRateSelectProps {
  name: string;
  label?: string;
  GSTOptions: GstOption[] | null;
  isLoading?: boolean;
  isError?: boolean;
}

const TaxRateSelect: React.FC<TaxRateSelectProps> = ({
  name,
  label,
  GSTOptions,
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
        value={field.value || ""}
        onChange={(e) => helpers.setValue(e.target.value)}
      >
        {/* 🔹 Loading State */}
        {isLoading && (
          <MenuItem disabled>
            <Box display="flex" alignItems="center" gap={1}>
              <CircularProgress size={20} />
              Loading tax rates...
            </Box>
          </MenuItem>
        )}

        {/* 🔹 Error State */}
        {isError && !isLoading && (
          <MenuItem disabled>Error loading tax rates</MenuItem>
        )}

        {/* 🔹 Show Options Only If Not Loading or Error */}
        {!isLoading &&
          !isError &&
          GSTOptions?.map((gstOption: GstOption) => (
            <MenuItem key={gstOption.id} value={gstOption.id}>
              {`${gstOption.gst_rate}%`}
            </MenuItem>
          ))}
      </Select>
      {meta.touched && meta.error && (
        <FormHelperText>{meta.error}</FormHelperText>
      )}
    </FormControl>
  );
};

export default TaxRateSelect;
