// SkuField.tsx
import React from "react";
import { useField } from "formik";
import { Box, Button, TextField, Typography } from "@mui/material";
import Barcode from "react-barcode";
import FormikTextInput from "@components/FormikTextInput";



const generateSku = (currentValue: string) => {
  if (!currentValue) {
    return null;
  }
  return `${currentValue}`;
};

interface SkuFieldProps {
  name: string; // field name in Formik
  label?: string; // label for textfield
  showBarcode?: boolean; // whether to show the barcode
  setShowBarcode?: (show: boolean) => void; // function to set barcode visibility
}

export const SkuField: React.FC<SkuFieldProps> = ({
  name,
  label = "SKU / Code",
  showBarcode = false,
  setShowBarcode,
}) => {
  const [field, , helpers] = useField(name);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {/* SKU input (readonly) */}

      <FormikTextInput
        name={name}
        placeholder={label}
        label={label}
        InputType="DrawerForm"
      />

      {/* Buttons */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          variant="outlined"
          onClick={() => {
            helpers.setValue(generateSku(field.value));
            setShowBarcode(true);
          }}
          disabled={!field.value}
        >
          Generate SKU
        </Button>
        <Button variant="text" onClick={() => 
        {
          helpers.setValue("")
          setShowBarcode(false);
        }
        }>
          Clear
        </Button>
      </Box>

      {/* Barcode preview */}
      <Box sx={{ width: 200, height: 100 }}>
        {showBarcode && (
          <Barcode value={field.value} format="CODE128" displayValue />
        )}
      </Box>
    </Box>
  );
};
