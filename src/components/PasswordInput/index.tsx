import React, { useState } from "react";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import TextInput from "@components/TextInput/index.tsx";
import type { TextInputProps } from "@components/TextInput/index.tsx";

export interface PasswordInputProps
  extends Omit<TextInputProps, "type" | "InputProps"> {
  InputProps?: TextInputProps["InputProps"];
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  InputProps,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleToggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <TextInput
      {...props}
      type={showPassword ? "text" : "password"}
      InputProps={{
        ...InputProps,
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={handleToggleShowPassword}
              edge="end"
              size="small"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
        classes: {
          // preserve existing input classes if provided
          ...InputProps?.classes,
          //   input: props.classes?.input,
        },
      }}
    />
  );
};

export default PasswordInput;
