import React from "react";
import { Grid, Typography } from "@mui/material";
import FormikTextInput from "@components/FormikTextInput/index";
import type { GridSize } from "@mui/material/Grid";
import CheckBoxLabels from "@components/CheckBoxLabels";

interface Field {
  name: string;
  label: string;
  fieldType?: "text" | "checkbox" | "spacer";
  isDisabled?: boolean;
  isRequired?: boolean; // optional, reflects your 'required' prop
  placeholder?: string; // note: typo—but keep as per your data if needed
  isSpacer?: boolean;
  size?: Partial<Record<"xs" | "sm" | "md" | "lg" | "xl", GridSize>>;
}

interface FormikSectionGridProps {
  title: string;
  fields: Field[];
  minHeight: string;
  padding?: number;
}

const FormikSectionGrid: React.FC<FormikSectionGridProps> = ({
  title,
  fields,
  minHeight,
  padding = 0,
}) => (
  <>
    <Typography variant="body1" color="textSecondary" ml={1} padding={padding}>
      {title}
    </Typography>
    <Grid container sx={{ minHeight: minHeight }} alignItems="center">
      {fields.map((field, index) => {
        if (field.fieldType === "spacer" || field.isSpacer) {
          // Render empty spacer Grid item
          return <Grid size={field.size} key={`${field.name}-${index}`} />;
        }
        if (field?.fieldType === "checkbox") {
          return (
            <Grid size={field.size}>
              <CheckBoxLabels
                label={field.label}
                key={`${field.name}-${index}`}
              />
            </Grid>
          );
        }
        return (
          <Grid size={field.size} key={field.name}>
            <FormikTextInput
              name={field.name}
              label={field.label}
              required={field.isRequired}
              placeholder={field.placeholder}
              isDisabled={field.isDisabled ?? false}
            />
          </Grid>
        );
      })}
    </Grid>
  </>
);

export default FormikSectionGrid;
