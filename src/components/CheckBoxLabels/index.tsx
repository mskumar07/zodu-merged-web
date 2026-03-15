import * as React from "react";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

// Props type for clarity (optional)
interface CheckBoxLabelsProps {
  label: string;
  checked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  [key: string]: any; // Allow extra props if needed
}

export default function CheckBoxLabels({
  label,
}: // ...rest
CheckBoxLabelsProps) {
  return (
    <FormGroup>
      <FormControlLabel
        control={<Checkbox disableRipple />}
        label={label}
        sx={{ marginLeft: 0.5 }}
      />
    </FormGroup>
  );
}
