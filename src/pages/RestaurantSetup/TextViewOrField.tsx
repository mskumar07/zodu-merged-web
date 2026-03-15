import React from "react";
import {Typography } from "@mui/material";
import FormikTextInput from "@components/FormikTextInput/index";

interface Props {
  name: string;
  label: string;
  value: string;
  editable: boolean;
}

/**
 *  <FormikTextInput
              name={field.name}
              label={field.label}
              required={field.isRequired}
              placeholder={field.placeholder}
              isDisabled={field.isDisabled ?? false}
            />
 */

/**
             * <Field
      name={name}
      as={TextField}
      label={label}
     
      
    />
             */

const TextViewOrField: React.FC<Props> = ({ name, label, value, editable }) => {
  return editable ? (
    <FormikTextInput
      name={name}
      label={label}
      required={true}
      placeholder={"eg"}
      isDisabled={false}
    />
  ) : (
    <>
      <Typography variant="caption" color="textSecondary">
        {label}
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        {value}
      </Typography>
    </>
  );
};

export default TextViewOrField;
