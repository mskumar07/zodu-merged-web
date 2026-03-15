import React from "react";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import TextField from "@mui/material/TextField";
import FormHelperText from "@mui/material/FormHelperText";
import type { TextFieldProps } from "@mui/material/TextField";
import styles from "./index.module.css";

export interface TextInputProps {
  label?: string;
  name: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
  isDisabled?: boolean;
  sx?: object;
  classes?: Partial<
    import("@mui/material/TextField").TextFieldProps["classes"]
  >;
  InputProps?: TextFieldProps["InputProps"];
  InputType?: "DrawerForm" | "InlineForm";
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  required = false,
  error = false,
  helperText,
  placeholder = "",
  sx = {},
  classes = {},
  InputProps = {},
  isDisabled = false,
  InputType,
  ...rest
}) => {
  //z-T87 updated label in TextInput
  if (InputType === "DrawerForm") {
    return (
      <FormControl fullWidth error={error} sx={{ mb: 1 }}>
        {label && (
          <FormLabel
            sx={{ fontSize: "0.85rem", color: "text.secondary", mb: 0.1 }}
          >
            {label}
          </FormLabel>
        )}
        <TextField
          id={name}
          name={name}
          fullWidth
          placeholder={placeholder}
          value={value}
          type={type}
          onChange={onChange}
          onBlur={onBlur}
          disabled={isDisabled}
          size="small"
          InputProps={{
            sx: {
              "&::placeholder": {
                color: (theme) => theme.palette.text.secondary,
                opacity: 1,
                fontSize: "0.775rem",
              },
            },
            ...InputProps,
          }}
          {...rest}
        />
        {helperText && (
          <FormHelperText sx={{ color: "error.main", fontSize: "0.75rem", marginTop: "2px", marginLeft: "2px" }}>
            {helperText}
          </FormHelperText>
        )}
      </FormControl>
    );
  }

  return (
    <FormControl
      fullWidth
      required={required}
      error={error}
      className={styles.formControl}
    >
      <FormLabel className={styles.label}>{label}</FormLabel>
      <TextField
        variant="outlined"
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={styles.inputRoot}
        disabled={isDisabled}
        InputProps={{
          classes: { input: styles.input },
          sx: {
            backgroundColor: () =>
              Boolean(isDisabled) ? "#F0F2F4" : "inherit",
          },
          ...InputProps, // Merge user passed InputProps here
        }}
        sx={sx}
        classes={classes}
      />
      {helperText && (
        <FormHelperText className={styles.error}>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default TextInput;
